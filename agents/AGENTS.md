# Elite-Data-Intelligence Agent System

I run 16 specialized agents inside GitHub and on the agency website. This folder holds their definitions and operating instructions.

## Agent Roster
1. Founder / Managing Partner / Strategy Lead (me) ✅
2. Principal Decision Scientist / Senior AI Lead ✅
3. Lead Data Engineer / Lakehouse Architect ✅
4. Senior MLOps / Production & Platform Engineer ✅
5. AI Governance, Risk & Compliance Lead ✅
6. Domain / Industry & Change Management Lead ✅
7. Engagement / Delivery Manager ✅
8. Project Manager Agent ✅
9. Applied ML / Agent Engineer ✅
10. Data Scientist / Decision Analyst ✅
11. Platform & Integration Specialist ✅
12. Mid-level Data Engineer / Analytics Engineer ✅
13. Business Development / Client Success & Operations Support ✅
14. Validation / Test Execution Agent ✅
15. Failure Analysis & Improvement Agent ✅
16. Customer Support & Client Interaction Agent ✅

## How agents are invoked (operational)

Work is routed through **GitHub Issues** and **labels**. Issue templates live under `.github/ISSUE_TEMPLATE/`.

| Label | Intent | Auto Action |
|-------|--------|-------------|
| `agent:project-manager` | Sequencing, status, dependencies | PM intake comment |
| `agent:validation` | Quality checks vs acceptance criteria | Validation checklist |
| `agent:failure-analysis` | Root-cause and improvement | Failure analysis intake |
| `agent:customer-support` | Client/inbound interaction | Website chat + form |
| `engagement` | Client delivery work | — |
| `quality-gate` | Must pass before release | — |
| `discovery` | Inbound lead | — |

**Templates**
- **New Engagement** → Project Manager
- **Validation Request** → quality gate
- **Failure Analysis** → improvement loop

**Workflows** (`.github/workflows/`)
- `project-manager-intake.yml`
- `validation-checklist.yml`
- `failure-analysis-intake.yml`

Full lifecycle: `docs/delivery-playbook.md`  
Founder oversight: `docs/founder-metrics.md`

## Definitions (all complete)
See this folder for each role file written from my perspective as founder.

The Project Manager Agent keeps delivery coordinated.  
The Validation + Failure Analysis pair forms the continuous quality loop.  
The Customer Support Agent is the public face on the website.  
I remain the final authority on strategy, commercial decisions, quality gates, and risk.

**Status:** Definitions, labels, templates, playbook, founder metrics, and auto-intake Actions are live. Dry-run #1/#2 verified the path. Autonomous LLM workers are not yet automated — humans execute roles using these definitions and Actions.
