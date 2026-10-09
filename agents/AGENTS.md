# Elite-Data-Intelligence Agent System

I run specialized agent **roles** (16 documented) plus a shared **runtime** for the first executable slice. This folder holds role definitions. Runtime code lives under `web-app/src/lib/agents/`.

## Levels of capability (honest)

| Level | Status |
|-------|--------|
| **1 — Documented roles** | Complete (16 markdown definitions) |
| **2 — Workflow automation** | GitHub labels/Actions for PM, validation, failure analysis |
| **3 — Executable runtime** | **v0 live:** Intake → Research → Validation (see below) |
| **4 — Full 16 autonomous agents** | Not claimed — expand only after v0 is durable |

## Runtime v0 (three agents)

Shared TypeScript orchestration:

1. **Intake** — structured brief, missing info, acceptance criteria, subtasks  
2. **Research** — facts / assumptions / limitations from supplied evidence only  
3. **Validation** — pass / fail / needs_human_review against criteria  

API: `POST /api/agents/tasks` · docs: `docs/agents/runtime-v0.md`  
Mode: `mock` without `OPENAI_API_KEY`; `llm` when key is set server-side.  
Permissions: no shell, no deploy, no private data access, no commercial commits.  
Store: in-memory (replace with Postgres before multi-instance production).

## Agent Roster (role definitions)
1. Founder / Managing Partner / Strategy Lead (me) — **human authority**
2. Principal Decision Scientist / Senior AI Lead
3. Lead Data Engineer / Lakehouse Architect
4. Senior MLOps / Production & Platform Engineer
5. AI Governance, Risk & Compliance Lead
6. Domain / Industry & Change Management Lead
7. Engagement / Delivery Manager
8. Project Manager Agent — GitHub intake + runtime Intake
9. Applied ML / Agent Engineer
10. Data Scientist / Decision Analyst — partial via runtime Research
11. Platform & Integration Specialist
12. Mid-level Data Engineer / Analytics Engineer
13. Business Development / Client Success & Operations Support
14. Validation / Test Execution Agent — GitHub checklist + runtime Validation
15. Failure Analysis & Improvement Agent — GitHub intake
16. Customer Support & Client Interaction Agent — website FAQ (knowledge mode)

## GitHub invocation (Level 2)

| Label | Intent | Auto Action |
|-------|--------|-------------|
| `agent:project-manager` | Sequencing | PM intake comment |
| `agent:validation` | Quality checks | Validation checklist |
| `agent:failure-analysis` | Root-cause | Failure analysis intake |
| `agent:customer-support` | Inbound | Website chat + form |

Templates: New Engagement · Validation Request · Failure Analysis  
Playbook: `docs/delivery-playbook.md`

**Status:** Role docs + GitHub ops + **runtime v0 (3 agents)** + CI tests. Founder remains final authority on commercial, risk, and release.
