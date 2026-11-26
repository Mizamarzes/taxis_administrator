import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.config.settings import Settings
from app.services.oil_change_service import OilChangeService

logger = logging.getLogger(__name__)


def _retrain(service: OilChangeService) -> None:
    try:
        service.train()
    except Exception:
        logger.exception("Falló el reentrenamiento programado del modelo de cambio de aceite")


def start_scheduler(service: OilChangeService, settings: Settings) -> BackgroundScheduler:
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        _retrain,
        CronTrigger(hour=settings.retrain_hour, minute=0),
        args=[service],
        id="retrain_oil_change",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Reentrenamiento programado todos los días a las %02d:00", settings.retrain_hour)
    return scheduler
