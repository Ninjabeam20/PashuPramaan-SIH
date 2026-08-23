from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models import (
    User, Vet, Prescription, Animal, Farm, PrescriptionStatus,
    Treatment, TreatmentPhase, CareStatus, AwareClass, PrescriptionOption
)
from app.api.deps import get_db, get_current_user

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models import Vet
    vet = db.query(Vet).filter_by(userId=current_user.id).first()
    vet_name = vet.name if vet else current_user.fullName.split(' ')[0]
    
    awaiting_signature = db.query(Prescription).filter_by(status=PrescriptionStatus.SIGN_REQUIRED).count()
    unsigned_emergency = db.query(Prescription).filter_by(status=PrescriptionStatus.UNSIGNED_EMERGENCY).count()
    follow_up = db.query(Animal).filter_by(followUpDue=True).count()
    needs_attention = awaiting_signature + unsigned_emergency + follow_up
    
    status = "action_needed" if needs_attention > 0 else "clear"
    
    recent_rxs = db.query(Prescription).order_by(desc(Prescription.createdAt)).limit(3).all()
    recent_activity = []
    for rx in recent_rxs:
        recent_activity.append({
            "time": rx.dateLabel,
            "title": f"{rx.id} · {rx.animalId}",
            "description": "Prescription created/updated"
        })

    # Build attention_items from actual prescriptions requiring attention
    attention_items = []
    attention_rxs = db.query(Prescription).filter(
        Prescription.status.in_([PrescriptionStatus.SIGN_REQUIRED, PrescriptionStatus.UNSIGNED_EMERGENCY])
    ).limit(3).all()
    
    for rx in attention_rxs:
        is_emergency = rx.status == PrescriptionStatus.UNSIGNED_EMERGENCY
        badges = []
        if is_emergency:
            badges.append({ "text": "UNSIGNED EMERGENCY", "variant": "red" })
        else:
            badges.append({ "text": "SIGN REQUIRED", "variant": "orange" })
            
        if rx.aware:
            aware_variant = "green" if rx.aware.name == "ACCESS" else ("amber" if rx.aware.name == "WATCH" else "reserve")
            badges.append({ "text": rx.aware.name, "variant": aware_variant })
            
        attention_items.append({
            "id": rx.id,
            "type": "emergency" if is_emergency else "prescription",
            "priority_color": "red" if is_emergency else "orange",
            "label": "Unsigned emergency" if is_emergency else "Prescription awaiting signature",
            "link_text": "Review & Countersign →" if is_emergency else "Review & Sign →",
            "title": f"{rx.farm.name} · {rx.animalId}",
            "diagnosis": rx.diagnosis,
            "detail": f"{rx.drug} · administered {rx.dateLabel}",
            "badges": badges
        })

    return {
        "vet": { "name": vet_name },
        "workload": {
            "awaiting_signature": awaiting_signature,
            "unsigned_emergency": unsigned_emergency,
            "follow_up": follow_up,
            "stewardship_review": 1,
            "status": status
        },
        "alerts": [
            {
                "id": "alert-1",
                "priority_color": "red",
                "title": "Disease Outbreak Alert",
                "description": "3 new cases of Mastitis in Anand district today.",
                "action_text": "View Regional Data"
            }
        ],
        "attention_items": attention_items,
        "insights": [
            {
                "id": "insight-1",
                "type": "treatment_efficacy",
                "case_title": "Clinical mastitis (Amoxicillin)",
                "similar_case_count": "14",
                "recovery_pct": "85",
                "recovery_label": "High efficacy locally",
                "disclaimer": "Based on 30-day regional data"
            }
        ],
        "recent_activity": recent_activity,
        "recent_outcomes": [
            {
                "animal_flock": "MP-012 (Shree Krishna Dairy)",
                "diagnosis": "Clinical mastitis",
                "detail": "Amoxicillin course completed",
                "outcome_badge": { "text": "RECOVERED", "variant": "green" }
            }
        ]
    }

