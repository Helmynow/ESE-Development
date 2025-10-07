import pytest
from hypothesis import given, strategies as st

from backend.app.core.rbac import Permission, RBACEngine


@given(st.text(min_size=1).filter(lambda value: value.strip() == value))
def test_permission_accepts_trimmed_names(name: str) -> None:
    permission = Permission(name=name)
    assert permission.name == name


@pytest.mark.parametrize(
    "invalid_name",
    ["", " trailing", "trailing ", " double  space "]
)
def test_permission_rejects_untrimmed_names(invalid_name: str) -> None:
    with pytest.raises(ValueError):
        Permission(name=invalid_name)


def test_rbac_engine_assigns_and_checks_permissions() -> None:
    manage_enrollment = Permission("enrollment.manage")
    engine = RBACEngine({"admin": [manage_enrollment]})

    engine.assign("user-1", "admin")

    assert engine.check("user-1", manage_enrollment) is True
    assert engine.snapshot()["user-1"] == {"admin"}


def test_rbac_engine_revoke_and_missing_role() -> None:
    view = Permission("view")
    engine = RBACEngine({"viewer": [view]})

    with pytest.raises(KeyError):
        engine.assign("user-2", "missing")

    engine.assign("user-2", "viewer")
    engine.revoke("user-2", "viewer")

    assert engine.snapshot() == {}
