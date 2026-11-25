from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import URL

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    db_host: str = "localhost"
    db_port: int = 5432
    db_username: str = "postgres"
    db_password: str = ""
    db_name: str = "taxis_db"
    db_sslmode: str = "prefer"

    ml_service_key: str = ""
    artifacts_dir: Path = BASE_DIR / "artifacts"
    retrain_enabled: bool = True
    retrain_hour: int = 2

    @property
    def database_url(self) -> URL:
        return URL.create(
            drivername="postgresql+psycopg",
            username=self.db_username,
            password=self.db_password,
            host=self.db_host,
            port=self.db_port,
            database=self.db_name,
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