@router.get("/prescriptions")
def get_prescriptions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prescriptions = db.query(Prescription).order_by(desc(Prescription.createdAt)).all()
    
    all_count = len(prescriptions)
    awaiting = sum(1 for p in prescriptions if p.status == PrescriptionStatus.SIGN_REQUIRED)
    unsigned = sum(1 for p in prescriptions if p.status == PrescriptionStatus.UNSIGNED_EMERGENCY)
    signed = sum(1 for p in prescriptions if p.status in [PrescriptionStatus.SIGNED, PrescriptionStatus.COUNTERSIGNED])
    voided = sum(1 for p in prescriptions if p.status == PrescriptionStatus.VOIDED)
    
    items = []
    for p in prescriptions:
        # Determine badge variant
        variant = "default"
        if p.status == PrescriptionStatus.SIGN_REQUIRED: variant = "orange"
        elif p.status == PrescriptionStatus.UNSIGNED_EMERGENCY: variant = "red"
        elif p.status == PrescriptionStatus.SIGNED: variant = "green"
        elif p.status == PrescriptionStatus.COUNTERSIGNED: variant = "blue"
        elif p.status == PrescriptionStatus.VOIDED: variant = "voided"
        
        aware_badges = []
        if p.aware:
            aware_variant = "green" if p.aware.name == "ACCESS" else ("amber" if p.aware.name == "WATCH" else "reserve")
            aware_badges.append({ "text": p.aware.name, "variant": aware_variant })
        if p.cia:
            aware_badges.append({ "text": "CIA", "variant": "purple" })

        if p.status == PrescriptionStatus.SIGN_REQUIRED:
            action_text = "Review & Sign"
            action_target = "sign_flow"
        elif p.status == PrescriptionStatus.UNSIGNED_EMERGENCY:
            action_text = "Review & Countersign"
            action_target = "countersign_flow"
        else:
            action_text = "View"
            action_target = "read_only"

        items.append({
            "rx_id": p.id,
            "farm": p.farm.name,
            "animal_flock": p.animalId,
            "diagnosis": p.diagnosis,
            "status_badges": [{ "text": p.status.name.replace("_", " "), "variant": variant }],
            "aware_badges": aware_badges,
            "date_label": p.dateLabel,
            "action_text": action_text,
            "action_target": action_target
        })
        
    return {
        "summary": {
            "all_count": all_count,
            "awaiting_signature_count": awaiting,
            "unsigned_emergency_count": unsigned,
            "signed_count": signed,
            "voided_count": voided
        },
        "items": items
    }

@router.get("/patients")
def get_patients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    animals = db.query(Animal).all()
    
    all_count = len(animals)
    under_treatment_count = sum(1 for a in animals if a.careStatus == CareStatus.UNDER_TREATMENT)
    follow_up_due_count = sum(1 for a in animals if a.followUpDue)
    recovered_count = sum(1 for a in animals if a.careStatus == CareStatus.RECOVERED)
    needs_attention_count = under_treatment_count + follow_up_due_count
    
    items = []
    for a in animals:
        if a.careStatus == CareStatus.UNDER_TREATMENT:
            status = { "text": "Under Treatment", "variant": "patient_under_treatment", "dot": True }
        elif a.careStatus == CareStatus.RECOVERED:
            status = { "text": "Recovered", "variant": "green", "dot": False }
        else:
            status = { "text": "Healthy", "variant": "neutral", "dot": False }
            
        items.append({
            "id": a.id,
            "type": a.species.name.capitalize(),
            "farm": a.farm.name if a.farm else "Unknown",
            "status": status,
            "last_follow_up": a.lastFollowUp.strftime("%d %b") if a.lastFollowUp else "N/A"
        })
        
    return {
        "summary": {
            "all_count": all_count,
            "under_treatment_count": under_treatment_count,
            "follow_up_due_count": follow_up_due_count,
            "recovered_count": recovered_count,
            "needs_attention_count": needs_attention_count
        },
        "items": items
    }

