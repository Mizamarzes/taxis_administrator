# 03 · Riesgo de mora de conductores

**Estado:** Propuesto · **Técnica:** Clasificación binaria · **Valor:** Alto · **Esfuerzo:** Medio

## Problema de negocio
El módulo de deudas registra deudas (`debt`), abonos (`payment`) y condonaciones (`forgiveness`) por conductor. Saber **qué conductor tiene alta probabilidad de atrasarse** en los próximos días permite actuar antes: acuerdos de pago, ajuste de tarifa o reasignación del vehículo.

## Tipo de problema
Clasificación binaria. Para cada conductor y fecha de corte `t`:

> `y = 1` si en los próximos **14 días** el saldo de deuda aumenta más de un umbral (p. ej. una tarifa diaria) o se registra una condonación.

Se construye un *dataset* de "fotos" semanales: una fila por conductor por semana, con features calculadas solo con datos anteriores a `t`.

## Datos disponibles
| Tabla | Columnas | Uso |
|---|---|---|
| `deuda_movements` | `driver_id`, `type`, `amount`, `movement_date`, `payment_method` | Saldo, frecuencia de abonos, etiqueta |
| `tarifas` | `driver_id`, `tarifa_date`, `amount` | Regularidad de pago diario |
| `drivers` | `status`, `hire_date` | Antigüedad, estado |
| `vehicles` | `driver_id`, `vehicle_status` | ¿Tiene vehículo asignado y operativo? |
| `vehicle_expenses` | `driver_id`, `category`, `expense_date` | Reparaciones asociadas al conductor (proxy de siniestros) |

## Datos faltantes
- Tarifa pactada por conductor (para medir "pagó X % de lo debido").
- Historial de asignaciones con fechas (hoy `vehicles.driver_id` solo guarda la actual).

## Features
| Feature | Cálculo (ventana anterior a `t`) |
|---|---|
| `balance` | Σ debt − Σ payment − Σ forgiveness |
| `balance_trend_28d` | Pendiente del saldo en 28 días |
| `days_since_last_payment` | Días desde el último `payment` |
| `payment_ratio_28d` | Σ payment / Σ debt en 28 días |
| `tarifa_days_28d` | Días con tarifa registrada / días laborables esperados |
| `tarifa_cv_28d` | Coeficiente de variación del monto de tarifas |
| `forgiveness_count_90d` | Condonaciones en 90 días |
| `tenure_days` | `t − hire_date` |
| `repairs_90d` | Gastos `repair`/`bodywork` con ese `driver_id` |
| `cash_share` | Proporción de pagos en efectivo vs. digitales |

## Modelo
- **Baseline:** regla — `balance > 0` y `days_since_last_payment > 7`.
- **Propuesto:** `LogisticRegression` con `StandardScaler` (interpretable: los coeficientes explican el riesgo) y, si hay suficientes datos, `HistGradientBoostingClassifier` con `class_weight="balanced"`.
- **Calibración:** `CalibratedClassifierCV` para que la probabilidad sea confiable y se pueda mostrar como "riesgo 72 %".
- **Explicación:** top 3 features que más aportan por conductor (coeficiente × valor estandarizado, o `permutation_importance` global).

## Evaluación
- Split temporal: entrenar con semanas antiguas, validar con las más recientes.
- Métricas: **PR-AUC** (clases desbalanceadas), *recall* en el top 20 % de riesgo, *Brier score* para calibración.
- Publicar solo si supera la regla baseline en PR-AUC.

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `app/features/deudas.py`, `app/models/debt_risk.py`, `GET /debt-risk/predictions?driverId=` |
| NestJS | `PredictionsService.getDebtRisk()`, permiso `predictions.debt-risk` (datos sensibles: solo administración) |
| Web | Columna "Riesgo" en la lista de conductores y en el módulo de deudas, con explicación al pasar el cursor |
| Móvil | Lista de conductores priorizada para cobro |

## Respuesta de ejemplo
```json
{
  "predictions": [
    {
      "driverId": 7,
      "name": "Juan Pérez",
      "riskScore": 0.72,
      "riskLevel": "high",
      "balance": 380000,
      "reasons": ["days_since_last_payment", "balance_trend_28d", "tarifa_days_28d"]
    }
  ]
}
```

## Reentrenamiento
Semanal (las etiquetas necesitan 14 días para materializarse). Predicción diaria con el modelo vigente.

## Riesgos y limitaciones
- **Ética y uso:** es una herramienta de apoyo, no un criterio automático de despido o sanción. Mostrar razones y no usar datos personales (nombre, dirección, teléfono) como features.
- Pocos conductores → pocas filas; el modelo logístico regularizado es más estable que uno de árboles.
- Profecía autocumplida: si se retira el vehículo a quien tiene riesgo alto, cambia el comportamiento futuro. Registrar las acciones tomadas.
