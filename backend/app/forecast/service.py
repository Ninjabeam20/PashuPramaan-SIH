"""Slice the AMU panel, forecast on demand, and assemble the admin payload."""

from __future__ import annotations

from datetime import date

import pandas as pd
from dateutil.relativedelta import relativedelta

from app.forecast.constants import (
    ALL_MEDICINES,
    ALL_REGIONS,
    ALL_SPECIES,
    CHART_HISTORY_MONTHS,
    CURRENT_AMU_HIGH,
    CURRENT_AMU_LOW,
    DRUGS,
    DRUG_BY_NAME,
    HISTORY_END,
    HISTORY_START,
    MIN_HISTORY,
    NEED_HIGH_PCT,
    NEED_LOW_PCT,
    ORIGIN,
    PERIODS,
    SPECIES_BY_LABEL,
    SPECIES_GROUPS,
    STATE_BY_NAME,
    STATES,
)
from app.forecast.model import forecast_series
from app.forecast.panel import load_panel


def add_months(d: date, n: int) -> date:
    return (d + relativedelta(months=n)) if n else d


def month_index(start: date, end: date) -> list[date]:
    months: list[date] = []
    cursor = start
    while cursor <= end:
        months.append(cursor)
        cursor += relativedelta(months=1)
    return months


def month_label(d: date) -> str:
    return d.strftime("%b '%y")


def _parse_filters(medicine: str, species: str, region: str, period: str):
    if period not in PERIODS:
        raise ValueError(f"Unknown period: {period}")
    if medicine != ALL_MEDICINES and medicine not in DRUG_BY_NAME:
        raise ValueError(f"Unknown medicine: {medicine}")
    if species != ALL_SPECIES and species not in SPECIES_BY_LABEL:
        raise ValueError(f"Unknown species: {species}")
    if region != ALL_REGIONS and region not in STATE_BY_NAME:
        raise ValueError(f"Unknown region: {region}")
    drugs = list(DRUGS) if medicine == ALL_MEDICINES else [DRUG_BY_NAME[medicine]]
    species_ids = (
        [s["id"] for s in SPECIES_GROUPS]
        if species == ALL_SPECIES
        else [SPECIES_BY_LABEL[species]["id"]]
    )
    state_codes = (
        [s["code"] for s in STATES]
        if region == ALL_REGIONS
        else [STATE_BY_NAME[region]["code"]]
    )
    return drugs, species_ids, state_codes, PERIODS[period]


def _complete_series(df: pd.DataFrame, months: list[date]) -> list[float]:
    by_month = {
        row.period_start: float(row.amu_mg)
        for row in df.groupby("period_start", as_index=False)["amu_mg"].sum().itertuples()
    }
    return [by_month.get(m, 0.0) for m in months]


def _need_from_change(change_pct: float) -> str:
    if change_pct >= NEED_HIGH_PCT:
        return "High"
    if change_pct <= NEED_LOW_PCT:
        return "Low"
    return "Medium"


def _recommendation(need: str, change_pct: float) -> tuple[str, str, str]:
    if need == "High" or change_pct >= NEED_HIGH_PCT:
        return "Stock up", "#B91C1C", "#FEE2E2"
    if need == "Low" or change_pct <= NEED_LOW_PCT:
        return "No additional stock", "#065F46", "#D1FAE5"
    return "Maintain current stock", "#92400E", "#FEF3C7"


def _signal(need: str) -> str:
    if need == "High":
        return "High need"
    if need == "Low":
        return "Stable"
    return "Monitor"


def _current_amu_label(value: float, mean: float) -> str:
    if mean <= 0:
        return "Medium"
    ratio = value / mean
    if ratio >= CURRENT_AMU_HIGH:
        return "High"
    if ratio <= CURRENT_AMU_LOW:
        return "Low"
    return "Medium"


def _planning_stats(history: list[float], point: list[float], planning_offset: int) -> dict:
    planning = point[planning_offset:]
    if not planning:
        planning = point
    baseline_window = history[-12:] if len(history) >= 12 else history
    baseline = sum(baseline_window) / len(baseline_window)
    planned_mean = sum(planning) / len(planning)
    change = 0.0 if baseline == 0 else (planned_mean / baseline - 1.0) * 100.0
    change_i = int(round(change))
    need = _need_from_change(change)
    rec, rec_color, rec_bg = _recommendation(need, change)
    expected_mg = float(sum(planning))
    return {
        "need": need,
        "change": change_i,
        "rec": rec,
        "recColor": rec_color,
        "recBg": rec_bg,
        "expected_mg": round(expected_mg, 1),
        "baseline_mg": round(baseline, 1),
        "signal": _signal(need),
    }


