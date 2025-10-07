"""Pydantic DTOs for the enrollment context."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EnrollmentApplicationCreate(BaseModel):
    """Incoming payload for a new enrollment application."""

    guardian_email: EmailStr = Field(description="Primary guardian email")
    student_first_name: str = Field(min_length=1, max_length=120)
    student_last_name: str = Field(min_length=1, max_length=120)


class EnrollmentApplicationRead(BaseModel):
    """Representation of an enrollment application."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    guardian_email: EmailStr
    student_first_name: str
    student_last_name: str
    status: str
    created_at: datetime
