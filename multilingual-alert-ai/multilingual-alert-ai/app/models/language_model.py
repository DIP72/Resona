"""
Language detection backend.

Uses `langdetect` (pure-python, ISO-639-1 codes, no network/model download
required) as the detection engine. This is intentionally lightweight so the
service starts instantly in DEMO mode and in constrained hackathon
environments. It can be swapped for a fastText / HF language-id model by
replacing `LanguageDetector.detect()` without touching any calling code.

langdetect does not know the Indic script->code split we need in a couple of
edge cases (it correctly returns 'or', 'bn', 'hi', 'ta', 'te', 'en'), so we
map its output directly onto our supported language set and fall back to a
lightweight Unicode-block heuristic when langdetect is unsure or unavailable.
"""

from __future__ import annotations

from typing import Optional, Tuple

from app.config import get_settings

try:
    from langdetect import DetectorFactory, detect_langs

    DetectorFactory.seed = 0  # deterministic results
    _LANGDETECT_AVAILABLE = True
except Exception:  # pragma: no cover - defensive import guard
    _LANGDETECT_AVAILABLE = False


# Unicode block ranges used as a fallback / sanity check for Indic scripts.
_SCRIPT_RANGES = {
    "hi": (0x0900, 0x097F),  # Devanagari (also used to approximate Hindi)
    "bn": (0x0980, 0x09FF),  # Bengali
    "or": (0x0B00, 0x0B7F),  # Odia
    "ta": (0x0B80, 0x0BFF),  # Tamil
    "te": (0x0C00, 0x0C7F),  # Telugu
}


def _script_heuristic(text: str) -> Optional[str]:
    counts = {code: 0 for code in _SCRIPT_RANGES}
    for ch in text:
        cp = ord(ch)
        for code, (lo, hi) in _SCRIPT_RANGES.items():
            if lo <= cp <= hi:
                counts[code] += 1
                break
    best = max(counts, key=counts.get)
    if counts[best] > 0:
        return best
    # No Indic script characters found -> assume Latin script -> English
    if any(ch.isalpha() for ch in text):
        return "en"
    return None


class LanguageDetector:
    """Loaded once at application startup (see main.py lifespan)."""

    def __init__(self):
        self.settings = get_settings()

    def detect(self, text: str) -> Tuple[str, float]:
        """
        Returns (language_code, confidence). Falls back gracefully:
        1. langdetect (probabilistic, works well for Latin-script + many
           Indic scripts)
        2. Unicode script-range heuristic (always available, deterministic)
        """
        text = (text or "").strip()
        if not text:
            return "en", 0.0

        if _LANGDETECT_AVAILABLE:
            try:
                candidates = detect_langs(text)
                if candidates:
                    top = candidates[0]
                    code = top.lang
                    confidence = float(top.prob)
                    if code in self.settings.SUPPORTED_LANGUAGES:
                        return code, confidence
                    # langdetect returned something outside our supported
                    # set (e.g. it confused 'or'/Odia with something else on
                    # very short text) -> fall through to script heuristic.
            except Exception:
                pass

        heuristic_code = _script_heuristic(text)
        if heuristic_code:
            # Heuristic is deterministic and always correct for script-level
            # classification, but we report a moderate confidence since it
            # cannot fully disambiguate hi vs mr etc. within Devanagari.
            return heuristic_code, 0.75

        return "en", 0.3


_detector_singleton: Optional[LanguageDetector] = None


def get_language_detector() -> LanguageDetector:
    global _detector_singleton
    if _detector_singleton is None:
        _detector_singleton = LanguageDetector()
    return _detector_singleton
