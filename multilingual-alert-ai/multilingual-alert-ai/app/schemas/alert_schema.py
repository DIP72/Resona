"""
Pydantic models for the Multilingual Emergency Alert AI.

These define the request/response contract for the API and the internal
language-independent structured alert representation described in the
project spec (Stage 3 - Structured Alert).
"""

from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------
# Stage 1 - Language detection
# ---------------------------------------------------------------------
class LanguageDetectionResult(BaseModel):
    language: str
    language_name: str
    confidence: float
    warning: Optional[str] = None


# ---------------------------------------------------------------------
# Stage 3 - Structured Alert (language independent internal representation)
# ---------------------------------------------------------------------
class StructuredAlert(BaseModel):
    alert_id: str = ""
    alert_type: str = "Unknown"
    severity: str = "Unknown"
    title: str = ""
    message: str = ""
    location: Optional[str] = None
    affected_area: Optional[str] = None
    event_time: Optional[str] = None
    expiry_time: Optional[str] = None
    hazards: List[str] = Field(default_factory=list)
    recommended_action: Optional[str] = None
    source: Optional[str] = None
    source_language: str = "en"
    numbers: List[str] = Field(default_factory=list)  # raw numeric+unit tokens, e.g. "120 km/h"


# ---------------------------------------------------------------------
# Stage 4 - Per-language translation package
# ---------------------------------------------------------------------
class TranslationPackage(BaseModel):
    title: str
    message: str
    recommended_action: str
    low_bandwidth_message: str
    tts_text: str


# ---------------------------------------------------------------------
# Stage 6 - Validation
# ---------------------------------------------------------------------
class ValidationResult(BaseModel):
    status: str  # "passed" | "warning" | "failed"
    language: Optional[str] = None
    issues: List[str] = Field(default_factory=list)


class ValidationReport(BaseModel):
    status: str  # overall: "passed" | "warning"
    per_language: Dict[str, ValidationResult] = Field(default_factory=dict)


# ---------------------------------------------------------------------
# Main API request/response
# ---------------------------------------------------------------------
class ProcessAlertRequest(BaseModel):
    alert_id: str
    title: str
    message: str
    source_language: str = "auto"  # "auto" or an explicit code e.g. "en"
    target_languages: List[str]
    alert_type: Optional[str] = None
    severity: Optional[str] = None
    location: Optional[str] = None
    recommended_action: Optional[str] = None
    alert_version: str = "v1"

    @field_validator("target_languages")
    @classmethod
    def non_empty_targets(cls, v):
        if not v:
            raise ValueError("target_languages must contain at least one language code")
        return v


class ProcessAlertResponse(BaseModel):
    alert_id: str
    source_language: LanguageDetectionResult
    structured_alert: StructuredAlert
    translations: Dict[str, TranslationPackage]
    validation: ValidationReport
    mode: str  # "demo" | "real_model"


class BatchTranslationRequest(BaseModel):
    alert_id: str
    source_language: str
    target_languages: List[str]
    alert: StructuredAlert
    alert_version: str = "v1"


class BatchTranslationResponse(BaseModel):
    alert_id: str
    translations: Dict[str, TranslationPackage]
    validation: ValidationReport
    cache_hits: List[str] = Field(default_factory=list)
    cache_misses: List[str] = Field(default_factory=list)
