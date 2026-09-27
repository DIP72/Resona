"""Test cases 8 and 9 from spec section 22, plus extra unit coverage."""

from app.services.language_detection import detect_source_language


def test_auto_detect_english():
    result = detect_source_language(
        "Severe cyclone warning for Odisha. Heavy rainfall and winds up to 120 km/h are expected.",
        source_language="auto",
    )
    assert result.language == "en"
    assert result.language_name == "English"


def test_auto_detect_hindi_script():
    result = detect_source_language("ओडिशा में भारी बारिश की चेतावनी दी गई है।", source_language="auto")
    assert result.language == "hi"
    assert result.language_name == "Hindi"


def test_explicit_source_language_overrides_detection():
    # Text looks like English but caller explicitly asserts it's Odia -
    # explicit input must win (spec section 5).
    result = detect_source_language("Some ambiguous text", source_language="or")
    assert result.language == "or"
    assert result.language_name == "Odia"


def test_invalid_language_code_is_reported(client):
    resp = client.post(
        "/process-alert",
        json={
            "alert_id": "ALT_INVALID",
            "title": "Test",
            "message": "Severe cyclone warning for Odisha.",
            "source_language": "xx",
            "target_languages": ["en"],
        },
    )
    assert resp.status_code == 422
    assert "not a supported language code" in resp.json()["detail"] or "not supported" in resp.json()["detail"].lower()


def test_unsupported_target_language_rejected(client):
    resp = client.post(
        "/process-alert",
        json={
            "alert_id": "ALT_BAD_TARGET",
            "title": "Test",
            "message": "Severe cyclone warning for Odisha.",
            "source_language": "en",
            "target_languages": ["fr"],
        },
    )
    assert resp.status_code == 422
