"""Keyword-lexicon matcher.

Lexicons are YAML files under ``app/detectors/lexicons/`` keyed by category
(``off_platform``, ``money``, …). At import time we compile every phrase into
a single, alternation-based, word-boundary-aware regex per (lang, category)
so a request scan is two regex passes regardless of phrase count.

Phrases are matched case-insensitively. Word boundaries (``\\b``) are
Unicode-aware in Python 3 by default, which means Vietnamese diacritics
(e.g. ``góa``) are matched correctly without extra config.
"""

from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path
from typing import Literal

import yaml

Lang = Literal["vi", "en"]

LEXICON_DIR: Path = Path(__file__).parent / "lexicons"


def _compile_category(phrases: list[str]) -> re.Pattern[str] | None:
    if not phrases:
        return None
    parts = sorted({p.strip().lower() for p in phrases if p.strip()}, key=len, reverse=True)
    if not parts:
        return None
    alternation = "|".join(re.escape(p) for p in parts)
    return re.compile(rf"\b(?:{alternation})\b", re.IGNORECASE | re.UNICODE)


@lru_cache(maxsize=4)
def _load(lang: Lang) -> dict[str, re.Pattern[str]]:
    path = LEXICON_DIR / f"{lang}.yml"
    if not path.is_file():
        raise FileNotFoundError(f"Lexicon file not found: {path}")
    raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    if not isinstance(raw, dict):
        raise ValueError(f"Lexicon {path} must be a YAML mapping at the root.")
    compiled: dict[str, re.Pattern[str]] = {}
    for category, phrases in raw.items():
        if not isinstance(phrases, list):
            raise ValueError(f"Lexicon {path} category '{category}' must be a list.")
        pattern = _compile_category([str(p) for p in phrases])
        if pattern is not None:
            compiled[str(category)] = pattern
    return compiled


def match_categories(text: str, *, lang: Lang) -> dict[str, list[str]]:
    """Return a dict ``{category: [matched_phrases]}`` for non-empty hits.

    Both ``vi`` and ``en`` lexicons are scanned regardless of the requested
    ``lang`` (Vietnamese chats freely mix English brand names like
    ``zalo``, ``telegram``, ``USDT``). The hint only affects fallback ordering.
    """
    hits: dict[str, list[str]] = {}
    for scan_lang in _scan_order(lang):
        for category, pattern in _load(scan_lang).items():
            matches = [m.group(0) for m in pattern.finditer(text)]
            if matches:
                hits.setdefault(category, []).extend(matches)
    return hits


def _scan_order(primary: Lang) -> tuple[Lang, ...]:
    return ("vi", "en") if primary == "vi" else ("en", "vi")


def warm_up() -> None:
    """Pre-compile the lexicons so the first request doesn't pay the latency."""
    _load("vi")
    _load("en")
