"""Authentication helpers and dependencies."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends


@dataclass(slots=True)
class AuthenticatedUser:
    """Represents an authenticated principal."""

    user_id: str
    roles: tuple[str, ...]
    permissions: tuple[str, ...]

    @property
    def is_service_account(self) -> bool:
        return "service" in self.roles


def get_current_user() -> AuthenticatedUser:
    """Placeholder dependency returning a system service account."""

    # TODO: Integrate JWT/session authentication once identity provider is available.
    return AuthenticatedUser(user_id="system", roles=("service",), permissions=("enrollment.submit", "enrollment.review"))


CurrentUser = Annotated[AuthenticatedUser, Depends(get_current_user)]
