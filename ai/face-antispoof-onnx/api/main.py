"""
Face Anti-Spoofing AI Microservice

FastAPI server wrapping the MiniFAS ONNX model for:
- Liveness detection (real vs spoof)
- Face detection
- Face comparison (crop similarity)
"""

import io
import sys
import time
import logging
from contextlib import asynccontextmanager
from typing import List

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from api.schemas import (
    BBox,
    LivenessResult,
    LivenessResponse,
    FaceCompareResponse,
    DetectFacesResponse,
    FaceDetection,
    HealthResponse,
    ErrorResponse,
    DocumentVerifyResponse,
    ScamDetectionRequest,
    ScamDetectionResponse,
)
from api.dependencies import (
    ModelManager,
    get_model_manager,
    model_manager,
    MODEL_IMG_SIZE,
    BBOX_EXPANSION_FACTOR,
    MARGIN,
)
from src.inference import infer, process_with_logits, crop
from src.detection import detect
from ml.scam_model import get_detector
from ml.features import ScamFeatures

# ── Logging ──────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("antispoof-api")


# ── Lifespan ─────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup, cleanup on shutdown."""
    logger.info("Loading AI models...")
    start = time.time()
    try:
        model_manager.load()
        elapsed = time.time() - start
        logger.info(f"Models loaded in {elapsed:.2f}s")
    except RuntimeError as e:
        logger.error(f"Failed to load models: {e}")
        raise
    # Warm up scam detector (non-fatal if model file is missing)
    get_detector()
    yield
    logger.info("Shutting down AI service")


# ── App ──────────────────────────────────────────────────────────

app = FastAPI(
    title="Face Anti-Spoofing API",
    description="Lightweight face liveness detection & comparison service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ──────────────────────────────────────────────────────

def read_image_from_upload(file_bytes: bytes) -> np.ndarray:
    """Decode uploaded file bytes into an RGB numpy array."""
    nparr = np.frombuffer(file_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Could not decode image file")
    return cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)


def compute_crop_similarity(crop_a: np.ndarray, crop_b: np.ndarray, size: int = 128) -> float:
    """
    Simple face similarity using normalized pixel correlation.
    For production, replace with a proper face embedding model (ArcFace/FaceNet).
    """
    a = cv2.resize(crop_a, (size, size)).astype(np.float32).flatten()
    b = cv2.resize(crop_b, (size, size)).astype(np.float32).flatten()

    # Normalize
    a = a - a.mean()
    b = b - b.mean()

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a < 1e-6 or norm_b < 1e-6:
        return 0.0

    similarity = float(np.dot(a, b) / (norm_a * norm_b))
    return max(0.0, similarity)


def check_image_quality(img_rgb: np.ndarray) -> tuple[bool, str]:
    """Check for darkness or extreme blur."""
    # Convert to grayscale for simple checks
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

    # 1. Brightness check (Mean pixel value)
    mean_brightness = np.mean(gray)
    
    # 2. Variance of Laplacian for blur detection
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    logger.info(f"Image Quality | Brightness: {mean_brightness:.2f} | Blur: {laplacian_var:.2f}")

    if mean_brightness < 40: 
        return False, "Image is too dark. Please use better lighting."

    if laplacian_var < 50:
        return False, "Image is too blurry. Please hold steady."

    return True, "OK"


# ── Endpoints ────────────────────────────────────────────────────

@app.get("/api/v1/health", response_model=HealthResponse, tags=["System"])
async def health_check(mm: ModelManager = Depends(get_model_manager)):
    """Health check — returns model loading status."""
    return HealthResponse(
        status="ok" if mm.is_loaded else "degraded",
        model_loaded=mm.liveness_session is not None,
        detector_loaded=mm.face_detector is not None,
    )


@app.post(
    "/api/v1/verify-liveness",
    response_model=LivenessResponse,
    responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}},
    tags=["Verification"],
)
async def verify_liveness(
    image: UploadFile = File(..., description="Face image to verify (JPEG/PNG)"),
    mm: ModelManager = Depends(get_model_manager),
):
    """
    Check if a face in the uploaded image is real or spoofed.

    Returns liveness classification for each detected face.
    """
    if not mm.is_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded yet")

    try:
        file_bytes = await image.read()
        img_rgb = read_image_from_upload(file_bytes)
        h, w = img_rgb.shape[:2]
        logger.info(f"Processing liveness check | Image size: {w}x{h}")
        
        is_ok, msg = check_image_quality(img_rgb)
        if not is_ok:
            logger.warning(f"Quality check failed: {msg}")
            return LivenessResponse(
                success=False,
                faces_detected=0,
                results=[],
                message=msg,
            )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Detect faces
    faces = detect(img_rgb, mm.face_detector, margin=MARGIN)
    logger.info(f"Face detection | Faces found: {len(faces)}")

    if not faces:
        return LivenessResponse(
            success=False,
            faces_detected=0,
            results=[],
            message="No faces detected in the image",
        )

    # Crop and run liveness inference
    face_crops: List[np.ndarray] = []
    valid_faces = []

    for face in faces:
        bbox = face["bbox"]
        x, y, w, h = bbox["x"], bbox["y"], bbox["width"], bbox["height"]
        try:
            face_crop = crop(img_rgb, (x, y, x + w, y + h), BBOX_EXPANSION_FACTOR)
            face_crops.append(face_crop)
            valid_faces.append(face)
        except Exception as e:
            logger.warning(f"Failed to crop face at ({x},{y},{w},{h}): {e}")
            continue

    if not face_crops:
        return LivenessResponse(
            success=True,
            faces_detected=len(faces),
            results=[],
            message="Faces detected but could not be cropped",
        )

    # Batch inference
    predictions = infer(face_crops, mm.liveness_session, mm.liveness_input_name, MODEL_IMG_SIZE)

    results: List[LivenessResult] = []
    for face, pred in zip(valid_faces, predictions):
        try:
            result = process_with_logits(pred, mm.logit_threshold)
            bbox = face["bbox"]
            results.append(LivenessResult(
                is_real=result["is_real"],
                status=result["status"],
                confidence=result["confidence"],
                logit_diff=result["logit_diff"],
                real_logit=result["real_logit"],
                spoof_logit=result["spoof_logit"],
                bbox=BBox(
                    x=bbox["x"],
                    y=bbox["y"],
                    width=bbox["width"],
                    height=bbox["height"],
                ),
            ))
        except Exception as e:
            logger.warning(f"Failed to process prediction: {e}")
            continue

    return LivenessResponse(
        success=True,
        faces_detected=len(results),
        results=results,
        message="Liveness check completed",
    )


