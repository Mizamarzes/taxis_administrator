# Arquitectura del ML Service

## 1. Vista general

```
┌──────────────┐      JWT       ┌───────────────────────────┐   X-Internal-Key   ┌──────────────────────────┐
│  Web (React) │ ─────────────▶ │ NestJS                    │ ─────────────────▶ │ ml-service (FastAPI)     │
│  Móvil (Expo)│                │ /api/predictions/*        │   HTTP + timeout   │ :8000                    │
└──────────────┘                │ PredictionsController     │ ◀───────────────── │                          │
                                │ PredictionsService        │      JSON          │                          │
                                └─────────────┬─────────────┘                    └────────────┬─────────────┘
                                              │ lectura/escritura                             │ solo lectura
                                              ▼                                               ▼
                                        ┌───────────────────────────────────────────────────────────┐
                                        │                     PostgreSQL (taxis_db)                 │
                                        └───────────────────────────────────────────────────────────┘
                                                                                              │
                                                                         artifacts/*.joblib ◀─┘ (modelos entrenados)
```

Principios:

| Principio | Cómo se cumple |
|---|---|
| **Aislamiento** | El servicio es interno; solo NestJS lo llama. Los clientes nunca ven su URL ni su clave. |
| **Autorización centralizada** | JWT y permisos se validan en NestJS (`AuthGuard` + `PermissionsGuard`). El ML service solo verifica `X-Internal-Key` con `compare_digest` (`app/guards/internal_key.py`). |
| **Solo lectura** | Cada consulta abre una transacción `SET TRANSACTION READ ONLY` (`app/repositories/base.py`) y se recomienda el rol `ml_readonly` (`sql/create_readonly_user.sql`). |
| **Degradación elegante** | Si el servicio cae, NestJS responde `503` y el resto del sistema funciona. Si la BD falla, FastAPI responde `503` controlado. |
| **Modelos como artefactos** | El entrenamiento produce un diccionario serializado con `joblib`; la predicción solo lo lee. |

## 2. Capas

El código sigue una arquitectura en capas con dependencias en una sola dirección:

```
guards ──▶ routes  ──▶  services  ──▶  models  ──▶  features
              │             │             │
              ▼             ▼             ▼
           schemas    repositories   models/store
                            │
                     config (settings, database)  ◀── usado por todas
```

Equivalencias con el backend NestJS:

| ml-service | NestJS |
|---|---|
| `routes/` | `*.controller.ts` |
| `routes/dependencies.py` | Inyección de dependencias del módulo |
| `guards/` | `AuthGuard` / `PermissionsGuard` |
| `services/` | `*.service.ts` |
| `repositories/` | `Repository<Entity>` de TypeORM |
| `schemas/` | `dto/` |
| `config/` | `config/` (`ConfigModule`, `database`) |
| `models/`, `features/`, `jobs/` | Sin equivalente: propios del ML |

| Capa | Archivo(s) | Responsabilidad | No debe |
|---|---|---|---|
| **config** | `config/settings.py`, `config/database.py` | Configuración desde `.env` (`pydantic-settings`, cacheada con `lru_cache`) y engine de SQLAlchemy (pool pequeño: 2 + 2) | Conocer modelos o rutas |
| **guards** | `guards/internal_key.py` | Validación de la clave interna `X-Internal-Key` | Contener lógica de negocio |
| **repositories** | `repositories/base.py`, `repositories/oil_change_repository.py` | SQL crudo de solo lectura que devuelve `DataFrame` | Transformar datos ni escribir |
| **features** | `features/odometer.py` | Limpieza y preparación de datos con pandas (funciones puras) | Acceder a BD |
| **models** | `models/oil_change.py`, `models/store.py` | `train()` y `predict()` puros sobre DataFrames; persistencia atómica del artefacto | Acceder a BD ni a HTTP |
| **services** | `services/oil_change_service.py` | Orquesta: consulta → valida firma → entrena si hace falta → predice | Saber de HTTP |
| **schemas** | `schemas/oil_change.py` | Contrato de respuesta (pydantic, alias camelCase para el frontend) | Contener lógica |
| **routes** | `routes/*.py`, `routes/dependencies.py` | Endpoints, inyección del servicio, traducción de errores a HTTP | Contener lógica de ML |
| **jobs** | `jobs/scheduler.py` | Reentrenamiento diario con APScheduler (`CronTrigger`) | — |

La regla clave: **`models/` y `features/` son funciones puras** que reciben DataFrames. Eso permite probarlos sin base de datos (`tests/test_oil_change_model.py`) y reutilizarlos en `notebooks/`.

## 3. Ciclo de vida

`app/main.py` usa el `lifespan` de FastAPI:

