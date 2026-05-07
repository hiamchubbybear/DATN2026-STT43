"""Operational endpoints: liveness, readiness, version.

These are intentionally unauthenticated so that K8s probes and operators
can observe the service without the shared internal token.
"""

from __future__ import annotations

import os
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from app import __version__
from app.core.config import get_settings

router = APIRouter(tags=["ops"])


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"


class ReadinessResponse(BaseModel):
    status: Literal["ready", "not_ready"]
    checks: dict[str, bool]


class VersionResponse(BaseModel):
    service_version: str
    rules_version: str
    image_sha: str | None = None
    env: str


@router.get("/healthz", response_model=HealthResponse, summary="Liveness probe")
async def healthz() -> HealthResponse:
    return HealthResponse()


@router.get("/readyz", response_model=ReadinessResponse, summary="Readiness probe")
async def readyz() -> ReadinessResponse:
    # Tier 0 has no model artifacts to load. As soon as Tier 1 lands this
    # returns ``False`` until the joblib pipeline is loaded into memory.
    checks = {"rules_loaded": True}
    all_ok = all(checks.values())
    return ReadinessResponse(
        status="ready" if all_ok else "not_ready",
        checks=checks,
    )


@router.get("/version", response_model=VersionResponse, summary="Build / model version")
async def version() -> VersionResponse:
    settings = get_settings()
    return VersionResponse(
        service_version=__version__,
        rules_version=settings.rules_version,
        image_sha=os.environ.get("IMAGE_SHA"),
        env=settings.env,
    )
