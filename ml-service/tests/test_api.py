from datetime import date, datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_oil_change_service
from app.core.config import Settings, get_settings
from app.main import app

TRAINING = {
    "name": "oil_change",
    "version": "1.0.0",
    "trained_at": datetime(2026, 11, 25, tzinfo=timezone.utc),
    "fleet_km_per_day": 150.0,
    "vehicles": {},
    "metrics": {"readings": 10, "holdout_mae_km": 12.5},
}

PREDICTION = {
    "vehicle_id": 1,
    "plate": "ABC123",
    "last_odometer_km": 85_000,
    "last_reading_date": date(2026, 11, 1),
    "km_per_day": 150.0,
    "estimated_current_km": 88_600,
    "next_oil_change_km": 90_000,
    "next_oil_change_date": None,
    "km_remaining": 1400,
    "days_until_due": 9,
    "predicted_due_date": date(2026, 12, 4),
    "due_by": "km",
    "status": "soon",
    "method": "vehicle_regression",
    "confidence": "high",
    "r2": 0.98,
    "readings": 5,
}


class FakeService:
    artifact = TRAINING

    def predict(self, vehicle_id=None):
        return {"training": TRAINING, "predictions": [PREDICTION]}

    def train(self):
        return TRAINING


@pytest.fixture
def client():
    app.dependency_overrides[get_settings] = lambda: Settings(ml_service_key="test-key")
    app.dependency_overrides[get_oil_change_service] = lambda: FakeService()
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_health_is_public(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["models"]["oilChange"]["loaded"] is True


def test_predictions_require_internal_key(client):
    assert client.get("/oil-change/predictions").status_code == 401
    assert client.get("/oil-change/predictions", headers={"X-Internal-Key": "wrong"}).status_code == 401


def test_predictions_return_camel_case(client):
    response = client.get("/oil-change/predictions", headers={"X-Internal-Key": "test-key"})

    assert response.status_code == 200
    body = response.json()
    assert body["training"]["fleetKmPerDay"] == 150.0
    assert body["predictions"][0]["daysUntilDue"] == 9
    assert body["predictions"][0]["predictedDueDate"] == "2026-12-04"


def test_train_endpoint(client):
    response = client.post("/oil-change/train", headers={"X-Internal-Key": "test-key"})
    assert response.status_code == 200
    assert response.json()["metrics"]["holdout_mae_km"] == 12.5


def test_missing_key_configuration_fails_closed(client):
    app.dependency_overrides[get_settings] = lambda: Settings(ml_service_key="")
    response = client.get("/oil-change/predictions", headers={"X-Internal-Key": "anything"})
    assert response.status_code == 503
