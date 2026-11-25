# Notebooks

Espacio para explorar datos y probar modelos antes de llevarlos a `app/models/`.

```bash
.venv/bin/pip install jupyterlab matplotlib
.venv/bin/jupyter lab
```

Para reutilizar la conexión y las consultas del servicio dentro de un notebook:

```python
import sys
sys.path.append("..")

from app.db.session import get_engine
from app.db.queries import load_odometer_readings
from app.features.odometer import clean_readings
from app.models import oil_change

raw = load_odometer_readings(get_engine())
readings = clean_readings(raw)
artifact = oil_change.train(raw)
artifact["metrics"]
```

Ideas para practicar con los datos del sistema:

| Técnica | Experimento |
|---|---|
| Regresión | Pronóstico de ingresos diarios por vehículo (tabla `tarifas`) |
| Clasificación | Riesgo de atraso en pagos por conductor (`deuda_movements`) |
| Clustering | Perfiles de vehículos según su patrón de gastos (`vehicle_expenses`) |
| Anomalías | Tarifas o gastos atípicos (Isolation Forest, z-score) |
