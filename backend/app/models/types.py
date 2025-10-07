"""Custom SQLAlchemy types for portable model definitions."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.dialects import postgresql
from sqlalchemy.sql.type_api import TypeEngine
from sqlalchemy.types import CHAR, TypeDecorator


class GUID(TypeDecorator[uuid.UUID]):
    """Platform-independent GUID/UUID type."""

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect: Any) -> TypeEngine[Any]:  # type: ignore[override]
        if dialect.name == "postgresql":
            return dialect.type_descriptor(postgresql.UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value: Any, dialect: Any) -> Any:
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value if dialect.name == "postgresql" else str(value)
        coerced = uuid.UUID(str(value))
        return coerced if dialect.name == "postgresql" else str(coerced)

    def process_result_value(self, value: Any, dialect: Any) -> Any:
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(str(value))
