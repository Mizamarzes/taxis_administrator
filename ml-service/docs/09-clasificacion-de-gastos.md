# 09 · Clasificación automática de gastos

**Estado:** Propuesto · **Técnica:** NLP clásico (TF-IDF + regresión logística) · **Valor:** Medio · **Esfuerzo:** Bajo

## Problema de negocio
Al registrar un gasto, el usuario escribe descripciones libres en los ítems ("cambio pastillas delanteras", "aceite 20W50 Mobil", "alineación y balanceo"). Elegir la categoría correcta y normalizar el componente es tedioso y genera inconsistencias que afectan los casos 04, 05 y 06.

Objetivos:
1. **Sugerir la categoría** (`oil_change`, `tires`, `repair`, …) y el `item_type` (`part`, `fluid`, `labor`, `other`) mientras se escribe.
2. **Normalizar el componente** ("pastillas", "Pastillas de freno Bosch" → `brake_pads`) para análisis.
3. **Sugerir precio esperado** del ítem a partir de los históricos.

## Tipo de problema
Clasificación de texto multiclase. Etiquetas ya existentes en los datos: `vehicle_expenses.category` y `vehicle_expense_items.item_type`.

## Datos disponibles
| Tabla | Columnas | Uso |
|---|---|---|
| `vehicle_expense_items` | `description`, `brand`, `unit`, `item_type`, `unit_price` | Texto de entrada, etiqueta de tipo, precio |
| `vehicle_expenses` | `category`, `description`, `supplier` | Etiqueta de categoría, contexto |

## Features
- Texto concatenado: `description + brand + supplier`, en minúsculas, sin tildes.
- `TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5))`: los n-gramas de caracteres toleran errores de ortografía y abreviaturas ("pastil", "filtr").
- Opcional: `TfidfVectorizer` de palabras para combinar.

## Modelo
- **Baseline:** diccionario de palabras clave por categoría.
- **Propuesto:** `Pipeline(TfidfVectorizer → LogisticRegression(class_weight="balanced"))`. Rápido (milisegundos), funciona con cientos de ejemplos y da probabilidades para mostrar "sugerido" solo si `p > 0.7`.
- **Normalización de componente:** catálogo manual de ~30 componentes + clasificador entrenado con ejemplos etiquetados por el administrador, o similitud coseno TF-IDF contra el catálogo.
- **Precio esperado:** mediana de `unit_price` de los vecinos más cercanos (`NearestNeighbors` sobre el TF-IDF) de los últimos 12 meses.
- **Alternativa avanzada:** *embeddings* de un modelo de lenguaje multilingüe si el vocabulario crece mucho.

## Evaluación
- `StratifiedKFold` (5 folds); métricas **macro-F1** y *top-2 accuracy*.
- Matriz de confusión para detectar categorías ambiguas (`maintenance` vs. `repair`).

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `app/models/expense_classifier.py`, `POST /expenses/classify` con `{ "text": "..." }` |
| NestJS | `PredictionsService.classifyExpense()`, permiso de creación de gastos (`gastos.create`) |
| Web / móvil | Autocompletar en el formulario de gasto con *debounce* de 300 ms; el usuario siempre confirma |

## Respuesta de ejemplo
```json
{
  "category": { "value": "repair", "probability": 0.84 },
  "itemType": { "value": "part", "probability": 0.91 },
  "component": "brake_pads",
  "expectedUnitPrice": { "median": 120000, "p25": 95000, "p75": 140000, "samples": 14 }
}
```

## Reentrenamiento
Diario o cuando cambie la firma de `vehicle_expense_items`. Entrena en segundos.

## Riesgos y limitaciones
- Si las etiquetas históricas son inconsistentes, el modelo aprende esa inconsistencia: revisar la matriz de confusión y limpiar.
- Es un endpoint de **baja latencia** que se llama mientras el usuario escribe: mantener el modelo en memoria y no entrenar dentro de la petición.
