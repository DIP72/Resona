from fastapi import APIRouter

from app.config import get_settings
from app.models.translation_model import get_translation_model

router = APIRouter()


@router.get("/health")
def health():
    settings = get_settings()
    model = get_translation_model()
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "mode": model.mode_name,
        "supported_languages": settings.SUPPORTED_LANGUAGES,
    }
