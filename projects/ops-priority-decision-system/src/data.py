"""Synthetic work-item generator for demo training and tests."""

from __future__ import annotations

import numpy as np


def generate_items(n: int = 400, seed: int = 42) -> tuple[list[dict], np.ndarray]:
    rng = np.random.default_rng(seed)
    items: list[dict] = []
    impacts: list[float] = []

    for _ in range(n):
        urgency = int(rng.integers(1, 6))
        tier = int(rng.integers(1, 4))
        age_hours = float(rng.uniform(0, 96))
        blocked = int(rng.integers(0, 2))
        effort = int(rng.integers(1, 9))

        # Synthetic impact: urgency and tier dominate; age adds mild pressure; blocked reduces.
        impact = (
            0.45 * (urgency / 5.0)
            + 0.30 * (tier / 3.0)
            + 0.15 * min(age_hours / 72.0, 1.0)
            - 0.20 * blocked
            - 0.10 * (effort / 8.0)
            + float(rng.normal(0, 0.05))
        )
        impact = float(np.clip(impact, 0.0, 1.0))

        items.append(
            {
                "urgency": urgency,
                "customer_tier": tier,
                "age_hours": age_hours,
                "blocked": blocked,
                "estimated_effort": effort,
            }
        )
        impacts.append(impact)

    return items, np.asarray(impacts, dtype=float)
