"""Data access layer for enrollment."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enrollment import models


class EnrollmentRepository:
    """Persistence operations for enrollment applications."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_application(self, application: models.EnrollmentApplication) -> models.EnrollmentApplication:
        self.session.add(application)
        await self.session.flush()
        await self.session.refresh(application)
        return application

    async def get_application(self, application_id: uuid.UUID) -> models.EnrollmentApplication | None:
        result = await self.session.execute(
            select(models.EnrollmentApplication).where(models.EnrollmentApplication.id == application_id)
        )
        return result.scalar_one_or_none()
