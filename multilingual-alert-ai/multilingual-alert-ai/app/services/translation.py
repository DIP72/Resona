"""
Stage 4 - MULTILINGUAL TRANSLATION
Stage 5 (spec sections 11/12) - LOW-BANDWIDTH + TTS output generation.

Given a language-independent StructuredAlert, produce a TranslationPackage
(title, message, recommended_action, low_bandwidth_message, tts_text) for one
target language.

Two code paths, both producing the exact same output shape:

1. DEMO mode (default, no model download needed): compose the message from
   curated phrase templates in translation_dictionaries.py. Numbers/units are
   spliced in verbatim from the StructuredAlert - never re-typed - so they
   are guaranteed byte-identical across every language.

2. REAL MODEL mode: run the loaded neural MT model on title/message/action,
   with critical tokens (numbers/units/dates) protected by placeholders
   before translation and restored after, so the model can rephrase freely
   around them but can never alter the numbers themselves.
"""

from __future__ import annotations

import re
from typing import Optional

from app.config import get_settings
from app.models.translation_model import get_translation_model
from app.schemas.alert_schema import StructuredAlert, TranslationPackage
from app.services import translation_dictionaries as td
from app.utils.text_utils import (
    protect_critical_tokens,
    restore_critical_tokens,
    strip_for_tts,
    truncate_for_sms,
)

_WIND_HAZARD_PATTERN = re.compile(r"wind[s]?[^0-9]*([\d.]+\s?(?:km/h|kmph|mph))", re.IGNORECASE)


def _translate_hazard(hazard: str, target_lang: str) -> str:
    """Translate one hazard string for DEMO mode."""
    wind_match = _WIND_HAZARD_PATTERN.search(hazard)
    if wind_match:
        speed = wind_match.group(1)
        prefix = td.WIND_PREFIX.get(target_lang, td.WIND_PREFIX["en"])
        suffix = td.WIND_SUFFIX.get(target_lang, td.WIND_SUFFIX["en"])
        return f"{prefix} {speed} {suffix}"

    phrase = td.HAZARD_PHRASES.get(hazard)
    if phrase:
        return phrase.get(target_lang, phrase["en"])

    # Unknown hazard text (free-form) - keep as-is; numbers inside are
    # already the source's own numbers so nothing is invented.
    return hazard


def _translate_action(action: Optional[str], location: Optional[str], target_lang: str) -> str:
    if not action:
        return td.ACTION_PHRASES["follow_authority"].get(target_lang, td.ACTION_PHRASES["follow_authority"]["en"])

    lower = action.lower()
    area = location or ("the affected area" if target_lang == "en" else "")

    if "evacuate" in lower:
        # try to pull the actual area phrase out of the action sentence
        area_match = re.search(r"evacuate\s+([a-zA-Z\- ]+?)(?:\s+immediately|\s+now|\.|$)", lower)
        area_text = area_match.group(1).strip() if area_match else area
        area_phrase = td.AREA_PHRASES.get(area_text)
        translated_area = (
            area_phrase.get(target_lang, area_phrase["en"]) if area_phrase else (area_text or area)
        )
        template = td.ACTION_PHRASES["evacuate"].get(target_lang, td.ACTION_PHRASES["evacuate"]["en"])
        return template.format(area=translated_area)
    if "higher ground" in lower:
        return td.ACTION_PHRASES["higher_ground"].get(target_lang, td.ACTION_PHRASES["higher_ground"]["en"])
    if "stay indoors" in lower or "avoid" in lower:
        return td.ACTION_PHRASES["stay_indoors"].get(target_lang, td.ACTION_PHRASES["stay_indoors"]["en"])

    # Unrecognized free-form action: prefix clearly + protect numbers so we
    # never silently claim a validated translation for arbitrary text.
    protected, tokens = protect_critical_tokens(action)
    restored = restore_critical_tokens(protected, tokens)
    prefix = td.GENERIC_ACTION_FALLBACK_PREFIX.get(target_lang, td.GENERIC_ACTION_FALLBACK_PREFIX["en"])
    return f"{prefix} {restored}"


