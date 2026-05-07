"""FastAPI entrypoint for the scam-detection service.

This module is intentionally thin: it wires up logging, config, routers and
middleware. All business logic lives in ``app.detectors`` and ``app.ml``.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app import __version__
from app.api import health
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    configure_logging(level=settings.log_level, json_logs=settings.is_production)
    log = get_logger("app.main")
    log.info(
        "ai_service_starting",
        env=settings.env,
        rules_version=settings.rules_version,
        service_version=__version__,
        internal_token_configured=bool(settings.internal_token),
    )
    try:
        yield
    finally:
        log.info("ai_service_stopping")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="DATN2026-STT43 AI",
        description="Internal scam-detection / safety service.",
        version=__version__,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url=None,
        lifespan=lifespan,
    )
    app.include_router(health.router)
    return app


app = create_app()
