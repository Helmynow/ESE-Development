"""Enrollment API routers."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request, status

from app.core.auth import AuthenticatedUser
from app.core.rbac import require_permission
from app.enrollment.schemas import EnrollmentApplicationCreate, EnrollmentApplicationRead
from app.enrollment.service import EnrollmentService, get_enrollment_service

router = APIRouter(prefix="/enrollment", tags=["enrollment"])


@router.post(
    "/applications",
    response_model=EnrollmentApplicationRead,
    status_code=status.HTTP_201_CREATED,
)
async def submit_enrollment_application(
    request: Request,
    payload: EnrollmentApplicationCreate,
    service: EnrollmentService = Depends(get_enrollment_service),
    user: AuthenticatedUser = Depends(require_permission("enrollment.submit")),
) -> EnrollmentApplicationRead:
    application = await service.submit_application(request.app, payload=payload, user=user)
    return EnrollmentApplicationRead.model_validate(application)
