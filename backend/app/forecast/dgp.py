"""Documented data-generating process for the monthly AMU demand panel.

amu_mg(t, region, species, drug) =
    base[drug] × species_mult × region_mult
    × (1 + trend[region, drug] · t)
    × seasonal[species, month]
    × outbreak_pulse
    × (1 + noise)

History only: Sep 2023 – Aug 2026 (36 months). Never writes Sep 2026+.
"""

from __future__ import annotations

import csv
from datetime import date
from pathlib import Path

import numpy as np
from dateutil.relativedelta import relativedelta

from app.forecast.constants import (
    DRUGS,
    HISTORY_END,
    HISTORY_START,
    RNG_SEED,
    SPECIES_GROUPS,
    STATES,
)

# mg/month at t=0 for dairy in an average region, before multipliers.
DRUG_BASE_MG = {
    "oxy": 12_000_000,  # high-use first-line
    "amox": 7_500_000,
    "enro": 3_200_000,  # lower, slightly declining
}

SPECIES_MULT = {
    "dairy": 1.00,
    "poultry": 0.72,
    "small_ruminants": 0.38,
}

REGION_MULT = {
    "MH": 1.35,
    "RJ": 1.28,
    "GJ": 1.00,
    "PB": 0.92,
    "KA": 0.68,
}

# Extra monthly trend on top of a mild national lift.
# Enrofloxacin declines; oxytetracycline rises fastest in MH/RJ.
NATIONAL_TREND = {
    "oxy": 0.005,
    "amox": 0.002,
    "enro": -0.004,
}
REGION_TREND_EXTRA = {
    "MH": 0.003,
    "RJ": 0.004,
    "GJ": 0.001,
    "PB": 0.000,
    "KA": -0.001,
}

# Seasonal indices, Jan–Dec, mean ≈ 1. Amplitude is large enough that
# Holt-Winters can beat Holt on 24+ months.
SEASON = {
    # Dairy: mastitis / calving lift in late winter and monsoon.
    "dairy": [1.05, 1.18, 1.15, 0.95, 0.88, 0.90, 1.12, 1.20, 1.05, 0.92, 0.85, 0.90],
    # Poultry: heat-stress and monsoon disease May–Sep.
    "poultry": [0.85, 0.88, 0.95, 1.05, 1.18, 1.22, 1.20, 1.15, 1.08, 0.95, 0.85, 0.82],
    # Small ruminants: monsoon GI / breeding.
    "small_ruminants": [0.90, 0.88, 0.92, 0.98, 1.05, 1.15, 1.22, 1.18, 1.10, 1.00, 0.92, 0.88],
}

# RJ dairy oxytetracycline pulse in Jun–Jul 2026.
OUTBREAK = {
    (date(2026, 6, 1), "RJ", "dairy", "oxy"): 1.45,
    (date(2026, 7, 1), "RJ", "dairy", "oxy"): 1.55,
}

NOISE_SD = 0.10

PANEL_COLUMNS = [
    "period_start",
    "state_code",
    "state_name",
    "species_group",
    "drug_id",
    "drug_name",
    "amu_mg",
    "treatment_count",
]


def month_range(start: date, end: date) -> list[date]:
    months: list[date] = []
    cursor = start
    while cursor <= end:
        months.append(cursor)
        cursor += relativedelta(months=1)
    return months


def generate_rows(seed: int = RNG_SEED) -> list[dict]:
    rng = np.random.default_rng(seed)
    months = month_range(HISTORY_START, HISTORY_END)
    rows: list[dict] = []
    for t, period in enumerate(months):
        month_idx = period.month - 1
        for state in STATES:
            for species in SPECIES_GROUPS:
                for drug in DRUGS:
                    trend = NATIONAL_TREND[drug["id"]] + REGION_TREND_EXTRA[state["code"]]
                    pulse = OUTBREAK.get(
                        (period, state["code"], species["id"], drug["id"]), 1.0
                    )
                    noise = rng.normal(0.0, NOISE_SD)
                    level = (
                        DRUG_BASE_MG[drug["id"]]
                        * SPECIES_MULT[species["id"]]
                        * REGION_MULT[state["code"]]
                        * (1.0 + trend * t)
                        * SEASON[species["id"]][month_idx]
                        * pulse
                        * (1.0 + noise)
                    )
                    amu_mg = float(max(0.0, round(level, 1)))
                    courses = max(1, int(round(amu_mg / drug["mg_per_course"])))
                    rows.append(
                        {
                            "period_start": period.isoformat(),
                            "state_code": state["code"],
                            "state_name": state["name"],
                            "species_group": species["id"],
                            "drug_id": drug["id"],
                            "drug_name": drug["name"],
                            "amu_mg": amu_mg,
                            "treatment_count": courses,
                        }
                    )
    return rows


def write_panel_csv(path: Path, rows: list[dict] | None = None) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = rows if rows is not None else generate_rows()
    with path.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=PANEL_COLUMNS)
        writer.writeheader()
        writer.writerows(data)
    return path


def default_panel_path() -> Path:
    return Path(__file__).resolve().parents[2] / "data" / "amu_monthly_panel.csv"
