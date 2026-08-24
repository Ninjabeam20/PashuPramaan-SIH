"""Shared lab pipeline helpers so Dispatches, Queue, and the testing workspace stay in sync."""
from __future__ import annotations

from typing import Iterable, Optional

from app.models import LabSample, LabStage, LabTest, LabTestState


STANDARD_TEST_SPECS = (
    ("Product Quality", ["Fat", "SNF", "Acidity", "Adulteration"]),
    ("Microbiological Safety", ["Standard Plate Count", "Coliform screening", "Pathogen screen"]),
    ("Antimicrobial Residue", ["Beta-lactam", "Targeted residue analysis"]),
)


def test_state_token(state) -> str:
    raw = state.value if hasattr(state, "value") else str(state)
    return raw.split(".")[-1].lower()


def has_active_test(tests: Iterable) -> bool:
    return any(test_state_token(getattr(t, "state", t)) == "active" for t in tests)


def first_pending(tests: list) -> Optional[object]:
    for t in tests:
        if test_state_token(getattr(t, "state", t)) == "pending":
            return t
    return None


_TEST_ORDER = {name: i for i, (name, _) in enumerate(STANDARD_TEST_SPECS)}


def _test_sort_key(t) -> tuple:
    return (_TEST_ORDER.get(getattr(t, "name", ""), 99), getattr(t, "id", "") or "")


def _tests_for_sample(db, dispatch_id: str) -> list:
    rows = db.query(LabTest).filter_by(dispatchId=dispatch_id).all()
    return sorted(rows, key=_test_sort_key)


def ensure_standard_tests(db, sample: LabSample) -> list:
    """Create the 3-test plan if missing, and make sure one test is ACTIVE.

    Generate Passport / seed rows historically created a LabSample with no LabTest
    rows. Queue → Receive Sample created them. Opening the workspace from
    Dispatches must do the same so Complete Test has an active test to submit.
    """
    tests = _tests_for_sample(db, sample.dispatchId)
    if not tests:
        for index, (name, checks) in enumerate(STANDARD_TEST_SPECS):
            db.add(LabTest(
                dispatchId=sample.dispatchId,
                name=name,
                checks=list(checks),
                state=LabTestState.ACTIVE if index == 0 else LabTestState.PENDING,
            ))
        db.flush()
        tests = _tests_for_sample(db, sample.dispatchId)

    if not has_active_test(tests):
        pending = first_pending(tests)
        if pending is not None:
            pending.state = LabTestState.ACTIVE
            db.flush()
            tests = _tests_for_sample(db, sample.dispatchId)

    return tests


def workspace_assessments(tests: list) -> list[dict]:
    ordered = sorted(tests, key=_test_sort_key)
    items = []
    for idx, t in enumerate(ordered):
        items.append({
            "id": t.id,
            "num": idx + 1,
            "label": t.name,
            "state": test_state_token(t.state),
            "checks": t.checks or [],
            "result": t.result,
            "ok": t.ok,
        })
    return items


def queue_bucket(stage: LabStage) -> Optional[str]:
    if stage == LabStage.AWAITING_RECEIPT:
        return "awaiting"
    if stage in (LabStage.RECEIVED, LabStage.TESTING):
        return "ready"
    return None
