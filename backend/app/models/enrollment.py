"""Database models for enrollment applications."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import Enum as PyEnum

from sqlalchemy import JSON, Column, DateTime, Enum, String

from ..database import Base
from .types import GUID


class EnrollmentStatus(str, PyEnum):  # type: ignore[misc]
    """Lifecycle states for enrollment applications."""

    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    PROVISIONED = "provisioned"


class EnrollmentApplication(Base):
    """Intake form capturing student onboarding information."""

    __tablename__ = "enrollment_application"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    guardian_email = Column(String(255), nullable=False)
    guardian_phone = Column(String(32), nullable=False)
    student_first_name = Column(String(128), nullable=False)
    student_last_name = Column(String(128), nullable=False)
    status = Column(
        Enum(EnrollmentStatus),
        default=EnrollmentStatus.SUBMITTED,
        nullable=False,
    )
    submitted_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    provisioned_at = Column(DateTime(timezone=True), nullable=True)
    checklist = Column(JSON, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    notes = Column(String(1024), nullable=True)
    correlation_id = Column(String(128), nullable=True)
    assigned_student_code = Column(String(64), nullable=True, unique=True)

    def mark_reviewed(self, when: datetime | None = None) -> None:
        """Record when the application entered manual review."""

        self.reviewed_at = when or datetime.now(UTC)
        self.status = EnrollmentStatus.IN_REVIEW

    def mark_approved(self, when: datetime | None = None) -> None:
        """Record approval of the application."""

        self.approved_at = when or datetime.now(UTC)
        self.status = EnrollmentStatus.APPROVED

    def mark_provisioned(self, student_code: str, when: datetime | None = None) -> None:
        """Record provisioning details for the approved student."""

        self.provisioned_at = when or datetime.now(UTC)
        self.assigned_student_code = student_code
        self.status = EnrollmentStatus.PROVISIONED
