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
