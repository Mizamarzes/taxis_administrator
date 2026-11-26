import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import SQLAlchemyError

from app.guards.internal_key import verify_internal_key
from app.routes.dependencies import get_oil_change_service
from app.schemas.oil_change import OilChangePredictionsResponse, TrainingInfo
from app.services.oil_change_service import OilChangeService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/oil-change", tags=["oil-change"], dependencies=[Depends(verify_internal_key)])

ServiceDep = Annotated[OilChangeService, Depends(get_oil_change_service)]


def _database_unavailable(error: SQLAlchemyError) -> HTTPException:
    logger.exception("Error consultando la base de datos", exc_info=error)
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="No se pudo consultar la base de datos",
    )


@router.get("/predictions", response_model=OilChangePredictionsResponse)
def get_predictions(
    service: ServiceDep,
    vehicle_id: Annotated[int | None, Query(alias="vehicleId", gt=0)] = None,
) -> dict:
    try:
        return service.predict(vehicle_id)
    except SQLAlchemyError as error:
        raise _database_unavailable(error) from error


@router.post("/train", response_model=TrainingInfo)
def train_model(service: ServiceDep) -> dict:
    try:
        return service.train()
    except SQLAlchemyError as error:
        raise _database_unavailable(error) from error
