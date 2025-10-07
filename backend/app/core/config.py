"""Application configuration powered by Pydantic v2 settings."""
from __future__ import annotations

from functools import lru_cache
from typing import Any

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class RedisSettings(BaseSettings):
    """Redis connection settings."""

    model_config = SettingsConfigDict(env_prefix="REDIS_", extra="allow")

    url: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")
    stream_name: str = Field(default="events", description="Stream used for domain events")


class PostgresSettings(BaseSettings):
    """PostgreSQL connection settings."""

    model_config = SettingsConfigDict(env_prefix="POSTGRES_", extra="allow")

    dsn: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/ese",
        description="Async SQLAlchemy DSN",
    )


class AppSettings(BaseSettings):
    """Top-level settings container loaded from environment variables."""

    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env", extra="allow")

    name: str = Field(default="ESE Backend", description="Service display name")
    environment: str = Field(default="development", description="Deployment environment identifier")
    version: str = Field(default="0.1.0", description="Semantic application version")
    log_level: str = Field(default="INFO", description="Python logging level")
    redis: RedisSettings = Field(default_factory=RedisSettings)
    postgres: PostgresSettings = Field(default_factory=PostgresSettings)

    def model_post_init(self, __context: dict[str, Any]) -> None:  # noqa: D401
        """Normalize log level casing after model creation."""

        self.log_level = self.log_level.upper()


@lru_cache
def get_settings() -> AppSettings:
    """Return a cached settings instance."""

    return AppSettings()


settings = get_settings()
