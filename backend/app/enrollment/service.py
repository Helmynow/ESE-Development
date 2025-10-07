"""Simple enrollment workflow primitives for exercising the tests."""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Callable

from pydantic import BaseModel, Field

from ..core.audit import AuditLogger
from ..events.chain import DomainEvent, EventChain


class EnrollmentState(str, Enum):
    SUBMITTED = "submitted"
    APPROVED = "approved"
    PROVISIONED = "provisioned"


class EnrollmentRequest(BaseModel):
    student_id: str = Field(min_length=1)
    guardian_email: str = Field(min_length=3)
    grade_level: str = Field(min_length=1)


@dataclass
class EnrollmentWorkflow:
    audit_logger: AuditLogger
    events: EventChain
    notify_guardian: Callable[[str, dict], None]

    def submit(self, request: EnrollmentRequest, actor_id: str) -> EnrollmentState:
        payload = request.model_dump()
        self.audit_logger.record(
            actor_id=actor_id,
            entity=request.student_id,
            action="enrollment.submitted",
            before=None,
            after=payload,
        )
        self.events.publish(
            DomainEvent(name="enrollment.submitted", payload={"student_id": request.student_id})
        )
        return EnrollmentState.SUBMITTED

    def approve(self, request: EnrollmentRequest, actor_id: str) -> EnrollmentState:
        payload = request.model_dump()
        self.audit_logger.record(
            actor_id=actor_id,
            entity=request.student_id,
            action="enrollment.approved",
            before=None,
            after=payload,
        )
        self.events.publish(
            DomainEvent(name="enrollment.approved", payload={"student_id": request.student_id})
        )
        return EnrollmentState.APPROVED

    def provision(self, request: EnrollmentRequest, actor_id: str) -> EnrollmentState:
        student_code = f"STD-{request.student_id[:4].upper()}"
        provisioned_payload = {"student_code": student_code, "grade_level": request.grade_level}
        self.audit_logger.record(
            actor_id=actor_id,
            entity=request.student_id,
            action="enrollment.provisioned",
            before=None,
            after=provisioned_payload,
        )
        self.events.publish(
            DomainEvent(
                name="enrollment.provisioned",
                payload={"student_id": request.student_id, **provisioned_payload},
            )
        )
        self.notify_guardian(request.guardian_email, provisioned_payload)
        return EnrollmentState.PROVISIONED


__all__ = ["EnrollmentWorkflow", "EnrollmentRequest", "EnrollmentState"]
