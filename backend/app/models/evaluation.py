"""Database models for multi-rater evaluation system."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from ..database import Base
from .types import GUID


class EvaluationCycleStatus(str, PyEnum):  # type: ignore[misc]
    """Lifecycle states for evaluation cycles."""

    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"
    ARCHIVED = "archived"


class EvaluationStatus(str, PyEnum):  # type: ignore[misc]
    """Status of individual evaluation assignments."""

    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    LATE = "late"


class EvaluatorRole(str, PyEnum):  # type: ignore[misc]
    """Roles for evaluators in the MRE system."""

    SELF = "self"
    PEER = "peer"
    SUPERVISOR = "supervisor"
    CEO = "ceo"
    PC_HEAD = "pc_head"


class StaffType(str, PyEnum):  # type: ignore[misc]
    """Types of staff for determining evaluation criteria."""

    ACADEMIC = "academic"
    ADMINISTRATIVE = "administrative"


class EvaluationCycle(Base):
    """Configuration and tracking for evaluation periods."""

    __tablename__ = "evaluation_cycle"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    cycle_name = Column(String(128), nullable=False)  # e.g., "December 2024 Evaluation"
    cycle_period = Column(String(7), nullable=False, index=True)  # Format: YYYY-MM
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(
        Enum(EvaluationCycleStatus),
        default=EvaluationCycleStatus.DRAFT,
        nullable=False,
    )
    created_by = Column(GUID(), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    activated_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    total_evaluations = Column(Integer, default=0, nullable=False)
    completed_evaluations = Column(Integer, default=0, nullable=False)
    description = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)

    def activate(self) -> None:
        """Activate the evaluation cycle."""
        self.status = EvaluationCycleStatus.ACTIVE
        self.activated_at = datetime.now(UTC)

    def close(self) -> None:
        """Close the evaluation cycle."""
        self.status = EvaluationCycleStatus.CLOSED
        self.closed_at = datetime.now(UTC)

    def archive(self) -> None:
        """Archive the evaluation cycle."""
        self.status = EvaluationCycleStatus.ARCHIVED

    def update_completion_count(self, increment: int = 1) -> None:
        """Update the count of completed evaluations."""
        self.completed_evaluations += increment


class Evaluation(Base):
    """Individual evaluation assignments linking evaluator to evaluee."""

    __tablename__ = "evaluation"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    cycle_id = Column(
        GUID(),
        ForeignKey("evaluation_cycle.id"),
        nullable=False,
        index=True,
    )
    evaluee_id = Column(GUID(), nullable=False, index=True)
    evaluee_name = Column(String(256), nullable=False)
    evaluee_department = Column(String(128), nullable=False)
    evaluee_staff_type = Column(Enum(StaffType), nullable=False)
    evaluator_id = Column(GUID(), nullable=False, index=True)
    evaluator_name = Column(String(256), nullable=False)
    evaluator_role = Column(Enum(EvaluatorRole), nullable=False)
    weight = Column(Float, nullable=False)  # Weight percentage (e.g., 0.05 for 5%)
    status = Column(
        Enum(EvaluationStatus),
        default=EvaluationStatus.NOT_STARTED,
        nullable=False,
    )
    assigned_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=False)
    metadata_ = Column("metadata", JSON, nullable=True)

    # Relationship
    cycle = relationship("EvaluationCycle", foreign_keys=[cycle_id])

    def mark_in_progress(self) -> None:
        """Mark evaluation as in progress."""
        self.status = EvaluationStatus.IN_PROGRESS

    def mark_submitted(self) -> None:
        """Mark evaluation as submitted."""
        self.status = EvaluationStatus.SUBMITTED
        self.submitted_at = datetime.now(UTC)

    def mark_late(self) -> None:
        """Mark evaluation as late."""
        self.status = EvaluationStatus.LATE


class EvaluationRating(Base):
    """Individual evaluator's ratings and feedback for an evaluee."""

    __tablename__ = "evaluation_rating"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(
        GUID(),
        ForeignKey("evaluation.id"),
        nullable=False,
        index=True,
    )
    cycle_id = Column(
        GUID(),
        ForeignKey("evaluation_cycle.id"),
        nullable=False,
        index=True,
    )
    evaluator_id = Column(GUID(), nullable=False, index=True)
    evaluator_role = Column(Enum(EvaluatorRole), nullable=False)
    evaluee_id = Column(GUID(), nullable=False, index=True)
    weight = Column(Float, nullable=False)

    # Academic staff scores (1-10 scale)
    teaching_effectiveness = Column(Float, nullable=True)
    student_engagement = Column(Float, nullable=True)
    curriculum_implementation = Column(Float, nullable=True)
    classroom_management = Column(Float, nullable=True)

    # Administrative staff scores (1-10 scale)
    task_management = Column(Float, nullable=True)
    policy_adherence = Column(Float, nullable=True)
    interdepartmental_communication = Column(Float, nullable=True)
    service_quality = Column(Float, nullable=True)

    # Common criteria for all staff (1-10 scale)
    collaboration = Column(Float, nullable=False)
    innovation = Column(Float, nullable=False)
    attendance = Column(Float, nullable=False)
    professional_development = Column(Float, nullable=False)

    # Calculated average score
    average_score = Column(Float, nullable=False)

    # Qualitative feedback
    strengths = Column(Text, nullable=True)
    improvements = Column(Text, nullable=True)
    comments = Column(Text, nullable=True)

    submitted_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    metadata_ = Column("metadata", JSON, nullable=True)

    # Relationships
    evaluation = relationship("Evaluation", foreign_keys=[evaluation_id])
    cycle = relationship("EvaluationCycle", foreign_keys=[cycle_id])


