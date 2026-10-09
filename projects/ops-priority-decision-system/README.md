# Flagship project: Ops priority decision system

**Status:** Internal demonstration · Not a client case study  
**Owner:** Elite-Data-Intelligence (founder)  
**Pattern:** Production decision system (`docs/patterns/production-decision-system.md`)

This project is the primary technical proof artifact for the agency. It shows how we move from a decision statement to evaluated logic, tests, and release discipline — without inventing client logos or unverified production claims.

---

## 1. Decision statement

**Decision:** Given a queue of operational work items, which items should a human operator handle first?

**Decision maker:** Ops lead / triage owner  
**Cost of error:**
- Prioritizing low-impact items → wasted capacity
- Deprioritizing high-impact items → delayed critical work

**Success metrics (demonstration):**
- Ranking quality: Spearman correlation of predicted priority vs synthetic ground-truth impact ≥ 0.70 on holdout
- Concentration: top-20% predicted items capture ≥ 30% of total impact mass
- Determinism: same inputs → same scores

These thresholds are **demo targets** for this repository, not guarantees for a client deployment.

---

## 2. Scope

**In scope**
- Feature contract for work-item attributes
- Transparent scoring model (Ridge regression ranking scores)
- Train / evaluate script with metrics
- Automated tests (contracts, metrics, determinism)
- Model card and limitations
- Mapping to Validation / quality-gate checklist language

**Out of scope**
- Live production API or multi-tenant hosting
- Real client data
- Guaranteed uplift on any operational KPI
- Fully autonomous agent orchestration

---

## 3. Architecture (short)

```
Work-item features (contract)
        │
        ▼
  Feature checks (tests)
        │
        ▼
  Score model (Ridge)
        │
        ▼
  Evaluation metrics + report
        │
        ▼
  Model card + limitations
        │
        ▼
  Human gate before any real ops use
```

Details: `docs/architecture.md`

---

## 4. How to run

```bash
cd projects/ops-priority-decision-system
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

python -m src.train_eval
pytest -q
```

---

## 5. Validation mapping

| Checklist item | Where it lives here |
|----------------|---------------------|
| Artifact identified | This directory |
| Acceptance criteria explicit | Success metrics above |
| Data quality / schema | `src/features.py` + tests |
| Model evaluation | `src/train_eval.py` + tests |
| Documentation / model card | `docs/model-card.md` |
| Human gate | Required before any real queue use |

---

## 6. Limitations

See `docs/limitations.md`. Summary: synthetic data only; simplified model; no live monitoring stack in this repo; not a substitute for domain-calibrated client work.

---

## 7. Repository path

`projects/ops-priority-decision-system/` on [Elite-Data-Intelligence](https://github.com/eluan216/Elite-Data-Intelligence)
