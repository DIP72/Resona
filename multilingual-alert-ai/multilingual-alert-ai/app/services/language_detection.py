"""
Stage 1 - LANGUAGE DETECTION service.

Wraps the LanguageDetector model with the business rules from the spec:
- if the caller supplies an explicit source_language, use it (skip detection)
- otherwise auto-detect
- if confidence is below the configured threshold, attach a warning instead
  of silently trusting an unreliable guess
"""

from __future__ import annotations

from app.config import get_settings
from app.models.language_model import get_language_detector
from app.schemas.alert_schema import LanguageDetectionResult


def detect_source_language(text: str, source_language: str = "auto") -> LanguageDetectionResult:
    settings = get_settings()

    if source_language and source_language.lower() != "auto":
        code = source_language.lower()
        name = settings.SUPPORTED_LANGUAGES.get(code)
        if name is None:
            return LanguageDetectionResult(
                language=code,
                language_name="Unknown",
                confidence=0.0,
                warning=(
                    f"'{code}' is not a supported language code. "
                    f"Supported codes: {list(settings.SUPPORTED_LANGUAGES.keys())}"
                ),
            )
        return LanguageDetectionResult(language=code, language_name=name, confidence=1.0)

    detector = get_language_detector()
    code, confidence = detector.detect(text)
    name = settings.SUPPORTED_LANGUAGES.get(code, "Unknown")

    warning = None
    if confidence < settings.LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD:
        warning = (
            f"Low confidence ({confidence:.2f}) detecting source language. "
            "Consider specifying source_language explicitly instead of 'auto'."
        )
    if name == "Unknown":
        warning = (
            f"Detected language '{code}' is not in the supported language set. "
            "Falling back is required before translation can proceed."
        )

    return LanguageDetectionResult(
        language=code, language_name=name, confidence=round(confidence, 4), warning=warning
    )
