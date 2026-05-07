"""Unit tests for the Tier-0 regex primitives."""

from __future__ import annotations

import pytest

from app.detectors import regex


class TestVietnamesePhone:
    @pytest.mark.parametrize(
        "text",
        [
            "0987654321",
            "0987 654 321",
            "0987.654.321",
            "0987-654-321",
            "+84 987 654 321",
            "+84987654321",
            "Liên hệ 0912345678 nhé",
        ],
    )
    def test_matches_valid_phone(self, text: str) -> None:
        assert regex.find_phones(text), f"expected to match: {text!r}"

    @pytest.mark.parametrize(
        "text",
        [
            "abc",
            "the year is 2024 and time is 12:30",
            "01234567",  # too short
            "0212345678",  # landline prefix not in mobile set
        ],
    )
    def test_does_not_match_non_phone(self, text: str) -> None:
        assert not regex.find_phones(text), f"unexpected match: {text!r}"


class TestEmail:
    def test_matches_basic_email(self) -> None:
        assert regex.find_emails("ping me at foo@bar.com please") == ["foo@bar.com"]

    def test_matches_plus_addressing(self) -> None:
        assert regex.find_emails("a.user+tag@sub.example.co") == ["a.user+tag@sub.example.co"]

    def test_no_match_without_tld(self) -> None:
        assert not regex.find_emails("foo@bar")


class TestOffPlatformUrl:
    @pytest.mark.parametrize(
        "text",
        [
            "https://t.me/abc123",
            "wa.me/849876543210",
            "zalo.me/0987654321",
            "https://bit.ly/abc",
            "tinyurl.com/xyz",
        ],
    )
    def test_matches_known_off_platform(self, text: str) -> None:
        assert regex.find_off_platform_urls(text), f"expected to match: {text!r}"

    def test_does_not_match_normal_url(self) -> None:
        assert not regex.find_off_platform_urls("https://example.com/page")


class TestCryptoAddresses:
    def test_matches_eth_address(self) -> None:
        addr = "0xAbCdEf0123456789012345678901234567890123"
        assert regex.find_crypto_addresses(f"send to {addr}") == [addr]

    def test_matches_btc_address(self) -> None:
        addr = "1BoatSLRHtKNngkdXEeobR76b53LETtpyT"
        assert addr in regex.find_crypto_addresses(f"my btc {addr}")

    def test_does_not_match_random_hex(self) -> None:
        assert not regex.find_crypto_addresses("0xshort")
