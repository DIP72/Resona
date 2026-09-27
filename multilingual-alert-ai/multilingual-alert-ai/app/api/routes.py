"""
Main API surface.

POST /process-alert   - spec section 17/18: full pipeline, single official
                         alert -> structured alert -> N language translations.
POST /batch-translate  - spec section 14: translate an already-structured
                         alert into a batch of target languages directly
                         (used when the caller already ran Stage 1-3 itself,
                         e.g. a different service produced the StructuredAlert).
GET  /languages        - list supported language codes/names.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.models.translation_model import get_translation_model
from app.schemas.alert_schema import (
    BatchTranslationRequest,
    BatchTranslationResponse,
    ProcessAlertRequest,
    ProcessAlertResponse,
)
from app.services.alert_parser import build_structured_alert
from app.services.batch_processor import process_batch
from app.services.language_detection import detect_source_language

router = APIRouter()


@router.get("/languages")
def list_languages():
    settings = get_settings()
    return {"supported_languages": settings.SUPPORTED_LANGUAGES}


@router.post("/process-alert", response_model=ProcessAlertResponse)
def process_alert(request: ProcessAlertRequest) -> ProcessAlertResponse:
    settings = get_settings()

    # Reject unsupported target languages up front with a clear error,
    # rather than silently skipping them.
    unsupported = [l for l in request.target_languages if l not in settings.SUPPORTED_LANGUAGES]
    if unsupported:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported target language(s): {unsupported}. "
            f"Supported: {list(settings.SUPPORTED_LANGUAGES.keys())}",
        )

    # ---- Stage 1: language detection --------------------------------
    detection = detect_source_language(request.message, request.source_language)
    if detection.language_name == "Unknown":
        raise HTTPException(
            status_code=422,
            detail=detection.warning or f"Could not resolve a supported source language for '{detection.language}'.",
        )

    # ---- Stage 2 + 3: understanding + structuring --------------------
    structured = build_structured_alert(
        alert_id=request.alert_id,
        message=request.message,
        source_language=detection.language,
        title=request.title,
        alert_type=request.alert_type,
        severity=request.severity,
        location=request.location,
        recommended_action=request.recommended_action,
    )

    # ---- Stage 4-6: translate + validate every target language -------
    translations, validation_report, _hits, _misses = process_batch(
        alert=structured, target_languages=request.target_languages, alert_version=request.alert_version
    )

    model = get_translation_model()

    return ProcessAlertResponse(
        alert_id=request.alert_id,
        source_language=detection,
        structured_alert=structured,
        translations=translations,
        validation=validation_report,
        mode=model.mode_name,
    )


@router.post("/batch-translate", response_model=BatchTranslationResponse)
def batch_translate(request: BatchTranslationRequest) -> BatchTranslationResponse:
    settings = get_settings()
    unsupported = [l for l in request.target_languages if l not in settings.SUPPORTED_LANGUAGES]
    if unsupported:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported target language(s): {unsupported}. "
            f"Supported: {list(settings.SUPPORTED_LANGUAGES.keys())}",
        )

    alert = request.alert
    alert.alert_id = request.alert_id
    alert.source_language = request.source_language

    translations, validation_report, hits, misses = process_batch(
        alert=alert, target_languages=request.target_languages, alert_version=request.alert_version
    )

    return BatchTranslationResponse(
        alert_id=request.alert_id,
        translations=translations,
        validation=validation_report,
        cache_hits=hits,
        cache_misses=misses,
    )
