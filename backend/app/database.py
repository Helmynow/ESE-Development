"""Database configuration and session utilities."""

from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


class Base(DeclarativeBase):
    """Base declarative class for all models."""


DEFAULT_DATABASE_URL = "sqlite:///./app.db"


def get_database_url() -> str:
    """Resolve the database URL from the environment with a safe default."""

    return os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)


engine = create_engine(get_database_url(), echo=False, future=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_session_maker() -> sessionmaker[Base]:
    """Expose the configured session factory for dependency injection."""

    return SessionLocal


@contextmanager
def session_scope() -> Generator:
    """Provide a transactional scope for database operations."""

    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
