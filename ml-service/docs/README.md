# Documentación del ML Service

Catálogo de casos de uso de machine learning para Taxis Administrator, construido a partir de los datos que **ya existen** en PostgreSQL.

| Documento | Contenido |
|---|---|
| [00-arquitectura.md](00-arquitectura.md) | Cómo está construido el microservicio y cómo se integra con NestJS, web y móvil |
| [00-plantilla-caso-de-uso.md](00-plantilla-caso-de-uso.md) | Plantilla para documentar un modelo nuevo |

## Casos de uso

| # | Caso de uso | Técnica | Tablas | Estado | Valor | Esfuerzo |
|---|---|---|---|---|---|---|
| 01 | [Próximo cambio de aceite](01-cambio-de-aceite.md) | Regresión lineal por vehículo | `vehicle_expenses` | ✅ Implementado (v1) | Alto | — |
| 02 | [Pronóstico de ingresos por tarifas](02-pronostico-de-ingresos.md) | Series de tiempo / regresión | `tarifas`, `vehicles` | ❌ Descartado: basta una fórmula en SQL (ver 12) | — | — |
| 03 | [Riesgo de mora de conductores](03-riesgo-de-mora.md) | Clasificación binaria | `deuda_movements`, `tarifas`, `drivers` | Propuesto | Alto | Medio |
| 04 | [Detección de anomalías](04-deteccion-de-anomalias.md) | No supervisado (Isolation Forest, z-score robusto) | `tarifas`, `vehicle_expenses`, `vehicle_expense_items` | Propuesto | Alto | Bajo |
| 05 | [Mantenimiento predictivo general](05-mantenimiento-predictivo.md) | Análisis de supervivencia | `vehicle_expenses` | Propuesto | Medio | Medio |
| 06 | [Pronóstico de gastos de flota](06-pronostico-de-gastos.md) | Regresión / series de tiempo | `vehicle_expenses`, `vehicle_expense_items` | Propuesto | Medio | Medio |
| 07 | [Rentabilidad y reemplazo de vehículos](07-rentabilidad-y-reemplazo.md) | Regresión + reglas de negocio | `tarifas`, `vehicle_expenses` | Propuesto | Alto | Medio |
| 08 | [Segmentación de vehículos y conductores](08-segmentacion.md) | Clustering (K-Means) | `tarifas`, `vehicle_expenses`, `deuda_movements` | Propuesto | Medio | Bajo |
| 09 | [Clasificación automática de gastos](09-clasificacion-de-gastos.md) | NLP (TF-IDF + regresión logística) | `vehicle_expenses`, `vehicle_expense_items` | Propuesto | Medio | Bajo |
| 10 | [Asignación conductor ↔ vehículo](10-asignacion-conductor-vehiculo.md) | Sistema de recomendación | `tarifas`, `deuda_movements`, `vehicles` | Propuesto | Medio | Alto |
| 11 | [Lectura de facturas y documentos (OCR)](11-ocr-documentos.md) | Visión por computador / OCR | `vehicle_documents`, `media_tarifas` | Exploratorio | Medio | Alto |
| 12 | [¿El conductor va a traer la tarifa hoy?](12-va-a-traer-la-tarifa.md) | Clasificación binaria (regresión logística) | `tarifas`, `deuda_movements`, `vehicles` | 🧪 En notebook | Alto | Bajo |

## Orden recomendado

1. **12 – ¿Va a traer la tarifa hoy?**: en curso en `notebooks/12_va_a_pagar_tarifa.ipynb`. Impacto directo en caja y la deuda es una señal clara.
2. **04 – Anomalías**: barato, sin etiquetas, mejora la calidad de los datos que usan todos los demás modelos (incluido el de aceite).
3. **03 – Riesgo de mora**: extiende el 12 a 14 días.
4. **07 – Rentabilidad**: ingresos con la fórmula del 12 y gastos del 06 en una vista de decisión.
5. El resto según necesidad.

## Requisitos de datos transversales

Varios modelos mejoran mucho si se captura mejor la información de origen:

| Dato | Dónde | Beneficia a |
|---|---|---|
| `odometer_km` en **todos** los gastos (hoy es opcional) | `vehicle_expenses` | 01, 05, 06, 07 |
| Días en que el vehículo no trabajó (taller, pico y placa, sin conductor) | Nueva tabla o `vehicle_status` con historial | 02, 07 |
| Monto pactado de la tarifa diaria por conductor | `drivers` o `settings` | 02, 03, 04 |
| Año, marca y modelo del vehículo | `vehicles` | 05, 06, 07, 08 |
| Historial de asignaciones conductor ↔ vehículo con fechas | Nueva tabla | 03, 10 |
