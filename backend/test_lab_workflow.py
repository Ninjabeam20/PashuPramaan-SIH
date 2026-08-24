import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.lab_workflow import (
    STANDARD_TEST_SPECS,
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


if __name__ == "__main__":
    test_state_token_normalizes_enum_and_raw_strings()
    test_has_active_and_first_pending()
    test_workspace_assessments_expose_ids_for_complete_test()
    test_queue_includes_testing_with_received()
    test_standard_plan_has_three_named_tests()
    print("lab workflow tests passed")
