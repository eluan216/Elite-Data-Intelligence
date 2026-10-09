"""Train and evaluate the ops priority scorer on synthetic data."""

from __future__ import annotations

import numpy as np
from scipy.stats import spearmanr

from .data import generate_items
from .model import PriorityScorer


def top_k_capture(scores: np.ndarray, impacts: np.ndarray, frac: float = 0.2) -> float:
    n = len(scores)
    k = max(1, int(n * frac))
    idx = np.argsort(-scores)[:k]
    return float(impacts[idx].sum() / impacts.sum())


def main() -> None:
    items, impacts = generate_items(n=500, seed=7)
    split = int(0.7 * len(items))
    train_items, test_items = items[:split], items[split:]
    train_y, test_y = impacts[:split], impacts[split:]

    model = PriorityScorer().fit(train_items, train_y)
    scores = model.score_many(test_items)

    rho, _ = spearmanr(scores, test_y)
    capture = top_k_capture(scores, test_y, 0.2)

    print("Ops priority scorer — evaluation (synthetic holdout)")
    print(f"  Spearman rho:     {rho:.3f}  (target >= 0.70)")
    print(f"  Top-20% capture:  {capture:.3f}  (target >= 0.30)")
    print(f"  n_test:           {len(test_items)}")

    s1 = model.score(test_items[0])
    s2 = model.score(test_items[0])
    print(f"  Determinism OK:   {s1 == s2}")


if __name__ == "__main__":
    main()
