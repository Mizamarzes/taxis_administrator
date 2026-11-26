# NN · Nombre del caso de uso

**Estado:** Propuesto · **Técnica:** … · **Valor:** Alto/Medio/Bajo · **Esfuerzo:** Alto/Medio/Bajo

## Problema de negocio
Qué decisión ayuda a tomar, quién la toma y con qué frecuencia.

## Tipo de problema
Regresión, clasificación, clustering, anomalías, supervivencia, etc. Variable objetivo.

## Datos disponibles
| Tabla | Columnas | Uso |
|---|---|---|

## Datos faltantes
Lo que habría que capturar para mejorar el modelo.

## Features
Variables derivadas y cómo se calculan.

## Modelo
- **Baseline:** regla o modelo simple con el que se compara.
- **Propuesto:** modelo principal.
- **Alternativas:** si el baseline no alcanza.

## Evaluación
Métrica, esquema de validación (temporal si hay fechas) y umbral mínimo para publicar.

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `app/models/...`, `GET /...` |
| NestJS | Método en `PredictionsService`, permiso en el catálogo |
| Web / móvil | Vista o widget |

## Respuesta de ejemplo
```json
{}
```

## Reentrenamiento
Frecuencia y disparadores.

## Riesgos y limitaciones
Sesgos, datos escasos, efectos no deseados.
