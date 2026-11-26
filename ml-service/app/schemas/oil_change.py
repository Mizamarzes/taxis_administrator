from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class TrainingInfo(CamelModel):
    name: str
    version: str
    trained_at: datetime
    fleet_km_per_day: float | None
    metrics: dict[str, float | int | None]


class OilChangePrediction(CamelModel):
    vehicle_id: int
    plate: str
    last_odometer_km: int | None
    last_reading_date: date | None
    km_per_day: float | None
    estimated_current_km: int | None
    next_oil_change_km: int | None
    next_oil_change_date: date | None
    km_remaining: int | None
    days_until_due: int | None
    predicted_due_date: date | None
    due_by: Literal["km", "date"] | None
    status: Literal["none", "unknown", "ok", "soon", "overdue"]
    method: Literal["vehicle_regression", "two_point_trend", "fleet_average"] | None
    confidence: Literal["high", "medium", "low"] | None
    r2: float | None
    readings: int


class OilChangePredictionsResponse(CamelModel):
    training: TrainingInfo
    predictions: list[OilChangePrediction]
