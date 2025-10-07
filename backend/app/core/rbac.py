
"""Role-based access control utilities."""
from __future__ import annotations

from typing import Iterable

from fastapi import Depends, HTTPException, status

from app.core.auth import AuthenticatedUser, get_current_user


class RBACService:
    """In-memory RBAC enforcement."""

    def __init__(self, permission_source: Iterable[str] | None = None) -> None:
        self.permission_source = set(permission_source or [])

    def assert_permission(self, user: AuthenticatedUser, permission: str) -> None:
        if permission not in self.permission_source:
            msg = f"Permission '{permission}' is undefined"
            raise ValueError(msg)
        if permission not in user.permissions:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="permission_denied")


DEFAULT_PERMISSIONS = {
    "enrollment.submit",
    "enrollment.review",
}
rbac_service = RBACService(permission_source=DEFAULT_PERMISSIONS)


def require_permission(permission: str):
    """Dependency that enforces a permission for the current user."""

    def dependency(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        rbac_service.assert_permission(user, permission)
        return user

    return dependency
