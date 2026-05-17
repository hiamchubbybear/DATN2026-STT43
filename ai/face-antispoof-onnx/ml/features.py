"""
Scam detection feature definitions.

These 7 behavioral signals are computed by the C# backend from Redis + MongoDB
and sent as a JSON body to POST /api/v1/detect-scam.

Mapping C# source → feature name:
  swipesPerHour       Redis  fast_swipe:min:{userId}                  (hourly avg last 24 h)
  spamLinkCount       Redis  spam_links:{userId}                       (running total)
  reportCount         MongoDB UserReport collection                    (total received)
  profileCompleteness Computed from UserProfile fields                 (0.0 – 1.0)
  hasProfilePhoto     UserProfile.Photos.Any()                         (bool)
  isFaceVerified      UserAccount.IsIdentityVerified                   (bool)
  bioHasContact       IContentModerationService.ModerateTextAsync      (bool)
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

import numpy as np

# Ordered list of feature names — must match the order used in training.
FEATURE_NAMES: List[str] = [
    "swipesPerHour",
    "spamLinkCount",
    "reportCount",
    "profileCompleteness",
    "hasProfilePhoto",
    "isFaceVerified",
    "bioHasContact",
]

# Human-readable rule descriptions matched to feature conditions.
# Used to populate the `triggeredRules` field in the API response.
RULE_DESCRIPTIONS = {
    "swipesPerHour":       ("swipe_speed_burst",    lambda v: v > 80),
    "spamLinkCount":       ("spam_links_detected",   lambda v: v >= 2),
    "reportCount":         ("multiple_reports",      lambda v: v >= 3),
    "profileCompleteness": ("incomplete_profile",    lambda v: v < 0.3),
    "hasProfilePhoto":     ("no_profile_photo",      lambda v: not bool(v)),
    "isFaceVerified":      ("not_face_verified",     lambda v: not bool(v)),
    "bioHasContact":       ("bio_contact_info",      lambda v: bool(v)),
}


@dataclass
class ScamFeatures:
    """Typed container for the 7 behavioral features.

    All values should already be validated / clipped before passing here.
    Use `from_dict` to parse the JSON payload from the C# backend.
    """

    swipesPerHour: float        # avg hourly swipes last 24 h
    spamLinkCount: int          # total spam links sent
    reportCount: int            # total reports received from other users
    profileCompleteness: float  # 0.0–1.0 fraction of profile filled
    hasProfilePhoto: bool       # has at least one photo uploaded
    isFaceVerified: bool        # passed biometric identity verification
    bioHasContact: bool         # bio contains phone/social contact info

    # ── Conversion ───────────────────────────────────────────────────────────

    def to_array(self) -> np.ndarray:
        """Return a 1-D float32 array in FEATURE_NAMES order."""
        return np.array([
            self.swipesPerHour,
            float(self.spamLinkCount),
            float(self.reportCount),
            self.profileCompleteness,
            float(self.hasProfilePhoto),
            float(self.isFaceVerified),
            float(self.bioHasContact),
        ], dtype=np.float32)

    @classmethod
    def from_dict(cls, data: dict) -> "ScamFeatures":
        return cls(
            swipesPerHour=float(data.get("swipesPerHour", 0)),
            spamLinkCount=int(data.get("spamLinkCount", 0)),
            reportCount=int(data.get("reportCount", 0)),
            profileCompleteness=float(data.get("profileCompleteness", 0)),
            hasProfilePhoto=bool(data.get("hasProfilePhoto", False)),
            isFaceVerified=bool(data.get("isFaceVerified", False)),
            bioHasContact=bool(data.get("bioHasContact", False)),
        )

    def triggered_rules(self) -> List[str]:
        """Return rule names whose threshold conditions are met by this feature set."""
        rules = []
        values = {
            "swipesPerHour": self.swipesPerHour,
            "spamLinkCount": self.spamLinkCount,
            "reportCount": self.reportCount,
            "profileCompleteness": self.profileCompleteness,
            "hasProfilePhoto": self.hasProfilePhoto,
            "isFaceVerified": self.isFaceVerified,
            "bioHasContact": self.bioHasContact,
        }
        for feat, (rule_name, condition) in RULE_DESCRIPTIONS.items():
            if condition(values[feat]):
                rules.append(rule_name)
        return rules
