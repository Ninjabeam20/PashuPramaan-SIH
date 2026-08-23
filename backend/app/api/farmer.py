from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel

from app.models import (
    User, Farm, Animal, HealthEvent, Prescription, Treatment, FarmerDispatch, 
    MedicineStock, AdminAnomaly, CareStatus, PrescriptionStatus, TreatmentPhase, DispatchStatus,
    StockLevel
)
from app.api.deps import get_db, get_current_user

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter_by(ownerId=current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")

    animals = db.query(Animal).filter_by(farmId=farm.id).all()
    total = len(animals)
    under_treatment = sum(1 for a in animals if a.careStatus == CareStatus.UNDER_TREATMENT)
    waiting = sum(1 for a in animals if a.careStatus in [CareStatus.IMPROVED, CareStatus.NO_CHANGE])
    clear = total - under_treatment - waiting

    attention_items = []
    
    # 1. Withdrawals
    active_withdrawals = db.query(Treatment).filter_by(farmId=farm.id, phase=TreatmentPhase.WITHDRAWAL).all()
    for i, t in enumerate(active_withdrawals):
        detail = t.withdrawal.productMessage if t.withdrawal else "Withdrawal in progress"
        attention_items.append({
            "id": f"attn-withdrawal-{i+1}",
            "priority": "HIGH",
            "title": t.animalId,
            "subtitle": "Withdrawal active",
            "detail": detail,
            "type": "animal"
        })
        
    # 2. Restock
    stocks = db.query(MedicineStock).filter_by(farmId=farm.id).all()
    restock_count = 0
    for s in stocks:
        if s.level == StockLevel.RESTOCK:
            restock_count += 1
            attention_items.append({
                "id": f"attn-stock-{restock_count}",
                "priority": "MEDIUM",
                "title": s.name,
                "subtitle": "Stock running low",
                "detail": "Reorder recommended",
                "type": "medicine"
            })

    medicine_stock = []
    for s in stocks:
        status_str = "good"
        if s.level == StockLevel.RESTOCK: status_str = "restock"
        elif s.level == StockLevel.MONITOR: status_str = "monitor"
        
        medicine_stock.append({
            "name": s.name,
            "quantity_label": f"{s.quantity} {s.unit}",
            "status": status_str
        })

    return {
        "farm": {
            "name": farm.name,
            "status": "ATTENTION" if under_treatment > 3 else "GOOD",
            "animal_count": total,
            "clear_count": clear,
            "under_treatment_count": under_treatment,
            "waiting_count": waiting
        },
        "attention_items": attention_items,
        "quick_actions": [
            { "id": "record_treatment", "label": "Record Treatment", "action": "record_treatment" },
            { "id": "health_event", "label": "Health Event", "action": "health_event" },
            { "id": "start_dispatch", "label": "Start Dispatch", "action": "start_dispatch" }
        ],
        "medicine_stock": medicine_stock
    }


@router.get("/animals")
def get_animals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter_by(ownerId=current_user.id).first()
    animals = db.query(Animal).filter_by(farmId=farm.id).all()
    
    items = []
    for a in animals:
        # status must be a string union matching AnimalItem["status"]
        if a.careStatus == CareStatus.UNDER_TREATMENT:
            status_str = "under_treatment"
        elif a.careStatus in [CareStatus.IMPROVED, CareStatus.NO_CHANGE]:
            status_str = "waiting"
        else:
            status_str = "healthy"
        items.append({
            "id": a.id,
            "species": a.species.value.capitalize(),
            "type": a.productionType,
            "breed": a.breed,
            "status": status_str
        })
    return {
        "summary": { "all_count": len(animals), "under_treatment_count": sum(1 for a in animals if a.careStatus == CareStatus.UNDER_TREATMENT) },
        "items": items
    }

@router.get("/animals/{animal_id}")
def get_animal_detail(animal_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    animal = db.query(Animal).filter_by(id=animal_id).first()
    if not animal: raise HTTPException(status_code=404)
    
    # status must be a string union matching AnimalDetail["status"]
    if animal.careStatus == CareStatus.UNDER_TREATMENT:
        status_str = "under_treatment"
    elif animal.careStatus in [CareStatus.IMPROVED, CareStatus.NO_CHANGE]:
        status_str = "waiting"
    else:
        status_str = "healthy"

    return {
        "id": animal.id,
        "type": animal.species.value.capitalize(),
        "status": status_str,
        "breed": animal.breed,
        "sex": animal.sex or "",
        "date_of_birth": animal.dateOfBirth.strftime("%d %b %Y") if hasattr(animal, "dateOfBirth") and animal.dateOfBirth else "",
        "production_type": animal.productionType or "",
        "registered_on": animal.registeredOn.strftime("%d %b %Y") if hasattr(animal, "registeredOn") and animal.registeredOn else "",
        "current_treatment": None
    }


@router.get("/vets")
def get_vets(db: Session = Depends(get_db)):
    from app.models import Vet
    vets = db.query(Vet).all()
    return {
        "items": [
            {
                "id": v.id,
                "name": v.name,
                "designation": v.designation,
                "vci_reg_no": v.vciRegNo or "VCI-12345"
            } for v in vets
        ]
    }

@router.get("/dispatch")
def get_dispatches(db: Session = Depends(get_db)):
    return {
        "summary": {
            "active_dispatches": 2,
            "ready_to_dispatch": 1,
            "under_withdrawal": 3,
            "blocked": 0
        },
        "items": [
            {
                "id": "DISP-F2026-0044",
                "product": "Milk",
                "animal_flock": "MP-087",
                "date": "23 Aug 2026",
                "status": "cleared"
            }
        ]
    }

class SafetyCheckReq(BaseModel):
    product_type: str
    animal_flock_id: str
    farm_id: Optional[str] = None

@router.post("/dispatch/safety-check")
def check_safety(req: SafetyCheckReq, db: Session = Depends(get_db)):
    # Standardized on 200 with eligible field per api-contract (3).md notes
    # prescription.signed must be a boolean, and lab_assay must be present
    return {
        "eligible": False,
        "withdrawal": {
            "status": "active",
            "detail": "Amoxicillin withdrawal active until 25 Aug 2026"
        },
        "mrl": {
            "status": "within_limit",
            "lab_result_ppm": "0.002",
            "permitted_ppm": "0.004"
        },
        "prescription": {
            "signed": True
        },
        "lab_assay": {
            "available": False
        }
    }

@router.post("/dispatch/passport")
def issue_passport(req: dict, db: Session = Depends(get_db)):
    return {
        "passport_id": "PP-2026-9999",
        "qr_data": "https://pashupramaan.gov.in/verify/PP-2026-9999",
        "issued_at": "2026-08-23T14:00:00Z"
    }

@router.get("/dispatch/{dispatchId}")
def get_dispatch_detail(dispatchId: str, db: Session = Depends(get_db)):
    return {
        "id": dispatchId,
        "product": "Milk",
        "date": "23 Aug 2026",
        "destination": "Anand Dairy Co-op",
        "quantity": "250 L",
        "status": "cleared",
        "statusColor": "green",
        "qr_data": "https://pashupramaan.gov.in/verify/DISP-F2026-0044",
        "passport_id": "PP-2026-8812",
        "history": [
            {"date": "20 Aug 2026", "action": "Sample dispatched to Regional Lab", "icon": "truck"},
            {"date": "22 Aug 2026", "action": "Lab Cleared: Beta-Lactam Negative", "icon": "check"}
        ]
    }

@router.get("/treatments")
def get_treatments(db: Session = Depends(get_db)):
    return {
        # Field names match TreatmentSummary interface exactly
        "summary": {
            "active_treatments": 1,
            "withdrawal_ongoing": 1,
            "awaiting_vet_unsigned": 0,
            "completed": 2
        },
        "items": [
            {
                "id": "TRT-001",
                "animal_flock": "MP-087",
                "species": "Cow",
                "drug_name": "Amoxicillin",
                "route_dosage": "IM · 5mg",
                "administered_time": "Administered 20 Aug 2026",
                "status": "Withdrawal",
                "badges": [
                    { "text": "Withdrawal Active", "variant": "withdrawal_active" },
                    { "text": "Vet Signed", "variant": "vet_signed" }
                ],
                "withdrawal": {
                    "dose_time": "20 Aug 2026",
                    "now_pct": 60,
                    "clear_label": "Clears 25 Aug",
                    "product_message": "Milk blocked until 25 Aug 2026"
                }
            }
        ]
    }

@router.get("/treatments/prescriptions")
def get_rx_options(db: Session = Depends(get_db)):
    # Must match PrescriptionOption interface: id, drug_name, dosage, route, rx_id, is_emergency_exception
    return [
        {
            "id": "RX-001",
            "drug_name": "Amoxicillin",
            "dosage": "5mg",
            "route": "IM",
            "rx_id": "RX-001",
            "is_emergency_exception": False
        }
    ]

@router.get("/treatments/{treatmentId}")
def get_treatment_detail(treatmentId: str, db: Session = Depends(get_db)):
    # Must match TreatmentDetail interface: id, animal_id, species, status_badges, medicine, route, dose, administered_at, reason, withdrawal, timeline
    return {
        "id": treatmentId,
        "animal_id": "MP-087",
        "species": "Cow",
        "status_badges": [{ "text": "WITHDRAWAL", "variant": "amber" }],
        "medicine": "Amoxicillin",
        "route": "IM",
        "dose": "5mg",
        "administered_at": "20 Aug 2026 · 09:00 AM",
        "reason": "Clinical mastitis",
        "withdrawal": {
            "dose_time": "20 Aug 2026",
            "now_pct": 60,
            "clear_label": "Clears 25 Aug",
            "product_message": "Milk blocked until 25 Aug 2026"
        },
        "timeline": [
            { "label": "Treatment Started", "status": "complete" },
            { "label": "Withdrawal Period", "status": "current" },
            { "label": "Cleared for Dispatch", "status": "upcoming" }
        ]
    }

@router.get("/insights")
def get_insights(db: Session = Depends(get_db)):
    return {
        "range": "30d",
        "medicine_stock": [
            {
                "name": "Amoxicillin",
                "current_stock": "450 ml",
                "recent_usage": "50 ml",
                "status": { "text": "GOOD", "variant": "good" }
            }
        ],
        "demand_forecast": {
            "chart_data": [
                { "month": "Jun", "past_usage": 300, "forecast": None },
                { "month": "Jul", "past_usage": 400, "forecast": None },
                { "month": "Aug", "past_usage": 450, "forecast": 450 },
                { "month": "Sep", "past_usage": None, "forecast": 480 }
            ],
            "now_index": 2,
            "current_stock": "450 ml",
            "expected_requirement": "480 ml",
            "status": { "text": "HIGH DEMAND EXPECTED", "variant": "orange" }
        },
        "most_used_medicines": [
            { "rank": 1, "name": "Amoxicillin", "usage": "150 ml", "usage_value": 150 },
            { "rank": 2, "name": "Meloxicam", "usage": "80 ml", "usage_value": 80 }
        ],
        "farm_health_map": [
            { "species": "Cows", "level": "High", "detail": "Multiple mastitis cases" },
            { "species": "Buffaloes", "level": "Low", "detail": "Generally healthy" }
        ],
        "farm_performance": {
            "chart_data": [
                { "month": "Jun", "milk_output": 1200, "medicine_cost": 25 },
                { "month": "Jul", "milk_output": 1100, "medicine_cost": 40 },
                { "month": "Aug", "milk_output": 1150, "medicine_cost": 35 }
            ]
        },
        "health_treatment_trends": {
            "chart_data": [
                { "month": "Jun", "health_events": 2, "treatments": 2 },
                { "month": "Jul", "health_events": 5, "treatments": 4 },
                { "month": "Aug", "health_events": 3, "treatments": 3 }
            ]
        }
    }
