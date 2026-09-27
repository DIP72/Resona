import os
import sys

# Ensure DEMO_MODE for the whole test suite regardless of local .env, and
# make sure `app` package is importable when pytest is run from repo root.
os.environ["DEMO_MODE"] = "true"
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.caching import get_translation_cache


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def _clear_cache_between_tests():
    get_translation_cache().clear()
    yield
