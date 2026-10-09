# Architecture — Ops priority decision system

## Components

| Component | Responsibility |
|-----------|----------------|
| `src/features.py` | Feature schema, validation, transform |
| `src/model.py` | Score function (sklearn logistic regression) |
| `src/data.py` | Synthetic work-item generator for demo/tests |
| `src/train_eval.py` | Train, evaluate, print metrics |
| `tests/` | Contract, metric, determinism tests |
| `docs/model-card.md` | Intended use, metrics, limits |

## Data flow

1. Raw work-item dicts must satisfy the feature contract (required keys, types, ranges).
2. Features are transformed to a fixed numeric vector.
3. Model outputs a priority score in [0, 1].
4. Ranking is by descending score.
5. Evaluation compares scores to synthetic impact labels.

## Why this design

- **Transparent:** logistic regression is inspectable; coefficients can be reviewed.
- **Testable:** contracts and metrics run in CI-friendly pytest.
- **Honest:** no claim of deep learning or production serving beyond this folder.

## Production path (not implemented here)

A client engagement would add: real feature store or warehouse feed, monitoring, drift checks, rollback, and operator UI. Those are engagement deliverables, not part of this flagship demo.