1. Crea `OilChangeService` con una fábrica del engine y un `ModelStore` apuntando a `artifacts/oil_change.joblib`.
2. Lo guarda en `app.state` (las rutas lo obtienen con `Depends(get_oil_change_service)`).
3. `ensure_model()` en un *threadpool*: carga el artefacto de disco o entrena si no existe. Si la BD no está disponible al arrancar, solo se registra el error y se reintenta en la primera petición.
4. Arranca el scheduler si `RETRAIN_ENABLED=true`.
5. Al apagar, detiene el scheduler.

## 4. Flujo de una predicción

```
GET /api/predictions/oil-change?vehicleId=3          (cliente → NestJS, JWT)
  └─ PredictionsService.request('GET', '/oil-change/predictions?vehicleId=3')   (+ X-Internal-Key, timeout)
       └─ verify_internal_key
       └─ OilChangeService.predict(3)
            ├─ load_odometer_readings()            SELECT ... READ ONLY
            ├─ data_signature(readings) == artifact.data_signature ?
            │      no → train() → ModelStore.save()   (reentrenamiento automático)
            ├─ load_oil_targets(vehicle_id=3)
            └─ oil_change.predict(artifact, readings, targets, today)
       └─ OilChangePredictionsResponse (camelCase)
```

Las rutas se declaran con `def` (no `async def`), así FastAPI las ejecuta en un threadpool y las consultas bloqueantes de SQLAlchemy/pandas no bloquean el event loop.

## 5. Estrategia de reentrenamiento

| Disparador | Dónde | Por qué |
|---|---|---|
| Al iniciar sin artefacto | `ensure_model()` | Primer despliegue |
| Diario a `RETRAIN_HOUR` | `jobs/scheduler.py` | Refrescar aunque nadie consulte |
| Cambio en los datos | `predict()` compara `data_signature` | Un gasto nuevo se refleja en la siguiente consulta |
| Manual | `POST /oil-change/train` | Administración |

La firma (`n_lecturas:suma_km:fecha_max`) es barata y suficiente para un modelo que entrena en milisegundos. Para modelos costosos (p. ej. 03 o 10) conviene **no** entrenar dentro de la petición: devolver el artefacto vigente y encolar el reentrenamiento.

## 6. Persistencia de modelos

`ModelStore` (`models/store.py`):

- Guarda en un `.tmp` y hace `replace()` → escritura **atómica**, un lector nunca ve un archivo a medias.
- `threading.Lock` protege la carga/guardado entre el scheduler y las peticiones.
- El artefacto es un `dict` con `name`, `version`, `trained_at`, `data_signature`, `metrics` y los parámetros del modelo. Las métricas se exponen al cliente para transparencia.

## 7. Integración con el resto del sistema

| Pieza | Ubicación | Rol |
|---|---|---|
| Proxy | `backend/src/predictions/` | Agrega la clave interna, aplica timeout (`ml.timeoutMs`, 10 s por defecto) y mapea errores a `503` |
| Variables | `ML_SERVICE_URL`, `ML_SERVICE_KEY` en `backend/.env` y `ml-service/.env` | La clave debe ser idéntica |
| Frontend / móvil | Consumen `/api/predictions/*` como cualquier otro endpoint | Ocultan la UI con `can('...')` |

## 8. Pruebas

- `tests/test_oil_change_model.py`: lógica pura con DataFrames sintéticos (limpieza, métodos de estimación, estados).
- `tests/test_api.py`: `TestClient` con un `FakeService` inyectado vía `dependency_overrides`; valida la clave interna y el contrato camelCase.

## 9. Escalar a varios modelos

Hoy `main.py` y `health.py` están acoplados a `OilChangeService`. Al agregar el segundo modelo se recomienda:

1. Un registro de servicios en `app.state.services: dict[str, Service]` con una interfaz común (`ensure_model`, `train`, `artifact`).
2. `health` iterando el registro.
3. `scheduler` registrando un job por servicio (con horas escalonadas).
4. Un módulo `features/` por dominio (`features/tarifas.py`, `features/deudas.py`) y un repositorio por dominio (`repositories/tarifas_repository.py`).
5. Pipelines de scikit-learn (`Pipeline` + `ColumnTransformer`) guardados dentro del artefacto para que la transformación de features sea idéntica en entrenamiento y predicción.
6. Versionado: incluir `MODEL_VERSION` en el nombre del archivo si cambia el formato del artefacto, para poder revertir.

## 10. Límites actuales

| Límite | Impacto | Mitigación |
|---|---|---|
| Artefactos en disco local | No sirve con varias réplicas | Volumen compartido o almacenamiento de objetos |
| Scheduler dentro del proceso | Con N réplicas se entrena N veces | Un solo worker de jobs o lock en BD |
| Entrenamiento síncrono en la petición | Aceptable solo para modelos rápidos | Cola de tareas o `BackgroundTasks` |
| Sin registro de métricas históricas | No se ve si el modelo empeora | Guardar `metrics` por entrenamiento (tabla propia o archivo) |
