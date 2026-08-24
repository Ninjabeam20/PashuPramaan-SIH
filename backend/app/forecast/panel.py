"""Load the monthly AMU demand panel from CSV (generate if missing)."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import pandas as pd

from app.forecast.dgp import default_panel_path, write_panel_csv


def _ensure_panel(path: Path) -> Path:
    if not path.exists():
        write_panel_csv(path)
    return path


@lru_cache(maxsize=1)
def load_panel(path: str | None = None) -> pd.DataFrame:
    csv_path = Path(path) if path else default_panel_path()
    _ensure_panel(csv_path)
    df = pd.read_csv(csv_path)
    df["period_start"] = pd.to_datetime(df["period_start"]).dt.date
    df["amu_mg"] = df["amu_mg"].astype(float)
    df["treatment_count"] = df["treatment_count"].astype(int)
    return df
