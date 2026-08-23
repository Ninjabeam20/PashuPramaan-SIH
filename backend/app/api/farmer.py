from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel

from app.models import (
    User, Farm, Animal, HealthEvent, Prescription, Treatment, FarmerDispatch, 
    MedicineStock, AdminAnomaly, CareStatus, PrescriptionStatus, TreatmentPhase, DispatchStatus,
    StockLevel, Withdrawal, ProductType, Species
)
from app.formulary import get_withdrawal_hours
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
    from datetime import datetime
    from app.models import Animal, Treatment, TreatmentPhase, LabSample
    
    active_treatments = db.query(Treatment).filter(
        Treatment.animalId == req.animal_flock_id,
        Treatment.phase == TreatmentPhase.WITHDRAWAL
    ).all()
    
    now = datetime.utcnow()
    eligible = True
    
    withdrawal_status = "cleared"
    withdrawal_detail = None
    presc_signed = True
    
    for trt in active_treatments:
        if not trt.signed:
            presc_signed = False
            eligible = False
            
        if trt.withdrawal:
            if trt.withdrawal.clearsAt > now:
                withdrawal_status = "active"
                withdrawal_detail = f"{trt.drug} withdrawal active until {trt.withdrawal.clearsAt.strftime('%d %b %Y, %I:%M %p')}"
                eligible = False
            else:
                trt.phase = TreatmentPhase.COMPLETED
                db.commit()
                
    mrl_status = "within_limit"
    lab_result_ppm = 0.0
    permitted_ppm = 0.1 
    lab_available = False
    
    sample = db.query(LabSample).filter_by(animalId=req.animal_flock_id).order_by(desc(LabSample.createdAt)).first()
    if sample and sample.report:
        lab_available = True
        lab_result_ppm = sample.report.mrlMeasured
        permitted_ppm = sample.report.mrlLimit
        if sample.report.mrlVerdict == "EXCEEDED":
            mrl_status = "exceeded"
            eligible = False
            
    return {
        "eligible": eligible,
        "withdrawal": {
            "status": withdrawal_status,
            "detail": withdrawal_detail
        },
        "mrl": {
            "status": mrl_status,
            "lab_result_ppm": lab_result_ppm,
            "permitted_ppm": permitted_ppm
        },
        "prescription": {
            "signed": presc_signed
        },
        "lab_assay": {
            "available": lab_available
        }
    }

class PassportIssueReq(BaseModel):
    product: str
    animal_ids: List[str]
    safety_check_id: Optional[str] = None

