# 06 · Pronóstico de gastos de flota

**Estado:** Propuesto · **Técnica:** Regresión / series de tiempo · **Valor:** Medio · **Esfuerzo:** Medio

## Problema de negocio
Saber cuánto se va a gastar el próximo mes en mantenimiento, repuestos y reparaciones, por vehículo y por categoría, para presupuestar y apartar dinero de los ingresos (caso 02).

## Tipo de problema
Regresión del gasto mensual por vehículo y categoría. Componentes:
1. **Gastos recurrentes** (aceite, lavado, mantenimiento programado): predecibles con la tasa km/día (caso 01) y los intervalos del caso 05.
2. **Gastos correctivos** (`repair`, `bodywork`, `spare_part`): modelo de frecuencia × severidad.

## Datos disponibles
| Tabla | Columnas | Uso |
|---|---|---|
| `vehicle_expenses` | `vehicle_id`, `category`, `expense_date`, `odometer_km`, `next_service_km`, `next_service_date` | Eventos y programación |
| `vehicle_expense_items` | `quantity`, `unit_price`, `item_type` | Monto real (Σ `quantity × unit_price`) y desglose repuesto / mano de obra |

> Nota: `vehicle_expenses` no tiene columna de total; el monto se calcula sumando sus ítems.

## Features
| Feature | Cálculo |
|---|---|
| `spend_last_3m` por categoría | Gasto en los últimos 3 meses |
| `km_expected_next_month` | km/día (caso 01) × 30 |
| `scheduled_services_next_month` | Servicios con `next_service_date` o `next_service_km` alcanzable el próximo mes |
| `repairs_frequency_6m` | Número de reparaciones en 6 meses |
| `avg_ticket` por categoría | Gasto medio por evento |
| `labor_share` | Proporción mano de obra (`item_type = 'labor'`) |
| `month` | Estacionalidad (lluvias → más llantas, frenos) |

## Modelo
- **Baseline:** promedio móvil de 3 meses por vehículo y categoría.
- **Propuesto:**
  - Recurrentes: cálculo determinista = servicios esperados × ticket promedio.
  - Correctivos: modelo *Tweedie* (`HistGradientBoostingRegressor(loss="poisson")` o `TweedieRegressor`), adecuado para montos con muchos ceros y algunos valores altos.
- Total = suma de ambos; intervalo con regresión cuantílica.

## Evaluación
- Backtesting mensual (entrenar hasta el mes M, predecir M+1).
- **MAE** mensual por vehículo y **error relativo del total de flota** (lo que importa para presupuesto).

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `app/models/expense_forecast.py`, `GET /expenses/forecast?months=1&vehicleId=` |
| NestJS | `PredictionsService.getExpenseForecast()`, permiso `predictions.expenses` |
| Web | Tarjeta en dashboard: "Gasto esperado próximo mes" con desglose por categoría |

## Respuesta de ejemplo
```json
{
  "period": "2026-12",
  "fleetTotal": { "expected": 3200000, "p10": 2400000, "p90": 4800000 },
  "byCategory": [
    { "category": "oil_change", "expected": 900000, "kind": "scheduled" },
    { "category": "repair", "expected": 1500000, "kind": "corrective" }
  ],
  "byVehicle": [
    { "vehicleId": 3, "plate": "ABC123", "expected": 650000 }
  ]
}
```

## Reentrenamiento
Mensual (el 1 de cada mes) y manual.

## Riesgos y limitaciones
- Un siniestro grande distorsiona el promedio: usar medianas o recortar el percentil 99 en el entrenamiento.
- Inflación de precios de repuestos: ajustar montos históricos o usar solo los últimos 12 meses.
