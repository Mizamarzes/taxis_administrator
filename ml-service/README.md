# Taxis Administrator — ML Service

Microservicio de machine learning (FastAPI + scikit-learn) del sistema Taxis Administrator.

```
 Web / Móvil ──JWT──▶ NestJS (/api/predictions/*) ──X-Internal-Key──▶ ml-service (FastAPI :8000)
                          │                                                 │
                          └───────────────── PostgreSQL ◀── solo lectura ───┘
```

- Los clientes **nunca** llaman directo a este servicio: NestJS valida el JWT y el rol, y reenvía la petición con la clave interna.
- El servicio solo **lee** la base de datos (cada consulta corre en una transacción `READ ONLY`).
- Si el servicio está caído, NestJS responde `503` y el resto del sistema sigue funcionando.

## Requisitos

- Python 3.11+
- PostgreSQL del proyecto corriendo

## Configuración

```bash
cd ml-service
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Conexión a PostgreSQL |
| `DB_SSLMODE` | `prefer` (local) o `require` (producción) |
| `ML_SERVICE_KEY` | Clave compartida con NestJS. **Debe ser igual** a `ML_SERVICE_KEY` en `backend/.env` |
| `RETRAIN_ENABLED`, `RETRAIN_HOUR` | Reentrenamiento programado diario (por defecto 02:00) |

En el backend (`backend/.env`):

```
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_KEY=<la misma clave>
```

Generar una clave: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`

### Usuario de solo lectura (recomendado)

`sql/create_readonly_user.sql` crea el rol `ml_readonly` con permisos solo de `SELECT`. Ejecútalo con un superusuario, cambia la contraseña y úsalo en `DB_USERNAME`/`DB_PASSWORD`.

## Comandos

```bash
.venv/bin/uvicorn app.main:app --reload --port 8000
.venv/bin/python -m pytest
```

Documentación interactiva: http://localhost:8000/docs

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/health` | — | Estado del servicio y de los modelos cargados |
| GET | `/oil-change/predictions?vehicleId=` | `X-Internal-Key` | Predicción del próximo cambio de aceite |
| POST | `/oil-change/train` | `X-Internal-Key` | Reentrena el modelo ahora |

Expuestos al cliente por NestJS como `GET /api/predictions/oil-change` y `POST /api/predictions/oil-change/train` (permisos `predictions.read` y `predictions.train`).

## Modelo: próximo cambio de aceite (v1)

**Problema:** regresión. A partir del kilometraje registrado en los gastos (`vehicle_expenses.odometer_km`) se estima cuántos km/día recorre cada vehículo y, con eso, cuándo alcanzará el `next_service_km` de su último cambio de aceite.

1. **Limpieza** (`app/features/odometer.py`): descarta lecturas nulas, deja una lectura por día (la mayor) y elimina valores que bajan respecto a uno anterior (errores de digitación).
2. **Estimación de km/día** por vehículo (`app/models/oil_change.py`):
   - `vehicle_regression`: regresión lineal (`LinearRegression`) con ≥ 3 lecturas en ≥ 7 días.
   - `two_point_trend`: pendiente entre la primera y la última lectura.
   - `fleet_average`: mediana de la flota cuando el vehículo no tiene historial suficiente.
3. **Predicción**: proyecta el km actual desde la última lectura, calcula los días hasta el km objetivo y toma el menor entre ese valor y la fecha programada (`next_service_date`).
4. **Estado**: `overdue` (vencido), `soon` (≤ 15 días o ≤ 500 km, misma regla que el frontend), `ok`, `unknown` (sin datos para estimar) o `none` (sin cambio de aceite registrado).
5. **Evaluación**: *holdout* de la última lectura de cada vehículo → `holdout_mae_km` (error absoluto medio en km) en las métricas del entrenamiento.

El modelo se guarda en `artifacts/oil_change.joblib`. Se reentrena al iniciar si no existe, cada noche, y **automáticamente cuando cambian las lecturas** (se compara una firma de los datos), por lo que un gasto nuevo se refleja en la siguiente consulta.

**Limitaciones conocidas:** depende de que se registre el kilometraje en los gastos; una lectura con un valor excesivamente alto por error hace que se descarten las siguientes hasta superarla.

## Estructura

```
app/
  main.py              # FastAPI, ciclo de vida, scheduler
  config/              # settings.py (.env) y database.py (engine)
  guards/              # Validación de la clave interna (X-Internal-Key)
  repositories/        # Consultas SQL de solo lectura → DataFrame
  features/            # Preparación de datos (pandas)
  models/              # Entrenamiento / predicción y almacenamiento de artefactos
  services/            # Orquestación datos → modelo → respuesta
  schemas/             # Respuestas (pydantic, camelCase)
  routes/              # Endpoints e inyección de dependencias
  jobs/                # Reentrenamiento programado
notebooks/             # Exploración y experimentos
artifacts/             # Modelos entrenados (no se versionan)
sql/                   # Scripts de base de datos
tests/                 # pytest
```

## Agregar un modelo nuevo

1. Explora en `notebooks/`.
2. Crea `app/repositories/<nombre>_repository.py` con las consultas (siempre con `read_only_query` de `app/repositories/base.py`).
3. Implementa `train()` / `predict()` en `app/models/<nombre>.py`, con pruebas en `tests/`.
4. Crea el servicio en `app/services/`, los esquemas en `app/schemas/` y el router en `app/routes/`.
5. Regístralo en `app/main.py` (y en `app/jobs/scheduler.py` si se reentrena).
6. En NestJS, agrega el método en `PredictionsService` y el endpoint en `PredictionsController`.
