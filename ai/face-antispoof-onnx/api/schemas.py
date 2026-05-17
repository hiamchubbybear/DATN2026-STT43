"""Pydantic schemas for API request/response models."""

from pydantic import BaseModel, Field
from typing import Optional, List


# ── Response Models ──────────────────────────────────────────────

class BBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class FaceDetection(BaseModel):
    bbox: BBox
    confidence: float


class LivenessResult(BaseModel):
    """Result of a single face liveness check."""
    is_real: bool
    status: str = Field(description="'real' or 'spoof'")
    confidence: float = Field(description="Absolute logit difference (higher = more certain)")
    logit_diff: float
    real_logit: float
    spoof_logit: float
    bbox: BBox


class LivenessResponse(BaseModel):
    """Response for /verify-liveness endpoint."""
    success: bool
    faces_detected: int
    results: List[LivenessResult]
    message: str = ""


class FaceCompareResponse(BaseModel):
    """Response for /compare-faces endpoint."""
    success: bool
    match: bool
    similarity: float = Field(description="Cosine similarity between face crops (0-1)")
    message: str = ""


class DetectFacesResponse(BaseModel):
    """Response for /detect-faces endpoint."""
    success: bool
    faces_detected: int
    faces: List[FaceDetection]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    detector_loaded: bool
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    detail: Optional[str] = None


class DocumentVerifyResponse(BaseModel):
    """Response for /verify-document endpoint."""
    success: bool
    is_clear: bool = True
    is_bright: bool = True
    blur_score: float = 0.0
    brightness_score: float = 0.0
    ocr_text: List[str] = []
    message: str = ""


# ── Scam Detection ────────────────────────────────────────────────────────────

class ScamDetectionRequest(BaseModel):
    """
    Behavioral feature vector sent by the C# backend.
    Field names are camelCase to match System.Text.Json defaults.
    """
    swipesPerHour: float = Field(0.0, description="Average hourly swipe rate (last 24 h)")
    spamLinkCount: int = Field(0, description="Total spam links sent (all time)")
    reportCount: int = Field(0, description="Total reports received from other users")
    profileCompleteness: float = Field(0.0, ge=0.0, le=1.0, description="Fraction of profile fields filled (0–1)")
    hasProfilePhoto: bool = Field(False, description="Has at least one profile photo")
    isFaceVerified: bool = Field(False, description="Passed biometric identity verification")
    bioHasContact: bool = Field(False, description="Bio contains phone/social contact info")


class ScamDetectionResponse(BaseModel):
    """Scam prediction result returned to the C# backend."""
    scamProbability: float = Field(description="Probability of being a scam account (0.0–1.0)")
    riskLevel: str = Field(description="low | medium | high | critical")
    triggeredRules: List[str] = Field(default_factory=list, description="Rule names whose thresholds were exceeded")
    recommendation: str = Field(description="none | warn | shadow_ban | ban")
