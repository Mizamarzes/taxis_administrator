from functools import lru_cache

from sqlalchemy import Engine, create_engine

from app.config.settings import get_settings


@lru_cache
def get_engine() -> Engine:
    settings = get_settings()
    return create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=2,
        max_overflow=2,
        connect_args={"sslmode": settings.db_sslmode, "connect_timeout": 10},
    )
