"""Priority scoring model."""

from __future__ import annotations

import numpy as np
from sklearn.linear_model import LogisticRegression

from .features import FEATURE_DIM, to_vector


class PriorityScorer:
    def __init__(self) -> None:
        # Use logistic on binarized high-impact for a stable ranking score (predict_proba).
        self._clf = LogisticRegression(max_iter=500, random_state=42)
        self._fitted = False

    def fit(self, items: list[dict], impacts: np.ndarray) -> "PriorityScorer":
        X = np.asarray([to_vector(it) for it in items], dtype=float)
        assert X.shape[1] == FEATURE_DIM
        y = (impacts >= np.median(impacts)).astype(int)
        self._clf.fit(X, y)
        self._fitted = True
        return self

    def score(self, item: dict) -> float:
        if not self._fitted:
            raise RuntimeError("Model not fitted")
        X = np.asarray([to_vector(item)], dtype=float)
        return float(self._clf.predict_proba(X)[0, 1])

    def score_many(self, items: list[dict]) -> np.ndarray:
        return np.asarray([self.score(it) for it in items], dtype=float)
