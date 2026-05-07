"""Regex detectors for the Tier-0 scorer.

Each detector returns a list of distinct matches found in the input. Returning
the matches (not just a boolean) lets future tiers count occurrences, but the
v1 scorer only cares about presence/absence.

Patterns are deliberately conservative — when in doubt we under-match. False
positives directly drive away real users; the model retraining loop will
recover lost recall as labels accumulate.
"""

from __future__ import annotations

import re
from re import Pattern

# Vietnamese mobile-phone number, with optional spaces / dots / dashes between
# digits. Matches "0987654321", "0987 654 321", "+84 987-654-321".
# Mobile prefixes: 03, 05, 07, 08, 09 (per the 2018 numbering plan).
VN_PHONE: Pattern[str] = re.compile(
    r"(?:(?:\+|00)84|0)[\s.\-]?[35789](?:[\s.\-]?\d){8}",
    re.IGNORECASE,
)

# Generic email — RFC 5322 is too permissive for our needs; this is the
# "good enough for surface-level leak detection" subset.
EMAIL: Pattern[str] = re.compile(
    r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b",
    re.IGNORECASE,
)

# Off-platform messenger / shortener URLs. These are *strong* signals — almost
# all legitimate dating-app conversation stays on-platform until much later.
OFF_PLATFORM_URL: Pattern[str] = re.compile(
    r"\b(?:https?://)?(?:www\.)?"
    r"(?:zalo\.me|t\.me|telegram\.me|wa\.me|whatsapp\.com|"
    r"line\.me|wechat\.com|signal\.org|"
    r"bit\.ly|tinyurl\.com|t\.co|goo\.gl)"
    r"(?:/[^\s]*)?",
    re.IGNORECASE,
)

# Cryptocurrency wallet addresses.
# - BTC: legacy P2PKH/P2SH (1.., 3..), bech32 (bc1..)
# - ETH / EVM: 0x + 40 hex chars
# - USDT-TRC20: T + 33 base58 chars
CRYPTO_BTC: Pattern[str] = re.compile(r"\b(?:bc1|[13])[A-HJ-NP-Za-km-z1-9]{25,62}\b")
CRYPTO_ETH: Pattern[str] = re.compile(r"\b0x[a-fA-F0-9]{40}\b")
CRYPTO_TRC20: Pattern[str] = re.compile(r"\bT[A-Za-z1-9]{33}\b")


def find_phones(text: str) -> list[str]:
    return [m.group(0) for m in VN_PHONE.finditer(text)]


def find_emails(text: str) -> list[str]:
    return [m.group(0) for m in EMAIL.finditer(text)]


def find_off_platform_urls(text: str) -> list[str]:
    return [m.group(0) for m in OFF_PLATFORM_URL.finditer(text)]


def find_crypto_addresses(text: str) -> list[str]:
    hits: list[str] = []
    for pattern in (CRYPTO_BTC, CRYPTO_ETH, CRYPTO_TRC20):
        hits.extend(m.group(0) for m in pattern.finditer(text))
    return hits
