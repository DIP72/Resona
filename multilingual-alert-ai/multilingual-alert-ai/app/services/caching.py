"""
Translation caching (spec section 15).

Cache key = hash(alert_id + alert_version + source_language + target_language).
If the same alert has already been translated into a given target language,
the cached TranslationPackage is returned instead of re-running the
translation model. This is what allows "10,000 recipients, 5 languages" to
require exactly 5 translation runs instead of 10,000 (spec section 16/22
test case 16).

Implementation: a process-memory LRU-ish dict, good enough for a hackathon /
single-process deployment. Swap `InMemoryTranslationCache` for a Redis-backed
implementation in production without changing any caller - both implement
the same `get`/`set` interface.
"""

from __future__ import annotations

import hashlib
import time
from collections import OrderedDict
from typing import Optional

from app.config import get_settings
from app.schemas.alert_schema import TranslationPackage


def make_cache_key(alert_id: str, alert_version: str, source_language: str, target_language: str) -> str:
    raw = f"{alert_id}:{alert_version}:{source_language}:{target_language}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class InMemoryTranslationCache:
    def __init__(self, max_entries: int = 5000, ttl_seconds: int = 86400):
        self.max_entries = max_entries
        self.ttl_seconds = ttl_seconds
        self._store: "OrderedDict[str, tuple[float, TranslationPackage]]" = OrderedDict()

    def get(self, key: str) -> Optional[TranslationPackage]:
        entry = self._store.get(key)
        if entry is None:
            return None
        timestamp, value = entry
        if time.time() - timestamp > self.ttl_seconds:
            del self._store[key]
            return None
        # LRU touch
        self._store.move_to_end(key)
        return value

    def set(self, key: str, value: TranslationPackage) -> None:
        self._store[key] = (time.time(), value)
        self._store.move_to_end(key)
        while len(self._store) > self.max_entries:
            self._store.popitem(last=False)

    def clear(self) -> None:
        self._store.clear()

    def __len__(self) -> int:
        return len(self._store)


_cache_singleton: Optional[InMemoryTranslationCache] = None


def get_translation_cache() -> InMemoryTranslationCache:
    global _cache_singleton
    if _cache_singleton is None:
        settings = get_settings()
        _cache_singleton = InMemoryTranslationCache(
            max_entries=settings.CACHE_MAX_ENTRIES, ttl_seconds=settings.CACHE_TTL_SECONDS
        )
    return _cache_singleton
