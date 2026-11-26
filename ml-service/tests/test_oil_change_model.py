from datetime import date, timedelta

import pandas as pd
import pytest

from app.features.odometer import clean_readings
from app.models import oil_change

START = date(2026, 1, 1)


def make_readings(vehicle_id: int, km_per_day: float, days: list[int], start_km: float = 50_000) -> list[dict]:
    return [
        {
            "vehicle_id": vehicle_id,
            "reading_date": START + timedelta(days=day),
            "odometer_km": start_km + km_per_day * day,
        }
        for day in days
    ]


def make_targets(rows: list[dict]) -> pd.DataFrame:
    return pd.DataFrame(rows, columns=["vehicle_id", "plate", "next_service_km", "next_service_date"])


def test_clean_readings_drops_decreasing_values_and_duplicates():
    raw = pd.DataFrame(
        [
            {"vehicle_id": 1, "reading_date": START, "odometer_km": 1000},
            {"vehicle_id": 1, "reading_date": START, "odometer_km": 1100},
            {"vehicle_id": 1, "reading_date": START + timedelta(days=5), "odometer_km": 900},
            {"vehicle_id": 1, "reading_date": START + timedelta(days=10), "odometer_km": 2100},
            {"vehicle_id": 1, "reading_date": START + timedelta(days=12), "odometer_km": None},
        ]
    )

    cleaned = clean_readings(raw)

    assert cleaned["odometer_km"].tolist() == [1100, 2100]
    assert cleaned["days"].tolist() == [0, 10]


def test_clean_readings_handles_empty_input():
    cleaned = clean_readings(pd.DataFrame(columns=["vehicle_id", "reading_date", "odometer_km"]))
    assert cleaned.empty


def test_regression_recovers_constant_rate():
    readings = clean_readings(pd.DataFrame(make_readings(1, 180, [0, 10, 20, 30])))

    rate = oil_change.estimate_rate(readings)

    assert rate is not None
    assert rate.method == "vehicle_regression"
    assert rate.km_per_day == pytest.approx(180)
    assert rate.r2 == pytest.approx(1.0)


def test_two_readings_use_simple_trend():
    readings = clean_readings(pd.DataFrame(make_readings(1, 100, [0, 4])))

    rate = oil_change.estimate_rate(readings)

    assert rate is not None
    assert rate.method == "two_point_trend"
    assert rate.km_per_day == pytest.approx(100)


def test_single_reading_has_no_rate():
    readings = clean_readings(pd.DataFrame(make_readings(1, 100, [0])))
    assert oil_change.estimate_rate(readings) is None


def test_train_computes_fleet_median_and_holdout_metrics():
    raw = pd.DataFrame(
        make_readings(1, 100, [0, 10, 20, 30]) + make_readings(2, 200, [0, 10, 20, 30]) + make_readings(3, 50, [0])
    )

    artifact = oil_change.train(raw)

    assert set(artifact["vehicles"]) == {1, 2}
    assert artifact["fleet_km_per_day"] == pytest.approx(150)
    assert artifact["metrics"]["vehicles_with_rate"] == 2
    assert artifact["metrics"]["holdout_vehicles"] == 2
    assert artifact["metrics"]["holdout_mae_km"] == pytest.approx(0, abs=0.1)


def test_data_signature_changes_when_readings_change():
    raw = pd.DataFrame(make_readings(1, 100, [0, 10]))
    extended = pd.DataFrame(make_readings(1, 100, [0, 10, 20]))

    assert oil_change.data_signature(raw) == oil_change.data_signature(raw.copy())
    assert oil_change.data_signature(raw) != oil_change.data_signature(extended)
    assert oil_change.train(raw)["data_signature"] == oil_change.data_signature(raw)


def test_predict_days_until_due_by_km():
    raw = pd.DataFrame(make_readings(1, 100, [0, 10, 20, 30]))
    artifact = oil_change.train(raw)
    today = START + timedelta(days=30)
    targets = make_targets([{"vehicle_id": 1, "plate": "ABC123", "next_service_km": 50_000 + 3000 + 2000, "next_service_date": None}])

    [prediction] = oil_change.predict(artifact, raw, targets, today)

    assert prediction["km_per_day"] == pytest.approx(100)
    assert prediction["km_remaining"] == 2000
    assert prediction["days_until_due"] == 20
    assert prediction["predicted_due_date"] == today + timedelta(days=20)
    assert prediction["due_by"] == "km"
    assert prediction["status"] == "ok"
    assert prediction["confidence"] == "high"


def test_predict_projects_current_km_from_last_reading():
    raw = pd.DataFrame(make_readings(1, 100, [0, 10, 20, 30]))
    artifact = oil_change.train(raw)
    today = START + timedelta(days=40)
    targets = make_targets([{"vehicle_id": 1, "plate": "ABC123", "next_service_km": 54_500, "next_service_date": None}])

    [prediction] = oil_change.predict(artifact, raw, targets, today)

    assert prediction["estimated_current_km"] == 54_000
    assert prediction["km_remaining"] == 500
    assert prediction["status"] == "soon"


def test_predict_uses_the_earliest_between_km_and_date():
    raw = pd.DataFrame(make_readings(1, 100, [0, 10, 20, 30]))
    artifact = oil_change.train(raw)
    today = START + timedelta(days=30)
    targets = make_targets(
        [{"vehicle_id": 1, "plate": "ABC123", "next_service_km": 60_000, "next_service_date": today + timedelta(days=5)}]
    )

    [prediction] = oil_change.predict(artifact, raw, targets, today)

    assert prediction["due_by"] == "date"
    assert prediction["days_until_due"] == 5
    assert prediction["status"] == "soon"


def test_predict_marks_overdue_when_km_passed():
    raw = pd.DataFrame(make_readings(1, 100, [0, 10, 20, 30]))
    artifact = oil_change.train(raw)
    targets = make_targets([{"vehicle_id": 1, "plate": "ABC123", "next_service_km": 52_000, "next_service_date": None}])

    [prediction] = oil_change.predict(artifact, raw, targets, START + timedelta(days=30))

    assert prediction["status"] == "overdue"
    assert prediction["days_until_due"] < 0


def test_predict_falls_back_to_fleet_average():
    raw = pd.DataFrame(make_readings(1, 100, [0, 10, 20, 30]) + make_readings(2, 0, [0]))
    artifact = oil_change.train(raw)
    targets = make_targets([{"vehicle_id": 2, "plate": "XYZ789", "next_service_km": 51_000, "next_service_date": None}])

    [prediction] = oil_change.predict(artifact, raw, targets, START)

    assert prediction["method"] == "fleet_average"
    assert prediction["confidence"] == "low"
    assert prediction["days_until_due"] == 10


def test_predict_without_target_or_data():
    raw = pd.DataFrame(make_readings(1, 100, [0, 10, 20, 30]))
    artifact = oil_change.train(raw)
    targets = make_targets(
        [
            {"vehicle_id": 1, "plate": "ABC123", "next_service_km": None, "next_service_date": None},
            {"vehicle_id": 9, "plate": "NEW001", "next_service_km": 10_000, "next_service_date": None},
        ]
    )

    predictions = {item["plate"]: item for item in oil_change.predict(artifact, raw, targets, START)}

    assert predictions["ABC123"]["status"] == "none"
    assert predictions["NEW001"]["status"] == "unknown"
    assert predictions["NEW001"]["method"] is None
