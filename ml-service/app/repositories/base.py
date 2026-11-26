import pandas as pd
from sqlalchemy import Engine, text


def read_only_query(engine: Engine, sql: str, params: dict | None = None) -> pd.DataFrame:
    with engine.connect() as connection:
        connection.execute(text("SET TRANSACTION READ ONLY"))
        result = connection.execute(text(sql), params or {})
        return pd.DataFrame(result.fetchall(), columns=list(result.keys()))
