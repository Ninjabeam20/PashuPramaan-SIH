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
def get_dispatches(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models import FarmerDispatch, Farm
    farm = db.query(Farm).filter_by(ownerId=current_user.id).first()
    if not farm:
        return {"summary": {}, "items": []}
    
    dispatches = db.query(FarmerDispatch).filter_by(farmId=farm.id).order_by(desc(FarmerDispatch.createdAt)).all()
    # Remove dummy seeded data
    dispatches = [d for d in dispatches if len(d.id) > 7]
    
    items = []
    active_dispatches = 0
    ready_to_dispatch = 0
    under_withdrawal = 0
    blocked = 0
    lab_pending = 0
    
    for d in dispatches:
        status_lower = d.status.name.lower()
        if d.status.name == "CLEARED":
            ready_to_dispatch += 1
            active_dispatches += 1
        elif d.status.name == "WITHDRAWAL":
            under_withdrawal += 1
        elif d.status.name == "BLOCKED":
            blocked += 1
        elif d.status.name == "LAB_PENDING":
            lab_pending += 1
            status_lower = "lab_pending"
            
        items.append({
            "id": d.id,
            "product": d.product.name.capitalize(),
            "animal_flock": d.animalId,
            "date": d.dateLabel,
            "status": status_lower,
            "mrlMeasuredPpm": d.mrlMeasuredPpm,
            "mrlPermittedPpm": d.mrlPermittedPpm,
        })
        
    return {
        "summary": {
            "active_dispatches": active_dispatches,
            "ready_to_dispatch": ready_to_dispatch,
            "under_withdrawal": under_withdrawal,
            "blocked": blocked,
            "lab_pending": lab_pending
        },
        "items": items
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
                
    mrl_status = "pending"
    lab_result_ppm = 0.0
    permitted_ppm = 0.1 
    lab_available = False
    
    sample = db.query(LabSample).filter_by(animalId=req.animal_flock_id).order_by(desc(LabSample.createdAt)).first()
    if sample and sample.report:
        lab_available = True
        lab_result_ppm = sample.report.mrlMeasured
        permitted_ppm = sample.report.mrlLimit
        if sample.report.mrlVerdict in ["EXCEEDED", "Exceeds Limits"] or not sample.report.mrlVerdictOk:
            mrl_status = "exceeded"
            eligible = False
        else:
            mrl_status = "within_limit"
    else:
        # If no lab result is on file, verification is pending and dispatch is blocked
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

def _product_type_from_name(product: str) -> ProductType:
    name = (product or "").lower()
    if name == "meat":
        return ProductType.MEAT
    if name == "eggs":
        return ProductType.EGGS
    return ProductType.MILK


def _ensure_open_lab_sample(db: Session, farm, animal_id: str, product: str):
    """Create a lab sample for this animal+product, or reuse one still in the pipeline."""
    from datetime import datetime
    import uuid
    from app.models import LabSample, LabStage

    if farm is None:
        raise HTTPException(status_code=400, detail="Farm not found")

    product_type = _product_type_from_name(product)
    open_stages = (
        LabStage.AWAITING_RECEIPT,
        LabStage.RECEIVED,
        LabStage.TESTING,
        LabStage.AWAITING_VERIFICATION,
    )
    existing = (
        db.query(LabSample)
        .filter(
            LabSample.animalId == animal_id,
            LabSample.product == product_type,
            LabSample.stage.in_(open_stages),
        )
        .order_by(desc(LabSample.createdAt))
        .first()
    )
    if existing:
        return {
            "dispatch_id": existing.dispatchId,
            "sample_id": existing.sampleId,
            "product_type": product_type,
            "created": False,
        }

    dsp_id = f"DSP-{str(uuid.uuid4())[:6].upper()}"
    sample_id = f"SMP-{str(uuid.uuid4())[:6].upper()}"
    date_label = datetime.utcnow().strftime("%d %b %Y")
    ls = LabSample(
        dispatchId=dsp_id,
        sampleId=sample_id,
        product=product_type,
        productSub="Raw",
        productLabel=product,
        farmId=farm.id,
        animalId=animal_id,
        sourceName=farm.name,
        quantity="1 Sample",
        scheduledFor=date_label,
        priority="Standard",
        stage=LabStage.AWAITING_RECEIPT,
    )
    db.add(ls)
    db.flush()
    fd = FarmerDispatch(
        id=dsp_id,
        farmId=farm.id,
        animalId=animal_id,
        product=product_type,
        dateLabel=date_label,
        status=DispatchStatus.LAB_PENDING,
        prescriptionSigned=True,
        labDispatchId=dsp_id,
    )
    db.add(fd)
    db.commit()
    return {
        "dispatch_id": dsp_id,
        "sample_id": sample_id,
        "product_type": product_type,
        "created": True,
    }


class PassportIssueReq(BaseModel):
    product: str
    animal_ids: List[str]
    safety_check_id: Optional[str] = None

@router.post("/dispatch/passport")
def issue_passport(req: PassportIssueReq, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import datetime
    import uuid
    from app.supabase_passports import (
        PassportWriteError,
        assemble_row,
        qr_verify_url,
        upsert_passport,
    )
    
    if not req.animal_ids:
        raise HTTPException(status_code=400, detail="No animal specified")
        
    animal_id = req.animal_ids[0]
    
    sc_req = SafetyCheckReq(product_type=req.product, animal_flock_id=animal_id)
    sc_res = check_safety(sc_req, db)
        
    farm = db.query(Farm).filter_by(ownerId=current_user.id).first()
    if not farm:
        farm = db.query(Farm).first()

    lab_row = _ensure_open_lab_sample(db, farm, animal_id, req.product)
    product_type = lab_row["product_type"]
    date_label = datetime.utcnow().strftime("%d %b %Y")
    passport_id = f"PP-2026-{uuid.uuid4().hex[:8].upper()}"

    row = assemble_row(
        passport_id=passport_id,
        product=req.product,
        animal_id=animal_id,
        farm=farm,
        sc_res=sc_res,
        db=db,
        is_verified=False,
    )
    try:
        upsert_passport(row)
    except PassportWriteError:
        raise HTTPException(
            status_code=502,
            detail="Could not publish the public passport. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        )
    
    lab_status = "No assay on file"
    if sc_res["lab_assay"]["available"]:
        lab_status = sc_res["mrl"]["status"].replace("_", " ").title()
        
    return {
        "passport_id": passport_id,
        "dispatch_id": lab_row["dispatch_id"],
        "sample_id": lab_row["sample_id"],
        "product": product_type.name.capitalize(),
        "farm": farm.name if farm else "",
        "animal_flock": animal_id,
        "dispatch_date": date_label,
        "withdrawal": sc_res["withdrawal"]["status"].capitalize(),
        "mrl": lab_status,
        "prescription": "Vet Signed" if sc_res["prescription"]["signed"] else "Unsigned",
        "lab": lab_status,
        "qr_verify_url": qr_verify_url(passport_id)
    }

@router.post("/dispatch/send-to-lab")
def send_to_lab(req: PassportIssueReq, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not req.animal_ids:
        raise HTTPException(status_code=400, detail="No animal specified")

    animal_id = req.animal_ids[0]
    animal = db.query(Animal).filter_by(id=animal_id).first()
    if not animal:
        animal = db.query(Animal).first()
        if animal:
            animal_id = animal.id

    farm = db.query(Farm).filter_by(ownerId=current_user.id).first()
    if not farm:
        farm = db.query(Farm).first()

    lab_row = _ensure_open_lab_sample(db, farm, animal_id, req.product)
    return {
        "dispatch_id": lab_row["dispatch_id"],
        "sample_id": lab_row["sample_id"],
        "status": "lab_pending",
    }

@router.get("/dispatch/{dispatchId}")
def get_dispatch_detail(dispatchId: str, db: Session = Depends(get_db)):
    from app.models import FarmerDispatch
    from fastapi import HTTPException
    
    d = db.query(FarmerDispatch).filter_by(id=dispatchId).first()
    if not d:
        raise HTTPException(status_code=404, detail="Dispatch not found")
        
    status_lower = d.status.name.lower()
    if status_lower == "lab_pending":
        status_color = "amber"
    elif status_lower == "cleared":
        status_color = "green"
    elif status_lower == "withdrawal":
        status_color = "amber"
    else:
        status_color = "red"
        
    res = {
        "id": d.id,
        "product": d.product.name.capitalize(),
        "animal_flock": d.animalId,
        "date": d.dateLabel,
        "destination": "Anand Dairy Co-op",
        "quantity": "250 L",
        "status": status_lower,
        "statusColor": status_color,
        "qr_data": f"https://pashupramaan.gov.in/verify/{d.id}",
        "passport_id": f"PP-{d.id}",
        "mrlMeasuredPpm": d.mrlMeasuredPpm,
        "mrlPermittedPpm": d.mrlPermittedPpm,
        "timeline": []
    }
    
    if status_lower == "cleared":
        res["cleared_checklist"] = [
            "Withdrawal Cleared",
            "Vet Signed",
            f"Lab Tested: Within MRL ({d.mrlMeasuredPpm} ppm / {d.mrlPermittedPpm} ppm)" if d.mrlMeasuredPpm else "No lab assay required"
        ]
    elif status_lower == "blocked":
        res["blocked_detail"] = {
            "failed_gates": [
                { "message": f"Lab Test Failed: MRL Exceeded ({d.mrlMeasuredPpm} ppm / {d.mrlPermittedPpm} ppm)" if d.mrlMeasuredPpm else "Safety check failed" }
            ],
            "warnings": []
        }
    return res

@router.get("/treatments")
def get_treatments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models import Treatment, Farm
    
    farms = db.query(Farm).filter_by(ownerId=current_user.id).all()
    if not farms:
        # Fallback to all treatments if no mapping yet for the demo
        treatments = db.query(Treatment).order_by(desc(Treatment.createdAt)).all()
        # Ensure we have some farm context for species resolution
        all_farms = db.query(Farm).all()
    else:
        farm_ids = [f.id for f in farms]
        treatments = db.query(Treatment).filter(Treatment.farmId.in_(farm_ids)).order_by(desc(Treatment.createdAt)).all()
        all_farms = farms
    
    active = 0
    withdrawal = 0
    unsigned = 0
    completed = 0
    
    items = []
    for trt in treatments:
        # compute summary stats
        if not trt.signed: unsigned += 1
        if trt.phase.name == "COMPLETED": completed += 1
        elif trt.phase.name == "WITHDRAWAL": withdrawal += 1
        elif trt.phase.name == "ACTIVE": active += 1
        
        status_val = "Active"
        if trt.phase.name == "COMPLETED": status_val = "Completed"
        elif trt.phase.name == "WITHDRAWAL": status_val = "Withdrawal"
        if not trt.signed: status_val = "Unsigned"
        
        badges = []
        if trt.phase.name == "WITHDRAWAL": badges.append({ "text": "Withdrawal Active", "variant": "withdrawal_active" })
        if trt.signed: badges.append({ "text": "Vet Signed", "variant": "vet_signed" })
        elif not trt.signed and trt.emergency: badges.append({ "text": "Unsigned Emergency", "variant": "unsigned_emergency" })
            
        withdrawal_data = None
        if trt.withdrawal:
            from datetime import datetime
            now = datetime.utcnow()
            total_duration = (trt.withdrawal.clearsAt - trt.withdrawal.doseTime).total_seconds()
            elapsed = (now - trt.withdrawal.doseTime).total_seconds()
            
            now_pct = 0
            if total_duration > 0:
                now_pct = max(0, min(100, int((elapsed / total_duration) * 100)))
                
            withdrawal_data = {
                "dose_time": trt.withdrawal.doseTime.isoformat(),
                "now_pct": now_pct,
                "clear_label": trt.withdrawal.clearLabel,
                "product_message": f"{trt.withdrawal.productMessage.capitalize()} blocked until {trt.withdrawal.clearsAt.strftime('%d %b')}"
            }
            
        animal_obj = None
        for f in all_farms:
            found = next((a for a in f.animals if a.id == trt.animalId), None)
            if found:
                animal_obj = found
                break
        species_val = animal_obj.species.name.capitalize() if animal_obj else ""
        
        items.append({
            "id": trt.id,
            "animal_flock": trt.animalId,
            "species": species_val,
            "drug_name": trt.drug,
            "route_dosage": f"{trt.route} · {trt.dosage}",
            "administered_time": trt.administeredLabel,
            "status": status_val,
            "badges": badges,
            "withdrawal": withdrawal_data
        })
        
    return {
        "summary": {
            "active_treatments": active,
            "withdrawal_ongoing": withdrawal,
            "awaiting_vet_unsigned": unsigned,
            "completed": completed
        },
        "items": items
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
        
        animal.followUpDue = True # Trigger follow-up when treated
        
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
        
        # Deduct from medicine stock
        import re
        from app.models import MedicineStock, StockLevel
        ms = db.query(MedicineStock).filter_by(farmId=farm.id, name=drug).first()
        if ms:
            match = re.search(r'(\d+)', dose)
            qty_used = int(match.group(1)) if match else 1
            ms.quantity = max(0, ms.quantity - qty_used)
            ms.recentUsage = (ms.recentUsage or 0) + qty_used
            ms.usageTotal = (ms.usageTotal or 0) + qty_used
            
            # Update stock level indicator
            if ms.quantity <= 10:
                ms.level = StockLevel.RESTOCK
            elif ms.quantity <= 50:
                ms.level = StockLevel.MONITOR
            else:
                ms.level = StockLevel.GOOD
        
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
def get_rx_options(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models import Prescription, PrescriptionStatus, Farm, Treatment
    
    farms = db.query(Farm).filter_by(ownerId=current_user.id).all()
    if not farms:
        return []
        
    farm_ids = [f.id for f in farms]
    
    # Get signed prescriptions that DO NOT have a matching Treatment
    prescriptions = db.query(Prescription).filter(
        Prescription.farmId.in_(farm_ids),
        Prescription.status == PrescriptionStatus.SIGNED,
        ~Prescription.id.in_(db.query(Treatment.prescriptionId).filter(Treatment.prescriptionId.isnot(None)))
    ).all()
    
    options = []
    for rx in prescriptions:
        options.append({
            "id": rx.id,
            "drug_name": rx.drug,
            "dosage": rx.dose,
            "route": rx.route,
            "rx_id": rx.id,
            "animal_id": rx.animalId,
            "diagnosis": rx.diagnosis,
            "is_emergency_exception": False
        })
        
    return options

@router.get("/treatments/{treatmentId}")
def get_treatment_detail(treatmentId: str, db: Session = Depends(get_db)):
    from app.models import Treatment, Animal, Withdrawal, TreatmentPhase
    from datetime import datetime
    
    trt = db.query(Treatment).filter(Treatment.id == treatmentId).first()
    if not trt:
        return {} # return empty or 404
        
    animal = db.query(Animal).filter(Animal.id == trt.animalId).first()
    species_name = animal.species.name.capitalize() if animal else ""
    
    badges = []
    if trt.phase.name == "WITHDRAWAL":
        badges.append({"text": "WITHDRAWAL", "variant": "amber"})
    elif trt.phase.name == "COMPLETED":
        badges.append({"text": "COMPLETED", "variant": "green"})
    elif trt.phase.name == "ACTIVE":
        badges.append({"text": "ACTIVE", "variant": "blue"})
    
    if trt.signed:
        badges.append({"text": "VET SIGNED", "variant": "green"})
        
    wd_data = None
    if trt.withdrawal:
        wd = trt.withdrawal
        now = datetime.utcnow()
        total_duration = (wd.clearsAt - wd.doseTime).total_seconds()
        elapsed = (now - wd.doseTime).total_seconds()
        
        now_pct = 0
        if total_duration > 0:
            now_pct = max(0, min(100, int((elapsed / total_duration) * 100)))
            
        wd_data = {
            "dose_time": wd.doseTime.isoformat(),
            "now_pct": now_pct,
            "clear_label": wd.clearLabel,
            "product_message": f"{wd.productMessage.capitalize()} blocked until {wd.clearsAt.strftime('%d %b %Y')}"
        }
        
    timeline = []
    if trt.phase.name == "ACTIVE":
        timeline = [
            { "label": "Treatment Started", "status": "current" },
            { "label": "Withdrawal Period", "status": "upcoming" },
            { "label": "Cleared for Dispatch", "status": "upcoming" }
        ]
    elif trt.phase.name == "WITHDRAWAL":
        timeline = [
            { "label": "Treatment Started", "status": "complete" },
            { "label": "Withdrawal Period", "status": "current" },
            { "label": "Cleared for Dispatch", "status": "upcoming" }
        ]
    elif trt.phase.name == "COMPLETED":
        timeline = [
            { "label": "Treatment Started", "status": "complete" },
            { "label": "Withdrawal Period", "status": "complete" },
            { "label": "Cleared for Dispatch", "status": "complete" }
        ]

    return {
        "id": trt.id,
        "animal_id": trt.animalId,
        "species": species_name,
        "status_badges": badges,
        "medicine": trt.drug,
        "route": trt.route,
        "dose": trt.dosage,
        "administered_at": trt.administeredLabel,
        "reason": getattr(trt, 'reason', 'Emergency treatment'),
        "withdrawal": wd_data,
        "timeline": timeline
    }

@router.get("/insights")
def get_insights(
    range: str = "30d",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.forecast.farmer_insights import build_farmer_insights, _month_start

    farm = db.query(Farm).filter_by(ownerId=current_user.id).first()
    if not farm:
        farm = db.query(Farm).first()

    medicine_stocks = db.query(MedicineStock).filter_by(farmId=farm.id).all()

    stock_list = []
    for ms in medicine_stocks:
        stock_list.append({
            "name": ms.name,
            "current_stock": f"{ms.quantity} {ms.unit}",
            "recent_usage": f"{ms.recentUsage} {ms.unit}",
            "status": {"text": ms.level.name, "variant": ms.level.name.lower()},
        })

    sorted_by_usage = sorted(
        medicine_stocks, key=lambda x: x.usageTotal or x.recentUsage or 0, reverse=True
    )
    max_usage = (
        (sorted_by_usage[0].usageTotal or sorted_by_usage[0].recentUsage or 0)
        if sorted_by_usage
        else 0
    )

    most_used_list = []
    for idx, ms in enumerate(sorted_by_usage[:5]):
        val = ms.usageTotal or ms.recentUsage or 0
        if val > 0:
            rel_val = int((val / max_usage) * 100) if max_usage > 0 else 0
            most_used_list.append({
                "rank": idx + 1,
                "name": ms.name,
                "usage": f"{val} {ms.unit}",
                "usage_value": rel_val,
            })

    if not most_used_list:
        most_used_list = [
            {"rank": 1, "name": "No data yet", "usage": "0 ml", "usage_value": 0}
        ]

    live_treatments: dict = {}
    for trt in db.query(Treatment).filter_by(farmId=farm.id).all():
        key = _month_start(trt.administeredOn)
        if key:
            live_treatments[key] = live_treatments.get(key, 0) + 1

    animal_ids = [a.id for a in db.query(Animal).filter_by(farmId=farm.id).all()]
    live_events: dict = {}
    if animal_ids:
        for ev in db.query(HealthEvent).filter(HealthEvent.animalId.in_(animal_ids)).all():
            key = _month_start(ev.onset)
            if key:
                live_events[key] = live_events.get(key, 0) + 1

    try:
        charts = build_farmer_insights(
            range,
            current_stock_label=stock_list[0]["current_stock"] if stock_list else "0 ml",
            cows=farm.cowsCount or 10,
            buffaloes=farm.buffaloesCount or 20,
            live_treatments_by_month=live_treatments,
            live_events_by_month=live_events,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "range": charts["range"],
        "medicine_stock": stock_list,
        "demand_forecast": charts["demand_forecast"],
        "most_used_medicines": most_used_list,
        "farm_health_map": [
            {"species": "Cows", "level": "High", "detail": "Multiple mastitis cases"},
            {"species": "Buffaloes", "level": "Low", "detail": "Generally healthy"},
        ],
        "farm_performance": charts["farm_performance"],
        "health_treatment_trends": charts["health_treatment_trends"],
    }

class AddStockReq(BaseModel):
    drug_id: str
    quantity: int

@router.post("/inventory/stock")
def add_stock(req: AddStockReq, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models import Drug, StockLevel
    
    farm = db.query(Farm).filter_by(ownerId=current_user.id).first()
    if not farm: farm = db.query(Farm).first()
    
    drug = db.query(Drug).filter_by(id=req.drug_id).first()
    if not drug:
        raise HTTPException(status_code=400, detail="Invalid drug ID")
        
    ms = db.query(MedicineStock).filter_by(farmId=farm.id, name=drug.name).first()
    if ms:
        ms.quantity += req.quantity
    else:
        unit_val = "mL" if "Liquid" in (drug.formulation or "") or "Injectable" in (drug.formulation or "") else "doses"
        ms = MedicineStock(
            farmId=farm.id,
            name=drug.name,
            quantity=req.quantity,
            unit=unit_val,
            recentUsage=0,
            usageTotal=0,
            level=StockLevel.GOOD
        )
        db.add(ms)
        
    db.commit()
    return {"success": True}

@router.get("/drugs")
def get_drugs(db: Session = Depends(get_db)):
    from app.models import Drug
    drugs = db.query(Drug).order_by(Drug.name).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "formulation": d.formulation
        } for d in drugs
    ]
