# Model card — Ops priority scorer

## Model details
- **Name:** ops_priority_scorer_v0
- **Type:** Ridge regression (scikit-learn) ranking scores from work-item features
- **Version:** 0.1.0 (demonstration)
- **Owner:** Elite-Data-Intelligence

## Intended use
- **Primary:** Rank synthetic operational work items for triage demonstration and testing of our delivery pattern.
- **Users:** Engineers reviewing this repository; internal dry-runs.
- **Out of scope:** Direct control of real operational queues without domain calibration and human gate.

## Training data
- Synthetic only (`src/data.py`).
- Features: urgency, customer_tier, age_hours, blocked_flag, estimated_effort.
- Labels: continuous impact score used for ranking evaluation.

## Evaluation (demo targets)
- Spearman rank correlation vs impact on holdout ≥ 0.70
- Top 20% by score capture ≥ 0.40 of total impact
- Deterministic scores for identical feature rows

Run `python -m src.train_eval` for current numbers on a fresh synthetic draw.

## Ethical / operational considerations
- Scores can encode bias if real tier or urgency fields reflect unfair process. Client work requires fairness review.
- Human operators remain responsible for final prioritization in any real deployment.

## Limitations
See `limitations.md`.
