# 11 · Lectura de facturas y documentos (OCR)

**Estado:** Exploratorio · **Técnica:** OCR + extracción de información · **Valor:** Medio · **Esfuerzo:** Alto

## Problema de negocio
El sistema ya almacena archivos:
- `vehicle_documents.file_url` (SOAT, revisión técnico-mecánica, tarjeta de operación…), con `issue_date` y `expiry_date` digitados a mano.
- `media_tarifas.file_url` (soportes de pago: capturas de Nequi/Daviplata, recibos).

Digitar fechas, montos y números de factura es lento y propenso a errores. Extraerlos automáticamente de la foto o PDF:
1. **Documentos del vehículo**: tipo de documento, fecha de expedición, fecha de vencimiento, placa.
2. **Facturas de gastos**: proveedor, número de factura, fecha, total, ítems (llena `vehicle_expenses` y `vehicle_expense_items`).
3. **Soportes de tarifa**: monto, fecha y medio de pago, y validar que coincida con la tarifa registrada (complementa el caso 04).

## Tipo de problema
Visión por computador + extracción de entidades. No es scikit-learn: requiere un motor OCR y reglas o un modelo de lenguaje para estructurar.

## Opciones técnicas
| Opción | Ventajas | Desventajas |
|---|---|---|
| **Tesseract** (`pytesseract`) + expresiones regulares | Gratis, local, sin enviar datos fuera | Precisión baja en fotos de celular; reglas frágiles |
| **PaddleOCR / docTR** | Mejor precisión en fotos, local | Dependencias pesadas (modelos de deep learning) |
| **Modelo multimodal vía API** (visión + extracción a JSON) | Alta precisión, entiende formatos variados sin reglas | Costo por documento; los archivos salen del servidor (revisar privacidad y consentimiento) |

Recomendación: empezar con un modelo multimodal para validar el valor con pocos documentos y, si el volumen crece o la privacidad lo exige, migrar a una solución local.

## Pipeline
1. NestJS sube el archivo y llama `POST /documents/extract` con la URL interna (el ML service no debe descargar URLs arbitrarias: solo del almacenamiento propio).
2. Preprocesamiento de imagen: corrección de rotación, recorte, contraste.
3. OCR → texto con posiciones.
4. Extracción de campos: regex para fechas (`dd/mm/aaaa`), placas (`[A-Z]{3}\d{3}`), montos (`$ 1.234.567`); o el modelo multimodal devolviendo JSON con un esquema fijo.
5. Validación: fechas coherentes (`expiry_date > issue_date`), placa existente, total = Σ ítems.
6. Respuesta con **confianza por campo**; la UI precarga el formulario y el usuario confirma.

## Evaluación
- Conjunto de 50–100 documentos reales etiquetados a mano.
- *Accuracy* por campo (exacto en fechas y placa; tolerancia de ±1 % en montos).
- Tiempo ahorrado por registro.

## Integración
| Capa | Elemento |
|---|---|
| ml-service | `app/models/document_extraction.py`, `POST /documents/extract` |
| NestJS | Endpoint en `vehicles` / `gastos` / `tarifas` que llama al extractor tras subir el archivo |
| Móvil | Tomar foto de la factura → formulario precargado (el caso de uso más natural) |
| Web | Botón "Leer documento" en el modal de documentos del vehículo |

## Respuesta de ejemplo
```json
{
  "documentType": { "value": "soat", "confidence": 0.93 },
  "plate": { "value": "ABC123", "confidence": 0.98 },
  "issueDate": { "value": "2026-03-14", "confidence": 0.95 },
  "expiryDate": { "value": "2027-03-13", "confidence": 0.95 }
}
```

## Casos derivados
- **Alertas de vencimiento**: con `expiry_date` confiable, notificar 30/15/5 días antes (regla simple, no ML).
- **Conciliación de pagos**: comparar el monto leído del soporte con `tarifas.amount` y marcar diferencias.

## Riesgos y limitaciones
- Datos personales en los documentos: definir política de retención y, si se usa una API externa, informar y obtener consentimiento.
- Cambia el perfil del servicio (dependencias pesadas, posible GPU): evaluar desplegarlo como un microservicio separado.
- El servicio actual es de solo lectura sobre la BD; la extracción solo **devuelve** datos, el guardado lo hace NestJS.
