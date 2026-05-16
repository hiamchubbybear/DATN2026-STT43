"""Face detection."""

import cv2
import numpy as np
from typing import List, Dict
from pathlib import Path


def load_detector(
    model_path: str,
    input_size: tuple,
    confidence_threshold: float = 0.5,
    nms_threshold: float = 0.3,
    top_k: int = 5000,
):
    """Load face detector."""
    if not Path(model_path).exists():
        return None

    try:
        return cv2.FaceDetectorYN.create(
            str(model_path),
            "",
            input_size,
            confidence_threshold,
            nms_threshold,
            top_k,
        )
    except Exception:
        return None


def detect(
    image: np.ndarray, detector, min_face_size: int = 30, margin: int = 0, threshold: float = 0.5
) -> List[Dict]:
    """Detect faces. Filter by min size and edge margin. Return list of {bbox, confidence}."""
    if detector is None or image is None:
        return []

    img_h, img_w = image.shape[:2]
    detector.setInputSize((img_w, img_h))
    
    # We use a trick: the detector has its own threshold, but we can filter the results here too.
    _, faces = detector.detect(image)

    if faces is None or len(faces) == 0:
        return []

    detections = []
    for face in faces:
        x, y, w, h = face[:4].astype(int)
        conf = float(face[14])

        if conf < threshold:
            continue

        # Clip bounding box to image boundaries instead of skipping
        x1, y1 = max(0, x), max(0, y)
        x2, y2 = min(img_w, x + w), min(img_h, y + h)
        w, h = x2 - x1, y2 - y1

        if w <= 0 or h <= 0:
            continue

        dist_left = x1
        dist_right = img_w - x2
        dist_top = y1
        dist_bottom = img_h - y2
        if min(dist_left, dist_right, dist_top, dist_bottom) < margin:
            continue

        if w >= min_face_size and h >= min_face_size:
            detections.append(
                {
                    "bbox": {
                        "x": float(x1),
                        "y": float(y1),
                        "width": float(w),
                        "height": float(h),
                    },
                    "confidence": conf,
                }
            )

    return detections