class EvaluationResult(Base):
    """Aggregated evaluation results for an evaluee in a cycle."""

    __tablename__ = "evaluation_result"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    cycle_id = Column(
        GUID(),
        ForeignKey("evaluation_cycle.id"),
        nullable=False,
        index=True,
    )
    evaluee_id = Column(GUID(), nullable=False, index=True)
    evaluee_name = Column(String(256), nullable=False)
    evaluee_department = Column(String(128), nullable=False)
    evaluee_staff_type = Column(Enum(StaffType), nullable=False)

    # Weighted scores by evaluator role
    self_score = Column(Float, nullable=True)
    peer_scores_avg = Column(Float, nullable=True)
    supervisor_score = Column(Float, nullable=True)
    ceo_score = Column(Float, nullable=True)
    pc_head_score = Column(Float, nullable=True)

    # Final weighted average
    final_score = Column(Float, nullable=False)

    # Completion tracking
    total_expected_ratings = Column(Integer, nullable=False)
    received_ratings = Column(Integer, nullable=False)
    completion_percentage = Column(Float, nullable=False)

    # Variance metrics
    score_variance = Column(
        Float,
        nullable=True,
    )  # Statistical variance across evaluators
    has_high_variance = Column(Integer, default=0, nullable=False)  # Boolean flag

    # AI analysis
    ai_insights = Column(JSON, nullable=True)  # AI-generated insights and trends

    # Aggregated feedback
    aggregated_strengths = Column(Text, nullable=True)
    aggregated_improvements = Column(Text, nullable=True)

    calculated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    released_at = Column(DateTime(timezone=True), nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)

    # Relationship
    cycle = relationship("EvaluationCycle", foreign_keys=[cycle_id])

    def mark_released(self) -> None:
        """Mark results as released to the evaluee."""
        self.released_at = datetime.now(UTC)


class EOYCandidate(Base):
    """Employee of the Year candidate tracking and scoring."""

    __tablename__ = "eoy_candidate"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    year = Column(Integer, nullable=False, index=True)
    employee_id = Column(GUID(), nullable=False, index=True)
    employee_name = Column(String(256), nullable=False)
    department = Column(String(128), nullable=False)

    # Eligibility criteria
    eom_wins_count = Column(Integer, nullable=False)
    avg_mre_score = Column(Float, nullable=False)
    attendance_rate = Column(Float, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    has_disciplinary_actions = Column(Integer, default=0, nullable=False)  # Boolean

    # Qualification status
    meets_minimum_criteria = Column(Integer, default=0, nullable=False)  # Boolean

    # Leadership evaluation
    ceo_vote_score = Column(Float, nullable=True)
    pc_head_vote_score = Column(Float, nullable=True)

    # Final EOY score calculation
    eoy_score = Column(Float, nullable=True)  # Weighted formula result
    rank = Column(Integer, nullable=True)

    # Status
    is_winner = Column(Integer, default=0, nullable=False)  # Boolean

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
        onupdate=lambda: datetime.now(UTC),
    )
    metadata_ = Column("metadata", JSON, nullable=True)

    def calculate_eoy_score(self) -> float:
        """Calculate EOY score using weighted formula."""
        # EOY Score = (EOM Wins x 30%) + (Avg MRE x 50%) +
        # (Attendance x 10%) + (Leadership x 10%)
        eom_component = min(self.eom_wins_count, 12) / 12 * 30  # Max 12 months
        mre_component = self.avg_mre_score / 10 * 50  # Scale 1-10 to percentage
        attendance_component = self.attendance_rate / 100 * 10  # Already percentage

        leadership_avg = 0.0
        if self.ceo_vote_score and self.pc_head_vote_score:
            leadership_avg = (self.ceo_vote_score + self.pc_head_vote_score) / 2
        leadership_component = leadership_avg / 10 * 10

        self.eoy_score = (
            eom_component + mre_component + attendance_component + leadership_component
        )
        self.updated_at = datetime.now(UTC)

        return self.eoy_score

    def check_eligibility(self) -> bool:
        """Check if candidate meets minimum EOY criteria."""
        meets_criteria = (
            self.eom_wins_count >= 2
            and self.avg_mre_score >= 8.5
            and self.attendance_rate >= 95.0
            and self.tenure_months >= 12
            and self.has_disciplinary_actions == 0
        )
        self.meets_minimum_criteria = 1 if meets_criteria else 0
        self.updated_at = datetime.now(UTC)
        return meets_criteria

    def mark_winner(self) -> None:
        """Mark this candidate as the EOY winner."""
        self.is_winner = 1
        self.updated_at = datetime.now(UTC)
