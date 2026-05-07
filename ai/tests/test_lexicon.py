"""Unit tests for the YAML keyword lexicon."""

from __future__ import annotations

from app.detectors import lexicon


def test_loads_vietnamese_lexicon() -> None:
    hits = lexicon.match_categories("Em qua zalo nói chuyện nhé", lang="vi")

    assert "off_platform" in hits
    assert any("zalo" in h.lower() for h in hits["off_platform"])


def test_loads_english_lexicon() -> None:
    hits = lexicon.match_categories("send me money via western union please", lang="en")

    assert "money" in hits


def test_lexicon_is_case_insensitive() -> None:
    upper = lexicon.match_categories("ADD ME ON TELEGRAM", lang="en")
    lower = lexicon.match_categories("add me on telegram", lang="en")

    assert upper.keys() == lower.keys()


def test_word_boundary_avoids_substring_match() -> None:
    hits = lexicon.match_categories("I love water and watching movies", lang="en")

    assert "off_platform" not in hits


def test_diacritics_match_correctly() -> None:
    hits = lexicon.match_categories("Anh đã góa vợ", lang="vi")

    assert "widow" in hits


def test_warm_up_does_not_raise() -> None:
    lexicon.warm_up()


def test_unknown_phrase_does_not_match() -> None:
    hits = lexicon.match_categories("Hôm nay trời đẹp quá", lang="vi")

    assert hits == {}


def test_cross_language_scan_catches_english_brand_in_vietnamese() -> None:
    hits = lexicon.match_categories("Anh ơi add me on telegram nhé", lang="vi")

    assert "off_platform" in hits