def _chart_payload(history_months: list[date], history: list[float], fc_months: list[date], fc) -> dict:
    keep = history_months[-CHART_HISTORY_MONTHS:]
    hist_keep = history[-CHART_HISTORY_MONTHS:]
    months = [month_label(m) for m in keep + fc_months]
    n_hist, n_fc = len(hist_keep), len(fc_months)
    historical = [round(v / 1_000_000, 3) for v in hist_keep] + [None] * n_fc
    forecast = [None] * (n_hist - 1) + [round(hist_keep[-1] / 1_000_000, 3)] + [
        round(v / 1_000_000, 3) for v in fc.point
    ]
    lower = [None] * n_hist + [round(v / 1_000_000, 3) for v in fc.lower]
    upper = [None] * n_hist + [round(v / 1_000_000, 3) for v in fc.upper]
    return {
        "months": months,
        "historical": historical,
        "forecast": forecast,
        "lower_bound": lower,
        "upper_bound": upper,
        "hist_count": n_hist,
        "unit": "kg",
        "model": fc.model,
    }


def build_forecast(
    medicine: str = ALL_MEDICINES,
    species: str = ALL_SPECIES,
    region: str = ALL_REGIONS,
    period: str = "Next 30 days",
) -> dict:
    drugs, species_ids, chart_states, spec = _parse_filters(medicine, species, region, period)
    steps = spec["steps"]
    planning_offset = spec["planning_offset"]
    panel = load_panel()
    history_months = month_index(HISTORY_START, HISTORY_END)
    fc_months = [add_months(ORIGIN, i) for i in range(1, steps + 1)]

    sliced = panel[
        panel["species_group"].isin(species_ids) & panel["drug_name"].isin([d["name"] for d in drugs])
    ]

    series_out = []
    summary = []
    for drug in drugs:
        drug_rows = sliced[sliced["drug_name"] == drug["name"]]
        drug_rows = drug_rows[drug_rows["state_code"].isin(chart_states)]
        history = _complete_series(drug_rows, history_months)
        if sum(1 for v in history if v > 0) < MIN_HISTORY:
            continue
        fc = forecast_series(history, steps)
        chart = _chart_payload(history_months, history, fc_months, fc)
        series_out.append(
            {
                "name": drug["name"],
                "color": drug["color"],
                **chart,
            }
        )
        stats = _planning_stats(history, fc.point, planning_offset)
        packs = stats["expected_mg"] / drug["mg_per_typical_pack"]
        summary.append(
            {
                "medicine": drug["name"],
                "need": stats["need"],
                "change": stats["change"],
                "rec": stats["rec"],
                "recColor": stats["recColor"],
                "recBg": stats["recBg"],
                "expected_kg": round(stats["expected_mg"] / 1_000_000, 3),
                "expected_packs": int(round(packs)),
                "model": fc.model,
            }
        )

    # Regional outlook: always the five demo states, same medicine × species slice.
    regional = []
    demand_level = {}
    for state in STATES:
        state_rows = sliced[sliced["state_code"] == state["code"]]
        history = _complete_series(state_rows, history_months)
        if sum(1 for v in history if v > 0) < MIN_HISTORY:
            continue
        fc = forecast_series(history, steps)
        stats = _planning_stats(history, fc.point, planning_offset)
        last12 = history[-12:] if len(history) >= 12 else history
        current_mean = sum(last12) / len(last12)
        regional.append(
            {
                "state": state["name"],
                "id": state["code"],
                "predDemand": stats["need"],
                "change": stats["change"],
                "signal": stats["signal"],
                "expected_kg": round(stats["expected_mg"] / 1_000_000, 3),
                "_current_mean": current_mean,
            }
        )

    means = [row["_current_mean"] for row in regional]
    pool_mean = sum(means) / len(means) if means else 0.0
    for row in regional:
        row["currentAmu"] = _current_amu_label(row.pop("_current_mean"), pool_mean)
        demand_level[row["id"]] = {
            "demand": row["predDemand"],
            "change": row["change"],
            "currentAmu": row["currentAmu"],
            "signal": row["signal"],
        }

    title_horizon = period if period != "Q4 2026" else "Q4 2026"
    return {
        "origin": ORIGIN.isoformat(),
        "period": period,
        "medicine": medicine,
        "species": species,
        "region": region,
        "title": f"{title_horizon} medicine demand forecast",
        "unit": "kg",
        "unit_note": "Kilograms of active ingredient. Pack estimates use a typical vial size per drug.",
        "series": series_out,
        "summary": summary,
        "regional_planning": regional,
        "demand_level": demand_level,
        "forecast_months": [m.isoformat() for m in fc_months],
        "insufficient_data": len(series_out) == 0,
    }
