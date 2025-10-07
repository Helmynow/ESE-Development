"""FastAPI application exposing enrollment endpoints for test coverage."""
from __future__ import annotations

from fastapi import FastAPI

from .enrollment.api import router as enrollment_router

app = FastAPI(title="ESE Enrollment Test Harness")
app.include_router(enrollment_router)


__all__ = ["app"]
