# 01 · Próximo cambio de aceite

**Estado:** ✅ Implementado (v1.0.0) · **Técnica:** Regresión lineal por vehículo · **Valor:** Alto · **Esfuerzo:** —

## Problema de negocio
El administrador necesita saber qué vehículos están por cumplir el kilometraje o la fecha de su próximo cambio de aceite, aunque el conductor no reporte el odómetro todos los días. Un cambio tardío daña el motor; uno anticipado cuesta dinero.

## Tipo de problema
Regresión: estimar **km/día** de cada vehículo y proyectar cuándo alcanzará `next_service_km`.

## Datos disponibles
| Tabla | Columnas | Uso |
|---|---|---|
| `vehicle_expenses` | `vehicle_id`, `expense_date`, `odometer_km` | Lecturas de odómetro (cualquier categoría de gasto) |
| `vehicle_expenses` (`category = 'oil_change'`) | `next_service_km`, `next_service_date` | Objetivo del último cambio |
| `vehicles` | `id`, `plate`, `deletedAt` | Universo de vehículos |

## Pipeline
1. **Limpieza** (`features/odometer.py`): descarta nulos, una lectura por día (la mayor), elimina lecturas que bajan respecto al máximo acumulado, calcula `days` desde la primera lectura.
2. **Estimación** (`models/oil_change.py::estimate_rate`):
   - `vehicle_regression`: `LinearRegression(days → km)` con ≥ 3 lecturas en ≥ 7 días y pendiente positiva.
   - `two_point_trend`: pendiente entre primera y última lectura.
   - `fleet_average`: mediana de la flota si el vehículo tiene lecturas pero no tasa propia.
3. **Predicción**: km actual estimado = última lectura + km/día × días transcurridos; días hasta el vencimiento = mínimo entre el criterio por km y por fecha.
4. **Estado**: `overdue`, `soon` (≤ 15 días o ≤ 500 km), `ok`, `unknown`, `none`.
5. **Confianza**: `high` si R² ≥ 0.9 y ≥ 4 lecturas; `medium` para regresión o dos puntos; `low` para promedio de flota.

## Evaluación
*Holdout* de la última lectura de cada vehículo con ≥ 4 lecturas → `holdout_mae_km` (error absoluto medio en km). Se publica en `training.metrics`.

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `GET /oil-change/predictions?vehicleId=`, `POST /oil-change/train` |
| NestJS | `GET /api/predictions/oil-change` (`@Can('predictions.read')`), `POST /api/predictions/oil-change/train` (`@Can('predictions.train')`) |
| Web / móvil | Vista de predicciones con estado y confianza |

## Mejoras propuestas (v2)
| Mejora | Detalle |
|---|---|
| Robustez a outliers | `HuberRegressor` o `TheilSenRegressor` en lugar de `LinearRegression`; hoy una lectura inflada por error descarta todas las siguientes |
| Detección de lecturas erróneas | Usar el caso [04](04-deteccion-de-anomalias.md) para marcar saltos imposibles (p. ej. > 600 km/día) en vez de usar `cummax` |
| Estacionalidad semanal | Restar los días de pico y placa (`vehicles.driving_restriction_day`) y días sin trabajo; km/día laborable es más estable |
| Ventana reciente | Ponderar más las últimas 8 semanas (`sample_weight`) para captar cambios de conductor o de ruta |
| Intervalo de predicción | Devolver `predictedDueDateRange` con el error residual del vehículo |
| Generalizar | Reutilizar la misma tasa km/día para el caso [05](05-mantenimiento-predictivo.md) |
| Notificaciones | Push en móvil cuando el estado pasa a `soon` |

## Limitaciones
- Depende de que se registre `odometer_km` en los gastos.
- Vehículos nuevos sin lecturas quedan en `unknown`.
