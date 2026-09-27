"""
Test cases 1-7 and 10-13 from spec section 22:
  1. English -> Hindi
  2. English -> Odia
  3. English -> Bengali
  4. English -> Telugu
  5. Hindi -> English
  6. Odia -> English
  7. Bengali -> Hindi
  10. Number preservation
  11. Location preservation
  12. Severity preservation
  13. Recommended-action preservation
"""

import pytest

CYCLONE_MESSAGE = (
    "Severe cyclone warning for Odisha. Heavy rainfall and winds up to 120 km/h are "
    "expected. Residents in low-lying areas should evacuate immediately."
)


def _process(client, alert_id, message, source_language, target_languages, **overrides):
    payload = {
        "alert_id": alert_id,
        "title": overrides.pop("title", "Severe Cyclone Warning"),
        "message": message,
        "source_language": source_language,
        "target_languages": target_languages,
    }
    payload.update(overrides)
    resp = client.post("/process-alert", json=payload)
    assert resp.status_code == 200, resp.text
    return resp.json()


@pytest.mark.parametrize("target", ["hi", "or", "bn", "te"])
def test_english_to_target_language(client, target):
    data = _process(client, f"ALT_EN_{target}", CYCLONE_MESSAGE, "en", [target])
    assert target in data["translations"]
    package = data["translations"][target]
    assert package["title"]
    assert package["message"]
    assert package["recommended_action"]
    assert package["low_bandwidth_message"]
    assert package["tts_text"]
    assert data["validation"]["status"] == "passed"


def test_hindi_source_to_english_target(client):
    hindi_message = "ओडिशा के लिए गंभीर चक्रवात चेतावनी। भारी वर्षा और 120 किमी/घंटा तक हवाएं अपेक्षित हैं।"
    data = _process(client, "ALT_HI_EN", hindi_message, "hi", ["en"])
    assert "en" in data["translations"]
    assert data["source_language"]["language"] == "hi"


def test_odia_source_to_english_target(client):
    odia_message = "ଓଡ଼ିଶାରେ ପ୍ରବଳ ବର୍ଷା ଏବଂ ପବନ ଆଶା କରାଯାଉଛି।"
    data = _process(client, "ALT_OR_EN", odia_message, "or", ["en"])
    assert "en" in data["translations"]
    assert data["source_language"]["language"] == "or"


def test_bengali_source_to_hindi_target(client):
    bengali_message = "ওড়িশার জন্য তীব্র ঘূর্ণিঝড় সতর্কতা। ভারী বৃষ্টিপাত প্রত্যাশিত।"
    data = _process(client, "ALT_BN_HI", bengali_message, "bn", ["hi"])
    assert "hi" in data["translations"]
    assert data["source_language"]["language"] == "bn"


def test_number_preservation_across_all_languages(client):
    data = _process(
        client,
        "ALT_NUM_PRESERVE",
        CYCLONE_MESSAGE,
        "en",
        ["hi", "or", "bn", "te", "ta"],
    )
    for lang, package in data["translations"].items():
        combined = " ".join(
            [package["title"], package["message"], package["recommended_action"], package["low_bandwidth_message"]]
        )
        assert "120" in combined, f"120 missing in {lang} output"
        assert "1200" not in combined, f"corrupted number in {lang} output"
        assert "km/h" in combined.lower() or "kmph" in combined.lower(), f"unit missing in {lang} output"
    assert data["validation"]["status"] == "passed"


def test_location_preservation(client):
    data = _process(client, "ALT_LOC_PRESERVE", CYCLONE_MESSAGE, "en", ["hi", "or", "bn"])
    assert data["structured_alert"]["location"] == "Odisha"
    for lang, package in data["translations"].items():
        combined = " ".join([package["title"], package["message"], package["low_bandwidth_message"]])
        assert "odisha" in combined.lower(), f"location missing in {lang} output"


def test_severity_preservation(client):
    data = _process(
        client, "ALT_SEV_PRESERVE", CYCLONE_MESSAGE, "en", ["hi"], severity="Critical", alert_type="Cyclone"
    )
    assert data["structured_alert"]["severity"] == "Critical"
    # Hindi word for "Critical" severity must appear in the Hindi title
    assert "अति गंभीर" in data["translations"]["hi"]["title"]


def test_recommended_action_preservation(client):
    data = _process(
        client,
        "ALT_ACTION_PRESERVE",
        CYCLONE_MESSAGE,
        "en",
        ["hi", "or"],
        recommended_action="Evacuate low-lying areas immediately",
    )
    assert data["structured_alert"]["recommended_action"] == "Evacuate low-lying areas immediately"
    for lang, package in data["translations"].items():
        assert package["recommended_action"], f"missing recommended_action for {lang}"
