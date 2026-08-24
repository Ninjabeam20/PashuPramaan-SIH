"""Farmer Insights charts: farm-scaled Punjab dairy panel + on-demand ES."""

from __future__ import annotations

from calendar import monthrange
from datetime import date, datetime

from app.forecast.constants import (
    BUFFALO_LITRES_PER_DAY,
    COW_LITRES_PER_DAY,
    FARMER_CHART_HISTORY_MONTHS,
    FARM_AMU_SHARE,
    FARM_COST_PER_ML,
    FARM_INSIGHTS_REGION,
    FARM_INSIGHTS_SPECIES,
    FARM_TREATMENT_SHARE,
    HISTORY_END,
    HISTORY_START,
    ORIGIN,
    RANGE_TO_PERIOD,
)
from app.forecast.panel import load_panel
from app.forecast.service import (
    _complete_series,
    _need_from_change,
    _planning_stats,
    add_months,
    build_forecast,
    month_index,
)


def _month_start(value) -> date | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return date(value.year, value.month, 1)
    if isinstance(value, date):
        return date(value.year, value.month, 1)
    return None


def _status_from_need(need: str) -> dict:
    if need == "High":
        return {"text": "HIGH DEMAND EXPECTED", "variant": "orange"}
    if need == "Low":
        return {"text": "STOCK SUFFICIENT", "variant": "green"}
    return {"text": "MONITOR", "variant": "amber"}


DUAL_CHART_MONTHS = 12
# Jan–Dec: milk products peak at Holi (Mar) and Diwali/wedding season (Oct–Nov).
_FESTIVE_DAIRY = [1.05, 1.02, 1.18, 0.98, 0.86, 0.88, 0.95, 0.98, 1.04, 1.16, 1.22, 1.10]
# Opposite festive pattern (egg/poultry demand lower around Diwali).
_FESTIVE_POULTRY = [0.95, 0.98, 0.90, 1.02, 1.14, 1.18, 1.16, 1.12, 1.06, 0.84, 0.78, 0.88]


def _with_trend(index: int, last_index: int = DUAL_CHART_MONTHS - 1) -> float:
    return 1.0 + 0.35 * (index / last_index)


def _milk_litres(month: date, cows: int, buffaloes: int, trend_index: int) -> int:
    days = monthrange(month.year, month.month)[1]
    festive = _FESTIVE_DAIRY[month.month - 1]
    daily = cows * COW_LITRES_PER_DAY + buffaloes * BUFFALO_LITRES_PER_DAY
    return int(round(daily * days * festive * _with_trend(trend_index)))


def build_farmer_insights(
    range_key: str,
    *,
    current_stock_label: str,
    cows: int,
    buffaloes: int,
    live_treatments_by_month: dict[date, int] | None = None,
    live_events_by_month: dict[date, int] | None = None,
) -> dict:
    if range_key not in RANGE_TO_PERIOD:
        raise ValueError(f"Unknown range: {range_key}")

    period = RANGE_TO_PERIOD[range_key]
    payload = build_forecast(
        medicine="All Medicines",
        species=FARM_INSIGHTS_SPECIES,
        region=FARM_INSIGHTS_REGION,
        period=period,
    )
    if payload.get("insufficient_data"):
        raise ValueError("Not enough history to forecast")

    panel = load_panel()
    history_months = month_index(HISTORY_START, HISTORY_END)
    keep = history_months[-FARMER_CHART_HISTORY_MONTHS:]
    dual_keep = history_months[-DUAL_CHART_MONTHS:]
    sliced = panel[
        (panel["species_group"] == "dairy") & (panel["state_name"] == FARM_INSIGHTS_REGION)
    ]
    amu_history = _complete_series(sliced, history_months)
    treat_by_month = {
        row.period_start: int(row.treatment_count)
        for row in sliced.groupby("period_start", as_index=False)["treatment_count"]
        .sum()
        .itertuples()
    }
    treat_history = [treat_by_month.get(m, 0) for m in history_months]

    steps = {"30d": 1, "60d": 2, "90d": 3}[range_key]
    fc_months = [add_months(ORIGIN, i) for i in range(1, steps + 1)]

    # Combined All-Medicines forecast: sum the per-drug series from build_forecast.
    combined_fc = [0.0] * steps
    for series in payload["series"]:
        points = [v for v in series["forecast"] if v is not None][-steps:]
        for i, v in enumerate(points):
            combined_fc[i] += float(v) * 1_000_000  # kg → mg

    display_hist = [max(0, int(round(v * FARM_AMU_SHARE))) for v in amu_history]
    display_fc = [max(0, int(round(v * FARM_AMU_SHARE))) for v in combined_fc]

    chart_data = []
    for i, month in enumerate(keep):
        usage = display_hist[-(FARMER_CHART_HISTORY_MONTHS - i)]
        row = {
            "month": month.strftime("%b"),
            "past_usage": usage,
            "forecast": usage if i == len(keep) - 1 else None,
        }
        chart_data.append(row)
    for i, month in enumerate(fc_months):
        chart_data.append(
            {
                "month": month.strftime("%b"),
                "past_usage": None,
                "forecast": display_fc[i],
            }
        )

    stats = _planning_stats(amu_history, combined_fc, 0)
    expected_ml = int(round(sum(display_fc))) if display_fc else 0
    need = _need_from_change(stats["change"])

    live_t = live_treatments_by_month or {}
    live_e = live_events_by_month or {}

    performance = []
    health = []
    for i, month in enumerate(dual_keep):
        usage = display_hist[-(DUAL_CHART_MONTHS - i)]
        poultry = _FESTIVE_POULTRY[month.month - 1] * _with_trend(i)
        treatments = max(
            0,
            int(round(treat_history[-(DUAL_CHART_MONTHS - i)] * FARM_TREATMENT_SHARE * poultry)),
        )
        treatments += live_t.get(month, 0)
        events = max(1, int(round(treatments * 0.82))) if treatments else 0
        events += live_e.get(month, 0)
        performance.append(
            {
                "month": month.strftime("%b"),
                "milk_output": _milk_litres(month, cows, buffaloes, i),
                "medicine_cost": max(1, int(round(usage * FARM_COST_PER_ML * poultry))),
            }
        )
        health.append(
            {
                "month": month.strftime("%b"),
                "health_events": events,
                "treatments": max(events + 1, treatments),
            }
        )

    return {
        "range": range_key,
        "demand_forecast": {
            "chart_data": chart_data,
            "now_index": FARMER_CHART_HISTORY_MONTHS - 1,
            "current_stock": current_stock_label,
            "expected_requirement": f"{expected_ml} ml",
            "status": _status_from_need(need),
        },
        "farm_performance": {"chart_data": performance},
        "health_treatment_trends": {"chart_data": health},
    }
