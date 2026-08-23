import os
import sys

# Add backend dir to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User, Farm, Animal, Prescription, Treatment, LabSample, LabReport, FarmerDispatch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_golden_path():
    db = SessionLocal()
    
    # 1. Get a Vet and Farmer for headers
    vet_user = db.query(User).filter_by(username="vet_vet-1").first()
    farmer_user = db.query(User).filter_by(username="farmer1").first()
    
    vet_header = {"Authorization": f"Bearer {vet_user.id}:abc"}
    farmer_header = {"Authorization": f"Bearer {farmer_user.id}:abc"}
    
    # Get a farm and an animal
    farm = db.query(Farm).first()
    animal = db.query(Animal).first()
    
    print("--- 1. Vet writes prescription ---")
    rx_payload = {
        "farm": farm.name,
        "animalFlock": animal.id,
        "diagnosis": "Clinical mastitis",
        "drug": "Amoxicillin",
        "dose": "10",
        "unit": "mL",
        "route": "im",
        "frequency": "Once daily",
        "duration": "3 days",
        "reason": "Test",
        "aware": "ACCESS",
        "cia": False
    }
    r = client.post("/api/vet/prescriptions", json=rx_payload, headers=vet_header)
    assert r.status_code == 200, r.text
    rx_id = r.json()["rx_id"]
    print(f"Created RX: {rx_id}")
    
    print("--- 2. Vet signs prescription ---")
    sign_payload = {
        "typed_name": "Dr. Test",
        "has_drawn_signature": False,
        "pin": "1234"
    }
    r = client.post(f"/api/vet/prescriptions/{rx_id}/sign", json=sign_payload, headers=vet_header)
    assert r.status_code == 200, r.text
    print(f"Signed RX: {rx_id}")
    
    print("--- 3. Farmer records treatment ---")
    trt_payload = {
        "animal_ids": [animal.id],
        "prescription_option_id": rx_id,
        "timing": "backdated",
        "backdated_at": "2024-01-01T00:00:00Z" # Old date so withdrawal is fully cleared immediately!
    }
    r = client.post("/api/farmer/treatments", json=trt_payload, headers=farmer_header)
    assert r.status_code == 200, r.text
    print("Created Treatment successfully")
    
    print("--- 4. Attempt Safety Check (No Lab) ---")
    sc_payload = {
        "product_type": "MILK",
        "animal_flock_id": animal.id
    }
    r = client.post("/api/farmer/dispatch/safety-check", json=sc_payload, headers=farmer_header)
    assert r.status_code == 200, r.text
    print("Safety Check Response:", r.json())
    
    print("--- 5. Lab receives sample and records MRL ---")
    # First, create a mock LabSample in DB manually so the endpoint can find it
    import uuid
    sample_id = "SMP-TEST-123"
    dispatch_id = "DSP-TEST-123"
    s = LabSample(
        dispatchId=dispatch_id,
        sampleId=sample_id,
        product="MILK",
        productSub="Raw Milk",
        productLabel="Milk",
        animalId=animal.id,
        sourceName=farm.name,
        quantity="1 L",
        scheduledFor="Today"
    )
    db.add(s)
    db.commit()
    
    lab_payload = {
        "test_id": "TEST-1",
        "result_value": 0.05,
        "unit": "ppm",
        "operator": "Lab Tech 1",
        "verdict": ""
    }
    r = client.post(f"/api/lab/workspace/{dispatch_id}/tests", json=lab_payload)
    assert r.status_code == 200, r.text
    print("Recorded Lab MRL test successfully")
    
    print("--- 6. Attempt Safety Check (With Lab) ---")
    r = client.post("/api/farmer/dispatch/safety-check", json=sc_payload, headers=farmer_header)
    assert r.status_code == 200, r.text
    res = r.json()
    print("Safety Check Response:", res)
    assert res["eligible"] == True
    
    print("--- 7. Generate Passport ---")
    passport_payload = {
        "product": "MILK",
        "animal_ids": [animal.id]
    }
    r = client.post("/api/farmer/dispatch/passport", json=passport_payload, headers=farmer_header)
    assert r.status_code == 200, r.text
    print("Passport Generated:", r.json()["passport_id"])
    
    print("\n✅ GOLDEN PATH TEST PASSED")

if __name__ == "__main__":
    test_golden_path()
