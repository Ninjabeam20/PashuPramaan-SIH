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

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    samples = db.query(LabSample).all()
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
    samples = db.query(LabSample).all()
    items = []
    for s in samples:
        items.append({
            "id": s.dispatchId,
            "date": s.createdAt.strftime("%d %b · %I:%M %p"),
            "product": s.product.name.capitalize(),
            "productSub": s.productSub,
            "source": s.sourceName,
            "sourceSub": f"{s.animal.species.name.capitalize()} {s.animalId}" if s.animal and s.animalId else (f"Animal: {s.animalId}" if s.animalId else ""),
            "sample": s.sampleId,
            "sampleStatus": s.stage.name.replace("_", " ").capitalize(),
            "sampleColor": "green" if s.stage != LabStage.AWAITING_RECEIPT else "amber",
            "risk": "MODERATE",
            "riskColor": "amber",
            "status": "READY FOR TESTING" if s.stage == LabStage.RECEIVED else s.stage.name.replace("_", " "),
            "statusColor": "amber",
            "action": "View →",
            "clickable": True
        })
    return items

@router.get("/dispatches/{dispatchId}")
def get_dispatch_detail(dispatchId: str, db: Session = Depends(get_db)):
    s = db.query(LabSample).filter_by(dispatchId=dispatchId).first()
    if not s: raise HTTPException(status_code=404)
    
    return {
        "id": s.dispatchId,
        "product": s.productLabel,
        "source": s.sourceName,
        "date": s.createdAt.strftime("%d %b %Y"),
        "time": s.createdAt.strftime("%I:%M %p"),
        "quantity": s.quantity,
        "linkedAnimal": s.animalId,
        "currentSample": s.sampleId,
        "risk": s.priority.replace(" PRIORITY", "").upper() if s.priority else "MODERATE",
        "riskReason": "",
        "overallStatus": s.stage.name.replace("_", " "),
        "stages": [],
        "tests": [],
        "assessment": [],
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
    s = db.query(LabSample).filter_by(dispatchId=dispatchId).first()
    if not s: raise HTTPException(status_code=404)
    
    s.stage = LabStage.RECEIVED
    s.receivedOn = datetime.utcnow()
    s.condition = req.condition
    s.temperature = req.temperature
    s.container = req.container
    
    # Create standard tests
    from app.models import LabTest, LabTestState
    
    tests = [
        LabTest(dispatchId=s.dispatchId, name="Product Quality", checks=["Fat", "SNF", "Acidity", "Adulteration"], state=LabTestState.ACTIVE),
        LabTest(dispatchId=s.dispatchId, name="Microbiological Safety", checks=["Standard Plate Count", "Coliform screening", "Pathogen screen"], state=LabTestState.PENDING),
        LabTest(dispatchId=s.dispatchId, name="Antimicrobial Residue", checks=["Beta-lactam", "Targeted residue analysis"], state=LabTestState.PENDING)
    ]
    db.add_all(tests)
    db.commit()
    
    return {
        "success": True,
        "dispatchId": s.dispatchId,
        "new_status": "READY FOR TESTING"
    }


@router.get("/queue")
def get_queue(db: Session = Depends(get_db)):
    samples = db.query(LabSample).all()
    awaiting = []
    ready = []

    priority_color_map = {
        "HIGH PRIORITY": "red",
        "MEDIUM": "amber",
        "LOW": "neutral",
    }

    for s in samples:
        p_color = priority_color_map.get(s.priority or "", "neutral")
        if s.stage == LabStage.AWAITING_RECEIPT:
            awaiting.append({
                "id": s.dispatchId,
                "product": s.product.name.capitalize(),
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
        elif s.stage == LabStage.RECEIVED:
            tests_list = []
            for t in (s.tests or []):
                tests_list.append({
                    "name": t.name,
                    "status": t.state.value if hasattr(t.state, "value") else str(t.state)
                })
            ready.append({
                "id": s.dispatchId,
                "product": s.product.name.capitalize(),
                "source": s.sourceName or "",
                "sample": s.sampleId,
                "tests": tests_list,
                "action": "Start Testing →"
            })

    return {
        "awaiting": awaiting,
        "ready": ready
    }

@router.get("/workspace/{sampleId}")
def get_workspace(sampleId: str, db: Session = Depends(get_db)):
    # Wait, api-contract says GET /api/lab/workspace/{dispatchId} or sampleId? 
    # Contract says /workspace/{sampleId} for sample detail and workspace
    s = db.query(LabSample).filter_by(dispatchId=sampleId).first()
    if not s:
        s = db.query(LabSample).filter_by(sampleId=sampleId).first()
    if not s: raise HTTPException(status_code=404)
    
    assessments = []
    for idx, t in enumerate(sorted(s.tests, key=lambda x: x.id)):
        assessments.append({
            "id": t.id,
            "num": idx + 1,
            "label": t.name,
            "state": t.state.value.lower() if hasattr(t.state, 'value') else str(t.state).lower(),
            "checks": t.checks,
            "result": t.result,
            "ok": t.ok
        })
        
    return {
        "dispatchId": s.dispatchId,
        "sampleId": s.sampleId,
        "product": s.product.name.capitalize(),
        "productSub": s.productLabel or "",
        "source": s.sourceName or "",
        "sourceSub": f"Animal: {s.animalId}" if s.animalId else "",
        "condition": s.condition or "",
        "temperature": s.temperature or "",
        "riskLevel": s.priority.replace(" PRIORITY", "").upper() if s.priority else "MODERATE",
        "antimicrobialContext": "",
        "antimicrobialStatus": "",
        "assessments": assessments
    }

class TestSubmission(BaseModel):
    test_id: str
    result_value: float
    unit: str
    operator: str
    verdict: str

@router.post("/workspace/{sampleId}/tests")
def submit_test(sampleId: str, req: TestSubmission, db: Session = Depends(get_db)):
    from app.models import LabTest, LabTestState
    s = db.query(LabSample).filter_by(dispatchId=sampleId).first()
    if not s:
        s = db.query(LabSample).filter_by(sampleId=sampleId).first()
    if not s: raise HTTPException(status_code=404)

    # Find the test
    test = db.query(LabTest).filter_by(id=req.test_id).first()
    if not test: raise HTTPException(status_code=404, detail="Test not found")

    mrl_limit = 0.1
    is_ok = req.result_value <= mrl_limit
    
    # Update the current test
    test.state = LabTestState.DONE
    test.result = f"{req.result_value} {req.unit}"
    test.ok = is_ok
    
    # Unlock the next test if any
    all_tests = sorted(s.tests, key=lambda x: x.id)
    next_test = next((t for t in all_tests if t.state == LabTestState.PENDING), None)
    if next_test:
        next_test.state = LabTestState.ACTIVE

    db.commit()

    return {
        "success": True,
        "sample_id": sampleId,
        "test_id": req.test_id,
        "verdict": "WITHIN_MRL" if is_ok else "EXCEEDED",
        "next_step": "verification_required" if not next_test else "continue"
    }

@router.post("/workspace/{sampleId}/submit_assessment")
def submit_assessment(sampleId: str, db: Session = Depends(get_db)):
    s = db.query(LabSample).filter_by(dispatchId=sampleId).first()
    if not s:
        s = db.query(LabSample).filter_by(sampleId=sampleId).first()
    if not s: raise HTTPException(status_code=404)
    
    s.stage = LabStage.AWAITING_VERIFICATION
    db.commit()
    
    return {"success": True, "sampleId": sampleId}

@router.get("/results")
def get_results(db: Session = Depends(get_db)):
    samples = db.query(LabSample).all()
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

    if req.action == "RELEASE":
        s.stage = LabStage.VERIFIED
        if fd: fd.status = DispatchStatus.CLEARED

        d = db.query(FarmerDispatch).filter_by(id=s.dispatchId).first()
        mrl_measured = str(measured_ppm) if measured_ppm is not None else (getattr(d, "mrlMeasuredPpm", "0.0") if d else "0.0")
        mrl_limit = str(limit_ppm) if limit_ppm else (getattr(d, "mrlPermittedPpm", "0.10") if d else "0.10")
        if d and measured_ppm is not None:
            d.mrlMeasuredPpm = str(measured_ppm)
            d.mrlPermittedPpm = str(limit_ppm)
        mrl_ok = True
        try:
            mrl_ok = float(mrl_measured) <= float(mrl_limit)
        except Exception:
            mrl_ok = within_limit
        mrl_ratio = 0.0
        try:
            mrl_ratio = float(mrl_measured) / float(mrl_limit) if float(mrl_limit) > 0 else 0.0
        except Exception:
            pass
        
        report = LabReport(
            dispatchId=s.dispatchId,
            refNo=f"REP-{s.dispatchId}",
            verifiedBy="Authorized Technician",
            verifiedOn=datetime.utcnow(),
            status="CLEARED" if req.action == "RELEASE" else "ON HOLD",
            statusColor="green" if req.action == "RELEASE" else "red",
            mrlDrug="Regulated Residue",
            mrlMeasured=float(mrl_measured) if mrl_measured else 0.0,
            mrlLimit=float(mrl_limit) if mrl_limit else 1.0,
            mrlUnit="ppm",
            mrlRatio=mrl_ratio,
            mrlVerdict="Within Limits" if mrl_ok else "Exceeds Limits",
            mrlVerdictOk=mrl_ok,
            withdrawalDrug="General Treatment",
            withdrawalAdministered="2026-08-01",
            withdrawalCompleted="2026-08-15",
            withdrawalStatus="Completed",
            outcome="Eligible for Release" if req.action == "RELEASE" else "Hold Recommended",
            outcomeOk=req.action == "RELEASE"
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

    is_release = req.action == "RELEASE"
    lab_results, safety, extra_timeline = lab_payload_from_sample(s, is_release=is_release)
    product_label = s.product.name.capitalize() if s.product else ""
    if s.animalId:
        update_latest_unverified(
            s.animalId,
            product_label,
            is_verified=is_release,
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
    reports = db.query(LabReport).all()
    
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

