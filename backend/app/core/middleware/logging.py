"""Structured logging middleware."""
from __future__ import annotations

import logging
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.core.middleware.correlation import get_correlation_id

logger = logging.getLogger("app.api")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Log request lifecycle with correlation context."""

    def __init__(self, app, log_level: int | str = logging.INFO) -> None:  # type: ignore[override]
        super().__init__(app)
        if isinstance(log_level, str):
            self.log_level = logging.getLevelName(log_level.upper())
            if isinstance(self.log_level, str):  # getLevelName may return a string if unknown
                self.log_level = logging.INFO
        else:
            self.log_level = log_level

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start = time.perf_counter()
        correlation_id = get_correlation_id()
        logger.log(
            self.log_level,
            "request.started",
            extra={
                "method": request.method,
                "path": request.url.path,
                "correlation_id": correlation_id,
                "client": request.client.host if request.client else None,
            },
        )
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.log(
            self.log_level,
            "request.completed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(elapsed_ms, 2),
                "correlation_id": correlation_id,
            },
        )
        return response