@router.post("/dispatch/passport")
def issue_passport(req: PassportIssueReq, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import datetime
    import uuid
    from fastapi import HTTPException
    
    if not req.animal_ids:
        raise HTTPException(status_code=400, detail="No animal specified")
        
    animal_id = req.animal_ids[0]
    
    # Re-run safety check
    sc_req = SafetyCheckReq(product_type=req.product, animal_flock_id=animal_id)
    sc_res = check_safety(sc_req, db)
    
    if not sc_res.get("eligible"):
        raise HTTPException(status_code=409, detail="Safety check failed. Dispatch blocked.")
        
    farm = db.query(Farm).filter_by(ownerId=current_user.id).first()
    if not farm: farm = db.query(Farm).first()
    
    # Check ProductType
    product_type = ProductType.MILK
    if req.product.lower() == "meat": product_type = ProductType.MEAT
    elif req.product.lower() == "eggs": product_type = ProductType.EGGS
    
    dsp_id = f"DSP-{str(uuid.uuid4())[:6].upper()}"
    passport_id = f"PP-2026-{str(uuid.uuid4())[:4].upper()}"
    
    fd = FarmerDispatch(
        id=dsp_id,
        farmId=farm.id,
        animalId=animal_id,
        product=product_type,
        dateLabel=datetime.utcnow().strftime("%d %b %Y"),
        status=DispatchStatus.CLEARED,
        prescriptionSigned=sc_res["prescription"]["signed"],
        mrlMeasuredPpm=str(sc_res["mrl"]["lab_result_ppm"]),
        mrlPermittedPpm=str(sc_res["mrl"]["permitted_ppm"])
    )
    db.add(fd)
    db.commit()
    
    lab_status = "No assay on file"
    if sc_res["lab_assay"]["available"]:
        lab_status = sc_res["mrl"]["status"].replace("_", " ").title()
        
    return {
        "passport_id": passport_id,
        "dispatch_id": dsp_id,
        "product": product_type.name.capitalize(),
        "farm": farm.name,
        "animal_flock": animal_id,
        "dispatch_date": fd.dateLabel,
        "withdrawal": sc_res["withdrawal"]["status"].capitalize(),
        "mrl": lab_status,
        "prescription": "Vet Signed" if sc_res["prescription"]["signed"] else "Unsigned",
        "lab": lab_status,
        "qr_verify_url": f"https://pashupramaan.gov.in/verify/{passport_id}"
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

class CreateTreatmentReq(BaseModel):
    animal_ids: List[str]
    prescription_option_id: str
    timing: str = "now"
    backdated_at: Optional[str] = None

@router.post("/treatments")
def create_treatment(req: CreateTreatmentReq, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import datetime, timedelta
    import uuid
    
    farm = db.query(Farm).filter_by(ownerId=current_user.id).first()
    if not farm: farm = db.query(Farm).first() # fallback for demo
    
    is_emergency = req.prescription_option_id == "emergency"
    
    rx = None
    if not is_emergency:
        rx = db.query(Prescription).filter_by(id=req.prescription_option_id).first()
        if not rx: rx = db.query(Prescription).first()
            
    drug = rx.drug if rx else "Oxytetracycline"
    route = rx.route if rx else "Injection"
    dose = rx.dose if rx else "10 mL"
    
    admin_time = datetime.utcnow()
    if req.timing == "backdated" and req.backdated_at:
        admin_time = datetime.fromisoformat(req.backdated_at.replace("Z", "+00:00"))
        
    created_treatments = []
    
    for a_id in req.animal_ids:
        animal = db.query(Animal).filter_by(id=a_id).first()
        if not animal: continue
        
        trt_id = f"TRT-{str(uuid.uuid4())[:8].upper()}"
        trt = Treatment(
            id=trt_id,
            animalId=animal.id,
            farmId=farm.id,
            prescriptionId=rx.id if rx else None,
            drug=drug,
            route=route,
            dosage=dose,
            administeredLabel=f"Administered {admin_time.strftime('%d %b %Y')}",
            administeredOn=admin_time,
            phase=TreatmentPhase.WITHDRAWAL,
            signed=True if rx and rx.status == PrescriptionStatus.SIGNED else False,
            emergency=is_emergency,
            reason=rx.reason if rx else "Emergency treatment"
        )
        db.add(trt)
        
        prod_type = ProductType.MILK
        if "meat" in animal.productionType.lower(): prod_type = ProductType.MEAT
        elif "egg" in animal.productionType.lower(): prod_type = ProductType.EGGS
        
        hours = get_withdrawal_hours(drug, animal.species, route, prod_type)
        clears_at = admin_time + timedelta(hours=hours)
        
        wd = Withdrawal(
            treatmentId=trt.id,
            doseTime=admin_time,
            nowPct=0.0,
            clearLabel=f"Clears {clears_at.strftime('%d %b, %I:%M %p')}",
            productMessage=prod_type.name.lower(),
            clearsAt=clears_at
        )
        db.add(wd)
        
        created_treatments.append({
            "id": trt.id,
            "animal_id": animal.id,
            "species": animal.species.name.capitalize(),
            "feed_batch": trt.feedBatch,
            "drug": trt.drug,
            "route": trt.route,
            "dosage": trt.dosage,
            "administered_at": admin_time.isoformat(),
            "status_badge": { "text": "Withdrawal Active", "variant": "amber" },
            "secondary_badges": [],
            "withdrawal": {
                "dose_time": admin_time.isoformat(),
                "now_pct": 0,
                "clear_label": f"Clears {clears_at.strftime('%d %b, %I:%M %p')}",
                "product": prod_type.name.lower()
            }
        })
        
    db.commit()
    
    if len(created_treatments) > 0:
        return created_treatments[0]
    return {"success": False, "detail": "No treatments created"}

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
