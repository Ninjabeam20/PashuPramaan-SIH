"""Shared dimensions for the monthly AMU demand panel and forecast API."""

from datetime import date

HISTORY_START = date(2023, 9, 1)  # 36 months ending Aug 2026
HISTORY_END = date(2026, 8, 1)  # last complete month (forecast origin)
ORIGIN = HISTORY_END
RNG_SEED = 42

STATES = [
    {"code": "MH", "name": "Maharashtra"},
    {"code": "GJ", "name": "Gujarat"},
    {"code": "RJ", "name": "Rajasthan"},
    {"code": "PB", "name": "Punjab"},
    {"code": "KA", "name": "Karnataka"},
]
STATE_BY_CODE = {s["code"]: s for s in STATES}
STATE_BY_NAME = {s["name"]: s for s in STATES}

SPECIES_GROUPS = [
    {"id": "dairy", "label": "Dairy"},
    {"id": "poultry", "label": "Poultry"},
    {"id": "small_ruminants", "label": "Small Ruminants"},
]
SPECIES_BY_ID = {s["id"]: s for s in SPECIES_GROUPS}
SPECIES_BY_LABEL = {s["label"]: s for s in SPECIES_GROUPS}

DRUGS = [
    {
        "id": "oxy",
        "name": "Oxytetracycline",
        "color": "#D4724A",
        "mg_per_typical_pack": 5000,
        "mg_per_course": 2000,
    },
    {
        "id": "amox",
        "name": "Amoxicillin",
        "color": "#2D6A4F",
        "mg_per_typical_pack": 3000,
        "mg_per_course": 1500,
    },
    {
        "id": "enro",
        "name": "Enrofloxacin",
        "color": "#6B7280",
        "mg_per_typical_pack": 1000,
        "mg_per_course": 500,
    },
]
DRUG_BY_ID = {d["id"]: d for d in DRUGS}
DRUG_BY_NAME = {d["name"]: d for d in DRUGS}

ALL_MEDICINES = "All Medicines"
ALL_SPECIES = "All Species"
ALL_REGIONS = "All Regions"

PERIODS = {
    "Next 30 days": {"steps": 1, "planning_offset": 0},
    "Next 60 days": {"steps": 2, "planning_offset": 0},
    "Next 90 days": {"steps": 3, "planning_offset": 0},
    # Origin Aug 2026 → forecast Sep–Dec; planning uses Oct–Dec only.
    "Q4 2026": {"steps": 4, "planning_offset": 1},
}

NEED_HIGH_PCT = 15.0
NEED_LOW_PCT = -10.0
MIN_HISTORY = 8
CHART_HISTORY_MONTHS = 12
HOLDOUT_MONTHS = 6

# Policy knobs for High / Medium / Low current AMU (vs 5-state mean).
CURRENT_AMU_HIGH = 1.15
CURRENT_AMU_LOW = 0.85

# Farmer Insights uses the Punjab dairy slice (Haryana is not in the 5-state panel).
FARM_INSIGHTS_REGION = "Punjab"
FARM_INSIGHTS_SPECIES = "Dairy"
FARMER_CHART_HISTORY_MONTHS = 3
# Scales regional mg AMU down to farm-looking millilitres (~300–500).
FARM_AMU_SHARE = 2.0e-5
FARM_TREATMENT_SHARE = 0.002
# ₹00s per displayed ml of usage on the performance chart.
FARM_COST_PER_ML = 0.08
COW_LITRES_PER_DAY = 10.0
BUFFALO_LITRES_PER_DAY = 7.0

RANGE_TO_PERIOD = {
    "30d": "Next 30 days",
    "60d": "Next 60 days",
    "90d": "Next 90 days",
}
