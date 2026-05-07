"""Shared pytest fixtures."""

from __future__ import annotations

import os
from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient

# A predictable token for the auth tests. Set BEFORE app modules import settings.
os.environ.setdefault("AI_INTERNAL_TOKEN", "test-internal-token")
os.environ.setdefault("AI_ENV", "development")

from app.core.config import get_settings
from app.main import app


@pytest.fixture(autouse=True)
def _clear_settings_cache() -> None:
    get_settings.cache_clear()


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        yield c
