from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.models import (
    User, LabSample, LabTest, LabReport, FarmerDispatch, LabStage, LabTestState,
    Farm, Animal, ProductType, DispatchStatus
)
from app.api.deps import get_db, get_current_user
from app.lab_workflow import (
    ensure_standard_tests,
    first_pending,
    queue_bucket,
    test_state_token,
    workspace_assessments,
)

router = APIRouter()

def _newest_samples(db) -> List[LabSample]:
    return db.query(LabSample).order_by(desc(LabSample.createdAt), desc(LabSample.dispatchId)).all()


def _find_sample(db, sample_id: str) -> LabSample:
    s = db.query(LabSample).filter_by(dispatchId=sample_id).first()
    if not s:
        s = db.query(LabSample).filter_by(sampleId=sample_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sample not found")
    return s


def _stage_timeline(stage: LabStage):
    labels = ["Created", "Received", "Testing", "Verification", "Assessment"]
    active_at = {
        LabStage.AWAITING_RECEIPT: 1,
        LabStage.RECEIVED: 2,
        LabStage.TESTING: 2,
        LabStage.AWAITING_VERIFICATION: 3,
        LabStage.VERIFIED: 4,
        LabStage.ON_HOLD: 3,
    }.get(stage, 1)
    items = []
    for i, label in enumerate(labels):
        if i < active_at:
            state = "done"
        elif i == active_at:
            state = "active"
        else:
            state = "upcoming"
        items.append({"label": label, "state": state})
    return items


def _dispatch_list_item(s: LabSample) -> dict:
    stage_name = s.stage.name.replace("_", " ") if s.stage else ""
    if s.stage == LabStage.RECEIVED:
        status = "READY FOR TESTING"
    elif s.stage == LabStage.TESTING:
        status = "TESTING"
    else:
        status = stage_name
    return {
        "id": s.dispatchId,
        "date": s.createdAt.strftime("%d %b · %I:%M %p") if s.createdAt else "",
        "createdAt": s.createdAt.isoformat() if s.createdAt else "",
        "product": s.product.name.capitalize() if s.product else "",
        "productSub": s.productSub,
        "source": s.sourceName,
        "sourceSub": f"{s.animal.species.name.capitalize()} {s.animalId}" if s.animal and s.animalId else (f"Animal: {s.animalId}" if s.animalId else ""),
        "sample": s.sampleId,
        "sampleStatus": stage_name.capitalize() if stage_name else "",
        "sampleColor": "green" if s.stage != LabStage.AWAITING_RECEIPT else "amber",
        "risk": (s.priority or "MODERATE").replace(" PRIORITY", "").upper(),
        "riskColor": "red" if s.priority == "HIGH PRIORITY" else "amber",
        "status": status,
        "statusColor": "amber",
        "action": "View →",
        "clickable": True
    }


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    samples = _newest_samples(db)
    awaiting = sum(1 for s in samples if s.stage == LabStage.AWAITING_RECEIPT)
    high_priority = sum(1 for s in samples if s.stage == LabStage.AWAITING_RECEIPT and s.priority == "HIGH PRIORITY")
    
    attention = []
    for s in samples:
        if s.priority == "HIGH PRIORITY" and s.stage == LabStage.AWAITING_RECEIPT:
            attention.append({
                "id": s.dispatchId,
                "type": s.product.name,
                "title": s.sourceName,
                "desc": "Beta-lactam residue testing required.",
                "status": "HIGH PRIORITY",
                "statusColor": "amber",
                "action": "Start Testing →",
                "page": f"/lab/testing-workspace/{s.dispatchId}"
            })

    return {
        "summary": [
            {
                "value": str(awaiting),
                "label": "Awaiting Receipt",
                "sub": f"{high_priority} high priority",
                "color": "amber"
            }
        ],
        "attention": attention,
        "activity": [
            {
                "text": "Result submitted for MLK-2026-00118",
                "time": "10 min ago",
                "icon": "check"
            }
        ]
    }

@router.get("/dispatches")
def get_dispatches(db: Session = Depends(get_db)):
    return [_dispatch_list_item(s) for s in _newest_samples(db)]

@router.get("/dispatches/{dispatchId}")
def get_dispatch_detail(dispatchId: str, db: Session = Depends(get_db)):
    s = _find_sample(db, dispatchId)
    tests = ensure_standard_tests(db, s)
    db.commit()
    assessments = workspace_assessments(tests)
    test_items = []
    for a in assessments:
        state = a["state"]
        test_items.append({
            "num": str(a["num"]).zfill(2),
            "title": a["label"],
            "checks": a["checks"],
            "status": "COMPLETED" if state == "done" else "IN PROGRESS" if state == "active" else "PENDING",
            "statusColor": "green" if state == "done" else "amber" if state == "active" else "neutral",
            "action": "View Results →" if state == "done" else "Continue Testing →" if state == "active" else "Start Test →",
            "active": state == "active",
            "badge": None,
        })
    done_or_active = sum(1 for a in assessments if a["state"] in ("done", "active"))
    assessment = [
        {"label": "Traceability", "status": "Complete", "color": "green"},
        *[
            {
                "label": a["label"],
                "status": "Complete" if a["state"] == "done" else "In Progress" if a["state"] == "active" else "Pending",
                "color": "green" if a["state"] == "done" else "amber" if a["state"] == "active" else "neutral",
            }
            for a in assessments
        ],
    ]
    return {
        "id": s.dispatchId,
        "product": s.productLabel,
        "source": s.sourceName,
        "date": s.createdAt.strftime("%d %b %Y") if s.createdAt else "",
        "time": s.createdAt.strftime("%I:%M %p") if s.createdAt else "",
        "quantity": s.quantity,
        "linkedAnimal": s.animalId,
        "currentSample": s.sampleId,
        "risk": s.priority.replace(" PRIORITY", "").upper() if s.priority else "MODERATE",
        "riskReason": "",
        "overallStatus": s.stage.name.replace("_", " ") if s.stage else "",
        "progressText": f"{done_or_active} of {len(assessments) or 3} required test categories are complete or active.",
        "stages": _stage_timeline(s.stage),
        "tests": test_items,
        "assessment": assessment,
        "notes": {
            "condition": s.condition or "",
            "temperature": s.temperature or "",
            "container": s.container or "",
            "receivedBy": "Dr. Priya Sharma",
            "receivedAt": s.receivedOn.strftime("%d %b · %I:%M %p") if s.receivedOn else ""
        },
        "activity": []
    }

class ReceiveRequest(BaseModel):
    condition: str
    temperature: str
    container: str
    notes: Optional[str] = None

@router.post("/dispatches/{dispatchId}/receive")
def receive_sample(dispatchId: str, req: ReceiveRequest, db: Session = Depends(get_db)):
    s = _find_sample(db, dispatchId)
    
    s.stage = LabStage.RECEIVED
    s.receivedOn = datetime.utcnow()
    s.condition = req.condition
    s.temperature = req.temperature
    s.container = req.container
    ensure_standard_tests(db, s)
    db.commit()
    
    return {
        "success": True,
        "dispatchId": s.dispatchId,
        "new_status": "READY FOR TESTING"
    }


@router.get("/queue")
def get_queue(db: Session = Depends(get_db)):
    samples = _newest_samples(db)
    awaiting = []
    ready = []

    priority_color_map = {
        "HIGH PRIORITY": "red",
        "MEDIUM": "amber",
        "LOW": "neutral",
    }

    for s in samples:
        bucket = queue_bucket(s.stage)
        p_color = priority_color_map.get(s.priority or "", "neutral")
        if bucket == "awaiting":
            awaiting.append({
                "id": s.dispatchId,
                "product": s.product.name.capitalize() if s.product else "",
                "productSub": s.productLabel or "",
                "source": s.sourceName or "",
                "sourceSub": f"{s.animal.species.name.capitalize()} {s.animalId}" if s.animal and s.animalId else (f"Animal: {s.animalId}" if s.animalId else ""),
                "sample": s.sampleId,
                "arrival": s.scheduledFor or "Pending",
                "priority": s.priority or "STANDARD",
                "priorityColor": p_color,
                "reason": "",
                "action": "Receive Sample →",
                "highlighted": s.priority == "HIGH PRIORITY"
            })
        elif bucket == "ready":
            tests_list = []
            for t in workspace_assessments(s.tests or []):
                tests_list.append({
                    "name": t["label"],
                    "status": t["state"],
                })
            ready.append({
                "id": s.dispatchId,
                "product": s.product.name.capitalize() if s.product else "",
                "source": s.sourceName or "",
                "sample": s.sampleId,
                "tests": tests_list,
                "action": "Continue Testing →" if s.stage == LabStage.TESTING else "Start Testing →"
            })

    return {
        "awaiting": awaiting,
        "ready": ready
    }

@router.get("/workspace/{sampleId}")
def get_workspace(sampleId: str, db: Session = Depends(get_db)):
    s = _find_sample(db, sampleId)
    tests = ensure_standard_tests(db, s)
    db.commit()
    return {
        "dispatchId": s.dispatchId,
        "sampleId": s.sampleId,
        "product": s.product.name.capitalize() if s.product else "",
        "productSub": s.productLabel or "",
        "source": s.sourceName or "",
        "sourceSub": f"Animal: {s.animalId}" if s.animalId else "",
        "condition": s.condition or "",
        "temperature": s.temperature or "",
        "riskLevel": s.priority.replace(" PRIORITY", "").upper() if s.priority else "MODERATE",
        "antimicrobialContext": "",
        "antimicrobialStatus": "",
        "assessments": workspace_assessments(tests)
    }

class TestSubmission(BaseModel):
    test_id: Optional[str] = None
    result_value: float
    unit: str
    operator: str
    verdict: str

@router.post("/workspace/{sampleId}/tests")
def submit_test(sampleId: str, req: TestSubmission, db: Session = Depends(get_db)):
    s = _find_sample(db, sampleId)
    tests = ensure_standard_tests(db, s)

    test = None
    if req.test_id:
        test = next((t for t in tests if t.id == req.test_id), None)
        if test is None:
            test = db.query(LabTest).filter_by(id=req.test_id).first()
    if test is None:
        test = next((t for t in tests if test_state_token(t.state) == "active"), None)
    if test is None:
        raise HTTPException(status_code=404, detail="Test not found")

    mrl_limit = 0.1
    is_ok = req.result_value <= mrl_limit

    test.state = LabTestState.DONE
    test.result = f"{req.result_value} {req.unit}"
    test.ok = is_ok

    if s.stage in (LabStage.AWAITING_RECEIPT, LabStage.RECEIVED):
        s.stage = LabStage.TESTING

    next_test = first_pending(tests)
    if next_test:
        next_test.state = LabTestState.ACTIVE

    db.commit()

    return {
        "success": True,
        "sample_id": sampleId,
        "test_id": test.id,
        "verdict": "WITHIN_MRL" if is_ok else "EXCEEDED",
        "next_step": "verification_required" if not next_test else "continue"
    }

@router.post("/workspace/{sampleId}/submit_assessment")
def submit_assessment(sampleId: str, db: Session = Depends(get_db)):
    s = _find_sample(db, sampleId)
    s.stage = LabStage.AWAITING_VERIFICATION
    db.commit()
    return {"success": True, "sampleId": sampleId}

@router.get("/results")
def get_results(db: Session = Depends(get_db)):
    samples = _newest_samples(db)
    items = []
    for s in samples:
        # Check if all tests are done
        tests = s.tests or []
        if not tests: continue
        all_done = all(t.state == LabTestState.DONE for t in tests)
        if not all_done and s.stage not in [LabStage.AWAITING_VERIFICATION, LabStage.VERIFIED, LabStage.ON_HOLD]:
            continue

        # Determine status string
        if s.stage == LabStage.AWAITING_VERIFICATION:
            status = "AWAITING VERIFICATION"
            color = "amber"
            action = "Review Assessment →"
            outcome = "released" # generic routing to assessment screen
        elif s.stage == LabStage.VERIFIED:
            status = "VERIFIED"
            color = "green"
            action = "View Report →"
            outcome = "released"
        elif s.stage == LabStage.ON_HOLD:
            status = "ACTION REQUIRED"
            color = "red"
            action = "Review →"
            outcome = "hold"
        else:
            # All done but not yet submitted
            status = "AWAITING VERIFICATION"
            color = "amber"
            action = "Review Assessment →"
            outcome = "released"

        test_data = []
        for t in tests:
            test_data.append({
                "label": t.name,
                "result": t.result or "N/A",
                "ok": t.ok
            })

        items.append({
            "id": s.dispatchId,
            "product": s.product.name.capitalize(),
            "source": s.sourceName,
            "sample": s.sampleId,
            "date": s.createdAt.strftime("%d %b %Y"),
            "tests": test_data,
            "status": status,
            "statusColor": color,
            "action": action,
            "outcome": outcome
        })

    return {"items": items}

class VerificationRequest(BaseModel):
    action: str
    notes: Optional[str] = None

@router.post("/results/{resultId}/verify")
def verify_result(resultId: str, req: VerificationRequest, db: Session = Depends(get_db)):
    from app.models import FarmerDispatch, DispatchStatus, LabReport
    
    s = db.query(LabSample).filter_by(dispatchId=resultId).first()
    if not s: raise HTTPException(status_code=404)
    fd = db.query(FarmerDispatch).filter_by(id=s.dispatchId).first()

    from app.supabase_passports import extract_mrl_from_sample

    measured_ppm, limit_ppm, within_limit = extract_mrl_from_sample(s)
    mrl_ok = False

    if req.action == "RELEASE":
        s.stage = LabStage.VERIFIED

        d = fd or db.query(FarmerDispatch).filter_by(id=s.dispatchId).first()
        mrl_measured = str(measured_ppm) if measured_ppm is not None else (getattr(d, "mrlMeasuredPpm", "0.0") if d else "0.0")
        mrl_limit = str(limit_ppm) if limit_ppm else (getattr(d, "mrlPermittedPpm", "0.10") if d else "0.10")
        if d and measured_ppm is not None:
            d.mrlMeasuredPpm = str(measured_ppm)
            d.mrlPermittedPpm = str(limit_ppm)
        try:
            mrl_ok = float(mrl_measured) <= float(mrl_limit)
        except Exception:
            mrl_ok = within_limit

        if fd:
            fd.status = DispatchStatus.CLEARED if mrl_ok else DispatchStatus.BLOCKED

        mrl_measured_val = float(mrl_measured) if mrl_measured else 0.0
        mrl_limit_val = float(mrl_limit) if mrl_limit else 0.10
        mrl_verdict_str = "WITHIN_LIMITS" if mrl_ok else "EXCEEDED"

        report = LabReport(
            dispatchId=s.dispatchId,
            refNo=f"REP-{s.dispatchId}",
            verifiedBy="Authorized Technician",
            verifiedOn=datetime.utcnow(),
            status="CLEARED" if (req.action == "RELEASE" and mrl_ok) else "ON HOLD",
            statusColor="green" if (req.action == "RELEASE" and mrl_ok) else "red",
            mrlDrug="Regulated Residue",
            mrlMeasured=mrl_measured_val,
            mrlLimit=mrl_limit_val,
            mrlUnit="ppm",
            mrlRatio=mrl_measured_val / mrl_limit_val if mrl_limit_val > 0 else 0.0,
            mrlVerdict=mrl_verdict_str,
            mrlVerdictOk=mrl_ok,
            withdrawalDrug="General Treatment",
            withdrawalAdministered=datetime.utcnow().strftime("%Y-%m-%d"),
            withdrawalCompleted=datetime.utcnow().strftime("%Y-%m-%d"),
            withdrawalStatus="Completed" if mrl_ok else "Violation",
            outcome="Eligible for Release" if (req.action == "RELEASE" and mrl_ok) else "Hold Recommended",
            outcomeOk=(req.action == "RELEASE" and mrl_ok)
        )
        existing = db.query(LabReport).filter_by(dispatchId=s.dispatchId).first()
        if existing: db.delete(existing)
        db.add(report)
        
    elif req.action == "HOLD":
        s.stage = LabStage.ON_HOLD
        if fd: fd.status = DispatchStatus.BLOCKED

    db.commit()
    db.refresh(s)

    from app.supabase_passports import lab_payload_from_sample, update_latest_unverified

    is_verified = req.action == "RELEASE" and mrl_ok
    lab_results, safety, extra_timeline = lab_payload_from_sample(s, is_release=is_verified)
    product_label = s.product.name.capitalize() if s.product else ""
    if s.animalId:
        update_latest_unverified(
            s.animalId,
            product_label,
            is_verified=is_verified,
            lab_results=lab_results,
            safety=safety,
            extra_timeline=extra_timeline,
        )

    return {
        "success": True,
        "resultId": resultId,
        "status": "verified_released" if req.action == "RELEASE" else "held_for_retest"
    }

@router.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    from app.models import LabReport, LabSample
    reports = db.query(LabReport).order_by(desc(LabReport.verifiedOn)).all()
    
    items = []
    for r in reports:
        # fetch related sample for traceability details
        s = db.query(LabSample).filter_by(dispatchId=r.dispatchId).first()
        
        assessments = []
        if s and s.tests:
            for t in s.tests:
                assessments.append({
                    "label": t.name,
                    "result": t.result or "N/A",
                    "ok": t.ok,
                    "detail": "Measured via standard protocols"
                })

        items.append({
            "id": r.dispatchId,
            "product": s.product.name.capitalize() if s else "Unknown",
            "productSub": s.productSub if s else "",
            "source": s.sourceName if s else "Unknown",
            "sample": s.sampleId if s else "Unknown",
            "animal": s.animalId if s else "",
            "date": r.verifiedOn.strftime("%d %b %Y") if r.verifiedOn else "",
            "status": r.status,
            "statusColor": r.statusColor,
            "refNo": r.refNo,
            "verifiedBy": r.verifiedBy,
            "verifiedOn": r.verifiedOn.strftime("%d %b %Y · %I:%M %p") if r.verifiedOn else "",
            "assessments": assessments,
            "mrl": {
                "drug": r.mrlDrug,
                "measured": r.mrlMeasured,
                "limit": r.mrlLimit,
                "unit": r.mrlUnit,
                "ratio": r.mrlRatio,
                "verdict": r.mrlVerdict,
                "verdictOk": r.mrlVerdictOk
            },
            "withdrawal": {
                "drug": r.withdrawalDrug,
                "administered": r.withdrawalAdministered,
                "completed": r.withdrawalCompleted,
                "status": r.withdrawalStatus
            },
            "outcome": r.outcome,
            "outcomeOk": r.outcomeOk
        })

    summary = [
        {"v": str(len(items)), "l": "Reports Generated", "color": "neutral"},
        {"v": str(len([r for r in reports if not r.outcomeOk])), "l": "Positive Violations", "color": "red"},
        {"v": str(len([r for r in reports if r.outcomeOk])), "l": "Passed", "color": "green"},
    ]

    return {
        "summary": summary,
        "items": items
    }

