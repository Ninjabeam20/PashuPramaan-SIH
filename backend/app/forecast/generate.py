"""Generate backend/data/amu_monthly_panel.csv (history only).

Run from the backend directory:

    python -m app.forecast.generate
"""

from app.forecast.dgp import default_panel_path, generate_rows, write_panel_csv


def main() -> None:
    path = default_panel_path()
    rows = generate_rows()
    write_panel_csv(path, rows)
    last = max(r["period_start"] for r in rows)
    print(f"Wrote {len(rows)} rows to {path}")
    print(f"History {rows[0]['period_start']} → {last}")


if __name__ == "__main__":
    main()
