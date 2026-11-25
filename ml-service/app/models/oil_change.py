import math
from dataclasses import asdict, dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Any

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

from app.features.odometer import clean_readings

MODEL_NAME = "oil_change"
MODEL_VERSION = "1.0.0"

MIN_REGRESSION_POINTS = 3
MIN_REGRESSION_SPAN_DAYS = 7
SOON_DAYS = 15
SOON_KM = 500
HIGH_CONFIDENCE_R2 = 0.9
HIGH_CONFIDENCE_POINTS = 4


@dataclass
class VehicleRate:
    km_per_day: float
    method: str
    r2: float | None
    n_readings: int
    span_days: int


def estimate_rate(group: pd.DataFrame) -> VehicleRate | None:
    n_readings = len(group)
    if n_readings < 2:
        return None

    span_days = int(group["days"].max())
    days = group["days"].to_numpy(dtype=float)
    km = group["odometer_km"].to_numpy(dtype=float)

    if n_readings >= MIN_REGRESSION_POINTS and span_days >= MIN_REGRESSION_SPAN_DAYS:
        regression = LinearRegression().fit(days.reshape(-1, 1), km)
        slope = float(regression.coef_[0])
        if slope > 0:
            r2 = float(regression.score(days.reshape(-1, 1), km))
            return VehicleRate(slope, "vehicle_regression", r2, n_readings, span_days)

    if span_days >= 1:
        slope = float((km[-1] - km[0]) / (days[-1] - days[0]))
        if slope > 0:
            return VehicleRate(slope, "two_point_trend", None, n_readings, span_days)

    return None


def evaluate_holdout(readings: pd.DataFrame) -> dict[str, Any]:
    errors: list[float] = []
    for _, group in readings.groupby("vehicle_id"):
        if len(group) < MIN_REGRESSION_POINTS + 1:
            continue
        train, test = group.iloc[:-1], group.iloc[-1]
        rate = estimate_rate(train)
        if rate is None:
            continue
        last = train.iloc[-1]
        predicted = last["odometer_km"] + rate.km_per_day * (test["days"] - last["days"])
        errors.append(abs(predicted - test["odometer_km"]))

    return {
        "holdout_mae_km": round(float(np.mean(errors)), 1) if errors else None,
        "holdout_vehicles": len(errors),
    }


def data_signature(raw_readings: pd.DataFrame) -> str:
    readings = clean_readings(raw_readings)
    if readings.empty:
        return "empty"
    return f"{len(readings)}:{readings['odometer_km'].sum():.0f}:{readings['reading_date'].max():%Y-%m-%d}"


def train(raw_readings: pd.DataFrame) -> dict[str, Any]:
    readings = clean_readings(raw_readings)

    vehicles: dict[int, dict[str, Any]] = {}
    for vehicle_id, group in readings.groupby("vehicle_id"):
        rate = estimate_rate(group)
        if rate is not None:
            vehicles[int(vehicle_id)] = asdict(rate)

    rates = [vehicle["km_per_day"] for vehicle in vehicles.values()]
    fleet_km_per_day = float(np.median(rates)) if rates else None

    return {
        "name": MODEL_NAME,
        "version": MODEL_VERSION,
        "trained_at": datetime.now(timezone.utc),
        "data_signature": data_signature(raw_readings),
        "fleet_km_per_day": fleet_km_per_day,
        "vehicles": vehicles,
        "metrics": {
            "readings": len(readings),
            "vehicles_with_readings": int(readings["vehicle_id"].nunique()) if not readings.empty else 0,
            "vehicles_with_rate": len(vehicles),
            **evaluate_holdout(readings),
        },
    }


def _optional_int(value: Any) -> int | None:
    return int(value) if value is not None and pd.notna(value) else None


def _optional_date(value: Any) -> date | None:
    if value is None or pd.isna(value):
        return None
    return pd.Timestamp(value).date()


