"""Automatic SES / Holt / Holt-Winters selection and forecast."""

from __future__ import annotations

import warnings
from dataclasses import dataclass

import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing, Holt, SimpleExpSmoothing

from app.forecast.constants import HOLDOUT_MONTHS, MIN_HISTORY

_KINDS = ("ses", "holt", "hw_add", "hw_mul")


@dataclass
class ForecastResult:
    model: str
    point: list[float]
    lower: list[float]
    upper: list[float]


def _safe_fit(y: np.ndarray, kind: str, damped: bool):
    y = np.asarray(y, dtype=float)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        if kind == "ses":
            model = SimpleExpSmoothing(y, initialization_method="estimated")
            return model.fit(optimized=True, remove_bias=False)
        if kind == "holt":
            model = Holt(y, damped_trend=damped, initialization_method="estimated")
            return model.fit(optimized=True)
        seasonal = "add" if kind == "hw_add" else "mul"
        if seasonal == "mul" and np.min(y) <= 0:
            return None
        model = ExponentialSmoothing(
            y,
            trend="add",
            seasonal=seasonal,
            seasonal_periods=12,
            damped_trend=damped,
            initialization_method="estimated",
        )
        return model.fit(optimized=True)


def _mae(actual: np.ndarray, predicted: np.ndarray) -> float:
    return float(np.mean(np.abs(actual - predicted)))


def _holdout_mae(y: np.ndarray, kind: str, damped: bool) -> float:
    if len(y) <= HOLDOUT_MONTHS + MIN_HISTORY:
        return float("inf")
    train, test = y[:-HOLDOUT_MONTHS], y[-HOLDOUT_MONTHS:]
    try:
        fit = _safe_fit(train, kind, damped)
        if fit is None:
            return float("inf")
        pred = np.asarray(fit.forecast(HOLDOUT_MONTHS), dtype=float)
        if pred.shape != test.shape or not np.all(np.isfinite(pred)):
            return float("inf")
        return _mae(test, pred)
    except Exception:
        return float("inf")


def _select_kind(y: np.ndarray, steps: int) -> tuple[str, bool]:
    n = len(y)
    damped = steps >= 3
    if n < 16:
        return "ses", False
    if n < 24:
        return "holt", damped

    candidates: list[tuple[str, bool]] = [
        ("holt", damped),
        ("hw_add", damped),
    ]
    if np.min(y) > 0:
        candidates.append(("hw_mul", damped))

    scored = [(kind, damp, _holdout_mae(y, kind, damp)) for kind, damp in candidates]
    scored.sort(key=lambda row: row[2])
    best_kind, best_damped, best_mae = scored[0]
    if not np.isfinite(best_mae):
        return "holt", damped
    return best_kind, best_damped


def _intervals(fit, point: np.ndarray, y: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    h = len(point)
    try:
        fc = fit.get_forecast(h)
        ci = np.asarray(fc.conf_int(alpha=0.2))
        lower, upper = ci[:, 0], ci[:, 1]
        if lower.shape == point.shape and np.all(np.isfinite(lower)):
            return lower, upper
    except Exception:
        pass
    resid = np.asarray(getattr(fit, "resid", y - np.mean(y)), dtype=float)
    resid = resid[np.isfinite(resid)]
    sigma = float(np.std(resid)) if len(resid) else float(np.std(y)) * 0.1
    z = 1.2816  # ~80% interval, matches alpha=0.2
    grow = np.sqrt(np.arange(1, h + 1, dtype=float))
    return point - z * sigma * grow, point + z * sigma * grow


def forecast_series(values: list[float], steps: int) -> ForecastResult:
    y = np.asarray(values, dtype=float)
    if len(y) < MIN_HISTORY:
        raise ValueError(f"Need at least {MIN_HISTORY} months of history")
    if steps < 1:
        raise ValueError("steps must be >= 1")

    kind, damped = _select_kind(y, steps)
    fit = None
    tried = [kind] + [k for k in _KINDS if k != kind]
    last_error: Exception | None = None
    for candidate in tried:
        damp = damped if candidate != "ses" else False
        try:
            fit = _safe_fit(y, candidate, damp)
            if fit is None:
                continue
            point = np.asarray(fit.forecast(steps), dtype=float)
            if point.shape != (steps,) or not np.all(np.isfinite(point)):
                continue
            kind = candidate
            break
        except Exception as exc:
            last_error = exc
            fit = None
    else:
        raise RuntimeError(f"Could not fit exponential smoothing: {last_error}")

    point = np.maximum(point, 0.0)
    lower, upper = _intervals(fit, point, y)
    lower = np.maximum(np.minimum(lower, point), 0.0)
    upper = np.maximum(upper, point)
    labels = {
        "ses": "simple_exponential_smoothing",
        "holt": "holt_damped" if damped and kind == "holt" else "holt",
        "hw_add": "holt_winters_additive",
        "hw_mul": "holt_winters_multiplicative",
    }
    return ForecastResult(
        model=labels.get(kind, kind),
        point=[float(round(v, 1)) for v in point],
        lower=[float(round(v, 1)) for v in lower],
        upper=[float(round(v, 1)) for v in upper],
    )
