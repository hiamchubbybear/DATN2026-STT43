"""Singleton model dependencies — loaded once at startup, reused across requests."""

import os
import numpy as np
from pathlib import Path
from typing import Optional, Tuple

import onnxruntime as ort

from src.inference.loader import load_model
from src.detection.face import load_detector
import easyocr

MODELS_DIR = Path(__file__).parent.parent / "models"

# Default model paths (overridable via env vars)
DETECTOR_MODEL = os.getenv("DETECTOR_MODEL_PATH", str(MODELS_DIR / "detector_quantized.onnx"))
LIVENESS_MODEL = os.getenv("LIVENESS_MODEL_PATH", str(MODELS_DIR / "best_model_quantized.onnx"))

# Thresholds (overridable via env vars)
LIVENESS_THRESHOLD = float(os.getenv("LIVENESS_THRESHOLD", "0.5"))
FACE_MATCH_THRESHOLD = float(os.getenv("FACE_MATCH_THRESHOLD", "0.4"))
MODEL_IMG_SIZE = int(os.getenv("MODEL_IMG_SIZE", "128"))
DETECTOR_INPUT_SIZE = (
    int(os.getenv("DETECTOR_INPUT_W", "640")),
    int(os.getenv("DETECTOR_INPUT_H", "640")),
)
BBOX_EXPANSION_FACTOR = float(os.getenv("BBOX_EXPANSION_FACTOR", "1.5"))
MARGIN = int(os.getenv("FACE_MARGIN", "0"))


class ModelManager:
    """Manages model loading and provides singleton access."""

    def __init__(self):
        self.liveness_session: Optional[ort.InferenceSession] = None
        self.liveness_input_name: Optional[str] = None
        self.face_detector = None
        self.ocr_reader = None
        self.logit_threshold: float = 0.0
        self._loaded = False

    def load(self) -> None:
        """Load all models. Call once at startup."""
        if self._loaded:
            return

        # Compute logit threshold from probability threshold
        p = max(1e-6, min(1 - 1e-6, LIVENESS_THRESHOLD))
        self.logit_threshold = float(np.log(p / (1 - p)))

        # Load face detector
        self.face_detector = load_detector(DETECTOR_MODEL, DETECTOR_INPUT_SIZE)
        if self.face_detector is None:
            raise RuntimeError(f"Failed to load face detector from {DETECTOR_MODEL}")

        # Load liveness model
        self.liveness_session, self.liveness_input_name = load_model(LIVENESS_MODEL)
        if self.liveness_session is None:
            raise RuntimeError(f"Failed to load liveness model from {LIVENESS_MODEL}")

        # Load OCR model (English + Vietnamese)
        try:
            self.ocr_reader = easyocr.Reader(['en', 'vi'], gpu=False) # Use CPU for stability in local dev
        except Exception as e:
            print(f"Failed to load EasyOCR: {e}")

        self._loaded = True

    @property
    def is_loaded(self) -> bool:
        return self._loaded


# Global singleton
model_manager = ModelManager()


def get_model_manager() -> ModelManager:
    """FastAPI dependency — returns the global ModelManager."""
    return model_manager
