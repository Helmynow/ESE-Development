"""Audit logging helpers."""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI

from app.core.auth import AuthenticatedUser
from app.core.events import EventRegistry, emit_event, get_event_registry

logger = logging.getLogger("app.audit")

AUDIT_RECORDED_SCHEMA = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "required": ["actor_id", "action", "entity", "entity_id", "details", "occurred_at"],
    "properties": {
        "actor_id": {"type": "string"},
        "action": {"type": "string"},
        "entity": {"type": "string"},
        "entity_id": {"type": "string"},
        "details": {"type": "object"},
        "occurred_at": {"type": "string", "format": "date-time"},
    },
    "additionalProperties": False,
}


@dataclass(slots=True)
class AuditRecord:
    """Captured audit trail entry."""

    actor_id: str
    action: str
    entity: str
    entity_id: str
    details: dict[str, Any]
    occurred_at: datetime


def register_audit_events(app: FastAPI) -> EventRegistry:
    registry = get_event_registry(app)
    registry.register("audit.recorded", AUDIT_RECORDED_SCHEMA)
    return registry


async def record_audit_event(
    app: FastAPI,
    *,
    user: AuthenticatedUser,
    action: str,
    entity: str,
    entity_id: str,
    details: dict[str, Any] | None = None,
) -> None:
    """Persist audit event using the event stream."""

    record = AuditRecord(
        actor_id=user.user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        details=details or {},
        occurred_at=datetime.now(timezone.utc),
    )
    logger.info(
        "audit.record",
        extra={
            "actor_id": record.actor_id,
            "action": record.action,
            "entity": record.entity,
            "entity_id": record.entity_id,
        },
    )
    await emit_event(
        app,
        "audit.recorded",
        {
            "actor_id": record.actor_id,
            "action": record.action,
            "entity": record.entity,
            "entity_id": record.entity_id,
            "details": record.details,
            "occurred_at": record.occurred_at.isoformat(),
        },
    )
