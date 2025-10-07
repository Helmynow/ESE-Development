"""Domain event chain helpers for tests."""
from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from typing import Deque, Iterable, Iterator, List


@dataclass
class DomainEvent:
    name: str
    payload: dict


class EventChain:
    """Maintains an ordered queue of domain events."""

    def __init__(self, events: Iterable[DomainEvent] | None = None) -> None:
        self._events: Deque[DomainEvent] = deque(events or [])

    def publish(self, event: DomainEvent) -> None:
        self._events.append(event)

    def drain(self) -> List[DomainEvent]:
        drained: List[DomainEvent] = list(self._events)
        self._events.clear()
        return drained

    def __iter__(self) -> Iterator[DomainEvent]:
        return iter(self.drain())


__all__ = ["DomainEvent", "EventChain"]