def _confidence(method: str | None, r2: float | None, n_readings: int) -> str | None:
    if method == "vehicle_regression":
        if r2 is not None and r2 >= HIGH_CONFIDENCE_R2 and n_readings >= HIGH_CONFIDENCE_POINTS:
            return "high"
        return "medium"
    if method == "two_point_trend":
        return "medium"
    if method == "fleet_average":
        return "low"
    return None


def _status(
    next_km: int | None,
    next_date: date | None,
    km_remaining: float | None,
    days_until_due: int | None,
) -> str:
    if next_km is None and next_date is None:
        return "none"
    if (km_remaining is not None and km_remaining <= 0) or (days_until_due is not None and days_until_due < 0):
        return "overdue"
    if days_until_due is None and km_remaining is None:
        return "unknown"
    if (km_remaining is not None and km_remaining <= SOON_KM) or (
        days_until_due is not None and days_until_due <= SOON_DAYS
    ):
        return "soon"
    if days_until_due is None:
        return "unknown"
    return "ok"


def predict(
    artifact: dict[str, Any],
    raw_readings: pd.DataFrame,
    targets: pd.DataFrame,
    today: date,
) -> list[dict[str, Any]]:
    readings = clean_readings(raw_readings)
    last_readings = readings.groupby("vehicle_id").last() if not readings.empty else pd.DataFrame()
    reading_counts = readings.groupby("vehicle_id").size() if not readings.empty else pd.Series(dtype=int)
    fleet_rate = artifact.get("fleet_km_per_day")

    predictions: list[dict[str, Any]] = []
    for target in targets.itertuples(index=False):
        vehicle_id = int(target.vehicle_id)
        has_readings = vehicle_id in last_readings.index

        last_km = float(last_readings.at[vehicle_id, "odometer_km"]) if has_readings else None
        last_date = last_readings.at[vehicle_id, "reading_date"].date() if has_readings else None
        n_readings = int(reading_counts.get(vehicle_id, 0))

        vehicle_rate = artifact["vehicles"].get(vehicle_id)
        if vehicle_rate is not None:
            km_per_day, method, r2 = vehicle_rate["km_per_day"], vehicle_rate["method"], vehicle_rate["r2"]
        elif has_readings and fleet_rate:
            km_per_day, method, r2 = fleet_rate, "fleet_average", None
        else:
            km_per_day, method, r2 = None, None, None

        estimated_km = None
        if last_km is not None:
            elapsed = max((today - last_date).days, 0)
            estimated_km = last_km + (km_per_day or 0) * elapsed

        next_km = _optional_int(target.next_service_km)
        next_date = _optional_date(target.next_service_date)

        km_remaining = next_km - estimated_km if next_km is not None and estimated_km is not None else None

        candidates: list[tuple[float, str]] = []
        if km_remaining is not None and km_per_day:
            candidates.append((km_remaining / km_per_day, "km"))
        if next_date is not None:
            candidates.append(((next_date - today).days, "date"))

        days_until_due, due_by, predicted_due_date = None, None, None
        if candidates:
            raw_days, due_by = min(candidates, key=lambda candidate: candidate[0])
            days_until_due = math.floor(raw_days)
            predicted_due_date = today + timedelta(days=days_until_due)

        predictions.append(
            {
                "vehicle_id": vehicle_id,
                "plate": target.plate,
                "last_odometer_km": _optional_int(last_km),
                "last_reading_date": last_date,
                "km_per_day": round(km_per_day, 1) if km_per_day else None,
                "estimated_current_km": _optional_int(round(estimated_km)) if estimated_km is not None else None,
                "next_oil_change_km": next_km,
                "next_oil_change_date": next_date,
                "km_remaining": _optional_int(round(km_remaining)) if km_remaining is not None else None,
                "days_until_due": days_until_due,
                "predicted_due_date": predicted_due_date,
                "due_by": due_by,
                "status": _status(next_km, next_date, km_remaining, days_until_due),
                "method": method,
                "confidence": _confidence(method, r2, n_readings),
                "r2": round(r2, 3) if r2 is not None else None,
                "readings": n_readings,
            }
        )

    return sorted(
        predictions,
        key=lambda item: (item["days_until_due"] is None, item["days_until_due"] or 0, item["plate"]),
    )
