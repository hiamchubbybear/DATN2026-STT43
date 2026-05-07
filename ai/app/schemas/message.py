"""Pydantic schemas for the message-scoring endpoint.

Mirrors ``AI_PLAN.md §5.1`` exactly. The .NET ``RiskScoringClient`` (Sprint
E1.3) deserialises the response into a ``RiskScore`` value object — any
field rename here is a breaking change for the backend team.
"""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MessageContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    conversation_age_seconds: int | None = Field(default=None, ge=0)
    messages_in_conversation: int | None = Field(default=None, ge=0)
    sender_account_age_days: float | None = Field(default=None, ge=0.0)
    sender_prior_reports: int | None = Field(default=None, ge=0)


class ScoreMessageRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message_id: UUID
    conversation_id: UUID
    sender_id: UUID
    receiver_id: UUID
    text: str = Field(min_length=1, max_length=10_000)
    context: MessageContext | None = None
    lang: str | None = Field(default=None, max_length=8)


class Explanation(BaseModel):
    feature: str
    weight: float = Field(ge=0.0, le=1.0)


class ScoreMessageResponse(BaseModel):
    message_id: UUID
    score: float = Field(ge=0.0, le=1.0)
    labels: list[str]
    model_version: str
    explanations: list[Explanation]
