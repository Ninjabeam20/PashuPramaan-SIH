import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime

from app.lab_workflow import (
    STANDARD_TEST_SPECS,
    build_lab_dashboard,
    first_pending,
    has_active_test,
    queue_bucket,
    test_state_token,
    workspace_assessments,
)
from app.models import LabStage, LabTestState


class FakeTest:
    def __init__(self, id, name, state, result=None, ok=True, checks=None):
        self.id = id
        self.name = name
        self.state = state
        self.result = result
        self.ok = ok
        self.checks = checks or []


def test_state_token_normalizes_enum_and_raw_strings():
    assert test_state_token(LabTestState.ACTIVE) == "active"
    assert test_state_token("PENDING") == "pending"
    assert test_state_token("LabTestState.DONE") == "done"


def test_has_active_and_first_pending():
    tests = [
        FakeTest("1", "Quality", LabTestState.DONE),
        FakeTest("2", "Micro", LabTestState.PENDING),
        FakeTest("3", "MRL", LabTestState.PENDING),
    ]
    assert has_active_test(tests) is False
    assert first_pending(tests).name == "Micro"


def test_workspace_assessments_expose_ids_for_complete_test():
    tests = [
        FakeTest("b", "Microbiological Safety", LabTestState.ACTIVE),
        FakeTest("a", "Product Quality", LabTestState.DONE, result="ok", ok=True),
    ]
    items = workspace_assessments(tests)
    assert [i["label"] for i in items] == ["Product Quality", "Microbiological Safety"]
    assert items[0]["id"] == "a"
    assert items[1]["state"] == "active"
    assert items[1]["id"] == "b"


def test_queue_includes_testing_with_received():
    assert queue_bucket(LabStage.AWAITING_RECEIPT) == "awaiting"
    assert queue_bucket(LabStage.RECEIVED) == "ready"
    assert queue_bucket(LabStage.TESTING) == "ready"
    assert queue_bucket(LabStage.VERIFIED) is None


def test_standard_plan_has_three_named_tests():
    assert len(STANDARD_TEST_SPECS) == 3
    assert STANDARD_TEST_SPECS[0][0] == "Product Quality"
    assert STANDARD_TEST_SPECS[2][0] == "Antimicrobial Residue"


class FakeSample:
    def __init__(self, dispatch_id, stage, product="MILK", source="Farm", priority="Standard", tests=None, **kwargs):
        self.dispatchId = dispatch_id
        self.sampleId = f"LAB-{dispatch_id}"
        self.stage = stage
        self.product = type("P", (), {"name": product})()
        self.sourceName = source
        self.priority = priority
        self.tests = tests or []
        self.createdAt = kwargs.get("createdAt", datetime(2026, 8, 23, 10, 0))
        self.receivedOn = kwargs.get("receivedOn")
        self.updatedAt = kwargs.get("updatedAt", self.createdAt)


class FakeReport:
    def __init__(self, dispatch_id, outcome_ok=True, verified_on=None):
        self.dispatchId = dispatch_id
        self.outcomeOk = outcome_ok
        self.verifiedOn = verified_on or datetime(2026, 8, 23, 12, 0)


def test_dashboard_counts_testing_and_attention():
    now = datetime(2026, 8, 23, 13, 0)
    samples = [
        FakeSample("MLK-1", LabStage.AWAITING_RECEIPT, product="MILK"),
        FakeSample("MLK-2", LabStage.TESTING, product="MILK", source="Shree Krishna Dairy"),
        FakeSample("MEAT-1", LabStage.AWAITING_VERIFICATION, product="MEAT"),
        FakeSample("EGG-1", LabStage.ON_HOLD, product="EGGS"),
    ]
    reports = [FakeReport("MLK-0", outcome_ok=True)]
    data = build_lab_dashboard(samples, reports, now=now, technician_name="Dr. Priya")

    by_label = {c["label"]: c for c in data["summary"]}
    assert by_label["Awaiting Receipt"]["value"] == "1"
    assert by_label["Tests in Progress"]["value"] == "1"
    assert by_label["Awaiting Verification"]["value"] == "1"
    assert by_label["On Hold"]["value"] == "1"

    outcomes = {c["label"]: c for c in data["outcomes"]}
    assert outcomes["Reports generated"]["value"] == "1"
    assert outcomes["Passed"]["value"] == "1"

    ids = [item["id"] for item in data["attention"]]
    assert "MLK-2" in ids
    assert any(item["page"].endswith("MLK-2") for item in data["attention"] if item["id"] == "MLK-2")
    mix = {m["label"]: m["count"] for m in data["productMix"]}
    assert mix["Milk"] == 2
    assert data["activity"]


if __name__ == "__main__":
    test_state_token_normalizes_enum_and_raw_strings()
    test_has_active_and_first_pending()
    test_workspace_assessments_expose_ids_for_complete_test()
    test_queue_includes_testing_with_received()
    test_standard_plan_has_three_named_tests()
    test_dashboard_counts_testing_and_attention()
    print("lab workflow tests passed")