def _compose_demo(alert: StructuredAlert, target_lang: str) -> TranslationPackage:
    settings = get_settings()

    severity_word = td.SEVERITY.get(target_lang, td.SEVERITY["en"]).get(
        alert.severity, alert.severity
    )
    alert_type_word = td.ALERT_TYPE.get(target_lang, td.ALERT_TYPE["en"]).get(
        alert.alert_type, alert.alert_type
    )

    title = td.TITLE_TEMPLATE.get(target_lang, td.TITLE_TEMPLATE["en"]).format(
        severity=severity_word, alert_type=alert_type_word
    )

    sentences = []
    if alert.location:
        sentences.append(
            td.FOR_LOCATION.get(target_lang, td.FOR_LOCATION["en"]).format(
                alert_type=alert_type_word, location=alert.location
            )
        )
    for hazard in alert.hazards:
        translated_hazard = _translate_hazard(hazard, target_lang)
        # simple sentence-cased hazard clause
        sentences.append(translated_hazard.rstrip(".") + ".")

    translated_action = _translate_action(alert.recommended_action, alert.affected_area or alert.location, target_lang)
    if translated_action:
        sentences.append(translated_action)

    message = " ".join(s.strip() for s in sentences if s.strip())

    sms_prefix = td.SMS_PREFIX.get(target_lang, td.SMS_PREFIX["en"]).format(alert_type=alert_type_word.upper())
    low_bw_parts = [sms_prefix + ":"]
    if alert.location:
        low_bw_parts.append(alert.location.upper() + ".")
    for hazard in alert.hazards:
        low_bw_parts.append(_translate_hazard(hazard, target_lang).upper() + ".")
    low_bw_parts.append(translated_action.upper())
    low_bandwidth_message = truncate_for_sms(" ".join(low_bw_parts), settings.LOW_BANDWIDTH_MAX_CHARS)

    tts_text = strip_for_tts(f"{title}. {translated_action}")

    return TranslationPackage(
        title=title,
        message=message,
        recommended_action=translated_action,
        low_bandwidth_message=low_bandwidth_message,
        tts_text=tts_text,
    )


def _compose_real_model(alert: StructuredAlert, target_lang: str) -> TranslationPackage:
    settings = get_settings()
    model = get_translation_model()
    source_lang = alert.source_language

    def _translate_protected(text: str) -> str:
        if not text:
            return ""
        protected, tokens = protect_critical_tokens(text)
        translated = model.translate_text(protected, source_lang, target_lang)
        return restore_critical_tokens(translated, tokens)

    title = _translate_protected(alert.title) or alert.title
    message = _translate_protected(alert.message) or alert.message
    action = _translate_protected(alert.recommended_action or "") or (alert.recommended_action or "")

    low_bandwidth_message = truncate_for_sms(f"{title.upper()}: {message}", settings.LOW_BANDWIDTH_MAX_CHARS)
    tts_text = strip_for_tts(f"{title}. {action}")

    return TranslationPackage(
        title=title,
        message=message,
        recommended_action=action,
        low_bandwidth_message=low_bandwidth_message,
        tts_text=tts_text,
    )


def translate_alert(alert: StructuredAlert, target_lang: str) -> TranslationPackage:
    """
    Stage 4 entry point. Produces ONE TranslationPackage for ONE target
    language, regardless of how many recipients ultimately use it -
    see services/batch_processor.py for the fan-out over languages and
    services/caching.py for reuse across repeated calls.
    """
    model = get_translation_model()

    if target_lang == alert.source_language:
        # Identity case (e.g. an English alert also has an "en" target for
        # English-preferring recipients) - still run through the same
        # composition path for a consistent output shape, but no actual
        # translation work is needed.
        if model.mode_name == "demo":
            return _compose_demo(alert, target_lang)
        return TranslationPackage(
            title=alert.title,
            message=alert.message,
            recommended_action=alert.recommended_action or "",
            low_bandwidth_message=truncate_for_sms(
                f"{alert.title.upper()}: {alert.message}", get_settings().LOW_BANDWIDTH_MAX_CHARS
            ),
            tts_text=strip_for_tts(f"{alert.title}. {alert.recommended_action or ''}"),
        )

    if model.mode_name == "demo":
        return _compose_demo(alert, target_lang)
    return _compose_real_model(alert, target_lang)
