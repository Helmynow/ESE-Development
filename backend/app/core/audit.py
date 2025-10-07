"""Simple in-memory audit logger for tests."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Sequence


@dataclass
class AuditEntry:
    actor_id: str
    entity: str
    action: str
    before: dict | None
    after: dict | None
    at: datetime


class AuditLogger:
    """Collects audit entries; useful for asserting behavior in tests."""

    def __init__(self) -> None:
        self._entries: List[AuditEntry] = []

    def record(
        self,
        *,
        actor_id: str,
        entity: str,
        action: str,
        before: dict | None,
        after: dict | None,
    ) -> AuditEntry:
        entry = AuditEntry(
            actor_id=actor_id,
            entity=entity,
            action=action,
            before=before,
            after=after,
            at=datetime.now(tz=timezone.utc),
        )
        self._entries.append(entry)
        return entry

    def clear(self) -> None:
        self._entries.clear()

    @property
    def entries(self) -> Sequence[AuditEntry]:
        return tuple(self._entries)


__all__ = ["AuditEntry", "AuditLogger"]
