"""
Central configuration for the Multilingual Emergency Alert AI service.

All tunables are read from environment variables (see .env.example) so the
same code can run in DEMO mode (hackathon / no GPU / no internet) or REAL
MODEL mode (IndicTrans2 / NLLB downloaded locally) without any code changes.
"""

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


def _bool_env(name: str, default: bool) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in ("1", "true", "yes", "on")


class Settings:
    # ---------------------------------------------------------------
    # Mode switch: the single flag that separates the two run modes.
    # ---------------------------------------------------------------
    # DEMO_MODE=true  -> lightweight rule/dictionary based translator.
    #                    No model download needed, runs anywhere, same API.
    # DEMO_MODE=false -> loads a real HF translation model (e.g. IndicTrans2 /
    #                    NLLB-200) once at startup and uses it for inference.
    DEMO_MODE: bool = _bool_env("DEMO_MODE", True)

    # If DEMO_MODE=false, which HF model id to load.
    REAL_TRANSLATION_MODEL_ID: str = os.getenv(
        "REAL_TRANSLATION_MODEL_ID", "ai4bharat/indictrans2-en-indic-1B"
    )
    REAL_MODEL_DEVICE: str = os.getenv("REAL_MODEL_DEVICE", "cpu")  # cpu | cuda

    # Language detection confidence threshold. Below this, the API returns
    # a warning instead of silently guessing the source language.
    LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD: float = float(
        os.getenv("LANGUAGE_DETECTION_CONFIDENCE_THRESHOLD", "0.55")
    )

    # Supported languages: code -> display name.
    SUPPORTED_LANGUAGES = {
        "en": "English",
        "hi": "Hindi",
        "or": "Odia",
        "bn": "Bengali",
        "te": "Telugu",
        "ta": "Tamil",
    }

    # Caching
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "86400"))  # 1 day
    CACHE_MAX_ENTRIES: int = int(os.getenv("CACHE_MAX_ENTRIES", "5000"))

    # Low bandwidth message max length (SMS-style)
    LOW_BANDWIDTH_MAX_CHARS: int = int(os.getenv("LOW_BANDWIDTH_MAX_CHARS", "160"))

    # API metadata
    APP_NAME = "Multilingual Emergency Alert AI"
    APP_VERSION = "1.0.0"


@lru_cache()
def get_settings() -> "Settings":
    return Settings()
