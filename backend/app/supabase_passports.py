"""Write public passport rows to hosted Supabase. Local Postgres is never altered here."""

from __future__ import annotations

import logging
import os
import re
from datetime import datetime, timedelta
from typing import Any, Optional

from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

logger = logging.getLogger(__name__)

PERMITTED_LIMIT_PPM = 0.10
LAB_TEST_NAME = "Beta-Lactam Residue Screen"


class PassportWriteError(RuntimeError):
    """Raised when the public passport cannot be written to Supabase."""


def passport_dates(now: Optional[datetime] = None) -> tuple[str, str]:
    issued = (now or datetime.utcnow()).date()
    expiry = issued + timedelta(days=365)
    return issued.isoformat(), expiry.isoformat()


def _client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url:
        logger.warning("SUPABASE_URL missing; skip public passport write")
        return None
    if not key:
        logger.warning("SUPABASE_SERVICE_ROLE_KEY is empty; skip public passport write (anon key cannot insert)")
        return None
    try:
        from supabase import create_client
        return create_client(url, key)
    except Exception:
        logger.exception("Failed to create Supabase client")
        return None


def verify_public_base_url() -> str:
    return os.getenv("VERIFY_PUBLIC_BASE_URL", "http://localhost:3001").rstrip("/")


def qr_verify_url(passport_id: str) -> str:
    return f"{verify_public_base_url()}/verify/{passport_id}"


def product_quantity(product: str) -> str:
    name = (product or "").lower()
    if name == "milk":
        return "250 L"
    if name == "meat":
        return "1 carcass"
    if name == "eggs":
        return "30 dozen"
    return "1 unit"


def parse_ppm(value: Any) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    match = re.search(r"[\d.]+", str(value))
    if not match:
        return None
    try:
        return float(match.group(0))
    except ValueError:
        return None


def extract_mrl_from_sample(sample) -> tuple[Optional[float], float, bool]:
    """Return (measured_ppm, limit_ppm, within_limit) from tests or the lab report."""
    limit = PERMITTED_LIMIT_PPM
    measured: Optional[float] = None

    tests = list(getattr(sample, "tests", None) or [])
    residue = next(
        (
            t
            for t in tests
            if t.name
            and (
                "residue" in t.name.lower()
                or "beta" in t.name.lower()
                or "antimicrobial" in t.name.lower()
            )
        ),
        None,
    )
    if residue is None and tests:
        residue = next((t for t in tests if t.result), None)
    if residue is not None:
        measured = parse_ppm(residue.result)
        if residue.ok is False:
            return measured, limit, False

    report = getattr(sample, "report", None)
    if report is not None:
        measured = parse_ppm(report.mrlMeasured) if measured is None else measured
        if report.mrlLimit:
            limit = float(report.mrlLimit)
        if measured is None:
            return None, limit, bool(report.mrlVerdictOk)
        return measured, limit, measured <= limit

    if measured is None:
        return None, limit, False
    return measured, limit, measured <= limit


def build_timeline(db: Session, animal_id: str, sc_res: dict, extra: Optional[list] = None) -> list[dict]:
    from app.models import Treatment

    events: list[dict] = []
    treatments = (
        db.query(Treatment)
        .filter_by(animalId=animal_id)
        .order_by(Treatment.administeredOn.asc())
        .all()
    )
    now = datetime.utcnow()
    for trt in treatments:
        when = trt.administeredOn or now
        events.append(
            {
                "date": when.strftime("%b %d"),
                "label": f"{trt.drug} treatment" if trt.drug else "Antibiotic treatment",
                "type": "calendar",
                "ok": True,
            }
        )
        if trt.withdrawal:
            cleared = trt.withdrawal.clearsAt <= now
            events.append(
                {
                    "date": trt.withdrawal.clearsAt.strftime("%b %d"),
                    "label": "Withdrawal cleared" if cleared else "Withdrawal period not complete",
                    "type": "shield",
                    "ok": cleared,
                }
            )

    mrl = sc_res.get("mrl") or {}
    lab_available = (sc_res.get("lab_assay") or {}).get("available")
    if lab_available:
        ok = mrl.get("status") == "within_limit"
        events.append(
            {
                "date": now.strftime("%b %d"),
                "label": "Lab test passed" if ok else "Lab test failed",
                "type": "flask",
                "ok": ok,
            }
        )

    vet_ok = bool((sc_res.get("prescription") or {}).get("signed"))
    events.append(
        {
            "date": now.strftime("%b %d"),
            "label": "Vet cleared" if vet_ok else "Vet clearance pending",
            "type": "steth",
            "ok": vet_ok,
        }
    )

    if extra:
        events.extend(extra)
    return events


def safety_from_check(sc_res: dict) -> dict:
    withdrawal_ok = (sc_res.get("withdrawal") or {}).get("status") == "cleared"
    vet_ok = bool((sc_res.get("prescription") or {}).get("signed"))
    mrl = sc_res.get("mrl") or {}
    lab_ok = mrl.get("status") == "within_limit"
    return {
        "withdrawalCleared": withdrawal_ok,
        "vetCleared": vet_ok,
        "labPassed": lab_ok,
    }


