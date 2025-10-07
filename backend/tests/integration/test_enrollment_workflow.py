from collections import deque

import pytest

from backend.app.core.audit import AuditLogger
from backend.app.enrollment.service import EnrollmentRequest, EnrollmentWorkflow, EnrollmentState
from backend.app.events.chain import EventChain


@pytest.fixture()
def workflow_components():
    notifications = deque()

    def notifier(recipient: str, payload: dict) -> None:
        notifications.append((recipient, payload))

    audit_logger = AuditLogger()
    events = EventChain()

    workflow = EnrollmentWorkflow(
        audit_logger=audit_logger,
        events=events,
        notify_guardian=notifier,
    )

    return workflow, audit_logger, events, notifications


def test_full_enrollment_flow_records_audit_and_events(workflow_components) -> None:
    workflow, audit_logger, events, notifications = workflow_components
    request = EnrollmentRequest(
        student_id="student-2024",
        guardian_email="guardian@example.com",
        grade_level="5",
    )

    state_submitted = workflow.submit(request, actor_id="staff-1")
    state_approved = workflow.approve(request, actor_id="staff-2")
    state_provisioned = workflow.provision(request, actor_id="staff-3")

    assert state_submitted is EnrollmentState.SUBMITTED
    assert state_approved is EnrollmentState.APPROVED
    assert state_provisioned is EnrollmentState.PROVISIONED

    event_names = [event.name for event in events.drain()]
    assert event_names == [
        "enrollment.submitted",
        "enrollment.approved",
        "enrollment.provisioned",
    ]

    assert len(audit_logger.entries) == 3
    assert notifications.pop() == (
        "guardian@example.com",
        {"student_code": "STD-STUD", "grade_level": "5"},
    )
    assert not notifications
