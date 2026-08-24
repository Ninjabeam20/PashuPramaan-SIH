"""Forecast panel + on-demand exponential smoothing."""

import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.forecast.constants import DRUGS, HISTORY_END, HISTORY_START, SPECIES_GROUPS, STATES
from app.forecast.dgp import generate_rows, month_range
from app.forecast.model import forecast_series
from app.forecast.service import build_forecast


def test_panel_is_36_months_history_only():
    months = month_range(HISTORY_START, HISTORY_END)
    assert len(months) == 36
    assert months[0].isoformat() == "2023-09-01"
    assert months[-1].isoformat() == "2026-08-01"
    rows = generate_rows()
    expected = 36 * len(STATES) * len(SPECIES_GROUPS) * len(DRUGS)
    assert len(rows) == expected
    assert max(r["period_start"] for r in rows) == "2026-08-01"
    assert min(r["period_start"] for r in rows) == "2023-09-01"


def test_forecast_default_payload():
    payload = build_forecast()
    assert payload["insufficient_data"] is False
    assert len(payload["series"]) == 3
    assert payload["series"][0]["unit"] == "kg"
    assert payload["series"][0]["hist_count"] == 12
    n_fc = 1  # next 30 days
    assert len(payload["series"][0]["months"]) == 12 + n_fc
    assert payload["series"][0]["forecast"][-1] is not None
    assert payload["series"][0]["lower_bound"][-1] <= payload["series"][0]["forecast"][-1]
    assert payload["series"][0]["upper_bound"][-1] >= payload["series"][0]["forecast"][-1]
    assert len(payload["summary"]) == 3
    assert len(payload["regional_planning"]) == 5
    assert set(payload["demand_level"]) == {"MH", "GJ", "RJ", "PB", "KA"}


def test_filters_change_the_slice():
    all_regions = build_forecast(medicine="Oxytetracycline", region="All Regions")
    mh = build_forecast(medicine="Oxytetracycline", region="Maharashtra")
    assert all_regions["series"][0]["historical"][0] != mh["series"][0]["historical"][0]
    q4 = build_forecast(period="Q4 2026")
    assert len(q4["forecast_months"]) == 4
    assert q4["forecast_months"][0] == "2026-09-01"
    assert q4["forecast_months"][-1] == "2026-12-01"


def test_farmer_insights_range_changes_forecast():
    from datetime import date

    from app.forecast.farmer_insights import build_farmer_insights

    base = dict(
        current_stock_label="17 vials",
        cows=10,
        buffaloes=20,
        live_treatments_by_month={date(2026, 8, 1): 4},
        live_events_by_month={date(2026, 8, 1): 2},
    )
    d30 = build_farmer_insights("30d", **base)
    d60 = build_farmer_insights("60d", **base)
    d90 = build_farmer_insights("90d", **base)

    assert [r["month"] for r in d30["demand_forecast"]["chart_data"]] == ["Jun", "Jul", "Aug", "Sep"]
    assert [r["month"] for r in d60["demand_forecast"]["chart_data"]] == ["Jun", "Jul", "Aug", "Sep", "Oct"]
    assert [r["month"] for r in d90["demand_forecast"]["chart_data"]] == ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]
    assert d30["demand_forecast"]["expected_requirement"] != d90["demand_forecast"]["expected_requirement"]
    assert d30["demand_forecast"]["now_index"] == 2
    assert d30["demand_forecast"]["current_stock"] == "17 vials"

    perf = d30["farm_performance"]["chart_data"]
    health = d30["health_treatment_trends"]["chart_data"]
    assert len(perf) == 12
    assert len(health) == 12
    months = [row["month"] for row in perf]
    assert len(set(months)) == 12
    assert months[-1] == "Aug"
    assert perf[-1]["milk_output"] > perf[0]["milk_output"]
    milk_by_month = {row["month"]: row["milk_output"] for row in perf}
    assert milk_by_month["Nov"] > milk_by_month["May"]
    assert len({row["milk_output"] for row in perf}) > 1
    assert health[-1]["treatments"] >= 4
    assert health[-1]["health_events"] >= 2


def test_holt_family_on_synthetic_trend():
    y = [100 + 3 * i for i in range(24)]
    result = forecast_series(y, steps=3)
    assert result.model in {
        "simple_exponential_smoothing",
        "holt",
        "holt_damped",
        "holt_winters_additive",
        "holt_winters_multiplicative",
    }
    assert len(result.point) == 3
    assert result.point[-1] > y[0]


if __name__ == "__main__":
    test_panel_is_36_months_history_only()
    print("panel ok")
    test_holt_family_on_synthetic_trend()
    print("model ok")
    test_forecast_default_payload()
    print("default payload ok")
    test_filters_change_the_slice()
    print("filters ok")
    test_farmer_insights_range_changes_forecast()
    print("farmer insights ok")
    print("all forecast tests passed")
