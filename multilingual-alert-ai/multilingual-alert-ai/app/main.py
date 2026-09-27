"""
FastAPI application entrypoint.

The translation model is loaded ONCE here via a lifespan hook (spec section
23), not per-request. In DEMO_MODE (default) this is instant; in REAL MODEL
mode this is where the multi-GB neural model download/load happens.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import health, routes
from app.config import get_settings
from app.models.language_model import get_language_detector
from app.models.translation_model import load_translation_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load models ONCE, reused for every request afterwards.
    get_language_detector()
    model = load_translation_model()
    print(f"[startup] Translation backend ready: mode={model.mode_name}")
    yield
    # Shutdown: nothing to clean up for the in-memory cache/model.


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "AI-Powered Multilingual Emergency Alert System - detects the "
            "source language of an official alert, extracts structured "
            "emergency data, and produces ONE validated translation per "
            "target language (not per recipient)."
        ),
        lifespan=lifespan,
    )

    app.include_router(health.router, tags=["health"])
    app.include_router(routes.router, tags=["alerts"])

    return app


app = create_app()
