"""Shared lab pipeline helpers so Dispatches, Queue, and the testing workspace stay in sync."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Iterable, Optional

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


def relative_time(dt: Optional[datetime], now: Optional[datetime] = None) -> str:
    if not dt:
        return ""
    now = now or datetime.utcnow()
    secs = int((now - dt).total_seconds())
    if secs < 0:
        secs = 0
    if secs < 60:
        return "Just now"
    if secs < 3600:
        mins = secs // 60
        return f"{mins} min ago"
    if secs < 86400:
        hours = secs // 3600
        return f"{hours} hour ago" if hours == 1 else f"{hours} hours ago"
    days = secs // 86400
    if days == 1:
        return "Yesterday"
    return f"{days} days ago"


def _product_label(s) -> str:
    product = getattr(s, "product", None)
    name = getattr(product, "name", None) or str(product or "")
    return name.replace("_", " ").title() if name else ""


def _failed_tests(s) -> bool:
    tests = getattr(s, "tests", None) or []
    return any(
        test_state_token(getattr(t, "state", t)) == "done" and getattr(t, "ok", True) is False
        for t in tests
    )


def _attention_item(s, desc: str, status: str, status_color: str, action: str, page: str) -> dict:
    return {
        "id": s.dispatchId,
        "type": _product_label(s) or "SAMPLE",
        "title": s.sourceName or "Unknown source",
        "desc": desc,
        "status": status,
        "statusColor": status_color,
        "action": action,
        "page": page,
    }


def build_lab_dashboard(
    samples: Iterable[Any],
    reports: Iterable[Any] = (),
    now: Optional[datetime] = None,
    technician_name: str = "Dr. Priya",
) -> dict:
    now = now or datetime.utcnow()
    samples = list(samples)
    reports = list(reports)

    awaiting = [s for s in samples if s.stage == LabStage.AWAITING_RECEIPT]
    in_lab = [s for s in samples if s.stage in (LabStage.RECEIVED, LabStage.TESTING)]
    testing = [s for s in samples if s.stage == LabStage.TESTING]
    awaiting_v = [s for s in samples if s.stage == LabStage.AWAITING_VERIFICATION]
    on_hold = [s for s in samples if s.stage == LabStage.ON_HOLD]
    high_priority = [s for s in awaiting if (s.priority or "") == "HIGH PRIORITY"]

    passed = [r for r in reports if getattr(r, "outcomeOk", False)]
    violations = [r for r in reports if not getattr(r, "outcomeOk", True)]

    summary = [
        {
            "value": str(len(awaiting)),
            "label": "Awaiting Receipt",
            "sub": f"{len(high_priority)} high priority",
            "color": "amber",
            "href": "/lab/testing-queue",
        },
        {
            "value": str(len(in_lab)),
            "label": "Tests in Progress",
            "sub": f"{len(testing)} in testing",
            "color": "neutral",
            "href": "/lab/testing-queue",
        },
        {
            "value": str(len(awaiting_v)),
            "label": "Awaiting Verification",
            "sub": "Ready for review",
            "color": "amber",
            "href": "/lab/results",
        },
        {
            "value": str(len(on_hold)),
            "label": "On Hold",
            "sub": "Action required",
            "color": "red",
            "href": "/lab/results",
        },
    ]

    outcomes = [
        {
            "value": str(len(reports)),
            "label": "Reports generated",
            "sub": "Official records",
            "color": "neutral",
            "href": "/lab/reports",
        },
        {
            "value": str(len(passed)),
            "label": "Passed",
            "sub": "Eligible for release",
            "color": "green",
            "href": "/lab/reports",
        },
        {
            "value": str(len(violations) + len(on_hold)),
            "label": "Violations / hold",
            "sub": "Needs follow-up",
            "color": "red",
            "href": "/lab/reports",
        },
    ]

    open_stages = {
        LabStage.AWAITING_RECEIPT,
        LabStage.RECEIVED,
        LabStage.TESTING,
        LabStage.AWAITING_VERIFICATION,
        LabStage.ON_HOLD,
    }
    mix_source = [s for s in samples if s.stage in open_stages] or samples
    mix_counts: dict[str, int] = {}
    for s in mix_source:
        label = _product_label(s) or "Other"
        mix_counts[label] = mix_counts.get(label, 0) + 1
    product_mix = [{"label": k, "count": v} for k, v in sorted(mix_counts.items())]

    ranked: list[tuple[int, datetime, dict]] = []
    for s in samples:
        created = getattr(s, "createdAt", None) or datetime.min
        failed = _failed_tests(s)
        if failed:
            ranked.append((0, created, _attention_item(
                s,
                "A completed test did not pass.",
                "REVIEW REQUIRED",
                "red",
                "Review Results →",
                "/lab/results",
            )))
        if s.stage == LabStage.ON_HOLD:
            ranked.append((1, created, _attention_item(
                s,
                "Sample is on hold pending review.",
                "ACTION REQUIRED",
                "red",
                "Review →",
                "/lab/results",
            )))
        elif s.stage == LabStage.AWAITING_RECEIPT and (s.priority or "") == "HIGH PRIORITY":
            ranked.append((2, created, _attention_item(
                s,
                "High-priority inbound sample awaiting receipt.",
                "HIGH PRIORITY",
                "amber",
                "Receive Sample →",
                "/lab/testing-queue",
            )))
        elif s.stage == LabStage.AWAITING_VERIFICATION:
            ranked.append((3, created, _attention_item(
                s,
                "Assessment is awaiting verification.",
                "ACTION REQUIRED",
                "amber",
                "Review Assessment →",
                "/lab/results",
            )))
        elif s.stage == LabStage.TESTING:
            ranked.append((4, created, _attention_item(
                s,
                "Testing is in progress.",
                "IN TESTING",
                "amber",
                "Continue Testing →",
                f"/lab/testing-workspace/{s.dispatchId}",
            )))
        elif s.stage == LabStage.RECEIVED:
            ranked.append((5, created, _attention_item(
                s,
                "Sample received — start required tests.",
                "READY FOR TESTING",
                "amber",
                "Start Testing →",
                f"/lab/testing-workspace/{s.dispatchId}",
            )))
        elif s.stage == LabStage.AWAITING_RECEIPT:
            ranked.append((6, created, _attention_item(
                s,
                "Inbound sample awaiting receipt.",
                "AWAITING RECEIPT",
                "amber",
                "Receive Sample →",
                "/lab/testing-queue",
            )))

    ranked.sort(key=lambda row: (row[0], -row[1].timestamp() if row[1] != datetime.min else 0))
    attention = []
    seen = set()
    for _, _, item in ranked:
        if item["id"] in seen:
            continue
        seen.add(item["id"])
        attention.append(item)
        if len(attention) >= 5:
            break

    events: list[tuple[datetime, dict]] = []
    for s in samples:
        if getattr(s, "createdAt", None):
            events.append((s.createdAt, {
                "text": f"Dispatch {s.dispatchId} sent to lab",
                "time": relative_time(s.createdAt, now),
                "icon": "inbox",
            }))
        if getattr(s, "receivedOn", None):
            events.append((s.receivedOn, {
                "text": f"Sample {s.sampleId} received and registered",
                "time": relative_time(s.receivedOn, now),
                "icon": "inbox",
            }))
        if s.stage == LabStage.ON_HOLD and getattr(s, "updatedAt", None):
            events.append((s.updatedAt, {
                "text": f"{s.dispatchId} placed on hold",
                "time": relative_time(s.updatedAt, now),
                "icon": "hold",
            }))
        elif s.stage == LabStage.AWAITING_VERIFICATION and getattr(s, "updatedAt", None):
            events.append((s.updatedAt, {
                "text": f"Assessment submitted for {s.dispatchId}",
                "time": relative_time(s.updatedAt, now),
                "icon": "check",
            }))
    for r in reports:
        when = getattr(r, "verifiedOn", None)
        if not when:
            continue
        dispatch_id = getattr(r, "dispatchId", "")
        if getattr(r, "outcomeOk", False):
            events.append((when, {
                "text": f"{dispatch_id} cleared for dispatch",
                "time": relative_time(when, now),
                "icon": "dispatch",
            }))
        else:
            events.append((when, {
                "text": f"Result submitted for {dispatch_id}",
                "time": relative_time(when, now),
                "icon": "hold",
            }))

    events.sort(key=lambda row: row[0], reverse=True)
    activity = []
    seen_text = set()
    for _, item in events:
        if item["text"] in seen_text:
            continue
        seen_text.add(item["text"])
        activity.append(item)
        if len(activity) >= 8:
            break

    hour = now.hour
    if hour < 12:
        hello = "Good morning"
    elif hour < 17:
        hello = "Good afternoon"
    else:
        hello = "Good evening"

    return {
        "greeting": {
            "hello": hello,
            "name": technician_name,
            "date": now.strftime("%a %d %b %Y"),
        },
        "summary": summary,
        "outcomes": outcomes,
        "productMix": product_mix,
        "attention": attention,
        "activity": activity,
    }
