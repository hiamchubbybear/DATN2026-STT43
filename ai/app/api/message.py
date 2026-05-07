"""``POST /v1/score/message`` — Tier-0 scoring of a single chat message."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.auth import require_internal_token
from app.core.config import get_settings
from app.detectors.tier0 import score_t0
from app.schemas.message import (
    Explanation,
    ScoreMessageRequest,
    ScoreMessageResponse,
)

router = APIRouter(
    prefix="/v1/score",
    tags=["scoring"],
    dependencies=[Depends(require_internal_token)],
)


@router.post(
    "/message",
    response_model=ScoreMessageResponse,
    summary="Score a single chat message for scam risk",
)
async def score_message(payload: ScoreMessageRequest) -> ScoreMessageResponse:
    settings = get_settings()
    result = score_t0(payload.text, lang=payload.lang)
    return ScoreMessageResponse(
        message_id=payload.message_id,
        score=result.score,
        labels=list(result.labels),
        model_version=settings.rules_version,
        explanations=[
            Explanation(feature=feature, weight=weight) for feature, weight in result.explanations
        ],
    )
