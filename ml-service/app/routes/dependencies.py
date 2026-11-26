from fastapi import Request

from app.services.oil_change_service import OilChangeService


def get_oil_change_service(request: Request) -> OilChangeService:
    return request.app.state.oil_change_service
