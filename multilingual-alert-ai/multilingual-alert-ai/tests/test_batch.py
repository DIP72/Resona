"""
Test cases 14, 15 and 16 from spec section 22:
  14. Multiple target languages
  15. Translation caching
  16. 10,000 recipients with only 5 target languages -> prove only 5
      translated outputs are generated, not 10,000.
"""

from unittest.mock import patch

from app.services.alert_parser import build_structured_alert
from app.services.batch_processor import process_batch
from app.services.caching import get_translation_cache

CYCLONE_MESSAGE = (
    "Severe cyclone warning for Odisha. Heavy rainfall and winds up to 120 km/h are "
    "expected. Residents in low-lying areas should evacuate immediately."
)


def _structured_alert(alert_id="ALT001"):
    return build_structured_alert(
        alert_id=alert_id,
        message=CYCLONE_MESSAGE,
        source_language="en",
        title="Severe Cyclone Warning",
        alert_type="Cyclone",
        severity="Critical",
        location="Odisha",
        recommended_action="Evacuate low-lying areas immediately",
    )


def test_multiple_target_languages_all_present():
    alert = _structured_alert("ALT_MULTI")
    targets = ["en", "hi", "or", "bn", "te"]
    translations, report, hits, misses = process_batch(alert, targets, alert_version="v1")
    assert set(translations.keys()) == set(targets)
    assert set(misses) == set(targets)  # first run: nothing cached yet
    assert hits == []
    assert report.status in ("passed", "warning")


def test_repeated_call_hits_cache_and_does_not_retranslate():
    alert = _structured_alert("ALT_CACHE")
    targets = ["hi", "or"]

    # First call: cold cache -> both are misses.
    translations_1, _report_1, hits_1, misses_1 = process_batch(alert, targets, alert_version="v1")
    assert hits_1 == []
    assert set(misses_1) == set(targets)

    # Second call with the SAME alert_id + version + source + targets:
    # everything must come from cache, and translate_alert must not be
    # invoked again.
    with patch("app.services.batch_processor.translate_alert") as mocked_translate:
        translations_2, _report_2, hits_2, misses_2 = process_batch(alert, targets, alert_version="v1")
        mocked_translate.assert_not_called()

    assert set(hits_2) == set(targets)
    assert misses_2 == []
    # Content must be identical between the two calls (same cached object).
    assert translations_1["hi"].message == translations_2["hi"].message
    assert translations_1["or"].message == translations_2["or"].message


def test_10000_recipients_5_languages_only_5_translations_generated():
    """
    Simulates the exact scenario from the spec:

        10,000 recipients across 5 preferred languages
        -> the AI must only produce 5 translation packages, never 10,000.

    We patch translate_alert to count how many times the actual translation
    routine runs, then simulate the MERN backend fanning the 5 packages out
    to 10,000 recipients using simple in-memory reuse (no re-translation).
    """
    get_translation_cache().clear()
    alert = _structured_alert("ALT_10K")

    recipients_by_language = {
        "en": 3000,
        "hi": 2500,
        "or": 2000,
        "bn": 1500,
        "te": 1000,
    }
    assert sum(recipients_by_language.values()) == 10000

    from app.services import batch_processor as bp

    real_translate_alert = bp.translate_alert
    call_count = {"n": 0}

    def counting_translate_alert(alert_, lang_):
        call_count["n"] += 1
        return real_translate_alert(alert_, lang_)

    with patch("app.services.batch_processor.translate_alert", side_effect=counting_translate_alert):
        translations, report, hits, misses = process_batch(
            alert, list(recipients_by_language.keys()), alert_version="v1"
        )

    # Exactly 5 AI translation calls were made - NOT 10,000.
    assert call_count["n"] == 5
    assert len(translations) == 5

    # Now simulate the MERN backend distributing each of the 5 translation
    # packages to its recipients, WITHOUT calling the AI again.
    delivery_log = []
    for lang, recipient_count in recipients_by_language.items():
        package = translations[lang]  # same object reused for every recipient
        for _ in range(recipient_count):
            delivery_log.append((lang, package.message))

    assert len(delivery_log) == 10000
    # Every delivery for a given language used the exact same message text -
    # proof of reuse, not per-recipient regeneration.
    for lang in recipients_by_language:
        messages_for_lang = {msg for (l, msg) in delivery_log if l == lang}
        assert len(messages_for_lang) == 1
