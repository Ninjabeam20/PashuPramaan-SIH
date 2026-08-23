import json
import os
from datetime import datetime
from dateutil import parser
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import (
    User, UserRole, Vet, Farm, FarmKind, Animal, Species, CareStatus, HealthEvent,
    Prescription, PrescriptionStatus, AwareClass, PrescriptionOption,
    Treatment, TreatmentPhase, LabAssayVerdict, FarmerDispatch, DispatchStatus, ProductType,
    MedicineStock, StockLevel, LabSample, LabStage, AdminAnomaly, AnomalySeverity
)

# Load data
with open(os.path.join(os.path.dirname(__file__), '../canonical.json'), 'r') as f:
    data = json.load(f)

def parse_date(d):
    if not d: return None
    return parser.parse(d)

def seed_db():
    db = SessionLocal()
    try:
        # 1. Create dummy users for Farmer
        farmer = db.query(User).filter_by(username='farmer1').first()
        if not farmer:
            farmer = User(
                username='farmer1',
                passwordHash='dummy_hash',
                fullName='Ramesh (Shree Krishna Dairy)',
                role=UserRole.FARMER,
            )
            db.add(farmer)
            db.commit()

        # 2. Insert Vets and their associated Users
        for vet_data in data['VETS']:
            user = db.query(User).filter_by(username=f"vet_{vet_data['id']}").first()
            if not user:
                user = User(
                    username=f"vet_{vet_data['id']}",
                    passwordHash='dummy_hash',
                    fullName=vet_data['name'],
                    role=UserRole.VET,
                )
                db.add(user)
                db.commit()

            vet = db.query(Vet).filter_by(id=vet_data['id']).first()
            if not vet:
                vet = Vet(
                    id=vet_data['id'],
                    name=vet_data['name'],
                    designation=vet_data['designation'],
                    pin=vet_data.get('pin', '1234'),
                    isCurrentUser=vet_data.get('isCurrentUser', False),
                    userId=user.id
                )
                db.add(vet)
        db.commit()

        # 3. Insert Farms
        for farm_data in data['FARMS']:
            farm = db.query(Farm).filter_by(id=farm_data['id']).first()
            if not farm:
                farm = Farm(
                    id=farm_data['id'],
                    name=farm_data['name'],
                    kind=FarmKind[farm_data['kind'].upper()],
                    region=farm_data['region'],
                    aliases=farm_data.get('aliases', []),
                    operatedByFarmer=farm_data.get('operatedByFarmer', False),
                    ownerId=farmer.id if farm_data.get('operatedByFarmer', False) else None
                )
                db.add(farm)
        db.commit()

        # 4. Insert Animals
        for animal_data in data['ANIMALS']:
            animal = db.query(Animal).filter_by(id=animal_data['id']).first()
            if not animal:
                care_status = animal_data.get('careStatus')
                animal = Animal(
                    id=animal_data['id'],
                    farmId=animal_data['farmId'],
                    species=Species[animal_data['species'].upper()],
                    isFlock=animal_data.get('isFlock', False),
                    breed=animal_data['breed'],
                    sex=animal_data['sex'],
                    productionType=animal_data['productionType'],
                    onFarmerRoster=animal_data.get('onFarmerRoster', True),
                    careStatus=CareStatus[care_status.upper()] if care_status else None,
                    followUpDue=animal_data.get('followUpDue', False),
                )
                db.add(animal)
        db.commit()

        # 5. Insert Health Events
        for ev in data['HEALTH_EVENTS']:
            he = db.query(HealthEvent).filter_by(id=ev['id']).first()
            if not he:
                he = HealthEvent(
                    id=ev['id'],
                    animalId=ev['animalId'],
                    name=ev['name'],
                    onset=datetime.utcnow()
                )
                db.add(he)
        db.commit()

        # 6. Insert Prescriptions & Options
        for rx in data['PRESCRIPTIONS']:
            prescription = db.query(Prescription).filter_by(id=rx['id']).first()
            if not prescription:
                aware_val = rx.get('aware')
                prescription = Prescription(
                    id=rx['id'],
                    farmId=rx['farmId'],
                    animalId=rx['animalId'],
                    vetId=rx.get('vetId'),
                    diagnosis=rx['diagnosis'],
                    status=PrescriptionStatus[rx['status'].upper()],
                    aware=AwareClass[aware_val.upper()] if aware_val else None,
                    drug=rx['drug'],
                    route=rx['route'],
                    dose=rx['dose'],
                    frequency=rx['frequency'],
                    duration=rx['duration'],
                    reason=rx.get('reason', ''),
                    dateLabel=rx['dateLabel'],
                    signedBy=rx.get('signedBy'),
                    signedAt=parse_date(rx.get('signedAt')),
                    stewardshipGuidance=rx.get('stewardshipGuidance', []),
                    treatmentHistory=rx.get('treatmentHistory'),
                    previousTreatment=rx.get('previousTreatment')
                )
                db.add(prescription)
        db.commit()

        for opt in data['PRESCRIPTION_OPTIONS2']:
            option = db.query(PrescriptionOption).filter_by(id=opt['id']).first()
            if not option:
                option = PrescriptionOption(
                    id=opt['id'],
                    drugName=opt['drugName'],
                    dosage=opt['dosage'],
                    route=opt['route'],
                    prescriptionId=opt.get('prescriptionId'),
                    isEmergencyException=opt.get('isEmergencyException', False)
                )
                db.add(option)
        db.commit()

        # 7. Insert Treatments
        for t in data['TREATMENTS']:
            treatment = db.query(Treatment).filter_by(id=t['id']).first()
            if not treatment:
                lab_assay = t.get('labAssay')
                treatment = Treatment(
                    id=t['id'],
                    animalId=t['animalId'],
                    farmId=t['farmId'],
                    prescriptionId=t.get('prescriptionId'),
                    drug=t['drug'],
                    route=t['route'],
                    dosage=t['dosage'],
                    administeredLabel=t['administeredLabel'],
                    administeredOn=parse_date(t.get('administeredOn')),
                    phase=TreatmentPhase[t['phase'].upper()],
                    signed=t.get('signed', False),
                    emergency=t.get('emergency', False),
                    reason=t.get('reason', ''),
                    feedBatch=t.get('feedBatch'),
                    labAssay=LabAssayVerdict[lab_assay.upper()] if lab_assay else None
                )
                db.add(treatment)
                
                # Also seed withdrawal if it exists
                if t.get('withdrawal'):
                    w_data = t['withdrawal']
                    from app.models import Withdrawal
                    from datetime import datetime
                    
                    dose_time_str = t.get('administeredOn') or datetime.utcnow().isoformat()
                    dose_time = parse_date(dose_time_str) or datetime.utcnow()
                    
                    # Hack for demo to parse clearsAt if it exists in canonical.json
                    # For seeded data, we will just make it 3 days from dose_time to ensure it doesn't instantly delete
                    from datetime import timedelta
                    clears_at = dose_time + timedelta(days=5)
                    
                    wd = db.query(Withdrawal).filter_by(treatmentId=t['id']).first()
                    if not wd:
                        wd = Withdrawal(
                            treatmentId=t['id'],
                            doseTime=dose_time,
                            nowPct=w_data.get('nowPct', 0),
                            clearLabel=w_data.get('clearLabel', 'Clears soon'),
                            productMessage=w_data.get('productMessage', 'Blocked'),
                            clearsAt=clears_at
                        )
                        db.add(wd)
        db.commit()

        # 8. Insert Medicine Stock
        for stock in data['MEDICINE_STOCK']:
            s = db.query(MedicineStock).filter_by(farmId="farm-shree-krishna-dairy", name=stock['name']).first()
            if not s:
                s = MedicineStock(
                    farmId="farm-shree-krishna-dairy",
                    name=stock['name'],
                    quantity=stock['quantity'],
                    unit=stock['unit'],
                    recentUsage=stock.get('recentUsage', 0),
                    level=StockLevel[stock['level'].upper()]
                )
                db.add(s)
        db.commit()

        # 9. Insert Lab Samples
        for sample in data['LAB_SAMPLES']:
            ls = db.query(LabSample).filter_by(dispatchId=sample['dispatchId']).first()
            if not ls:
                ls = LabSample(
                    dispatchId=sample['dispatchId'],
                    sampleId=sample['sampleId'],
                    product=ProductType[sample['product'].upper()],
                    productSub=sample['productSub'],
                    productLabel=sample['productLabel'],
                    farmId=sample.get('farmId'),
                    animalId=sample.get('animalId'),
                    sourceName=sample['sourceName'],
                    quantity=sample['quantity'],
                    scheduledFor=sample.get('scheduledFor', "TBD"),
                    priority=sample.get('priority', "Standard"),
                    stage=LabStage[sample['stage'].upper()]
                )
                db.add(ls)
        db.commit()

        # 10. Insert Farmer Dispatches
        for dispatch in data['FARMER_DISPATCHES']:
            fd = db.query(FarmerDispatch).filter_by(id=dispatch['id']).first()
            if not fd:
                fd = FarmerDispatch(
                    id=dispatch['id'],
                    farmId=dispatch['farmId'],
                    animalId=dispatch['animalId'],
                    product=ProductType[dispatch['product'].upper()],
                    dateLabel=dispatch['dateLabel'],
                    status=DispatchStatus[dispatch['status'].upper()],
                    treatmentId=dispatch.get('treatmentId'),
                    labDispatchId=dispatch.get('labDispatchId'),
                    mrlMeasuredPpm=dispatch.get('mrlMeasuredPpm'),
                    mrlPermittedPpm=dispatch.get('mrlPermittedPpm'),
                    prescriptionSigned=dispatch.get('prescriptionSigned', True)
                )
                db.add(fd)
        db.commit()

        # 11. Insert Admin Anomalies
        for anomaly in data['ADMIN_ANOMALIES']:
            aa = db.query(AdminAnomaly).filter_by(id=anomaly['id']).first()
            if not aa:
                aa = AdminAnomaly(
                    id=anomaly['id'],
                    farmId=anomaly.get('farmId'),
                    farmName=anomaly.get('farm', 'Unknown'),
                    species=Species.POULTRY if anomaly['species'].upper() == "POULTRY" else Species.COW,
                    issue=anomaly.get('status', 'UNEXPLAINED'),
                    drug=anomaly['medicine'],
                    severity=AnomalySeverity[anomaly['severity'].upper()],
                    confidence=anomaly.get('amuChange', 50),
                    dateLabel=anomaly['date']
                )
                db.add(aa)
        db.commit()

        print('Seeding completed successfully!')

    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
