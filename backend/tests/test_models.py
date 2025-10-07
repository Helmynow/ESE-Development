"""Basic smoke tests for ORM models."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from app import Base
from app.database import engine
from app.models import AuditLog, EnrollmentApplication, EnrollmentStatus
from sqlalchemy import inspect


def test_metadata_contains_tables() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    assert "audit_log" in tables
    assert "enrollment_application" in tables


def test_enrollment_status_transitions() -> None:
    application = EnrollmentApplication(
        id=uuid.uuid4(),
        guardian_email="guardian@example.com",
        guardian_phone="+201234567890",
        student_first_name="Ali",
        student_last_name="Hassan",
    )

    assert application.status is EnrollmentStatus.SUBMITTED

    review_time = datetime.now(UTC)
    application.mark_reviewed(review_time)
    assert application.status is EnrollmentStatus.IN_REVIEW
    assert application.reviewed_at == review_time

    approval_time = datetime.now(UTC)
    application.mark_approved(approval_time)
    assert application.status is EnrollmentStatus.APPROVED
    assert application.approved_at == approval_time

    provision_time = datetime.now(UTC)
    application.mark_provisioned("STU-001", provision_time)
    assert application.status is EnrollmentStatus.PROVISIONED
    assert application.provisioned_at == provision_time
    assert application.assigned_student_code == "STU-001"


def test_audit_log_defaults() -> None:
    entry = AuditLog(
        actor_id=uuid.uuid4(),
        actor_role="counselor",
        entity_type="enrollment_application",
        entity_id=uuid.uuid4(),
        action="approved",
        summary="Enrollment application approved",
    )

    assert entry.created_at is not None
    assert entry.before is None
    assert entry.after is None
