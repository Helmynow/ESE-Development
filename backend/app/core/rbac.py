"""A minimal RBAC implementation to support the unit tests."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, Mapping, MutableMapping, Set


@dataclass(frozen=True)
class Permission:
    """Represents a permission label."""

    name: str

    def __post_init__(self) -> None:
        if not self.name or self.name.strip() != self.name:
            msg = "Permission names must be non-empty and trimmed"
            raise ValueError(msg)


@dataclass
class Role:
    """Represents a role with a set of permissions."""

    name: str
    permissions: Set[Permission] = field(default_factory=set)

    def allows(self, permission: Permission) -> bool:
        return permission in self.permissions


class RBACEngine:
    """A lightweight RBAC engine for demonstration purposes."""

    def __init__(self, role_definitions: Mapping[str, Iterable[Permission]]) -> None:
        self._roles: Dict[str, Role] = {
            name: Role(name=name, permissions=set(perms))
            for name, perms in role_definitions.items()
        }
        self._assignments: MutableMapping[str, Set[str]] = {}

    def register_role(self, role: Role) -> None:
        if role.name in self._roles:
            msg = f"Role {role.name} already registered"
            raise ValueError(msg)
        self._roles[role.name] = role

    def assign(self, subject_id: str, role_name: str) -> None:
        if role_name not in self._roles:
            msg = f"Unknown role: {role_name}"
            raise KeyError(msg)
        self._assignments.setdefault(subject_id, set()).add(role_name)

    def revoke(self, subject_id: str, role_name: str) -> None:
        if subject_id not in self._assignments:
            return
        self._assignments[subject_id].discard(role_name)
        if not self._assignments[subject_id]:
            del self._assignments[subject_id]

    def check(self, subject_id: str, permission: Permission) -> bool:
        """Return True when the subject has the given permission."""

        for role_name in self._assignments.get(subject_id, set()):
            if self._roles[role_name].allows(permission):
                return True
        return False

    def snapshot(self) -> Mapping[str, Set[str]]:
        return {subject: set(roles) for subject, roles in self._assignments.items()}


__all__ = ["Permission", "Role", "RBACEngine"]
