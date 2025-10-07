import pytest
from httpx import AsyncClient

from backend.app.main import app


@pytest.mark.asyncio
async def test_submit_enrollment_returns_event_chain() -> None:
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.post(
            "/enrollment/submit",
            json={
                "student_id": "stu-123",
                "guardian_email": "guardian@example.com",
                "grade_level": "5",
            },
        )

    assert response.status_code == 202
    body = response.json()
    assert body["state"] == "submitted"
    assert body["events"] == ["enrollment.submitted"]


@pytest.mark.asyncio
async def test_provision_enrollment_returns_provisioned_state() -> None:
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.post(
            "/enrollment/provision",
            json={
                "student_id": "stu-124",
                "guardian_email": "guardian@example.com",
                "grade_level": "5",
            },
        )

    assert response.status_code == 200
    assert response.json()["state"] == "provisioned"
