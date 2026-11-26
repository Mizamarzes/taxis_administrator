# 12 · ¿El conductor va a traer la tarifa hoy?

**Estado:** 🧪 En notebook (`notebooks/12_va_a_pagar_tarifa.ipynb`) · **Técnica:** Clasificación binaria (regresión logística) · **Valor:** Alto · **Esfuerzo:** Bajo

## Problema de negocio

Cada mañana el administrador necesita saber **a qué conductores llamar primero** porque tienen más riesgo de no traer la tarifa.

Lo que se observa en la operación: **cuando un conductor se empieza a estancar con deudas, deja de pagar la tarifa**. Cada tarifa que no paga se suma a su deuda, la deuda crece y es cada vez menos probable que pague: un efecto bola de nieve.

### Por qué este caso y no el pronóstico de ingresos

El caso [02](02-pronostico-de-ingresos.md) se probó y se descartó. Como cada día solo hay dos opciones (paga la tarifa o no paga), el ingreso esperado es una fórmula:

```
ingreso esperado = días que trabaja × tarifa × % de días que paga − descuentos por reparación
```

Un promedio por taxi y día de la semana calculado en SQL igualó al modelo (6.5 % contra 6.6 % de error semanal en 10 flotas sintéticas). La única parte difícil de esa fórmula es **"% de días que paga"**, y eso es justo lo que resuelve este caso.

## Tipo de problema

**Clasificación binaria**: para cada conductor y cada día que trabaja, predecir la **probabilidad** de que traiga la tarifa (`trajo_tarifa = 1`) o no (`0`).

- Se predice **hoy** usando la información **hasta ayer**. El horizonte es de 1 día, así que sí se puede usar lo que pasó ayer.
- Los días de pico y placa se excluyen, porque ese día no se espera tarifa.
- Es **por conductor**: la decisión de pagar es de la persona, no del vehículo.

## Datos

| Tabla | Columnas | Uso |
|---|---|---|
| `tarifas` | `driver_id`, `tarifa_date`, `amount` | Si trajo la tarifa ese día y cuál es su tarifa habitual |
| `deuda_movements` | `driver_id`, `movement_date`, `type` (`debt` / `payment` / `forgiveness`), `amount` | Saldo de deuda día a día y fecha del último abono |
| `vehicles` | `driver_id`, `plate`, `driving_restriction_day` | Placa y día de pico y placa |
| `drivers` | `id`, `name`, `deletedAt` | Conductores activos |

El saldo se calcula igual que en `DeudasService.queryBalances()`: `debt − payment − forgiveness`.

### Supuestos que hay que confirmar con la operación real

| Supuesto | Por qué importa |
|---|---|
| Cuando un conductor **no trae la tarifa**, se registra como `debt` en `deuda_movements` | Es lo que hace crecer la deuda y genera el efecto bola de nieve |
| La **tarifa de cada conductor** es la mediana de lo que paga | No hay una columna de tarifa pactada; si existiera, se usaría esa |
| Un pago menor por una reparación cuenta como "trajo la tarifa" | Hoy no se puede distinguir de un pago parcial, porque la tarifa no está enlazada al gasto |
| El conductor no cambia de vehículo | El historial de asignaciones no se guarda (`vehicles.driver_id` es solo la asignación actual) |

## Pistas (features)

El modelo usa solo **2**:

| Pista | Cálculo | Qué representa |
|---|---|---|
| `deuda_en_tarifas` | Saldo de deuda al cierre de ayer ÷ tarifa del conductor | **Cuánto debe**. Se mide en tarifas para comparar conductores con tarifas distintas |
| `dias_sin_abonar` | Días desde el último `payment` (tope 60); `0` si no debe nada | **Si está estancado** con la deuda |

Además se calcula `pago_4_semanas` (proporción de los últimos 24 días de trabajo en que trajo la tarifa), pero **no es pista del modelo**: es la regla simple contra la que se compara.

### Pistas descartadas

| Pista | Por qué se descartó |
|---|---|
| `pago_4_semanas` | No mejora la detección y su peso sale con el signo al revés: repite información que ya está en la deuda |
| `dias_sin_pagar` (racha de días seguidos sin pagar) | Igual que la anterior: cada día sin pagar ya se suma a `deuda_en_tarifas` |
| Lluvia, festivos, ferias | La tarifa es una cuota fija: no cambia lo que el conductor le paga al administrador. Solo valdría la pena si los datos reales muestran que cambia la probabilidad de pagar |

Comparación en 10 flotas sintéticas (no pagos detectados con 2 llamadas por día):

| Pistas | Detectados |
|---|---|
| Las 4 pistas | 64 % |
| `pago_4_semanas` + deuda + días sin abonar | 64 % |
| `deuda_en_tarifas` + `dias_sin_abonar` | **65 %** |
| Solo `deuda_en_tarifas` | 65 % |

Se eligieron las 2 de deuda: detectan lo mismo, sus pesos siempre tienen el signo lógico y coinciden con lo que se observa en la operación.

## Modelo

| | Qué es | Cómo da la probabilidad |
|---|---|---|
| **Azar** | Elegir conductores sin ningún criterio | Número aleatorio |
| **Regla simple** (baseline) | "La probabilidad de pagar hoy es el % de días que pagó en las últimas 4 semanas" | `pago_4_semanas` |
| **Modelo** | `LogisticRegression(max_iter=1000)` con las 2 pistas | `predict_proba(...)[:, 1]` |

