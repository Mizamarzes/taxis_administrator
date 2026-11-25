import logging
from collections.abc import Callable
from datetime import date
from typing import Any

import pandas as pd
from sqlalchemy import Engine

from app.db.queries import load_odometer_readings, load_oil_targets
from app.models import oil_change
from app.models.store import ModelStore

logger = logging.getLogger(__name__)


class OilChangeService:
    def __init__(self, engine_factory: Callable[[], Engine], store: ModelStore) -> None:
        self._engine_factory = engine_factory
        self._store = store

    @property
    def artifact(self) -> dict[str, Any] | None:
        return self._store.artifact

    def ensure_model(self) -> None:
        if self._store.load():
            logger.info("Modelo de cambio de aceite cargado desde disco")
            return
        self.train()

    def train(self) -> dict[str, Any]:
        return self._train_from(load_odometer_readings(self._engine_factory()))

    def _train_from(self, readings: pd.DataFrame) -> dict[str, Any]:
        artifact = oil_change.train(readings)
        self._store.save(artifact)
        logger.info("Modelo de cambio de aceite entrenado: %s", artifact["metrics"])
        return artifact

    def predict(self, vehicle_id: int | None = None, today: date | None = None) -> dict[str, Any]:
        engine = self._engine_factory()
        readings = load_odometer_readings(engine)

        artifact = self._store.artifact
        if artifact is None or artifact.get("data_signature") != oil_change.data_signature(readings):
            artifact = self._train_from(readings)

        predictions = oil_change.predict(
            artifact,
            readings,
            load_oil_targets(engine, vehicle_id),
            today or date.today(),
        )
        return {"training": artifact, "predictions": predictions}
