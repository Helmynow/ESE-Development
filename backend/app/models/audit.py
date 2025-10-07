"""Database models for audit logging."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Column, DateTime, String

from ..database import Base
from .types import GUID


class AuditLog(Base):
    """Persisted audit events tracking state changes."""

    __tablename__ = "audit_log"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    actor_id = Column(GUID(), nullable=False)
    actor_role = Column(String(64), nullable=False)
    entity_type = Column(String(128), nullable=False)
    entity_id = Column(GUID(), nullable=False)
    action = Column(String(64), nullable=False)
    summary = Column(String(512), nullable=False)
    before = Column(JSON, nullable=True)
    after = Column(JSON, nullable=True)
    correlation_id = Column(String(128), nullable=True)
    ip_address = Column(String(64), nullable=True)
