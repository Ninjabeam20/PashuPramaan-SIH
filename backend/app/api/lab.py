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
            "sourceSub": f"Animal: {s.animalId}" if s.animalId else "",
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
        "risk": "MODERATE",
        "riskReason": "Recent antimicrobial exposure",
        "overallStatus": s.stage.name.replace("_", " "),
        "stages": [{"label": "Testing", "state": "active"}],
        "tests": [
            {
                "num": "02",
                "title": "Microbiological Safety",
                "checks": ["Standard plate count", "Coliform screening", "Pathogen screen"],
                "status": "IN PROGRESS",
                "statusColor": "amber",
                "action": "Continue Testing →",
                "active": True,
                "badge": None
            }
        ],
        "assessment": [
            {"label": "Traceability", "status": "Complete", "color": "green"}
        ],
        "notes": {
            "condition": "Acceptable",
            "temperature": "4.2°C",
            "container": "Intact",
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
                "sourceSub": f"Animal: {s.animalId}" if s.animalId else "",
                "sample": s.sampleId,
                "arrival": s.scheduledFor or "Pending",
                "priority": s.priority or "STANDARD",
                "priorityColor": p_color,
                "reason": "Recent antimicrobial exposure" if s.priority == "HIGH PRIORITY" else "",
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
    
    return {
        "dispatchId": s.dispatchId,
        "sampleId": s.sampleId,
        "product": s.product.name.capitalize(),
        "productSub": s.productLabel or "",
        "source": s.sourceName or "",
        "sourceSub": f"Animal: {s.animalId}" if s.animalId else "",
        "condition": "Good",
        "temperature": "4.2 °C",
        "riskLevel": "MODERATE",
        "antimicrobialContext": "Recent Amoxicillin administration noted on 20 Aug 2026.",
        "antimicrobialStatus": "High Risk",
        "assessments": [
            {"num": 1, "label": "Beta-Lactam Residue Screen", "state": "active"},
            {"num": 2, "label": "Microbiological Safety", "state": "pending"},
            {"num": 3, "label": "Antibiotic Residue Panel", "state": "pending"}
        ]
    }

class TestSubmission(BaseModel):
    test_id: str
    result_value: float
    unit: str
    operator: str
    verdict: str

@router.post("/workspace/{sampleId}/tests")
def submit_test(sampleId: str, req: TestSubmission, db: Session = Depends(get_db)):
    return {
        "success": True,
        "sample_id": sampleId,
        "test_id": req.test_id,
        "verdict": req.verdict,
        "next_step": "verification_required"
    }

@router.get("/results")
def get_results(db: Session = Depends(get_db)):
    return {
        "items": [
            {
                "id": "RES-882",
                "sampleId": "SMP-2026-0044",
                "product": "Milk",
                "testName": "Beta-Lactam Residue",
                "value": "0.012",
                "unit": "ppm",
                "mrl": "0.004 ppm",
                "verdict": "FAILED",
                "operator": "Dr. Sharma",
                "timestamp": "Today 14:30"
            }
        ]
    }

class VerificationRequest(BaseModel):
    action: str
    notes: Optional[str] = None

@router.post("/results/{resultId}/verify")
def verify_result(resultId: str, req: VerificationRequest, db: Session = Depends(get_db)):
    return {
        "success": True,
        "resultId": resultId,
        "status": "verified_released" if req.action == "RELEASE" else "held_for_retest"
    }

@router.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    return {
        "summary": [
            {"value": "124", "label": "Reports Generated", "color": "blue"},
            {"value": "8", "label": "Positive Violations", "color": "red"}
        ],
        "items": []
    }

