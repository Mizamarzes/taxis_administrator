# 08 · Segmentación de vehículos y conductores

**Estado:** Propuesto · **Técnica:** Clustering (K-Means, clustering jerárquico) · **Valor:** Medio · **Esfuerzo:** Bajo

## Problema de negocio
Agrupar vehículos y conductores por comportamiento para aplicar políticas distintas, en lugar de tratar a todos igual:
- **Vehículos**: "alto uso y bajo costo", "alto costo correctivo", "subutilizado", etc.
- **Conductores**: "puntual y estable", "irregular con deuda", "nuevo", etc.

También es un excelente primer ejercicio de ML con los datos del sistema (ya sugerido en `notebooks/README.md`).

## Tipo de problema
No supervisado. Se buscan grupos y se les pone nombre a partir de sus centroides.

## Datos y features

### Vehículos (ventana de 6 meses)
| Feature | Fuente |
|---|---|
| `km_per_day` | Caso 01 |
| `revenue_per_working_day` | `tarifas` |
| `cost_per_km` | `vehicle_expense_items` + caso 01 |
| `share_repair`, `share_tires`, `share_bodywork`, `share_maintenance` | Proporción del gasto por `category` |
| `downtime_ratio` | Días sin tarifa / días laborables |

### Conductores (ventana de 90 días)
| Feature | Fuente |
|---|---|
| `tarifa_days_ratio` | `tarifas` |
| `tarifa_amount_cv` | Variabilidad del monto |
| `avg_balance`, `max_balance` | `deuda_movements` |
| `days_to_pay_debt` | Tiempo medio entre `debt` y el `payment` que lo cubre |
| `digital_payment_share` | `payment_method` en `nequi`, `daviplata`, tarjetas |
| `tenure_days` | `drivers.hire_date` |
| `repairs_attributed` | `vehicle_expenses.driver_id` con `repair`/`bodywork` |

## Modelo
- Preprocesamiento: `RobustScaler` (resiste outliers) y, si hay muchas features, `PCA` para visualizar en 2D.
- **Propuesto:** `KMeans` con `k` entre 3 y 6 elegido por **silhouette score** y por interpretabilidad.
- **Alternativas:** `AgglomerativeClustering` (dendrograma útil para explicar) o `GaussianMixture` (pertenencia suave).
- **Etiquetado:** reglas sobre el centroide (p. ej. `cost_per_km` en el cuartil superior → "Alto costo").

## Evaluación
- Silhouette y Davies-Bouldin.
- **Estabilidad**: correr con varias semillas / submuestras y medir el *Adjusted Rand Index*; si los grupos cambian mucho, reducir `k`.
- Validación de negocio: ¿el administrador reconoce los grupos?

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `app/models/segmentation.py`, `GET /segments/vehicles`, `GET /segments/drivers` |
| NestJS | `PredictionsService.getSegments()`, permiso `predictions.segments` |
| Web | Badge de segmento en las listas de vehículos y conductores; gráfico de dispersión PCA en una vista de análisis |

## Respuesta de ejemplo
```json
{
  "training": { "k": 4, "silhouette": 0.41 },
  "segments": [
    { "id": 0, "label": "Alto uso, bajo costo", "size": 6, "centroid": { "kmPerDay": 210, "costPerKm": 85 } },
    { "id": 2, "label": "Alto costo correctivo", "size": 2, "centroid": { "kmPerDay": 160, "costPerKm": 190 } }
  ],
  "members": [
    { "vehicleId": 3, "plate": "ABC123", "segmentId": 0 }
  ]
}
```

## Reentrenamiento
Mensual. Mantener los nombres estables entre entrenamientos alineando los nuevos centroides con los anteriores (asignación húngara por distancia).

## Riesgos y limitaciones
- Flotas pequeñas (< 15 vehículos) dan grupos poco significativos; en ese caso basta con percentiles y cuadrantes (ingreso alto/bajo × costo alto/bajo).
- Los segmentos de conductores no deben usarse como única base para decisiones disciplinarias.
