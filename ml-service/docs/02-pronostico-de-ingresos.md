# 02 · Pronóstico de ingresos por tarifas

**Estado:** Propuesto · **Técnica:** Series de tiempo / regresión con variables de calendario · **Valor:** Alto · **Esfuerzo:** Medio

## Problema de negocio
El dashboard muestra ingresos históricos (`getGananciasPorDia`), pero no cuánto se espera recaudar. Un pronóstico permite:
- Planear el flujo de caja de la semana y el mes (pagos de mantenimiento, cuotas, seguros).
- Comparar lo recaudado contra lo esperado y detectar a tiempo un vehículo o conductor por debajo de su nivel.
- Estimar el impacto de tener un vehículo en taller o sin conductor.

## Tipo de problema
Regresión sobre series de tiempo. Objetivo: `SUM(tarifas.amount)` por día, a nivel **flota** y por **vehículo**, para los próximos 7–30 días.

## Datos disponibles
| Tabla | Columnas | Uso |
|---|---|---|
| `tarifas` | `tarifa_date`, `amount`, `vehicle_id`, `driver_id`, `payment_method` | Serie objetivo |
| `vehicles` | `driving_restriction_day`, `vehicle_status`, `driver_id` | Días sin trabajo esperados (pico y placa), vehículos activos |
| `vehicle_expenses` | `expense_date`, `category` | Días probables en taller (`repair`, `bodywork`) |

## Datos faltantes
- Monto pactado de tarifa diaria por conductor (permite separar "no pagó" de "pagó menos").
- Calendario de festivos de Colombia (se puede incluir como lista estática o con la librería `holidays`).
- Días de inactividad registrados explícitamente.

## Features
| Feature | Cálculo |
|---|---|
| `dow` | Día de la semana (one-hot) |
| `is_restriction_day` | `dow == driving_restriction_day` del vehículo |
| `is_holiday`, `is_payday` | Festivo; quincena (días 15 y último del mes) |
| `lag_1`, `lag_7`, `lag_14` | Ingreso del vehículo 1, 7 y 14 días antes |
| `rolling_mean_7`, `rolling_mean_28` | Medias móviles |
| `active_vehicles` | Vehículos con `vehicle_status = 'active'` y conductor asignado (nivel flota) |
| `days_since_repair` | Días desde el último gasto `repair`/`bodywork` |

## Modelo
- **Baseline:** *seasonal naive* (mismo día de la semana anterior) y media móvil de 4 semanas por día de semana.
- **Propuesto:** `HistGradientBoostingRegressor` global (un solo modelo para todos los vehículos con `vehicle_id` como feature categórica). Funciona bien con pocas filas por vehículo porque comparte patrones.
- **Alternativas:** Prophet o `statsmodels` (SARIMAX) solo para la serie de flota; intervalos con `HistGradientBoostingRegressor(loss="quantile")` para P10/P90.

## Evaluación
- Validación temporal con `TimeSeriesSplit` (nunca mezclar futuro en el entrenamiento).
- Métricas: **MAE** en pesos y **WAPE** (`Σ|error| / Σ real`) — más interpretable que MAPE cuando hay días con ingreso 0.
- Publicar solo si mejora al baseline *seasonal naive* en ≥ 10 % de WAPE.

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `app/features/tarifas.py`, `app/models/revenue_forecast.py`, `GET /revenue/forecast?vehicleId=&days=30` |
| NestJS | `PredictionsService.getRevenueForecast()`, permiso `predictions.revenue` |
| Web | Línea punteada de pronóstico + banda P10–P90 sobre la gráfica de ganancias del dashboard |
| Móvil | Tarjeta "Esperado esta semana vs. recaudado" |

## Respuesta de ejemplo
```json
{
  "training": { "name": "revenue_forecast", "version": "1.0.0", "metrics": { "wape": 0.12, "baselineWape": 0.18 } },
  "fleet": [
    { "date": "2026-11-27", "expected": 1450000, "p10": 1280000, "p90": 1600000 }
  ],
  "vehicles": [
    { "vehicleId": 3, "plate": "ABC123", "next7Days": 420000, "last7Days": 350000, "deviation": -0.17 }
  ]
}
```

## Reentrenamiento
Diario (después de medianoche) y cuando cambie la firma de `tarifas` (conteo + suma + fecha máxima). El modelo es pequeño, entrena en segundos.

## Riesgos y limitaciones
- Si las tarifas se registran con retraso, los últimos días parecen bajos → excluir los 2 días más recientes del entrenamiento o usar `createdAt` para detectarlo.
- Cambios de tarifa pactada rompen la serie: agregar `tarifa_vigente` como feature cuando exista.
- Con menos de ~3 meses de historia, preferir el baseline.
