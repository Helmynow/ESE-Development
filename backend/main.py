
"""FastAPI application entrypoint."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from redis.asyncio import from_url as redis_from_url

from app.core.audit import register_audit_events
from app.core.config import settings
from app.core.middleware.correlation import CorrelationIdMiddleware
from app.core.middleware.logging import LoggingMiddleware
from app.enrollment.api import router as enrollment_router
from app.enrollment.events import register_enrollment_events


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application resources."""

    logging.basicConfig(level=getattr(logging, settings.log_level, logging.INFO))
    app.state.settings = settings
    app.state.redis = redis_from_url(settings.redis.url)
    register_audit_events(app)
    register_enrollment_events(app)
    try:
        yield
    finally:
        redis = getattr(app.state, "redis", None)
        if redis:
            await redis.aclose()


app = FastAPI(
    title=settings.name,
    version=settings.version,
    lifespan=lifespan,
)

app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(LoggingMiddleware, log_level=settings.log_level)

app.include_router(enrollment_router)
