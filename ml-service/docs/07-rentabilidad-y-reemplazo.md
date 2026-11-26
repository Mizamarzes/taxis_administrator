# 07 · Rentabilidad y reemplazo de vehículos

**Estado:** Propuesto · **Técnica:** Regresión de tendencia + reglas de negocio · **Valor:** Alto · **Esfuerzo:** Medio

## Problema de negocio
¿Qué vehículos generan más margen? ¿Cuál está costando más de lo que produce y conviene venderlo o reemplazarlo? Hoy el dashboard tiene un ranking de ingresos (`getRanking`), pero no descuenta gastos ni muestra la tendencia.

## Tipo de problema
1. **Descriptivo**: margen neto por vehículo = ingresos (`tarifas`) − gastos (`vehicle_expense_items`).
2. **Predictivo**: tendencia del margen y del **costo por km** en los próximos 6–12 meses.
3. **Decisión**: punto en que el costo acumulado de mantener supera el costo de reemplazar (modelo clásico de *equipment replacement*).

## Datos disponibles
| Tabla | Columnas | Uso |
|---|---|---|
| `tarifas` | `vehicle_id`, `tarifa_date`, `amount` | Ingresos |
| `vehicle_expenses` + `vehicle_expense_items` | `vehicle_id`, `expense_date`, `category`, `quantity`, `unit_price` | Gastos |
| Caso 01 | km/día, km actual estimado | Costo por km |
| `vehicles` | `vehicle_status` | Días fuera de servicio |

## Datos faltantes
- Año del vehículo, precio de compra y valor comercial estimado (para el cálculo de reemplazo).
- Costos fijos por vehículo (SOAT, seguro, impuestos, cuota de crédito); se podrían registrar como gastos `other` o en una tabla nueva.

## Features / indicadores
| Indicador | Cálculo |
|---|---|
| `monthly_revenue`, `monthly_cost`, `monthly_margin` | Agregados mensuales |
| `cost_per_km` | `monthly_cost / km_mes` |
| `repair_cost_share` | Correctivo / total de gastos |
| `downtime_days` | Días sin tarifas en días laborables |
| `margin_trend` | Pendiente de `monthly_margin` en 12 meses (`TheilSenRegressor`, robusto) |
| `cost_per_km_trend` | Pendiente del costo por km |

## Modelo
- **Baseline:** margen de los últimos 3 meses.
- **Propuesto:** proyección de ingresos (caso 02) y gastos (caso 06) a 12 meses + tendencia robusta del costo por km. Regla de alerta: `cost_per_km_trend > 0` y `margin_next_6m < umbral` → candidato a revisión.
- **Reemplazo:** costo anual equivalente (EAC) = (depreciación + costos de operación acumulados) / años. El momento óptimo es el mínimo de la curva EAC.

## Evaluación
- Backtesting: margen proyectado a 3 meses vs. real (MAE en pesos).
- La recomendación de reemplazo se valida con el administrador; no hay "verdad" automática.

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `app/models/profitability.py`, `GET /profitability?vehicleId=&months=12` |
| NestJS | `PredictionsService.getProfitability()`, permiso `predictions.profitability` |
| Web | Vista "Rentabilidad": tabla con margen, costo/km, tendencia (flecha) y badge "Revisar reemplazo" |
| Dashboard | Ranking por **margen** además de ingresos |

## Respuesta de ejemplo
```json
{
  "vehicles": [
    {
      "vehicleId": 5,
      "plate": "XYZ789",
      "last3Months": { "revenue": 5400000, "cost": 2100000, "margin": 3300000 },
      "costPerKm": 142,
      "costPerKmTrend": "up",
      "projectedMargin6m": 5100000,
      "recommendation": "review_replacement",
      "reasons": ["costo por km +35 % en 12 meses", "18 días fuera de servicio en 90 días"]
    }
  ]
}
```

## Reentrenamiento
Mensual. Depende de que 02 y 06 estén entrenados.

## Riesgos y limitaciones
- Atribuir ingresos al vehículo y no al conductor: un mal margen puede deberse al conductor. Cruzar con el caso 08.
- Sin precio de compra / valor comercial, la parte de reemplazo es solo cualitativa.
