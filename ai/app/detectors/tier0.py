"""Tier-0 (rules + lexicons) scorer.

Composes the regex detectors and the YAML lexicons into a single label set
and a probabilistic-OR aggregated score. Pure function — no I/O, no globals
mutated, safe to call from any thread.

Scoring is the noisy-OR formula::

    score = 1 - prod(1 - w_i)  for each fired label i

This caps at 1.0 even when many labels fire and gives diminishing returns
to additional evidence, which matches the calibration we want before the
Tier-1 model lands. Weights are tuned to put a single "phone leak + zalo
push" message above the high-risk threshold (0.8) defined in
``backend/appsettings`` (``RiskScoring.ThresholdHigh``).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final

from app.detectors import labels, lexicon, regex

# Weight per label. Add new labels at the bottom; tune existing ones via the
# eval set in `tests/fixtures/messages.yml` and the calibration notebook in
# Sprint E2.
LABEL_WEIGHTS: Final[dict[str, float]] = {
    labels.PHONE_LEAK: 0.35,
    labels.EMAIL_LEAK: 0.25,
    labels.OFF_PLATFORM_LINK: 0.45,
    labels.CRYPTO_ADDRESS: 0.55,
    labels.BANK_NUMBER: 0.30,
    labels.MONEY_REQUEST: 0.55,
    labels.INVESTMENT_PITCH: 0.55,
    labels.GIFT_CARD_REQUEST: 0.55,
    labels.ROMANCE_BAIT: 0.20,
    labels.WIDOW_TEMPLATE: 0.15,
    labels.MILITARY_TEMPLATE: 0.15,
    labels.FAST_ESCALATION: 0.20,
}

_LEXICON_TO_LABEL: Final[dict[str, str]] = {
    "off_platform": labels.OFF_PLATFORM_LINK,
    "money": labels.MONEY_REQUEST,
    "investment": labels.INVESTMENT_PITCH,
    "gift_card": labels.GIFT_CARD_REQUEST,
    "romance_bait": labels.ROMANCE_BAIT,
    "widow": labels.WIDOW_TEMPLATE,
    "military": labels.MILITARY_TEMPLATE,
    "fast_escalation": labels.FAST_ESCALATION,
    "bank": labels.BANK_NUMBER,
}

# Stable label ordering for explanations (most "actionable" signals first).
_LABEL_ORDER: Final[tuple[str, ...]] = (
    labels.OFF_PLATFORM_LINK,
    labels.PHONE_LEAK,
    labels.EMAIL_LEAK,
    labels.CRYPTO_ADDRESS,
    labels.BANK_NUMBER,
    labels.MONEY_REQUEST,
    labels.INVESTMENT_PITCH,
    labels.GIFT_CARD_REQUEST,
    labels.ROMANCE_BAIT,
    labels.WIDOW_TEMPLATE,
    labels.MILITARY_TEMPLATE,
    labels.FAST_ESCALATION,
)


@dataclass(frozen=True)
class T0Result:
    """Output of :func:`score_t0`.

    ``score`` is in ``[0, 1]``. ``labels`` is deterministically ordered.
    ``explanations`` is a list of ``(feature, weight)`` tuples, one per fired
    label. The .NET ``RiskScoringClient`` deserialises this 1:1.
    """

    score: float
    labels: tuple[str, ...]
    explanations: tuple[tuple[str, float], ...]


def score_t0(text: str, *, lang: str | None = None) -> T0Result:
    if not text or not text.strip():
        return T0Result(score=0.0, labels=(), explanations=())

    fired: set[str] = set()

    if regex.find_phones(text):
        fired.add(labels.PHONE_LEAK)
    if regex.find_emails(text):
        fired.add(labels.EMAIL_LEAK)
    if regex.find_off_platform_urls(text):
        fired.add(labels.OFF_PLATFORM_LINK)
    if regex.find_crypto_addresses(text):
        fired.add(labels.CRYPTO_ADDRESS)

    primary: lexicon.Lang = "vi" if (lang or "").lower().startswith("vi") else "en"
    lex_hits = lexicon.match_categories(text, lang=primary)
    for category in lex_hits:
        label = _LEXICON_TO_LABEL.get(category)
        if label is not None:
            fired.add(label)

    ordered = tuple(label for label in _LABEL_ORDER if label in fired)
    explanations = tuple((label, LABEL_WEIGHTS[label]) for label in ordered)

    score = 1.0
    for _, weight in explanations:
        score *= 1.0 - weight
    score = round(1.0 - score, 4)

    return T0Result(score=score, labels=ordered, explanations=explanations)
