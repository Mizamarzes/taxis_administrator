from secrets import compare_digest
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status

from app.core.config import Settings, get_settings


def verify_internal_key(
    settings: Annotated[Settings, Depends(get_settings)],
    x_internal_key: Annotated[str | None, Header()] = None,
) -> None:
    if not settings.ml_service_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML_SERVICE_KEY no está configurada en el servicio de ML",
        )
    if not x_internal_key or not compare_digest(x_internal_key, settings.ml_service_key):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Clave interna inválida")
