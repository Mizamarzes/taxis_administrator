import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.config.database import get_engine
from app.repositories.base import read_only_query

CONDUCTORES = [
    ("Andrés", "ABC123", 80_000, 1, 0.98, 0.40),
    ("Beatriz", "DEF456", 80_000, 2, 0.97, 0.30),
    ("Carlos", "GHI789", 75_000, 3, 0.96, 0.20),
    ("Diana", "JKL012", 75_000, 4, 0.98, 0.35),
    ("Eduardo", "MNO345", 70_000, 5, 0.95, 0.15),
    ("Fabián", "PQR678", 70_000, 1, 0.96, 0.12),
    ("Gloria", "STU901", 85_000, 2, 0.98, 0.40),
    ("Héctor", "VWX234", 65_000, 3, 0.95, 0.20),
]

TARIFAS_SQL = """
    SELECT d.name AS conductor, t.tarifa_date AS fecha, t.amount AS pago
    FROM tarifas t
    JOIN drivers d ON d.id = t.driver_id AND d."deletedAt" IS NULL
    WHERE t."deletedAt" IS NULL
      AND t.tarifa_date IS NOT NULL
"""

DEUDAS_SQL = """
    SELECT d.name AS conductor, m.movement_date AS fecha, m.type AS tipo, m.amount AS monto
    FROM deuda_movements m
    JOIN drivers d ON d.id = m.driver_id AND d."deletedAt" IS NULL
    WHERE m."deletedAt" IS NULL
"""

CONDUCTORES_SQL = """
    SELECT d.name AS conductor, v.plate AS placa, v.driving_restriction_day AS dia_pico_y_placa
    FROM vehicles v
    JOIN drivers d ON d.id = v.driver_id AND d."deletedAt" IS NULL
    WHERE v."deletedAt" IS NULL
"""


def generar_sinteticos(hoy, dias=365, semilla=42):
    rng = np.random.default_rng(semilla)
    fechas = pd.date_range(hoy - pd.Timedelta(days=dias), hoy - pd.Timedelta(days=1))
    tarifas, deudas = [], []

    for nombre, _, tarifa, dia_pico, cumplimiento, disciplina in CONDUCTORES:
        saldo = 0.0
        dias_sin_abonar = 0

        for fecha in fechas:
            if rng.random() < 0.006:
                monto = float(rng.choice([100_000, 200_000, 300_000]))
                deudas.append({"conductor": nombre, "fecha": fecha, "tipo": "debt", "monto": monto})
                saldo += monto

            if saldo > 0 and rng.random() < disciplina:
                abono = min(saldo, float(tarifa * rng.choice([1, 2, 3])))
                deudas.append({"conductor": nombre, "fecha": fecha, "tipo": "payment", "monto": abono})
                saldo -= abono
                dias_sin_abonar = 0
            elif saldo > 0:
                dias_sin_abonar += 1
            else:
                dias_sin_abonar = 0

            if saldo > 6 * tarifa and rng.random() < 0.05:
                condonacion = saldo / 2
                deudas.append({"conductor": nombre, "fecha": fecha, "tipo": "forgiveness", "monto": condonacion})
                saldo -= condonacion

            if fecha.day_of_week + 1 == dia_pico:
                continue

            deuda_en_tarifas = saldo / tarifa
            estancado = saldo > 0 and dias_sin_abonar > 10
            probabilidad = cumplimiento - 0.04 * min(deuda_en_tarifas, 5) - (0.30 if estancado else 0)

            if rng.random() < max(probabilidad, 0.05):
                tarifas.append({"conductor": nombre, "fecha": fecha, "pago": float(tarifa)})
            else:
                deudas.append({"conductor": nombre, "fecha": fecha, "tipo": "debt", "monto": float(tarifa)})
                saldo += tarifa

    conductores = pd.DataFrame(
        [(nombre, placa, dia_pico) for nombre, placa, _, dia_pico, _, _ in CONDUCTORES],
        columns=["conductor", "placa", "dia_pico_y_placa"],
    )
    return pd.DataFrame(tarifas), pd.DataFrame(deudas), conductores


def cargar_reales():
    engine = get_engine()
    return (
        read_only_query(engine, TARIFAS_SQL),
        read_only_query(engine, DEUDAS_SQL),
        read_only_query(engine, CONDUCTORES_SQL),
    )


def cargar_datos(fuente, hoy, semilla=42):
    tarifas, deudas, conductores = generar_sinteticos(hoy, semilla=semilla) if fuente == "sintetico" else cargar_reales()
    tarifas["fecha"] = pd.to_datetime(tarifas["fecha"])
    tarifas["pago"] = tarifas["pago"].astype(float)
    deudas["fecha"] = pd.to_datetime(deudas["fecha"])
    deudas["monto"] = deudas["monto"].astype(float)
    tarifas = tarifas.groupby(["conductor", "fecha"], as_index=False)["pago"].sum()
    return tarifas, deudas, conductores
