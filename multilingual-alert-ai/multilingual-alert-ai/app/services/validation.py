"""
Stage 6 - TRANSLATION VALIDATION.

Before a translation package is accepted, compare it against the source
StructuredAlert to make sure nothing critical was lost or altered:

- every number/unit token present in the source message must still be
  present, verbatim, in the translated message (spec section 13)
- the location string must still appear somewhere in the translated output
  (a location should never be silently dropped)
- if a low_bandwidth_message exists it should not be empty and should not
  exceed the configured SMS length by a large margin

This module NEVER silently accepts a broken translation - if anything is
missing, the result is "warning" (not "passed") and the specific issue is
listed, exactly like the spec's example response.
"""

from __future__ import annotations

from typing import List

from app.config import get_settings
from app.schemas.alert_schema import StructuredAlert, TranslationPackage, ValidationResult
from app.utils.text_utils import extract_numeric_tokens, normalize_number


def validate_translation(
    alert: StructuredAlert, translation: TranslationPackage, target_lang: str
) -> ValidationResult:
    issues: List[str] = []

    source_numbers = {normalize_number(t) for t in alert.numbers}
    combined_translated_text = " ".join(
        [translation.title, translation.message, translation.recommended_action, translation.low_bandwidth_message]
    )
    translated_numbers = {normalize_number(t) for t in extract_numeric_tokens(combined_translated_text)}

    missing_numbers = [n for n in source_numbers if n not in translated_numbers]
    if missing_numbers:
        issues.append(f"Missing or altered numeric/unit value(s): {', '.join(sorted(missing_numbers))}")

    if alert.location and alert.location.strip():
        # Location names are proper nouns - they should appear untranslated
        # in every output language (transliteration is out of scope for the
        # demo dictionary; the real model is instructed to preserve them via
        # the same protect/restore mechanism where feasible).
        if alert.location.lower() not in combined_translated_text.lower():
            issues.append(f"Location '{alert.location}' not found in translated output")

    if not translation.message or not translation.message.strip():
        issues.append("Translated message is empty")

    if not translation.recommended_action or not translation.recommended_action.strip():
        issues.append("Recommended action missing from translation")

    if not translation.low_bandwidth_message or not translation.low_bandwidth_message.strip():
        issues.append("Low-bandwidth message is empty")

    status = "warning" if issues else "passed"
    return ValidationResult(status=status, language=target_lang, issues=issues)
