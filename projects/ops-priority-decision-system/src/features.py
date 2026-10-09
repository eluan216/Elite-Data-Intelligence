"""Feature contract and transforms for ops work items."""

from __future__ import annotations

from typing import Any, Mapping

REQUIRED_KEYS = (
    "urgency",  # 1–5
    "customer_tier",  # 1–3
    "age_hours",  # >= 0
    "blocked",  # 0 or 1
    "estimated_effort",  # 1–8
)


def validate_item(item: Mapping[str, Any]) -> None:
    missing = [k for k in REQUIRED_KEYS if k not in item]
    if missing:
        raise ValueError(f"Missing features: {missing}")

    urgency = int(item["urgency"])
    if urgency < 1 or urgency > 5:
        raise ValueError("urgency must be in 1..5")

    tier = int(item["customer_tier"])
    if tier < 1 or tier > 3:
        raise ValueError("customer_tier must be in 1..3")

    age = float(item["age_hours"])
    if age < 0:
        raise ValueError("age_hours must be >= 0")

    blocked = int(item["blocked"])
    if blocked not in (0, 1):
        raise ValueError("blocked must be 0 or 1")

    effort = int(item["estimated_effort"])
    if effort < 1 or effort > 8:
        raise ValueError("estimated_effort must be in 1..8")


def to_vector(item: Mapping[str, Any]) -> list[float]:
    """Fixed-order numeric vector for the model."""
    validate_item(item)
    return [
        float(item["urgency"]) / 5.0,
        float(item["customer_tier"]) / 3.0,
        min(float(item["age_hours"]) / 72.0, 1.0),  # cap at 3 days
        float(item["blocked"]),
        float(item["estimated_effort"]) / 8.0,
    ]


FEATURE_DIM = 5
