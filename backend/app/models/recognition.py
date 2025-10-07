"""Database models for employee recognition and awards."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import Enum as PyEnum

from sqlalchemy import JSON, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..database import Base
from .types import GUID


class NominationStatus(str, PyEnum):  # type: ignore[misc]
    """Lifecycle states for EOM nominations."""

    PENDING = "pending"
    VOTING = "voting"
    SELECTED = "selected"
    REJECTED = "rejected"


class NominationCategory(str, PyEnum):  # type: ignore[misc]
    """EOM award categories."""

    TEACHING_EXCELLENCE = "teaching_excellence"
    INNOVATION = "innovation"
    TEAMWORK = "teamwork"
    LEADERSHIP = "leadership"
    SERVICE_EXCELLENCE = "service_excellence"
    STUDENT_ADVOCACY = "student_advocacy"


class AwardType(str, PyEnum):  # type: ignore[misc]
    """Types of awards that can be granted."""

    EMPLOYEE_OF_MONTH = "employee_of_month"
    EMPLOYEE_OF_YEAR = "employee_of_year"
    SPECIAL_RECOGNITION = "special_recognition"


class Nomination(Base):
    """Employee of the Month nomination records."""

    __tablename__ = "nomination"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    nominee_id = Column(GUID(), nullable=False, index=True)
    nominee_name = Column(String(256), nullable=False)
    nominee_department = Column(String(128), nullable=False)
    category = Column(Enum(NominationCategory), nullable=False)
    nominator_id = Column(GUID(), nullable=False)
    nominator_name = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    submitted_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    status = Column(
        Enum(NominationStatus),
        default=NominationStatus.PENDING,
        nullable=False,
    )
    nomination_period = Column(String(7), nullable=False)  # Format: YYYY-MM
    votes_count = Column(Integer, default=0, nullable=False)
    total_eligible_voters = Column(Integer, nullable=True)
    ai_analysis = Column(JSON, nullable=True)  # AI suggestions and validation results
    metadata_ = Column("metadata", JSON, nullable=True)

    def mark_voting(self, total_voters: int, when: datetime | None = None) -> None:
        """Move nomination to voting phase."""
        self.status = NominationStatus.VOTING
        self.total_eligible_voters = total_voters

    def mark_selected(self, when: datetime | None = None) -> None:
        """Mark nomination as selected (winner)."""
        self.status = NominationStatus.SELECTED

    def mark_rejected(self, when: datetime | None = None) -> None:
        """Mark nomination as rejected."""
        self.status = NominationStatus.REJECTED

    def increment_vote(self) -> None:
        """Increment the vote count for this nomination."""
        self.votes_count += 1


class Vote(Base):
    """Voting records for EOM nominations."""

    __tablename__ = "vote"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    nomination_id = Column(
        GUID(),
        ForeignKey("nomination.id"),
        nullable=False,
        index=True,
    )
    voter_id = Column(GUID(), nullable=False, index=True)
    voter_role = Column(String(64), nullable=False)
    category = Column(Enum(NominationCategory), nullable=False)
    nomination_period = Column(String(7), nullable=False)  # Format: YYYY-MM
    voted_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationship
    nomination = relationship("Nomination", foreign_keys=[nomination_id])


class Award(Base):
    """Recognition awards granted to employees."""

    __tablename__ = "award"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    recipient_id = Column(GUID(), nullable=False, index=True)
    recipient_name = Column(String(256), nullable=False)
    department = Column(String(128), nullable=False)
    award_type = Column(Enum(AwardType), nullable=False)
    category = Column(Enum(NominationCategory), nullable=True)  # For EOM awards
    award_period = Column(String(7), nullable=False)  # Format: YYYY-MM or YYYY for EOY
    description = Column(Text, nullable=False)
    granted_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    nomination_id = Column(
        GUID(),
        ForeignKey("nomination.id"),
        nullable=True,
    )  # Link to winning nomination
    metadata_ = Column("metadata", JSON, nullable=True)  # Additional award details

    # Relationship
    nomination = relationship("Nomination", foreign_keys=[nomination_id])


class EligibilityTracking(Base):
    """Track employee eligibility for nominations and awards."""

    __tablename__ = "eligibility_tracking"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    employee_id = Column(GUID(), nullable=False, index=True)
    employee_name = Column(String(256), nullable=False)
    last_award_date = Column(DateTime(timezone=True), nullable=True)
    last_award_type = Column(Enum(AwardType), nullable=True)
    rotation_lock_until = Column(
        DateTime(timezone=True),
        nullable=True,
    )  # Date when eligible again
    ineligible = Column(
        Integer,
        default=0,
        nullable=False,
    )  # Boolean: 0=eligible, 1=ineligible
    ineligibility_reason = Column(Text, nullable=True)
    total_eom_wins = Column(Integer, default=0, nullable=False)
    total_eoy_wins = Column(Integer, default=0, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
        onupdate=lambda: datetime.now(UTC),
    )
    metadata_ = Column(
        "metadata",
        JSON,
        nullable=True,
    )  # Track additional eligibility factors

    def update_after_award(
        self,
        award_type: AwardType,
        rotation_days: int = 90,
    ) -> None:
        """Update eligibility tracking after an award is granted."""
        from datetime import timedelta

        self.last_award_date = datetime.now(UTC)
        self.last_award_type = award_type
        self.rotation_lock_until = datetime.now(UTC) + timedelta(days=rotation_days)

        if award_type == AwardType.EMPLOYEE_OF_MONTH:
            self.total_eom_wins += 1
        elif award_type == AwardType.EMPLOYEE_OF_YEAR:
            self.total_eoy_wins += 1

        self.updated_at = datetime.now(UTC)

    def set_ineligible(self, reason: str) -> None:
        """Mark employee as ineligible for nominations."""
        self.ineligible = 1
        self.ineligibility_reason = reason
        self.updated_at = datetime.now(UTC)

    def set_eligible(self) -> None:
        """Mark employee as eligible for nominations."""
        self.ineligible = 0
        self.ineligibility_reason = None
        self.updated_at = datetime.now(UTC)


class FairnessMetric(Base):
    """Track fairness and bias metrics for the recognition system."""

    __tablename__ = "fairness_metric"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    metric_type = Column(
        String(64),
        nullable=False,
    )  # e.g., "department_distribution", "variance_alert"
    period = Column(String(7), nullable=False)  # Format: YYYY-MM
    metric_data = Column(JSON, nullable=False)  # Detailed metric information
    alert_level = Column(String(32), nullable=True)  # "info", "warning", "critical"
    alert_message = Column(Text, nullable=True)
    resolved = Column(
        Integer,
        default=0,
        nullable=False,
    )  # Boolean: 0=unresolved, 1=resolved
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(GUID(), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    metadata_ = Column("metadata", JSON, nullable=True)

    def mark_resolved(self, resolver_id: uuid.UUID) -> None:
        """Mark this fairness alert as resolved."""
        self.resolved = 1
        self.resolved_at = datetime.now(UTC)
        self.resolved_by = resolver_id
