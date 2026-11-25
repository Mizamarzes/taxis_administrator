from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_oil_change_service
from app.services.oil_change_service import OilChangeService

router = APIRouter(tags=["health"])


@router.get("/health")
def health(service: Annotated[OilChangeService, Depends(get_oil_change_service)]) -> dict:
    artifact = service.artifact
    return {
        "status": "ok",
        "models": {
            "oilChange": {
                "loaded": artifact is not None,
                "trainedAt": artifact["trained_at"] if artifact else None,
                "version": artifact["version"] if artifact else None,
            }
        },
    }
