"""Smoke tests for the operational endpoints."""

from __future__ import annotations

from httpx import AsyncClient


async def test_healthz_returns_ok(client: AsyncClient) -> None:
    response = await client.get("/healthz")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_readyz_reports_ready_with_only_rules(client: AsyncClient) -> None:
    response = await client.get("/readyz")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ready"
    assert body["checks"]["rules_loaded"] is True


async def test_version_exposes_service_and_rules_version(client: AsyncClient) -> None:
    response = await client.get("/version")

    assert response.status_code == 200
    body = response.json()
    assert body["service_version"]
    assert body["rules_version"]
    assert body["env"] in {"development", "staging", "production"}
