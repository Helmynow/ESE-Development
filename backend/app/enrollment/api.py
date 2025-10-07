"""FastAPI router for enrollment workflow smoke tests."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..core.audit import AuditLogger
from ..events.chain import EventChain
from .service import EnrollmentRequest, EnrollmentState, EnrollmentWorkflow

router = APIRouter(prefix="/enrollment", tags=["enrollment"])


def _noop_notification(recipient: str, payload: dict) -> None:  # pragma: no cover - placeholder
    """Notification hook for tests; intentionally empty."""


def get_workflow() -> EnrollmentWorkflow:
    return EnrollmentWorkflow(
        audit_logger=AuditLogger(),
        events=EventChain(),
        notify_guardian=_noop_notification,
    )


@router.post("/submit", status_code=status.HTTP_202_ACCEPTED)
async def submit_enrollment(
    request: EnrollmentRequest,
    workflow: EnrollmentWorkflow = Depends(get_workflow),
) -> dict:
    state = workflow.submit(request, actor_id="staff-automation")
    return {"state": state.value, "events": [event.name for event in workflow.events.drain()]}


@router.post("/approve", status_code=status.HTTP_200_OK)
async def approve_enrollment(
    request: EnrollmentRequest,
    workflow: EnrollmentWorkflow = Depends(get_workflow),
) -> dict:
    state = workflow.approve(request, actor_id="registrar")
    return {"state": state.value}


@router.post("/provision", status_code=status.HTTP_200_OK)
async def provision_enrollment(
    request: EnrollmentRequest,
    workflow: EnrollmentWorkflow = Depends(get_workflow),
) -> dict:
    state = workflow.provision(request, actor_id="it-admin")
    if state is not EnrollmentState.PROVISIONED:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Provisioning failed")
    return {"state": state.value}
