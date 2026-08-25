import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient

from app.database import SessionLocal
from app.main import app
from app.models import FarmerDispatch, LabSample, LabTest, User

client = TestClient(app)


def _farmer_header():
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(username="farmer1").first()
        assert user is not None
        return {"Authorization": f"Bearer {user.id}:FARMER"}
    finally:
        db.close()


def _delete_dispatches(ids):
    db = SessionLocal()
    try:
        for dsp_id in ids:
            db.query(LabTest).filter_by(dispatchId=dsp_id).delete()
            db.query(FarmerDispatch).filter_by(id=dsp_id).delete()
            db.query(LabSample).filter_by(dispatchId=dsp_id).delete()
        db.commit()
    finally:
        db.close()


def test_send_to_lab_creates_new_queue_row_even_if_animal_already_queued():
    header = _farmer_header()
    animal_id = "MP-111"
    created = []
    try:
        first = client.post(
            "/api/farmer/dispatch/send-to-lab",
            json={"product": "Milk", "animal_ids": [animal_id]},
            headers=header,
        )
        assert first.status_code == 200, first.text
        first_id = first.json()["dispatch_id"]
        created.append(first_id)

        second = client.post(
            "/api/farmer/dispatch/send-to-lab",
            json={"product": "Milk", "animal_ids": [animal_id]},
            headers=header,
        )
        assert second.status_code == 200, second.text
        second_id = second.json()["dispatch_id"]
        created.append(second_id)

        assert first_id != second_id

        queue = client.get("/api/lab/queue", headers=header)
        assert queue.status_code == 200, queue.text
        awaiting_ids = [row["id"] for row in queue.json().get("awaiting") or []]
        assert first_id in awaiting_ids
        assert second_id in awaiting_ids
    finally:
        _delete_dispatches(created)


def test_passport_reuses_dispatch_from_send_to_lab():
    header = _farmer_header()
    animal_id = "MP-109"
    created = []
    try:
        sent = client.post(
            "/api/farmer/dispatch/send-to-lab",
            json={"product": "Milk", "animal_ids": [animal_id]},
            headers=header,
        )
        assert sent.status_code == 200, sent.text
        dispatch_id = sent.json()["dispatch_id"]
        created.append(dispatch_id)

        issued = client.post(
            "/api/farmer/dispatch/passport",
            json={
                "product": "Milk",
                "animal_ids": [animal_id],
                "dispatch_id": dispatch_id,
            },
            headers=header,
        )
        assert issued.status_code == 200, issued.text
        body = issued.json()
        assert body["dispatch_id"] == dispatch_id
        assert body["passport_id"]
        assert "/verify/" in (body.get("qr_verify_url") or "")
    finally:
        _delete_dispatches(created)


if __name__ == "__main__":
    test_send_to_lab_creates_new_queue_row_even_if_animal_already_queued()
    test_passport_reuses_dispatch_from_send_to_lab()
    print("dispatch queue tests passed")
