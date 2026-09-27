"""
Stage 4 - TRANSLATION model backends.

Two interchangeable implementations behind the same `BaseTranslationModel`
interface, selected once at startup by `get_translation_model()` based on
`Settings.DEMO_MODE`. The rest of the application (services/translation.py)
never knows which backend is in use - this is the "modular / model can be
replaced later" requirement from the spec.

- DemoTranslationModel: dictionary/template based, zero dependencies beyond
  the standard library, always available, deterministic, and fast. Used for
  hackathon demos and CI tests where a multi-GB neural model cannot be
  downloaded.

- RealTranslationModel: loads a Hugging Face sequence-to-sequence model
  (default: AI4Bharat's IndicTrans2) ONCE at process startup and reuses it
  for every request (spec section 23 - "load the model once"). Swap
  REAL_TRANSLATION_MODEL_ID in .env to use NLLB-200 or any other
  Seq2SeqLM-compatible multilingual model instead.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.config import get_settings


class BaseTranslationModel(ABC):
    """Common interface both backends implement."""

    mode_name: str = "base"

    @abstractmethod
    def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate a single free-text string. Implementations MUST NOT be
        called directly on strings containing raw numbers/units - callers
        are expected to protect those with placeholders first (see
        app/utils/text_utils.py) so this function only ever has to move
        placeholder tokens around, never invent or alter a number."""
        raise NotImplementedError


class DemoTranslationModel(BaseTranslationModel):
    """
    Lightweight fallback translator used when DEMO_MODE=true (default) or
    when the real model failed to load (e.g. no internet / no GPU).

    This backend does not do generic free-text translation. Instead,
    higher-level composition happens in services/translation.py using the
    phrase tables in services/translation_dictionaries.py. `translate_text`
    here is only used as a last-resort passthrough for text this pipeline
    stage does not have a dedicated template for (kept obviously labelled so
    it is never mistaken for a validated translation).
    """

    mode_name = "demo"

    def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        if source_lang == target_lang:
            return text
        # No generic MT available in demo mode: return the source text
        # unchanged rather than fabricating a translation. Placeholders
        # (numbers/units) inside `text` are already protected upstream, so
        # this is still safe - just not linguistically translated.
        return text


class RealTranslationModel(BaseTranslationModel):
    """
    Real neural MT backend (e.g. IndicTrans2 / NLLB-200) loaded once via HF
    `transformers`. Requires `torch` + `transformers` + internet access (or
    a pre-downloaded local model cache) at startup.
    """

    mode_name = "real_model"

    def __init__(self, model_id: str, device: str = "cpu"):
        # Imported lazily so DEMO_MODE installs don't need torch/transformers
        # at all.
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

        self.device = device
        self.tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_id, trust_remote_code=True)
        self.model.to(device)
        self.model.eval()
        self._torch = torch

    def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        if source_lang == target_lang:
            return text
        # NOTE: exact tokenizer call signature (language tags, flores codes)
        # depends on the specific model chosen. IndicTrans2 requires the
        # IndicTransToolkit pre/post-processor; NLLB-200 uses BCP-47-ish
        # `src_lang`/`tgt_lang` attributes. Kept intentionally simple/generic
        # here since the hackathon demo runs in DEMO_MODE; swap this method
        # to match whichever real model you load.
        self.tokenizer.src_lang = source_lang
        encoded = self.tokenizer(text, return_tensors="pt").to(self.device)
        with self._torch.no_grad():
            generated = self.model.generate(
                **encoded,
                forced_bos_token_id=self.tokenizer.convert_tokens_to_ids(target_lang),
                max_length=512,
            )
        return self.tokenizer.batch_decode(generated, skip_special_tokens=True)[0]


_model_singleton: Optional[BaseTranslationModel] = None


def load_translation_model() -> BaseTranslationModel:
    """
    Called ONCE from the FastAPI startup/lifespan hook. Never call this per
    request - that would reload a multi-GB model on every API call.
    """
    global _model_singleton
    settings = get_settings()

    if settings.DEMO_MODE:
        _model_singleton = DemoTranslationModel()
        return _model_singleton

    try:
        _model_singleton = RealTranslationModel(
            model_id=settings.REAL_TRANSLATION_MODEL_ID, device=settings.REAL_MODEL_DEVICE
        )
    except Exception as exc:  # pragma: no cover - environment dependent
        # Hackathon safety net: if the real model can't load (no internet,
        # not enough RAM/GPU, dependency missing), fall back to DEMO mode
        # automatically instead of crashing the whole service.
        print(f"[startup] Real translation model failed to load ({exc}); falling back to DEMO mode.")
        _model_singleton = DemoTranslationModel()

    return _model_singleton


def get_translation_model() -> BaseTranslationModel:
    if _model_singleton is None:
        return load_translation_model()
    return _model_singleton
