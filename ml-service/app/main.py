import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool

from app.config.database import get_engine
from app.config.settings import get_settings
from app.jobs.scheduler import start_scheduler
from app.models.store import ModelStore
from app.routes import health, oil_change
from app.services.oil_change_service import OilChangeService

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("ml-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    service = OilChangeService(get_engine, ModelStore(settings.artifacts_dir / "oil_change.joblib"))
    app.state.oil_change_service = service

    try:
        await run_in_threadpool(service.ensure_model)
    except Exception:
        logger.exception("No se pudo preparar el modelo al iniciar; se intentará en la primera petición")

    scheduler = start_scheduler(service, settings) if settings.retrain_enabled else None
    yield
    if scheduler:
        scheduler.shutdown(wait=False)


app = FastAPI(title="Taxis Administrator · ML Service", version="0.1.0", lifespan=lifespan)
app.include_router(health.router)
app.include_router(oil_change.router)
