"""Domain services for enrollment."""
from __future__ import annotations

from fastapi import Depends, FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import audit
from app.core.auth import AuthenticatedUser
from app.core.database import get_session
from app.core.events import emit_event
from app.enrollment import models, schemas
from app.enrollment.repo import EnrollmentRepository


class EnrollmentService:
    """Orchestrates enrollment workflows."""

    def __init__(self, repository: EnrollmentRepository) -> None:
        self.repository = repository

    async def submit_application(
        self,
        app: FastAPI,
        *,
        payload: schemas.EnrollmentApplicationCreate,
        user: AuthenticatedUser,
    ) -> models.EnrollmentApplication:
        application = models.EnrollmentApplication(
            guardian_email=payload.guardian_email,
            student_first_name=payload.student_first_name,
            student_last_name=payload.student_last_name,
        )
        application = await self.repository.create_application(application)
        await emit_event(
            app,
            "enrollment.submitted",
            {
                "application_id": str(application.id),
                "guardian_email": application.guardian_email,
                "student_first_name": application.student_first_name,
                "student_last_name": application.student_last_name,
                "status": application.status,
            },
        )
        await audit.record_audit_event(
            app,
            user=user,
            action="enrollment.submitted",
            entity="EnrollmentApplication",
            entity_id=str(application.id),
            details={"guardian_email": application.guardian_email},
        )
        return application


async def get_enrollment_service(
    session: AsyncSession = Depends(get_session),
) -> EnrollmentService:
    repository = EnrollmentRepository(session=session)
    return EnrollmentService(repository=repository)
