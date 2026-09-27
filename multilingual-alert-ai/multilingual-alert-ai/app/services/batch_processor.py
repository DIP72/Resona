"""
Batch translation orchestration (spec sections 14 & 16).

This is the module that enforces the central architectural rule of the whole
project:

    NUMBER OF AI TRANSLATIONS = NUMBER OF TARGET LANGUAGES
    NOT NUMBER OF AI TRANSLATIONS = NUMBER OF RECIPIENTS

Given a StructuredAlert and a list of target language codes, it produces
exactly `len(target_languages)` TranslationPackages (fewer, if some are
already cached), no matter how many recipients the MERN backend will later
fan those packages out to.
"""

from __future__ import annotations

from typing import Dict, List, Tuple

from app.schemas.alert_schema import StructuredAlert, TranslationPackage, ValidationReport, ValidationResult
from app.services.caching import get_translation_cache, make_cache_key
from app.services.translation import translate_alert
from app.services.validation import validate_translation


def process_batch(
    alert: StructuredAlert, target_languages: List[str], alert_version: str = "v1"
) -> Tuple[Dict[str, TranslationPackage], ValidationReport, List[str], List[str]]:
    """
    Returns (translations, validation_report, cache_hits, cache_misses).

    translations: {lang_code: TranslationPackage} - exactly one entry per
    target language, ready for the MERN backend to fan out to every
    recipient who prefers that language.
    """
    cache = get_translation_cache()

    translations: Dict[str, TranslationPackage] = {}
    validations: Dict[str, ValidationResult] = {}
    cache_hits: List[str] = []
    cache_misses: List[str] = []

    # De-duplicate target languages defensively - translating "hi" twice
    # because the caller listed it twice would still violate the
    # one-translation-per-language rule.
    seen = []
    for lang in target_languages:
        if lang not in seen:
            seen.append(lang)

    for lang in seen:
        key = make_cache_key(alert.alert_id, alert_version, alert.source_language, lang)
        cached = cache.get(key)
        if cached is not None:
            translations[lang] = cached
            cache_hits.append(lang)
        else:
            package = translate_alert(alert, lang)
            cache.set(key, package)
            translations[lang] = package
            cache_misses.append(lang)

        validations[lang] = validate_translation(alert, translations[lang], lang)

    overall_status = "passed" if all(v.status == "passed" for v in validations.values()) else "warning"
    report = ValidationReport(status=overall_status, per_language=validations)

    return translations, report, cache_hits, cache_misses
