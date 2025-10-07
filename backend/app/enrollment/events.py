"""Enrollment domain event contracts."""
from __future__ import annotations

from fastapi import FastAPI

from app.core.events import EventRegistry, get_event_registry

ENROLLMENT_SUBMITTED_SCHEMA = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "required": ["application_id", "guardian_email", "student_first_name", "student_last_name", "status"],
    "properties": {
        "application_id": {"type": "string", "format": "uuid"},
        "guardian_email": {"type": "string", "format": "email"},
        "student_first_name": {"type": "string"},
        "student_last_name": {"type": "string"},
        "status": {"type": "string"},
    },
    "additionalProperties": False,
}


def register_enrollment_events(app: FastAPI) -> EventRegistry:
    registry = get_event_registry(app)
    registry.register("enrollment.submitted", ENROLLMENT_SUBMITTED_SCHEMA)
    return registry