def lab_payload_from_check(db: Session, animal_id: str, sc_res: dict) -> dict:
    from app.models import LabSample

    sample = (
        db.query(LabSample)
        .filter_by(animalId=animal_id)
        .order_by(LabSample.createdAt.desc())
        .first()
    )
    mrl = sc_res.get("mrl") or {}
    lab_available = (sc_res.get("lab_assay") or {}).get("available")

    result = parse_ppm(mrl.get("lab_result_ppm")) if lab_available else None
    limit = parse_ppm(mrl.get("permitted_ppm")) or PERMITTED_LIMIT_PPM
    lab_id = "—"
    test_date = "—"

    if sample:
        lab_id = sample.sampleId or lab_id
        if sample.createdAt:
            test_date = sample.createdAt.strftime("%d %b %Y")
        measured, limit, within = extract_mrl_from_sample(sample)
        if measured is not None:
            result = measured
        if sample.report and sample.report.verifiedOn:
            test_date = sample.report.verifiedOn.strftime("%d %b %Y")
            lab_id = sample.report.refNo or lab_id
        if not lab_available:
            within = False
        else:
            within = mrl.get("status") == "within_limit" if measured is None else within
    else:
        within = mrl.get("status") == "within_limit"

    return {
        "testName": LAB_TEST_NAME,
        "labId": lab_id,
        "result": result,
        "permittedLimit": limit,
        "testDate": test_date,
        "withinLimit": bool(within) if result is not None else False,
    }


def lab_payload_from_sample(sample, is_release: bool) -> tuple[dict, dict, list]:
    measured, limit, within = extract_mrl_from_sample(sample)
    now = datetime.utcnow()
    lab_id = sample.sampleId if sample else "—"
    test_date = now.strftime("%d %b %Y")
    if sample and sample.createdAt:
        test_date = sample.createdAt.strftime("%d %b %Y")
    if sample and sample.report and sample.report.verifiedOn:
        test_date = sample.report.verifiedOn.strftime("%d %b %Y")
        lab_id = sample.report.refNo or lab_id

    lab_ok = bool(is_release and within)
    lab = {
        "testName": LAB_TEST_NAME,
        "labId": lab_id or "—",
        "result": measured,
        "permittedLimit": limit,
        "testDate": test_date,
        "withinLimit": lab_ok if is_release else bool(measured is not None and measured <= limit),
    }
    if not is_release:
        lab["withinLimit"] = bool(measured is not None and measured <= limit)

    withdrawal_ok = True
    vet_ok = True
    safety = {
        "withdrawalCleared": withdrawal_ok,
        "vetCleared": vet_ok if is_release else False,
        "labPassed": lab["withinLimit"] if is_release else False,
    }
    timeline = [
        {
            "date": now.strftime("%b %d"),
            "label": "Lab test passed" if lab["withinLimit"] else "Lab test failed",
            "type": "flask",
            "ok": lab["withinLimit"],
        },
        {
            "date": now.strftime("%b %d"),
            "label": "Vet cleared" if is_release else "Vet clearance pending",
            "type": "steth",
            "ok": bool(is_release),
        },
    ]
    return lab, safety, timeline


def assemble_row(
    *,
    passport_id: str,
    product: str,
    animal_id: str,
    farm,
    sc_res: dict,
    db: Session,
    is_verified: bool = False,
) -> dict:
    product_label = product.capitalize() if product else "Milk"
    district = (getattr(farm, "district", None) or "").strip() or "Haryana"
    safety = safety_from_check(sc_res)
    safety["district"] = district
    issued, expiry = passport_dates()
    return {
        "id": passport_id,
        "status": "VALID" if is_verified else "REVOKED",
        "product_type": product_label,
        "quantity": product_quantity(product_label),
        "farm_name": farm.name if farm else "Unknown farm",
        "animal_id": animal_id,
        "issue_date": issued,
        "expiry_date": expiry,
        "lab_results": lab_payload_from_check(db, animal_id, sc_res),
        "health_ledger": build_timeline(db, animal_id, sc_res),
        "vet_signatures": safety,
    }


def upsert_passport(row: dict) -> None:
    client = _client()
    if client is None:
        raise PassportWriteError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing")
    try:
        client.table("passports").upsert(row, on_conflict="id").execute()
    except PassportWriteError:
        raise
    except Exception as exc:
        logger.exception("Failed to upsert passport %s", row.get("id"))
        raise PassportWriteError("Could not write the public passport") from exc


def update_latest_unverified(
    animal_id: str,
    product: str,
    *,
    is_verified: bool,
    lab_results: dict,
    safety: dict,
    extra_timeline: list,
) -> None:
    client = _client()
    if client is None:
        return
    try:
        query = (
            client.table("passports")
            .select("id,health_ledger,vet_signatures")
            .eq("animal_id", animal_id)
        )
        if product:
            query = query.ilike("product_type", product)
        found = query.order("issue_date", desc=True).limit(1).execute()
        rows = found.data or []
        if not rows:
            logger.warning("No unverified public passport for animal %s / %s", animal_id, product)
            return
        target = rows[0]
        ledger = list(target.get("health_ledger") or [])
        ledger.extend(extra_timeline)
        merged_safety = dict(target.get("vet_signatures") or {})
        merged_safety.update(safety)
        client.table("passports").update(
            {
                "status": "VALID" if is_verified else "REVOKED",
                "lab_results": lab_results,
                "vet_signatures": merged_safety,
                "health_ledger": ledger,
            }
        ).eq("id", target["id"]).execute()
    except Exception:
        logger.exception("Failed to update public passport for animal %s", animal_id)
