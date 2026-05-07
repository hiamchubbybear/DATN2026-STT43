"""End-to-end tests for the Tier-0 scorer, driven by ``fixtures/messages.yml``."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest
import yaml

from app.detectors import labels, tier0

FIXTURES_PATH = Path(__file__).parent / "fixtures" / "messages.yml"


def _load_fixtures() -> list[dict[str, Any]]:
    raw = yaml.safe_load(FIXTURES_PATH.read_text(encoding="utf-8"))
    assert isinstance(raw, list), "messages.yml must be a top-level list"
    return raw


def _ids(fixtures: list[dict[str, Any]]) -> list[str]:
    return [str(f["id"]) for f in fixtures]


_FIXTURES = _load_fixtures()


@pytest.mark.parametrize("fixture", _FIXTURES, ids=_ids(_FIXTURES))
def test_tier0_fixture(fixture: dict[str, Any]) -> None:
    text = str(fixture["text"])
    lang = fixture.get("lang")

    result = tier0.score_t0(text, lang=lang)
    actual = set(result.labels)

    expected = {str(label) for label in fixture.get("expect_labels", [])}
    forbidden = {str(label) for label in fixture.get("forbid_labels", [])}

    missing = expected - actual
    assert not missing, f"missing labels for {fixture['id']}: {missing} (got {sorted(actual)})"

    accidental = forbidden & actual
    assert not accidental, f"accidental labels for {fixture['id']}: {accidental}"

    if "min_score" in fixture:
        assert result.score >= float(fixture["min_score"]), (
            f"score {result.score} < min {fixture['min_score']} for {fixture['id']}"
        )
    if "max_score" in fixture:
        assert result.score <= float(fixture["max_score"]), (
            f"score {result.score} > max {fixture['max_score']} for {fixture['id']}"
        )


def test_score_is_zero_for_empty_input() -> None:
    result = tier0.score_t0("")

    assert result.score == 0.0
    assert result.labels == ()
    assert result.explanations == ()


def test_score_is_clamped_to_unit_interval() -> None:
    result = tier0.score_t0(
        "Add me on telegram t.me/x phone 0987654321 send USDT to "
        "0xAbCdEf0123456789012345678901234567890123 sàn BO lệnh thắng góa vợ"
    )

    assert 0.0 <= result.score <= 1.0


def test_known_label_set_only() -> None:
    result = tier0.score_t0("Em ơi qua zalo nhé 0987654321")

    for label in result.labels:
        assert label in labels.ALL_LABELS, f"unknown label produced: {label}"
