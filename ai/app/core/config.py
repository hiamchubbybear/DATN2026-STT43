"""Application settings loaded from environment variables.

All variables use the ``AI_`` prefix (e.g. ``AI_INTERNAL_TOKEN``).
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "staging", "production"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="AI_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    env: Environment = "development"
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"

    # Shared secret with the .NET backend; required so that the AI service is
    # never exposed unauthenticated even if the ClusterIP is misconfigured.
    internal_token: str = Field(default="", min_length=0)

    redis_url: str | None = None

    rules_version: str = "rules-v1"

    @property
    def is_production(self) -> bool:
        return self.env == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()
    if settings.is_production and not settings.internal_token:
        raise RuntimeError("AI_INTERNAL_TOKEN must be set in production. Refusing to start.")
    return settings
