"""Priority scoring model — Ridge regression on continuous impact for ranking."""

from __future__ import annotations

import numpy as np
from sklearn.linear_model import Ridge

from .features import FEATURE_DIM, to_vector


class PriorityScorer:
    def __init__(self) -> None:
        self._reg = Ridge(alpha=1.0, random_state=42)
        self._fitted = False

    def fit(self, items: list[dict], impacts: np.ndarray) -> "PriorityScorer":
        X = np.asarray([to_vector(it) for it in items], dtype=float)
        assert X.shape[1] == FEATURE_DIM
        self._reg.fit(X, impacts)
        self._fitted = True
        return self

    def score(self, item: dict) -> float:
        if not self._fitted:
            raise RuntimeError("Model not fitted")
        X = np.asarray([to_vector(item)], dtype=float)
        return float(self._reg.predict(X)[0])

    def score_many(self, items: list[dict]) -> np.ndarray:
        X = np.asarray([to_vector(it) for it in items], dtype=float)
        return np.asarray(self._reg.predict(X), dtype=float)
