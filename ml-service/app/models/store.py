import threading
from pathlib import Path
from typing import Any

import joblib


class ModelStore:
    def __init__(self, path: Path) -> None:
        self._path = path
        self._artifact: dict[str, Any] | None = None
        self._lock = threading.Lock()

    @property
    def artifact(self) -> dict[str, Any] | None:
        return self._artifact

    def load(self) -> bool:
        if not self._path.exists():
            return False
        with self._lock:
            self._artifact = joblib.load(self._path)
        return True

    def save(self, artifact: dict[str, Any]) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self._path.with_suffix(".tmp")
        with self._lock:
            joblib.dump(artifact, temporary)
            temporary.replace(self._path)
            self._artifact = artifact
