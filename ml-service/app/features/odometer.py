import pandas as pd

READING_COLUMNS = ["vehicle_id", "reading_date", "odometer_km"]


def clean_readings(raw: pd.DataFrame) -> pd.DataFrame:
    if raw.empty:
        return pd.DataFrame(columns=[*READING_COLUMNS, "days"])

    data = raw[READING_COLUMNS].dropna().copy()
    data["vehicle_id"] = data["vehicle_id"].astype(int)
    data["reading_date"] = pd.to_datetime(data["reading_date"]).dt.normalize()
    data["odometer_km"] = data["odometer_km"].astype(float)

    data = data.groupby(["vehicle_id", "reading_date"], as_index=False)["odometer_km"].max()
    data = data.sort_values(["vehicle_id", "reading_date"]).reset_index(drop=True)

    running_max = data.groupby("vehicle_id")["odometer_km"].cummax()
    data = data[data["odometer_km"] >= running_max].copy()

    first_date = data.groupby("vehicle_id")["reading_date"].transform("min")
    data["days"] = (data["reading_date"] - first_date).dt.days.astype(int)
    return data.reset_index(drop=True)
