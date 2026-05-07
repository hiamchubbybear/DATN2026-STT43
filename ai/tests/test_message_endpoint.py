"""HTTP-level tests for ``POST /v1/score/message``."""

from __future__ import annotations

from uuid import uuid4

from httpx import AsyncClient

ENDPOINT = "/v1/score/message"
INTERNAL_TOKEN = "test-internal-token"  # set by tests/conftest.py


def _payload(text: str, lang: str | None = "vi") -> dict[str, object]:
    body: dict[str, object] = {
        "message_id": str(uuid4()),
        "conversation_id": str(uuid4()),
        "sender_id": str(uuid4()),
        "receiver_id": str(uuid4()),
        "text": text,
    }
    if lang is not None:
        body["lang"] = lang
    return body


async def test_rejects_request_without_internal_token(client: AsyncClient) -> None:
    response = await client.post(ENDPOINT, json=_payload("hello"))

    assert response.status_code == 401


async def test_rejects_request_with_wrong_internal_token(client: AsyncClient) -> None:
    response = await client.post(
        ENDPOINT,
        json=_payload("hello"),
        headers={"X-Internal-Token": "wrong"},
    )

    assert response.status_code == 401


async def test_scores_obvious_scam_message(client: AsyncClient) -> None:
    response = await client.post(
        ENDPOINT,
        json=_payload("Em ơi qua zalo nói chuyện 0987654321 nhé", lang="vi"),
        headers={"X-Internal-Token": INTERNAL_TOKEN},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["score"] >= 0.6
    assert "phone_leak" in body["labels"]
    assert "off_platform_link" in body["labels"]
    assert body["model_version"]
    assert any(e["feature"] == "phone_leak" for e in body["explanations"])


async def test_scores_benign_message_to_zero(client: AsyncClient) -> None:
    response = await client.post(
        ENDPOINT,
        json=_payload("Hôm nay em đi cà phê không?", lang="vi"),
        headers={"X-Internal-Token": INTERNAL_TOKEN},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["score"] == 0.0
    assert body["labels"] == []


async def test_response_message_id_echoes_request(client: AsyncClient) -> None:
    payload = _payload("hello world", lang="en")
    response = await client.post(
        ENDPOINT,
        json=payload,
        headers={"X-Internal-Token": INTERNAL_TOKEN},
    )

    assert response.status_code == 200
    assert response.json()["message_id"] == payload["message_id"]


async def test_validation_error_on_missing_text(client: AsyncClient) -> None:
    body = _payload("placeholder")
    del body["text"]
    response = await client.post(
        ENDPOINT,
        json=body,
        headers={"X-Internal-Token": INTERNAL_TOKEN},
    )

    assert response.status_code == 422


async def test_validation_error_on_empty_text(client: AsyncClient) -> None:
    response = await client.post(
        ENDPOINT,
        json=_payload("", lang="vi"),
        headers={"X-Internal-Token": INTERNAL_TOKEN},
    )

    assert response.status_code == 422