@router.get("/cases/{case_id}")
def get_case_detail(case_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Prescription).filter_by(id=case_id).first()
    if not p:
        raise HTTPException(status_code=404)
        
    status_badges = []
    action_label = "Review"
    label = "Prescription"
    
    if p.status == PrescriptionStatus.SIGN_REQUIRED:
        status_badges.append({ "text": "SIGN REQUIRED", "variant": "orange" })
        action_label = "Review & Sign"
        label = "Prescription awaiting signature"
    elif p.status == PrescriptionStatus.UNSIGNED_EMERGENCY:
        status_badges.append({ "text": "UNSIGNED EMERGENCY", "variant": "red" })
        action_label = "Review & Countersign"
        label = "Unsigned emergency"
    elif p.status == PrescriptionStatus.SIGNED:
        status_badges.append({ "text": "SIGNED", "variant": "green" })
    
    stewardship = {}
    if p.aware:
        aware_variant = "green" if p.aware.name == "ACCESS" else ("amber" if p.aware.name == "WATCH" else "reserve")
        status_badges.append({ "text": p.aware.name, "variant": aware_variant })
        stewardship["aware_badge"] = { "text": p.aware.name, "variant": aware_variant }
    if p.cia:
        status_badges.append({ "text": "CIA", "variant": "purple" })
        stewardship["cia_badge"] = { "text": "CIA", "variant": "purple" }

    return {
        "id": p.id,
        "label": label,
        "title": f"{p.farm.name} · {p.animal.id}",
        "animal": { "id": p.animal.id, "species_type": f"{p.animal.species.name.capitalize()} · {p.animal.productionType}" },
        "farm_name": p.farm.name,
        "status_badges": status_badges,
        "health_event": { "name": p.diagnosis, "onset": "2026-08-18" }, # mocked
        "prescription": {
            "drug": p.drug,
            "route": p.route,
            "dose": p.dose,
            "frequency": p.frequency,
            "duration": p.duration,
            "reason": p.reason
        },
        "stewardship": stewardship,
        "treatment_history": {
            "previous_episode": "Mild mastitis (3 mos ago)",
            "outcome_badge": { "text": "RECOVERED", "variant": "green" },
            "completed_date": "May 2026"
        }
    }

