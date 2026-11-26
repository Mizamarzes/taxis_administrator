import pandas as pd
from sqlalchemy import Engine

from app.repositories.base import read_only_query

ODOMETER_READINGS_SQL = """
    SELECT e.vehicle_id   AS vehicle_id,
           e.expense_date AS reading_date,
           e.odometer_km  AS odometer_km
    FROM vehicle_expenses e
    JOIN vehicles v ON v.id = e.vehicle_id AND v."deletedAt" IS NULL
    WHERE e.odometer_km IS NOT NULL
      AND e."deletedAt" IS NULL
"""

OIL_TARGETS_SQL = """
    SELECT v.id                   AS vehicle_id,
           v.plate                AS plate,
           oil.next_service_km    AS next_service_km,
           oil.next_service_date  AS next_service_date
    FROM vehicles v
    LEFT JOIN LATERAL (
        SELECT o.next_service_km, o.next_service_date
        FROM vehicle_expenses o
        WHERE o.vehicle_id = v.id
          AND o.category = 'oil_change'
          AND o."deletedAt" IS NULL
        ORDER BY o.expense_date DESC, o.id DESC
        LIMIT 1
    ) oil ON true
    WHERE v."deletedAt" IS NULL
      AND (CAST(:vehicle_id AS integer) IS NULL OR v.id = CAST(:vehicle_id AS integer))
    ORDER BY v.plate
"""


def load_odometer_readings(engine: Engine) -> pd.DataFrame:
    return read_only_query(engine, ODOMETER_READINGS_SQL)


def load_oil_targets(engine: Engine, vehicle_id: int | None = None) -> pd.DataFrame:
    return read_only_query(engine, OIL_TARGETS_SQL, {"vehicle_id": vehicle_id})