@app.post(
    "/api/v1/compare-faces",
    response_model=FaceCompareResponse,
    responses={400: {"model": ErrorResponse}},
    tags=["Verification"],
)
async def compare_faces(
    selfie: UploadFile = File(..., description="Selfie image"),
    id_photo: UploadFile = File(..., description="ID card photo"),
    mm: ModelManager = Depends(get_model_manager),
):
    """
    Compare the face in a selfie with the face on an ID card.

    Returns similarity score and match result.
    """
    if not mm.is_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded yet")

    try:
        selfie_bytes = await selfie.read()
        id_bytes = await id_photo.read()
        selfie_rgb = read_image_from_upload(selfie_bytes)
        id_rgb = read_image_from_upload(id_bytes)

        is_ok, msg = check_image_quality(selfie_rgb)
        if not is_ok:
            return FaceCompareResponse(success=False, match=False, similarity=0.0, message=f"Selfie: {msg}")

        is_ok, msg = check_image_quality(id_rgb)
        if not is_ok:
            return FaceCompareResponse(success=False, match=False, similarity=0.0, message=f"ID Photo: {msg}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Detect face in selfie
    selfie_faces = detect(selfie_rgb, mm.face_detector, margin=MARGIN)
    logger.info(f"Compare Faces | Selfie faces found: {len(selfie_faces)}")
    if not selfie_faces:
        return FaceCompareResponse(
            success=False, match=False, similarity=0.0,
            message="No face detected in selfie",
        )

    # Detect face in ID photo
    # We use a lower threshold (0.3) and smaller min_face_size (20) for ID cards
    id_faces = detect(id_rgb, mm.face_detector, margin=0, min_face_size=20, threshold=0.3)
    logger.info(f"Compare Faces | ID faces found: {len(id_faces)}")
    if not id_faces:
        return FaceCompareResponse(
            success=False, match=False, similarity=0.0,
            message="No face detected in ID photo",
        )

    # Crop the primary (highest confidence) face from each
    selfie_face = max(selfie_faces, key=lambda f: f["confidence"])
    id_face = max(id_faces, key=lambda f: f["confidence"])

    try:
        sb = selfie_face["bbox"]
        selfie_crop = crop(
            selfie_rgb, (sb["x"], sb["y"], sb["x"] + sb["width"], sb["y"] + sb["height"]),
            BBOX_EXPANSION_FACTOR,
        )
        ib = id_face["bbox"]
        id_crop = crop(
            id_rgb, (ib["x"], ib["y"], ib["x"] + ib["width"], ib["y"] + ib["height"]),
            BBOX_EXPANSION_FACTOR,
        )
    except Exception as e:
        return FaceCompareResponse(
            success=False, match=False, similarity=0.0,
            message=f"Failed to crop faces: {e}",
        )

    similarity = compute_crop_similarity(selfie_crop, id_crop)
    
    # Per user request: pass as long as faces are detected in both images.
    # We provide a base similarity of 0.5 to indicate "both have faces" even if pixel match is low.
    similarity = max(0.5, round(similarity, 4))
    is_match = True 

    logger.info(f"Compare Faces | Base Similarity: {similarity:.4f} | Match forced to True (faces detected)")

    return FaceCompareResponse(
        success=True,
        match=is_match,
        similarity=similarity,
        message="Face comparison completed (Faces detected in both)",
    )


@app.post(
    "/api/v1/detect-faces",
    response_model=DetectFacesResponse,
    responses={400: {"model": ErrorResponse}},
    tags=["Detection"],
)
async def detect_faces(
    image: UploadFile = File(..., description="Image to detect faces in"),
    mm: ModelManager = Depends(get_model_manager),
):
    """Detect faces in the uploaded image. Returns bounding boxes and confidence."""
    if not mm.is_loaded:
        raise HTTPException(status_code=503, detail="Models not loaded yet")

    try:
        file_bytes = await image.read()
        img_rgb = read_image_from_upload(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    faces = detect(img_rgb, mm.face_detector, margin=MARGIN)

    return DetectFacesResponse(
        success=True,
        faces_detected=len(faces),
        faces=[
            FaceDetection(
                bbox=BBox(
                    x=f["bbox"]["x"],
                    y=f["bbox"]["y"],
                    width=f["bbox"]["width"],
                    height=f["bbox"]["height"],
                ),
                confidence=f["confidence"],
            )
            for f in faces
        ],
    )


@app.post(
    "/api/v1/verify-document",
    response_model=DocumentVerifyResponse,
    responses={400: {"model": ErrorResponse}},
    tags=["Verification"],
)
async def verify_document(
    image: UploadFile = File(..., description="ID document image"),
    mm: ModelManager = Depends(get_model_manager),
):
    """
    Check ID document quality (blur, glare) and extract text via OCR.
    """
    try:
        file_bytes = await image.read()
        img_rgb = read_image_from_upload(file_bytes)
        img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process image: {e}")

    # 1. Blur Detection (Laplacian Variance)
    blur_score = cv2.Laplacian(img_gray, cv2.CV_64F).var()
    is_clear = blur_score > 60.0 # Threshold for clear enough text

    # 2. Glare/Highlight Detection
    # Check if there are large areas of pure white (glare)
    _, binary = cv2.threshold(img_gray, 240, 255, cv2.THRESH_BINARY)
    glare_pixels = np.sum(binary == 255)
    glare_ratio = glare_pixels / (img_gray.shape[0] * img_gray.shape[1])
    is_bright_ok = glare_ratio < 0.05 # Less than 5% of image is pure white glare

    # 3. Brightness check (reuse existing helper logic)
    mean_brightness = np.mean(img_gray)
    is_dim = mean_brightness < 40

    # 4. OCR Text Extraction
    ocr_results = []
    if is_clear and not is_dim and mm.ocr_reader:
        try:
            # EasyOCR expects numpy array
            results = mm.ocr_reader.readtext(img_rgb)
            ocr_results = [res[1] for res in results]
        except Exception as e:
            logger.warning(f"OCR failed: {e}")

    # Prepare message
    messages = []
    if not is_clear: messages.append("Image is too blurry.")
    if not is_bright_ok: messages.append("Image has too much glare/reflection.")
    if is_dim: messages.append("Image is too dark.")

    success = is_clear and is_bright_ok and not is_dim

    return DocumentVerifyResponse(
        success=success,
        is_clear=is_clear,
        is_bright=is_bright_ok and not is_dim,
        blur_score=round(blur_score, 2),
        brightness_score=round(mean_brightness, 2),
        ocr_text=ocr_results,
        message=" ".join(messages) if messages else "Document quality is good."
    )


@app.post(
    "/api/v1/detect-scam",
    response_model=ScamDetectionResponse,
    responses={422: {"model": ErrorResponse}},
    tags=["Scam Detection"],
)
async def detect_scam(request: ScamDetectionRequest):
    """
    Predict whether a user account is a scam/bot based on 7 behavioral signals.

    The C# backend aggregates these signals from Redis and MongoDB then calls
    this endpoint. Returns a scam probability, risk level, list of triggered
    rule names, and a recommended moderation action.

    Risk levels:
      low      (< 0.40)  → no action needed
      medium   (0.40-0.65) → send warning to user
      high     (0.65-0.85) → shadow ban
      critical (>= 0.85)  → ban account
    """
    features = ScamFeatures.from_dict(request.model_dump())

    detector = get_detector()
    result = detector.predict(features)

    logger.info(
        "Scam detection | prob=%.3f risk=%s rules=%s recommendation=%s",
        result["scamProbability"],
        result["riskLevel"],
        result["triggeredRules"],
        result["recommendation"],
    )

    return ScamDetectionResponse(**result)
