# 04 · Detección de anomalías

**Estado:** Propuesto · **Técnica:** No supervisado (z-score robusto, Isolation Forest) · **Valor:** Alto · **Esfuerzo:** Bajo

## Problema de negocio
Errores de digitación y registros atípicos afectan los reportes y a los demás modelos. Además, algunos patrones pueden indicar fraude o problemas operativos:
- Odómetro que retrocede o salta 5 000 km en un día.
- Gasto con precio unitario 10 veces mayor al habitual para el mismo repuesto.
- Tarifa con un monto muy distinto al del conductor, o tarifa duplicada el mismo día.
- Vehículo con demasiados gastos de reparación en poco tiempo.

## Tipo de problema
Detección de anomalías sin etiquetas. Se devuelve un **puntaje** y una **razón**; un humano confirma.

## Subdetectores

### 4.1 Odómetro
| Regla / modelo | Detalle |
|---|---|
| Retroceso | `odometer_km` menor que la lectura anterior del mismo vehículo |
| Salto imposible | km/día entre lecturas > percentil 99 de la flota o > 600 km/día |
| Fuera de tendencia | Residuo de la regresión del caso 01 con `|z robusto| > 3.5` (mediana y MAD) |

Hoy `clean_readings` descarta silenciosamente las lecturas que bajan; este detector permitiría **mostrarlas** para corregirlas en origen.

### 4.2 Gastos e ítems
| Feature | Fuente |
|---|---|
| `unit_price` normalizado por `description`/`brand` | `vehicle_expense_items` |
| Total del gasto (Σ `quantity × unit_price`) por `category` | `vehicle_expense_items` + `vehicle_expenses` |
| Frecuencia de la categoría para el vehículo en 30 días | `vehicle_expenses` |
| Mismo `invoice_number` + `supplier` repetido | Duplicados |

Modelo: z-score robusto por grupo (categoría, descripción normalizada) para precios; `IsolationForest` sobre el vector `[total, frecuencia_30d, km_desde_último_mismo_gasto]` para patrones combinados.

### 4.3 Tarifas
| Regla / modelo | Detalle |
|---|---|
| Duplicado | Mismo `driver_id`, `vehicle_id`, `tarifa_date`, `amount` |
| Monto atípico | `|z robusto| > 3.5` respecto al historial del conductor |
| Tarifa en día de pico y placa | `dow(tarifa_date) == driving_restriction_day` (puede ser válida, pero vale revisar) |
| Conductor ≠ conductor asignado | `tarifas.driver_id` distinto de `vehicles.driver_id` |

## Modelo
- **Baseline:** las reglas anteriores (deterministas, explicables, sin entrenamiento).
- **Propuesto:** reglas + `IsolationForest(contamination="auto")` para combinaciones que ninguna regla ve.
- Mantener el detector como **lista de hallazgos** con `severity` (`info`, `warning`, `critical`).

## Evaluación
Sin etiquetas iniciales: revisión manual de los top N hallazgos por semana. Agregar un botón "Es correcto / Es error" en la UI y guardar la respuesta (en NestJS, no en el ML service, que es solo lectura) para medir **precisión** y luego entrenar un clasificador supervisado.

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `app/models/anomalies.py`, `GET /anomalies?entity=odometer|expense|tarifa&from=&to=` |
| NestJS | `PredictionsService.getAnomalies()`, permiso `predictions.anomalies`; tabla `anomaly_reviews` para la retroalimentación |
| Web | Bandeja "Registros a revisar" con enlace al gasto o tarifa |
| Formularios | Validación en vivo: al guardar un gasto, NestJS consulta `POST /anomalies/score` y muestra una advertencia no bloqueante |

## Respuesta de ejemplo
```json
{
  "findings": [
    {
      "entity": "expense_item",
      "entityId": 512,
      "vehicleId": 3,
      "severity": "warning",
      "score": 0.91,
      "reason": "unit_price 450000 es 6.2× la mediana de 'filtro de aceite'",
      "detectedAt": "2026-11-26"
    }
  ]
}
```

## Reentrenamiento
Las reglas no se entrenan. `IsolationForest` semanal. Las medianas por grupo se recalculan diariamente.

## Riesgos y limitaciones
- Muchos falsos positivos agotan al usuario: empezar con umbrales estrictos y pocos hallazgos.
- Repuestos con descripciones libres distintas ("filtro aceite", "Filtro de aceite Mann") requieren normalización; el caso [09](09-clasificacion-de-gastos.md) ayuda.
