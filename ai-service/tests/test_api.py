from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_reports_ready_deterministic_provider():
    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["provider"] == "heuristic"
    assert body["aiAvailable"] is True
    assert body["fallbackAvailable"] is True


def test_normalize_endpoint_contract_shape():
    response = client.post("/normalize", json={"text": "ठिबक सिंचन जोड"})

    assert response.status_code == 200
    assert response.json() == {
        "original": "ठिबक सिंचन जोड",
        "normalized": "drip irrigation connector",
        "tokens": ["drip", "irrigation", "connector"],
        "languageGuess": "mr",
        "normalizedBy": "ai",
    }


def test_match_endpoint_returns_camel_case_contract_shape():
    response = client.post(
        "/match",
        json={
            "query": "mini tillar",
            "candidates": [
                {"productId": 1, "title": "Mini Tiller 7HP", "category": "MACHINERY"},
                {"productId": 8, "title": "Rotavator 5 Feet", "category": "MACHINERY"},
            ],
            "threshold": 0.6,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["queryNormalized"] == "mini tiller"
    assert body["provider"] == "ai"
    assert len(body["matches"]) == 2
    assert body["matches"][0]["productId"] == 1
    assert body["matches"][0]["match"] is True
    assert 0.0 <= body["matches"][0]["confidence"] <= 1.0
    assert body["matches"][0]["equivalence"] == "EQUIVALENT"


def test_match_endpoint_respects_impossible_threshold():
    response = client.post(
        "/match",
        json={
            "query": "mini tiller",
            "candidates": [{"productId": 1, "title": "Mini Tiller 7HP"}],
            "threshold": 1.0,
        },
    )

    assert response.status_code == 200
    assert response.json()["matches"][0]["match"] is False


def test_match_endpoint_rejects_empty_candidates():
    response = client.post("/match", json={"query": "mini tiller", "candidates": []})

    assert response.status_code == 422


def test_match_endpoint_rejects_out_of_range_threshold():
    response = client.post(
        "/match",
        json={
            "query": "mini tiller",
            "candidates": [{"productId": 1, "title": "Mini Tiller 7HP"}],
            "threshold": 1.5,
        },
    )

    assert response.status_code == 422


def test_root_describes_endpoints():
    response = client.get("/")

    assert response.status_code == 200
    assert set(response.json()["endpoints"]) == {"/health", "/normalize", "/match"}