Pesos aprendidos (semilla 42): `deuda_en_tarifas = −0.39`, `dias_sin_abonar = −0.02`. Los dos son negativos: más deuda y más días sin abonar → menos probabilidad de traer la tarifa.

## Evaluación

- **Examen:** las últimas **8 semanas**, que el modelo nunca vio. Son 8 y no 4 porque los días sin pago son pocos.
- **No se usa el % de aciertos.** Como los conductores pagan ~91–94 % de los días, la regla "todos pagan siempre" acierta el 91 % y no detecta ningún día sin pago.
- **Métrica: la lista de llamadas.** Cada día del examen se llama a los `LLAMADAS_POR_DIA = 2` conductores con menor probabilidad. Se mide qué porcentaje de los días sin tarifa estaba en esa lista.

### Resultados (datos sintéticos)

| Método | Semilla 42 (35 días sin tarifa) | Promedio de 10 semillas |
|---|---|---|
| Al azar | 34 % | 28 % |
| Regla simple | 60 % | 58 % |
| **Modelo** | **69 %** | **65 %** |

> ⚠️ Los datos sintéticos se generaron con la regla "más deuda y más días sin abonar → menos probabilidad de pagar" (`datos_pagos.py`), así que el modelo la encuentra. Estos números **validan el método**, no la flota real.

**Criterio para pasar a producción:** con datos reales (`FUENTE = "real"`, ≥ 3 meses de historia), el modelo debe detectar claramente más días sin tarifa que la regla simple. Si no lo hace, basta con la regla simple en SQL desde el backend.

## Generador sintético (`notebooks/datos_pagos.py`)

8 conductores durante 365 días. Cada uno tiene tarifa, día de pico y placa, nivel de cumplimiento sin deuda (0.95–0.98) y disciplina para abonar (probabilidad diaria de abonar si debe, 0.12–0.40).

| Evento | Regla |
|---|---|
| Deuda nueva (multa, daño, préstamo) | 0.6 % de los días, por 100 000 – 300 000 |
| Abono | Si debe, con probabilidad = disciplina, por 1–3 tarifas |
| Condonación | Si debe más de 6 tarifas, 5 % de los días, la mitad del saldo |
| Probabilidad de traer la tarifa | `cumplimiento − 0.04 × min(deuda en tarifas, 5) − 0.30 si lleva más de 10 días sin abonar` |
| No trae la tarifa | Se registra como `debt` por el valor de la tarifa |

Resultado: ~94 % de días pagados en promedio, con rachas malas cuando un conductor se endeuda.

## Integración propuesta

| Capa | Elemento |
|---|---|
| ml-service | `app/repositories/payments_repository.py` (las consultas de `datos_pagos.py`, por `driver_id` en lugar de `name`), `app/features/payments.py` (`armar_dias`, `agregar_pistas`), `app/models/payment_risk.py`, `GET /payment-risk/today` |
| NestJS | `PredictionsService.getPaymentRiskToday()`, permiso nuevo `predictions.payment-risk` en `permissions.catalog.ts` |
| Web | Tarjeta "Llamar hoy" en el dashboard y columna de probabilidad en el módulo de deudas |
| Móvil | Lista de llamadas del día, ordenada por riesgo |

### Respuesta de ejemplo

```json
{
  "date": "2026-11-26",
  "training": {
    "name": "payment_risk",
    "version": "1.0.0",
    "weights": { "deudaEnTarifas": -0.39, "diasSinAbonar": -0.02 },
    "metrics": { "detectedModel": 0.69, "detectedBaseline": 0.60, "callsPerDay": 2 }
  },
  "restingToday": ["Diana"],
  "drivers": [
    {
      "driverId": 6,
      "name": "Fabián",
      "plate": "PQR678",
      "probability": 0.92,
      "debtInTarifas": 2.0,
      "daysWithoutPayment": 22,
      "paidLast4Weeks": 0.88
    }
  ]
}
```

Se ordena de menor a mayor `probability`. Las pistas acompañan a cada conductor para explicar **por qué** está en la lista ("debe 2 tarifas y lleva 22 días sin abonar").

## Reentrenamiento

- **Modelo:** semanal, o cuando cambie la firma de `tarifas` + `deuda_movements`. Entrena en milisegundos.
- **Predicción:** cada mañana con el modelo vigente, usando los datos hasta ayer.

## Riesgos y limitaciones

- **Uso responsable:** es una ayuda para priorizar llamadas, no un criterio para sancionar o quitar el vehículo. No usa datos personales como pistas (solo deuda y pagos).
- **Calidad del registro:** si las tarifas o las deudas no se registran a tiempo, el modelo ve deudas o días sin pago que no existen.
- **Profecía autocumplida:** si se llama a un conductor y gracias a eso paga, el modelo "se equivocó" aunque haya servido. Conviene registrar a quién se llamó.
- **Pocos conductores:** con 8 conductores hay pocos días sin pago para aprender; por eso se usa el modelo más simple y solo 2 pistas.

## Próximos pasos

1. Confirmar los supuestos de la sección **Datos** con la operación real.
2. Acumular ≥ 3 meses de tarifas y deudas reales y repetir el examen con `FUENTE = "real"`.
3. Si el modelo le gana a la regla simple, llevarlo a `app/` siguiendo la sección **Integración propuesta**.
4. Complementa al caso [03 · Riesgo de mora](03-riesgo-de-mora.md), que mira a 14 días y si la deuda va a crecer. Este caso responde lo inmediato: ¿trae la tarifa hoy?
