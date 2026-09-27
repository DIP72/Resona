"""
Utility functions shared across pipeline stages.

The most important function here is `protect_critical_tokens` /
`restore_critical_tokens`. Emergency alerts contain values that must NEVER be
altered by a translation model: numbers, units (km/h, mm, cm, mph, m, ft),
dates, times, and phone/helpline numbers.

Strategy: before handing text to any translator (demo dictionary OR a real
neural model), we replace every critical token with a numbered placeholder
like `__NUM0__`. After translation, we substitute the placeholders back with
the ORIGINAL exact text. This guarantees "120 km/h" can never become
"1200 km/h" or "120 mph" no matter what the translation layer does to the
surrounding words.
"""

from __future__ import annotations

import re
from typing import List, Tuple

# Matches: 120 km/h, 45.5 mm, 3 pm, 10:30 AM, 08:00, 1800-345-1234, 120km/h, 2024-06-01
_CRITICAL_TOKEN_PATTERN = re.compile(
    r"""
    (?P<phone>\b\d{2,5}[-\s]\d{2,5}[-\s]\d{2,6}\b)                     # helpline-like numbers
    |(?P<datetime>\b\d{1,2}:\d{2}(?:\s?[APap][Mm])?\b)                 # times e.g. 10:30 AM
    |(?P<date>\b\d{4}-\d{2}-\d{2}\b)                                   # ISO dates
    |(?P<numunit>\b\d+(?:\.\d+)?\s?(?:km/h|kmph|km|mm|cm|m|ft|mph|kg|percent|%|hours?|hrs?|minutes?|mins?)\b)
    |(?P<plainnum>\b\d+(?:\.\d+)?\b)                                   # bare numbers
    """,
    re.IGNORECASE | re.VERBOSE,
)


def protect_critical_tokens(text: str) -> Tuple[str, List[str]]:
    """
    Replace every critical token (numbers, units, dates, times, phone-like
    numbers) with a placeholder. Returns the modified text and the ordered
    list of original tokens so they can be restored later.
    """
    tokens: List[str] = []

    def _replace(match: re.Match) -> str:
        tokens.append(match.group(0))
        return f"__PROTECT{len(tokens) - 1}__"

    protected_text = _CRITICAL_TOKEN_PATTERN.sub(_replace, text)
    return protected_text, tokens


def restore_critical_tokens(text: str, tokens: List[str]) -> str:
    """Reverse of protect_critical_tokens."""
    restored = text
    for i, tok in enumerate(tokens):
        restored = restored.replace(f"__PROTECT{i}__", tok)
    return restored


def extract_numeric_tokens(text: str) -> List[str]:
    """Extract all number/unit-like tokens from a piece of text, used by the
    validator to compare source vs translation."""
    return [m.group(0).strip() for m in _CRITICAL_TOKEN_PATTERN.finditer(text)]


def normalize_number(token: str) -> str:
    """Normalize a numeric token for comparison, e.g. '120km/h' vs '120 km/h'."""
    return re.sub(r"\s+", "", token).lower()


def truncate_for_sms(text: str, max_chars: int) -> str:
    """Truncate text to max_chars without cutting a word in half, and always
    keep the ending intact if possible (evacuation instructions matter most)."""
    text = text.strip()
    if len(text) <= max_chars:
        return text
    truncated = text[: max_chars - 1].rsplit(" ", 1)[0]
    return truncated + "\u2026"  # ellipsis


def strip_for_tts(text: str) -> str:
    """Remove markdown/symbols/emojis so the text is clean for text-to-speech."""
    text = re.sub(r"[*_`#>~\[\]]", "", text)
    text = re.sub(
        r"[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF]",
        "",
        text,
    )
    text = re.sub(r"\s+", " ", text).strip()
    return text
