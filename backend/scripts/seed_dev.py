#!/usr/bin/env python3
"""Seed development data for RBAC roles, sample users, and enrollment lifecycle."""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional

import requests


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger("seed_dev")


@dataclass(frozen=True)
class RoleSeed:
    slug: str
    name: str
    description: str
    permissions: List[str]


@dataclass(frozen=True)
class UserSeed:
    external_id: str
    email: str
    given_name: str
    family_name: str
    roles: List[str]
    temporary_password: str


@dataclass(frozen=True)
class EnrollmentSeed:
    application_code: str
    student_given_name: str
    student_family_name: str
    grade_level: str
    guardian_external_id: str


ROLE_SEEDS: List[RoleSeed] = [
    RoleSeed(
        slug="system-admin",
        name="System Administrator",
        description="Full platform access for secure configuration and auditing.",
        permissions=[
            "core.roles.read",
            "core.roles.write",
            "core.users.read",
            "core.users.write",
            "enrollment.applications.manage",
            "enrollment.students.manage",
            "audit.events.read",
        ],
    ),
    RoleSeed(
        slug="enrollment-registrar",
        name="Enrollment Registrar",
        description="Manages enrollment submissions through approval and provisioning.",
        permissions=[
            "enrollment.applications.submit",
            "enrollment.applications.review",
            "enrollment.applications.provision",
            "core.users.read",
        ],
    ),
    RoleSeed(
        slug="teacher",
        name="Teacher",
        description="Access to assigned courses and attendance features.",
        permissions=[
            "attendance.records.write",
            "attendance.records.read",
            "grading.records.read",
        ],
    ),
    RoleSeed(
        slug="guardian",
        name="Guardian",
        description="Read-only access to student progress and communications.",
        permissions=[
            "enrollment.status.read",
            "attendance.records.read",
            "grading.reports.read",
            "comms.messages.read",
        ],
    ),
]


USER_SEEDS: List[UserSeed] = [
    UserSeed(
        external_id="admin-0001",
        email="dev-admin@example.edu",
        given_name="Dev",
        family_name="Admin",
        roles=["system-admin"],
        temporary_password="ChangeMe!123",
    ),
    UserSeed(
        external_id="registrar-0001",
        email="registrar@example.edu",
        given_name="Rania",
        family_name="Registrar",
        roles=["enrollment-registrar"],
        temporary_password="ChangeMe!123",
    ),
    UserSeed(
        external_id="teacher-0001",
        email="math-teacher@example.edu",
        given_name="Youssef",
        family_name="Teacher",
        roles=["teacher"],
        temporary_password="ChangeMe!123",
    ),
    UserSeed(
        external_id="guardian-0001",
        email="guardian@example.edu",
        given_name="Mona",
        family_name="Guardian",
        roles=["guardian"],
        temporary_password="ChangeMe!123",
    ),
]


ENROLLMENT_SEED = EnrollmentSeed(
    application_code="ENR-2024-0001",
    student_given_name="Salma",
    student_family_name="Hassan",
    grade_level="KG2",
    guardian_external_id="guardian-0001",
)


class ApiError(RuntimeError):
    pass


class ApiClient:
    def __init__(self, base_url: str, token: Optional[str] = None) -> None:
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        if token:
            self.session.headers["Authorization"] = f"Bearer {token}"

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def post_json(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        response = self.session.post(self._url(path), json=payload, timeout=30)
        if response.status_code in (200, 201):
            return response.json()
        if response.status_code == 409:
            logger.info("Resource conflict on %s", path)
            try:
                return response.json()
            except ValueError as exc:  # pragma: no cover - guard against empty body
                raise ApiError(f"Conflict response without JSON for {path}") from exc
        raise ApiError(self._format_error(response))

    def put_json(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        response = self.session.put(self._url(path), json=payload, timeout=30)
        if response.status_code in (200, 201):
            return response.json()
        raise ApiError(self._format_error(response))

    def get_json(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        response = self.session.get(self._url(path), params=params, timeout=30)
        if response.status_code == 200:
            return response.json()
        if response.status_code == 404:
            raise ApiError(f"Resource not found for {path}")
        raise ApiError(self._format_error(response))

    def _format_error(self, response: requests.Response) -> str:
        detail: str
        try:
            payload = response.json()
            detail = json.dumps(payload)
        except ValueError:
            detail = response.text
        return f"{response.status_code} {response.reason}: {detail}"


def mask_identifier(identifier: str) -> str:
    if len(identifier) <= 4:
        return "***"
    return f"{identifier[:2]}***{identifier[-2:]}"


def seed_roles(client: ApiClient, roles: Iterable[RoleSeed]) -> None:
    for role in roles:
        payload = {
            "slug": role.slug,
            "name": role.name,
            "description": role.description,
            "permissions": role.permissions,
        }
        try:
            client.post_json("/api/core/roles", payload)
            logger.info("Ensured role %s", role.slug)
        except ApiError as exc:
            logger.error("Unable to seed role %s: %s", role.slug, exc)
            raise


def seed_users(client: ApiClient, users: Iterable[UserSeed]) -> None:
    for user in users:
        payload = {
            "external_id": user.external_id,
            "email": user.email,
            "given_name": user.given_name,
            "family_name": user.family_name,
            "roles": user.roles,
            "temporary_password": user.temporary_password,
        }
        try:
            client.post_json("/api/core/users", payload)
            logger.info("Ensured user %s", user.external_id)
        except ApiError as exc:
            logger.error(
                "Unable to seed user %s: %s", mask_identifier(user.external_id), exc
            )
            raise


def seed_enrollment(client: ApiClient, enrollment: EnrollmentSeed) -> None:
    submit_payload = {
        "application_code": enrollment.application_code,
        "student": {
            "given_name": enrollment.student_given_name,
            "family_name": enrollment.student_family_name,
            "grade_level": enrollment.grade_level,
        },
        "guardian_external_id": enrollment.guardian_external_id,
        "metadata": {
            "source": "seed-dev",
        },
    }
    submission = client.post_json("/api/enrollment/applications", submit_payload)
    application_id = submission.get("id")
    if not application_id:
        raise ApiError("Enrollment submission missing identifier")
    logger.info("Enrollment submitted for application %s", enrollment.application_code)

    approve_payload = {
        "decision": "approved",
        "notes": "Seed approval for development sandbox.",
    }
    client.post_json(
        f"/api/enrollment/applications/{application_id}/approval", approve_payload
    )
    logger.info("Enrollment approved for application %s", enrollment.application_code)

    provision_payload = {
        "student_profile": {
            "homeroom": "HR-A1",
            "student_code": "STU-0001",
        },
        "enrollments": [
            {"course_code": "MATH-KG2", "status": "active"},
            {"course_code": "LANG-KG2", "status": "active"},
        ],
    }
    client.post_json(
        f"/api/enrollment/applications/{application_id}/provision", provision_payload
    )
    logger.info("Enrollment provisioned for application %s", enrollment.application_code)


def run() -> None:
    base_url = os.getenv("ESE_API_BASE_URL", "http://localhost:8000")
    token = os.getenv("ESE_ADMIN_TOKEN")

    logger.info("Seeding data against %s", base_url)
    client = ApiClient(base_url=base_url, token=token)

    seed_roles(client, ROLE_SEEDS)
    seed_users(client, USER_SEEDS)
    seed_enrollment(client, ENROLLMENT_SEED)

    logger.info("Seed routine completed successfully")


if __name__ == "__main__":
    run()