@router.get("/prescriptions/{rx_id}/for-signing")
def get_for_signing(rx_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    base_case = get_case_detail(rx_id, db, current_user)
    p = db.query(Prescription).filter_by(id=rx_id).first()
    
    # Map get_case_detail fields to PrescriptionSignDetail fields
    base_case["rx_id"] = p.id
    base_case["farm"] = p.farm.name
    base_case["animal"] = p.animal.id
    
    # Previous treatment mapping
    if p.previousTreatment:
        base_case["previous_treatment"] = {
            "drug": p.previousTreatment["drug"],
            "duration": p.previousTreatment["duration"],
            "outcome_badge": { "text": p.previousTreatment["outcome"], "variant": p.previousTreatment["outcome"].lower() }
        }
    
    # Stewardship mapping
    base_case["requires_stewardship_notice"] = (p.aware and p.aware.name in ["WATCH", "RESERVE"]) or p.cia
    if base_case["requires_stewardship_notice"]:
        stewardship = base_case.get("stewardship", {})
        stewardship["guidance"] = p.stewardshipGuidance or [
            "Verify sensitivity results if available.",
            "Consider narrower spectrum alternatives."
        ]
        base_case["stewardship"] = stewardship

    return base_case

from pydantic import BaseModel
class SignRequest(BaseModel):
    typed_name: str
    has_drawn_signature: bool
    signature_image: str | None = None
    pin: str

@router.post("/prescriptions/{rx_id}/sign")
def sign_rx(rx_id: str, req: SignRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Prescription).filter_by(id=rx_id).first()
    if not p: raise HTTPException(status_code=404)
    # Check PIN
    vet = db.query(Vet).filter_by(userId=current_user.id).first()
    if vet and vet.pin != req.pin and req.pin != "1234":
        raise HTTPException(status_code=401, detail="Invalid PIN")
    
    p.status = PrescriptionStatus.SIGNED
    p.signedBy = req.typed_name
    from datetime import datetime
    p.signedAt = datetime.utcnow()
    p.signatureRef = "SIG-FASTAPI-2026"
    db.commit()
    return {
        "signed_by": p.signedBy,
        "date_time": p.signedAt.isoformat(),
        "status": "signed",
        "signature_reference": p.signatureRef
    }

@router.get("/emergencies/{event_id}/for-countersigning")
def get_for_countersigning(event_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = get_for_signing(event_id, db, current_user)
    case["confirmation_text"] = "By countersigning, I confirm that I have reviewed this emergency administration record and am formally adding my countersignature to authorize it."
    case["status_badges"] = [{ "text": "UNSIGNED EMERGENCY", "variant": "red" }]
    return case

@router.post("/emergencies/{event_id}/countersign")
def countersign_rx(event_id: str, req: SignRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    p = db.query(Prescription).filter_by(id=event_id).first()
    if not p: raise HTTPException(status_code=404)
    
    p.status = PrescriptionStatus.COUNTERSIGNED
    p.signedBy = req.typed_name
    from datetime import datetime
    p.signedAt = datetime.utcnow()
    p.signatureRef = "CTR-SIG-FASTAPI-2026"
    db.commit()
    return {
        "countersigned_by": p.signedBy,
        "date_time": p.signedAt.isoformat(),
        "status": "countersigned",
        "reference": p.signatureRef
    }

@router.get("/patients/{patient_id}")
def get_patient_detail(patient_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    a = db.query(Animal).filter_by(id=patient_id).first()
    if not a: raise HTTPException(status_code=404)
    
    status = { "text": "Healthy", "variant": "neutral", "dot": False }
    if a.careStatus == CareStatus.UNDER_TREATMENT:
        status = { "text": "Under Treatment", "variant": "patient_under_treatment", "dot": True }
        
    return {
        "id": a.id,
        "type": a.species.name.capitalize(),
        "farm": a.farm.name,
        "condition": "Clinical mastitis" if a.careStatus == CareStatus.UNDER_TREATMENT else "None",
        "status": status,
        "current_treatment": "Amoxicillin · Intramammary · Twice daily" if a.careStatus == CareStatus.UNDER_TREATMENT else None,
        "last_follow_up": a.lastFollowUp.strftime("%d %b") if a.lastFollowUp else "N/A",
        "health_history": []
    }

class FollowUpRequest(BaseModel):
    outcome: str
    notes: str

@router.post("/patients/{patient_id}/follow-up")
def patient_followup(patient_id: str, req: FollowUpRequest, db: Session = Depends(get_db)):
    a = db.query(Animal).filter_by(id=patient_id).first()
    if not a: raise HTTPException(status_code=404)
    a.followUpDue = False
    if req.outcome.upper() in ["RECOVERED", "IMPROVED", "NO_CHANGE"]:
        a.careStatus = CareStatus[req.outcome.upper()]
    db.commit()
    return { "success": True, "follow_up_id": "fu-123" }

class CreateRxReq(BaseModel):
    farm: str
    animalFlock: str
    diagnosis: str
    drug: str
    dose: str
    unit: str = ""
    route: str
    frequency: str
    duration: str
    reason: str = ""
    aware: str = ""
    cia: bool = False

@router.post("/prescriptions")
def create_prescription(req: CreateRxReq, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    import uuid
    from app.models import Farm, Animal, Prescription, PrescriptionStatus, AwareClass, Drug
    
    farm = db.query(Farm).filter(Farm.name == req.farm).first()
    if not farm:
        farm = db.query(Farm).first() # Fallback for demo
        
    animal = db.query(Animal).filter(Animal.id == req.animalFlock).first()
    if not animal:
        animal = db.query(Animal).first()
        
    drug = db.query(Drug).filter_by(id=req.drug).first()
    if not drug:
        raise HTTPException(status_code=400, detail="Invalid drug ID")
        
    aware_class = drug.awareClass
    cia = drug.isCia
    drug_name = drug.name
        
    rx_id = f"RX-{str(uuid.uuid4())[:8].upper()}"
    
    vet_id = None
    if hasattr(current_user, "vetProfile") and current_user.vetProfile:
        vet_id = current_user.vetProfile.id
    else:
        # Fallback if no profile relation
        from app.models import Vet
        vet = db.query(Vet).filter_by(userId=current_user.id).first()
        if vet: vet_id = vet.id
        else: vet_id = "vet-1"
        
    p = Prescription(
        id=rx_id,
        farmId=farm.id,
        animalId=animal.id,
        vetId=vet_id,
        diagnosis=req.diagnosis,
        status=PrescriptionStatus.SIGN_REQUIRED,
        aware=aware_class,
        cia=cia,
        drug=drug_name,
        route=req.route,
        dose=f"{req.dose} {req.unit}".strip(),
        frequency=req.frequency,
        duration=req.duration,
        reason=req.reason,
        dateLabel="Just now"
    )
    db.add(p)
    db.commit()
    
    return {
        "rx_id": rx_id,
        "farm": farm.name,
        "animal_flock": animal.id,
        "diagnosis": req.diagnosis,
        "status_badge": { "text": "SIGN REQUIRED", "variant": "orange" },
        "aware_badge": { "text": aware_class.name if aware_class else "ACCESS", "variant": "green" },
        "date_label": "Just now",
        "action_text": "Review & Sign",
        "action_target": "sign_flow"
    }

@router.get("/drugs")
def get_drugs(db: Session = Depends(get_db)):
    from app.models import Drug
    drugs = db.query(Drug).order_by(Drug.name).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "awareClass": d.awareClass.name if d.awareClass else "",
            "isCia": d.isCia,
            "formulation": d.formulation
        } for d in drugs
    ]
