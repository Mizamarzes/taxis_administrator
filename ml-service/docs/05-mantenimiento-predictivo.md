# 05 · Mantenimiento predictivo general

**Estado:** Propuesto · **Técnica:** Análisis de supervivencia · **Valor:** Medio · **Esfuerzo:** Medio

## Problema de negocio
El caso 01 cubre el aceite porque existe `next_service_km`. Para llantas, frenos, suspensión, batería o reparaciones mayores no hay un objetivo explícito, pero el historial muestra **cada cuántos km o días** suelen ocurrir. Anticiparlos permite:
- Comprar repuestos con tiempo y a mejor precio.
- Programar el taller en el día de pico y placa del vehículo (cuando igual no trabaja).
- Reducir días perdidos por fallas imprevistas.

## Tipo de problema
Supervivencia (*time-to-event*): para cada vehículo y tipo de evento, estimar la probabilidad de que ocurra en los próximos N km / días. Los vehículos que aún no han tenido el evento desde el último son **observaciones censuradas** (no se descartan).

Eventos (de `vehicle_expenses.category` y de `vehicle_expense_items.description`):
- `tires`
- `repair` (cualquier reparación correctiva)
- Ítems específicos por palabra clave: pastillas de freno, batería, amortiguadores, correa de distribución, embrague.

## Datos disponibles
| Tabla | Columnas | Uso |
|---|---|---|
| `vehicle_expenses` | `vehicle_id`, `category`, `expense_date`, `odometer_km` | Fechas y km de cada evento |
| `vehicle_expense_items` | `description`, `brand`, `item_type` | Identificar el componente reemplazado |
| Caso 01 | km/día por vehículo | Convertir días ↔ km y estimar km actual |

## Datos faltantes
- Año, marca y modelo del vehículo (los intervalos varían mucho entre modelos).
- `odometer_km` obligatorio en gastos de mantenimiento.
- Un campo "componente" estructurado en los ítems (o usar el caso 09).

## Features
| Feature | Cálculo |
|---|---|
| `duration` | km (o días) entre dos eventos del mismo tipo; o desde el último hasta hoy si está censurado |
| `event` | 1 si ocurrió, 0 si censurado |
| `km_per_day` | Del caso 01 (uso intensivo desgasta más) |
| `repairs_last_180d` | Reparaciones recientes (vehículo deteriorado) |
| `brand` del repuesto anterior | Calidad del componente |
| `driver_changes` | Cambios de conductor (cuando exista el historial) |

## Modelo
- **Baseline:** intervalo mediano de la flota por tipo de evento (Kaplan-Meier).
- **Propuesto:** `lifelines` — `KaplanMeierFitter` por tipo de evento y `CoxPHFitter` o `WeibullAFTFitter` con las features para personalizar por vehículo.
- **Alternativa en scikit-learn puro:** `scikit-survival` (`RandomSurvivalForest`) si crece el volumen de datos.

## Evaluación
- **Índice de concordancia (C-index)**: ¿el modelo ordena bien qué vehículo falla primero?
- **Integrated Brier Score** para la calibración de la curva.
- Split temporal por fecha de evento.

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `app/features/maintenance_events.py`, `app/models/maintenance_survival.py`, `GET /maintenance/predictions?vehicleId=` |
| NestJS | `PredictionsService.getMaintenancePredictions()`, permiso `predictions.maintenance` |
| Web | Tabla por vehículo: componente, km estimados restantes, probabilidad de falla en 30 días |
| Móvil | Recordatorio al conductor: "Revisa frenos, ~1 200 km estimados" |

## Respuesta de ejemplo
```json
{
  "predictions": [
    {
      "vehicleId": 3,
      "plate": "ABC123",
      "component": "tires",
      "kmSinceLast": 38500,
      "medianIntervalKm": 45000,
      "probabilityNext30Days": 0.41,
      "suggestedDate": "2026-12-10",
      "suggestedReason": "día de pico y placa"
    }
  ]
}
```

## Reentrenamiento
Semanal; la curva de flota cambia lentamente. Predicciones diarias usando el km actual estimado del caso 01.

## Riesgos y limitaciones
- Pocos eventos por componente al inicio: empezar con Kaplan-Meier de flota y personalizar después.
- Mantenimiento preventivo frecuente "censura" fallas reales; el modelo aprende la política actual, no la vida útil física.
- Dependencia nueva (`lifelines`) en `requirements.txt`.
