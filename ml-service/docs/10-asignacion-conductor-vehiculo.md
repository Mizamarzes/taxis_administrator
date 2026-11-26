# 10 · Asignación conductor ↔ vehículo

**Estado:** Propuesto · **Técnica:** Recomendación (factorización / regresión de pares) · **Valor:** Medio · **Esfuerzo:** Alto

## Problema de negocio
Cuando un vehículo queda sin conductor o entra un conductor nuevo, ¿qué combinación produce mejores resultados (ingreso estable, bajo costo de reparaciones, sin deuda)? Hoy `vehicles.driver_id` es único: cada vehículo tiene a lo sumo un conductor actual.

## Tipo de problema
Predecir el **desempeño de un par** (conductor, vehículo) y recomendar el mejor para la vacante. Se puede plantear como regresión: `score(par) = f(features del conductor, features del vehículo)`.

Score objetivo sugerido para pares históricos (por mes):

```
score = ingreso_neto_por_día_laborable − costo_correctivo_por_día − λ · deuda_generada_por_día
```

## Datos disponibles
| Tabla | Columnas | Uso |
|---|---|---|
| `tarifas` | `driver_id`, `vehicle_id`, `tarifa_date`, `amount` | Historial de pares reales e ingreso |
| `vehicle_expenses` | `driver_id`, `vehicle_id`, `category` | Costo correctivo atribuido al par |
| `deuda_movements` | `driver_id`, `vehicle_id`, `type`, `amount` | Deuda generada en el par |
| `drivers`, `vehicles` | estado, antigüedad | Elegibilidad |

## Datos faltantes
- **Historial de asignaciones** con fecha inicio/fin (hoy se infiere de `tarifas`, lo cual es aproximado).
- Preferencias o restricciones (turno, zona, licencia).

## Features
- Del conductor: segmentos del caso 08, riesgo del caso 03, antigüedad.
- Del vehículo: segmento del caso 08, km/día, costo por km, día de pico y placa.
- Del par: meses juntos, si ya trabajaron antes.

## Modelo
- **Baseline:** asignar el conductor disponible con mejor `tarifa_days_ratio` y menor riesgo de mora.
- **Propuesto:** `HistGradientBoostingRegressor` sobre las features combinadas del par (funciona con pocos pares, generaliza a pares no vistos).
- **Alternativa:** factorización de matrices (`TruncatedSVD` o `implicit`) si hay muchos pares históricos por conductor.
- **Optimización global** (reasignar varios a la vez): `scipy.optimize.linear_sum_assignment` sobre la matriz de scores.

## Evaluación
- Validación temporal sobre pares: entrenar con meses anteriores, medir MAE del score en el mes siguiente.
- *Ranking*: NDCG@3 del conductor que efectivamente rindió mejor.

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `app/models/assignment.py`, `GET /assignment/recommendations?vehicleId=` |
| NestJS | `PredictionsService.getAssignmentRecommendations()`, permiso `predictions.assignment` |
| Web | Al asignar conductor en el modal de vehículo: lista "Recomendados" con score y razones |

## Respuesta de ejemplo
```json
{
  "vehicleId": 4,
  "recommendations": [
    { "driverId": 11, "name": "Ana Gómez", "expectedScore": 92000, "reasons": ["pagos regulares", "bajo costo de reparación"] },
    { "driverId": 8, "name": "Luis Díaz", "expectedScore": 81000, "reasons": ["ya condujo este vehículo"] }
  ]
}
```

## Reentrenamiento
Mensual.

## Riesgos y limitaciones
- Es el caso con **más dependencia de datos**: requiere varios meses de historial de pares y los casos 03 y 08.
- Sesgo de selección: solo se observan pares que se asignaron; un conductor nuevo no tiene historial (usar solo features del conductor).
- Debe ser una sugerencia; la decisión final es del administrador.
