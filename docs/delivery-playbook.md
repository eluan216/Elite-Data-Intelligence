# Delivery Playbook

How an engagement runs from discovery to hand-off. Agents and the senior human core share this process.

## 1. Discovery → intake

| Source | Action |
|--------|--------|
| Website form | Email lands in founder inbox (`ogumaeluan@gmail.com`) |
| Support chat | Qualifies; points to form or creates discovery note |
| Direct outreach | Founder or BD captures essentials |

**Founder gate:** Accept, decline, or request a discovery call. No engagement is opened without a clear decision statement and commercial intent.

## 2. Open engagement

1. Create a GitHub issue with template **New Engagement**.
2. Labels: `engagement`, `agent:project-manager`.
3. Fill decision statement, success metrics, risk class, scope.
4. Project Manager Agent (or human acting in that role) sequences work and opens child tasks.

High / regulated risk → also involve **AI Governance** and require `quality-gate` on all client-facing artifacts.

## 3. Delivery loop

```
Data readiness → Models / agents → Production path → Adoption → Measured value
```

- **Principal Decision Scientist** owns problem framing and design bar.
- **Lead Data Engineer / Applied ML / MLOps** execute under that design.
- **Project Manager** keeps sequence, dependencies, and status visible.
- **Domain / Change** owns adoption path, not only technical delivery.

Every material deliverable before client release:

1. Open **Validation Request** (`agent:validation`, `quality-gate`).
2. Validation Agent (or human) runs against stated acceptance criteria.
3. Failures → **Failure Analysis** issue (`agent:failure-analysis`).
4. Fixes re-enter validation until pass.
5. Founder or Engagement Manager remains final commercial / reputation gate.

## 4. Quality loop (Pytest-style)

| Agent | Role |
|-------|------|
| Validation / Test Execution | Run checks; report pass/fail with evidence |
| Failure Analysis & Improvement | Root cause, fix recommendations, prevent recurrence |

No client-facing or production artifact ships without a recorded validation outcome.

## 5. Hand-off and value

- Documentation: model cards, runbooks, lineage, decision log.
- Operating procedures and escalation paths for the client.
- Success metrics measured against the original business case.
- Engagement Manager closes commercial loop; Founder reviews outcome quality.

## 6. What I do not delegate

- Final commercial terms and major scope changes
- Acceptance of high-risk or regulated use cases
- Public claims about capabilities or outcomes
- Reputation and long-term direction

Agents accelerate. Humans remain accountable.
