"""
Scam detection inference wrapper.

Loads models/scam_model.pkl once at process startup and exposes a single
`predict()` call used by the /api/v1/detect-scam endpoint.

Risk thresholds (probability → risk level):
    < 0.40             low
    0.40 – 0.65        medium
    0.65 – 0.85        high
    >= 0.85            critical

Recommendation mapping:
    low      → none
    medium   → warn
    high     → shadow_ban
    critical → ban
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

import joblib
import numpy as np

from ml.features import ScamFeatures

logger = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).parent.parent / "models" / "scam_model.pkl"

# Probability thresholds
_THRESHOLDS = {
    "critical": 0.85,
    "high":     0.65,
    "medium":   0.40,
}

_RECOMMENDATIONS = {
    "critical": "ban",
    "high":     "shadow_ban",
    "medium":   "warn",
    "low":      "none",
}


class ScamDetector:
    """Singleton wrapper around the trained XGBoost model."""

    def __init__(self) -> None:
        self._model = None
        self._loaded = False

    def load(self) -> None:
        if self._loaded:
            return
        if not MODEL_PATH.exists():
            logger.warning(
                "Scam model not found at %s. "
                "Run 'python -m ml.train' to generate it. "
                "Falling back to rule-only detection.",
                MODEL_PATH,
            )
            return
        try:
            self._model = joblib.load(MODEL_PATH)
            self._loaded = True
            logger.info("Scam detection model loaded from %s", MODEL_PATH)
        except Exception:
            logger.exception("Failed to load scam model from %s", MODEL_PATH)

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def predict(self, features: ScamFeatures) -> dict:
        """
        Return a prediction dict:
            scamProbability : float   (0.0 – 1.0)
            riskLevel       : str     (low | medium | high | critical)
            triggeredRules  : list[str]
            recommendation  : str     (none | warn | shadow_ban | ban)
        """
        triggered_rules = features.triggered_rules()

        if self._model is not None:
            prob = self._predict_ml(features)
        else:
            # Fallback: derive a rough probability from triggered rule count
            prob = self._rule_based_probability(triggered_rules)

        risk_level = self._classify_risk(prob)
        recommendation = _RECOMMENDATIONS[risk_level]

        return {
            "scamProbability": round(prob, 4),
            "riskLevel": risk_level,
            "triggeredRules": triggered_rules,
            "recommendation": recommendation,
        }

    # ── Private helpers ───────────────────────────────────────────────────────

    def _predict_ml(self, features: ScamFeatures) -> float:
        x = features.to_array().reshape(1, -1)
        prob = float(self._model.predict_proba(x)[0, 1])
        return prob

    @staticmethod
    def _rule_based_probability(triggered_rules: list[str]) -> float:
        """
        Rough scam probability when no ML model is available.
        Each triggered rule adds weight; hard caps at 0.95.

        High-signal rules correspond to RULE_DESCRIPTIONS values in features.py:
            multiple_reports    → reportCount >= 3
            spam_links_detected → spamLinkCount >= 2
            swipe_speed_burst   → swipesPerHour > 80
            bio_contact_info    → bioHasContact == True
        """
        # High-signal rules carry more weight — must match RULE_DESCRIPTIONS names
        high_weight = {
            "multiple_reports",
            "spam_links_detected",
            "swipe_speed_burst",
            "bio_contact_info",
        }
        score = 0.0
        for rule in triggered_rules:
            score += 0.20 if rule in high_weight else 0.10
        return min(score, 0.95)

    @staticmethod
    def _classify_risk(prob: float) -> str:
        if prob >= _THRESHOLDS["critical"]:
            return "critical"
        if prob >= _THRESHOLDS["high"]:
            return "high"
        if prob >= _THRESHOLDS["medium"]:
            return "medium"
        return "low"


# ── Module-level singleton ────────────────────────────────────────────────────

_detector: Optional[ScamDetector] = None


def get_detector() -> ScamDetector:
    global _detector
    if _detector is None:
        _detector = ScamDetector()
        _detector.load()
    return _detector
