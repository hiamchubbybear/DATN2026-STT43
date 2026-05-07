"""Canonical scam-detection label vocabulary.

These string constants are persisted in MongoDB (on ``ChatMessage.Risk.Labels``
in the .NET backend) and surfaced to the admin UI. **Renaming a label is a
breaking change** that requires a Mongo migration, so additions are cheap but
renames are not. Add new labels at the bottom and never reorder.

The mapping from this vocabulary to (feature, weight) pairs lives in
:mod:`app.detectors.tier0`.
"""

from __future__ import annotations

from typing import Final

PHONE_LEAK: Final = "phone_leak"
EMAIL_LEAK: Final = "email_leak"
OFF_PLATFORM_LINK: Final = "off_platform_link"
CRYPTO_ADDRESS: Final = "crypto_address"
BANK_NUMBER: Final = "bank_number"

MONEY_REQUEST: Final = "money_request"
INVESTMENT_PITCH: Final = "investment_pitch"
GIFT_CARD_REQUEST: Final = "gift_card_request"

ROMANCE_BAIT: Final = "romance_bait"
WIDOW_TEMPLATE: Final = "widow_template"
MILITARY_TEMPLATE: Final = "military_template"
FAST_ESCALATION: Final = "fast_escalation"

ALL_LABELS: Final[frozenset[str]] = frozenset(
    {
        PHONE_LEAK,
        EMAIL_LEAK,
        OFF_PLATFORM_LINK,
        CRYPTO_ADDRESS,
        BANK_NUMBER,
        MONEY_REQUEST,
        INVESTMENT_PITCH,
        GIFT_CARD_REQUEST,
        ROMANCE_BAIT,
        WIDOW_TEMPLATE,
        MILITARY_TEMPLATE,
        FAST_ESCALATION,
    }
)
