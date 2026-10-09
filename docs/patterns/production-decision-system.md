# Pattern: Production decision system

Reference path from decision statement to monitored release. Used for high-stakes decisions (fraud, credit, ops prioritization, similar workflows) and as the skeleton for agentic systems.

## 1. Decision & metrics
- Name the decision and the decision maker
- Cost of false positive vs false negative
- Success metric tied to the business case (not only AUC)

## 2. Governed data path
- Feature contracts and quality tests
- Lineage into train / serve sets
- Access boundaries documented

## 3. Model or agent
- Prefer the simplest method that hits the metric
- Document failure modes and limits
- Version training code and artifacts

## 4. Validation gate
- Open Validation Request with explicit acceptance criteria
- Run checklist; record PASS/FAIL with evidence
- Failures → Failure Analysis before retry

## 5. Production
- Versioned deploy, monitoring, drift alerts
- Rollback path and runbook
- Model card and audit-ready notes

## Operating model link
Engagement → Project Manager sequencing → Validation → (optional) Failure Analysis → hand-off.  
See `docs/delivery-playbook.md` and agent role files under `agents/`.
