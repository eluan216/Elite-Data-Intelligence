import pytest

from src.features import to_vector, validate_item


def valid_item():
    return {
        "urgency": 4,
        "customer_tier": 2,
        "age_hours": 12.0,
        "blocked": 0,
        "estimated_effort": 3,
    }


def test_validate_ok():
    validate_item(valid_item())


def test_missing_key():
    item = valid_item()
    del item["urgency"]
    with pytest.raises(ValueError, match="Missing"):
        validate_item(item)


def test_urgency_range():
    item = valid_item()
    item["urgency"] = 9
    with pytest.raises(ValueError, match="urgency"):
        validate_item(item)


def test_vector_length():
    v = to_vector(valid_item())
    assert len(v) == 5
    assert all(0.0 <= x <= 1.0 for x in v)
