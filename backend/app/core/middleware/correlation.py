
"""Correlation ID middleware for tracing requests across services."""
from __future__ import annotations

import contextvars
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

CORRELATION_ID_HEADER = "X-Correlation-ID"
correlation_id_var: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "correlation_id",
    default=None,
)


def get_correlation_id() -> str | None:
    """Return the correlation ID for the current context."""

    return correlation_id_var.get()


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Ensure each request has a correlation identifier."""

    def __init__(self, app, header_name: str = CORRELATION_ID_HEADER) -> None:  # type: ignore[override]
        super().__init__(app)
        self.header_name = header_name

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        correlation_id = request.headers.get(self.header_name, str(uuid.uuid4()))
        token = correlation_id_var.set(correlation_id)
        try:
            response = await call_next(request)
        finally:
            correlation_id_var.reset(token)
        response.headers[self.header_name] = correlation_id
        return response


def inject_correlation_id(headers: dict[str, str] | None = None) -> dict[str, str]:
    """Utility to add the current correlation ID to outgoing headers."""

    headers = headers.copy() if headers else {}
    correlation_id = get_correlation_id()
    if correlation_id:
        headers.setdefault(CORRELATION_ID_HEADER, correlation_id)
    return headers
