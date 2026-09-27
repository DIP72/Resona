from app.schemas.alert_schema import StructuredAlert, TranslationPackage
from app.services.validation import validate_translation


def _base_alert(**overrides):
    defaults = dict(
        alert_id="ALT001",
        alert_type="Cyclone",
        severity="Critical",
        title="Severe Cyclone Warning",
        message="Severe cyclone warning for Odisha. Winds up to 120 km/h expected.",
        location="Odisha",
        hazards=["Wind speeds up to 120 km/h"],
        recommended_action="Evacuate low-lying areas immediately",
        source_language="en",
        numbers=["120 km/h"],
    )
    defaults.update(overrides)
    return StructuredAlert(**defaults)


def test_validation_passes_when_number_preserved():
    alert = _base_alert()
    package = TranslationPackage(
        title="चक्रवात चेतावनी",
        message="ओडिशा के लिए चेतावनी। हवाएं 120 km/h तक चलेंगी।",
        recommended_action="निचले इलाकों को तुरंत खाली करें।",
        low_bandwidth_message="ODISHA CYCLONE WARNING 120 km/h EVACUATE",
        tts_text="चक्रवात चेतावनी। निचले इलाकों को तुरंत खाली करें।",
    )
    result = validate_translation(alert, package, "hi")
    assert result.status == "passed"
    assert result.issues == []


def test_validation_warns_when_number_altered():
    alert = _base_alert()
    package = TranslationPackage(
        title="चक्रवात चेतावनी",
        message="ओडिशा के लिए चेतावनी। हवाएं 1200 km/h तक चलेंगी।",  # corrupted number
        recommended_action="निचले इलाकों को तुरंत खाली करें।",
        low_bandwidth_message="ODISHA CYCLONE WARNING 1200 km/h EVACUATE",
        tts_text="चक्रवात चेतावनी।",
    )
    result = validate_translation(alert, package, "hi")
    assert result.status == "warning"
    assert any("120" in issue for issue in result.issues)


def test_validation_warns_when_location_missing():
    alert = _base_alert()
    package = TranslationPackage(
        title="चक्रवात चेतावनी",
        message="भारी वर्षा और 120 km/h तक हवाएं अपेक्षित हैं।",  # location dropped
        recommended_action="निचले इलाकों को तुरंत खाली करें।",
        low_bandwidth_message="CYCLONE WARNING 120 km/h EVACUATE",
        tts_text="चक्रवात चेतावनी।",
    )
    result = validate_translation(alert, package, "hi")
    assert result.status == "warning"
    assert any("Odisha" in issue for issue in result.issues)


def test_validation_warns_when_action_missing():
    alert = _base_alert()
    package = TranslationPackage(
        title="चक्रवात चेतावनी",
        message="ओडिशा के लिए चेतावनी। हवाएं 120 km/h तक चलेंगी।",
        recommended_action="",
        low_bandwidth_message="ODISHA CYCLONE WARNING 120 km/h",
        tts_text="चक्रवात चेतावनी।",
    )
    result = validate_translation(alert, package, "hi")
    assert result.status == "warning"
    assert any("action" in issue.lower() for issue in result.issues)
