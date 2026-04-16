"""HTTP smoke tests against the deployed game (default) or any base URL.

Default target is production on Netlify:
https://dutch-english-phrase-game.netlify.app/

Override for local Django::

    API_BASE_URL=http://127.0.0.1:8000 RUN_API_TESTS=1 python3.10 -m pytest tests/api/test_api.py -v

From the repo root::

    python3.10 -m pip install -r tests/api/requirements.txt
    RUN_API_TESTS=1 python3.10 -m pytest tests/api/test_api.py -v

Without ``RUN_API_TESTS=1`` the integration tests are skipped.
"""

import os

import pytest
import requests

_DEFAULT_NETLIFY = "https://dutch-english-phrase-game.netlify.app"
BASE_URL = os.environ.get("API_BASE_URL", _DEFAULT_NETLIFY)


@pytest.fixture
def live_base():
    if os.environ.get("RUN_API_TESTS") != "1":
        pytest.skip(
            "Set RUN_API_TESTS=1 (default URL is Netlify production; "
            "set API_BASE_URL for local Django on http://127.0.0.1:8000)"
        )
    return BASE_URL.rstrip("/")


def _get(url: str, **kwargs) -> requests.Response:
    try:
        return requests.get(url, timeout=10, **kwargs)
    except requests.RequestException as exc:
        pytest.fail(f"No response from {url}: {exc}")


@pytest.mark.integration
def test_homepage_returns_200(live_base):
    r = _get(live_base + "/")
    assert r.status_code == 200


@pytest.mark.integration
def test_homepage_has_non_empty_body(live_base):
    r = _get(live_base + "/")
    assert len(r.content) > 0
    assert "Dutch-English Phrase Game" in r.text


@pytest.mark.integration
def test_homepage_get_with_browser_like_headers(live_base):
    r = _get(
        live_base + "/",
        headers={
            "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    assert r.status_code == 200
    assert len(r.content) > 0
