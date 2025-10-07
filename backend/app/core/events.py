
"""Domain event registry and dispatcher."""
from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI
from jsonschema import Draft202012Validator, ValidationError
from redis.asyncio import Redis

from app.core.middleware.correlation import get_correlation_id

logger = logging.getLogger("app.events")
EVENT_NAME_PATTERN = re.compile(r"^[a-z]+\.[a-z0-9_]+$")


@dataclass(slots=True)
class EventContract:
    """Represents a validated domain event contract."""

    name: str
    schema: dict[str, Any]
    validator: Draft202012Validator = field(init=False)

    def __post_init__(self) -> None:
        if not EVENT_NAME_PATTERN.match(self.name):
            msg = "Event names must follow '<context>.<event>' pattern"
            raise ValueError(msg)
        self.validator = Draft202012Validator(self.schema)

    def validate(self, payload: dict[str, Any]) -> None:
        """Validate the payload against the JSON schema."""

        self.validator.validate(payload)


class EventRegistry:
    """In-memory registry mapping event names to schemas."""

    def __init__(self) -> None:
        self._contracts: dict[str, EventContract] = {}

    def register(self, name: str, schema: dict[str, Any]) -> None:
        if name in self._contracts:
            logger.warning("event.contract.overwrite", extra={"event": name})
        contract = EventContract(name=name, schema=schema)
        self._contracts[name] = contract
        logger.info("event.contract.registered", extra={"event": name})

    def get(self, name: str) -> EventContract:
        contract = self._contracts.get(name)
        if not contract:
            msg = f"Event '{name}' is not registered"
            raise KeyError(msg)
        return contract

    def emit(self, name: str, payload: dict[str, Any]) -> dict[str, Any]:
        contract = self.get(name)
        contract.validate(payload)
        event_envelope = {
            "name": name,
            "payload": payload,
            "emitted_at": datetime.now(timezone.utc).isoformat(),
            "correlation_id": get_correlation_id(),
        }
        logger.info(
            "event.emitted",
            extra={
                "event": name,
                "emitted_at": event_envelope["emitted_at"],
                "correlation_id": event_envelope["correlation_id"],
            },
        )
        return event_envelope


def get_event_registry(app: FastAPI) -> EventRegistry:
    registry: EventRegistry | None = getattr(app.state, "event_registry", None)
    if not registry:
        registry = EventRegistry()
        app.state.event_registry = registry
    return registry


async def emit_event(app: FastAPI, name: str, payload: dict[str, Any]) -> dict[str, Any]:
    """Validate and publish an event to Redis streams."""

    registry = get_event_registry(app)
    try:
        envelope = registry.emit(name, payload)
    except ValidationError as exc:
        logger.exception("event.validation_failed", extra={"event": name, "error": str(exc)})
        raise

    redis: Redis | None = getattr(app.state, "redis", None)
    if redis:
        await redis.xadd(registry_name(app), {"event": json.dumps(envelope)})
    return envelope


def registry_name(app: FastAPI) -> str:
    settings = getattr(app.state, "settings", None)
    if settings:
        return settings.redis.stream_name
    return "events"
