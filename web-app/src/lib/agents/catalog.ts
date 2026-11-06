/** Executable roles; Founder is deliberately a human authority, not a model. */
export const AGENT_CATALOG = [
  {
    "id": "intake",
    "name": "Project Manager / Intake",
    "source": "agents/project-manager-agent.md",
    "mission": "Turn the request into a scoped brief, explicit acceptance criteria, sequenced tasks and unresolved questions.",
    "deliverables": [
      "Brief",
      "Acceptance criteria",
      "Work breakdown"
    ],
    "handoff": "Human owner approves scope and dates"
  },
  {
    "id": "research",
    "name": "Data Scientist / Research",
    "source": "agents/data-scientist-decision-analyst.md",
    "mission": "Analyze supplied evidence, distinguish observations from assumptions, describe uncertainty and recommend a defensible decision.",
    "deliverables": [
      "Findings",
      "Facts and assumptions",
      "Source quotes"
    ],
    "handoff": "Validation reviews evidence against acceptance criteria"
  },
  {
    "id": "validation",
    "name": "Validation / Quality",
    "source": "agents/validation-test-execution-agent.md",
    "mission": "Evaluate supplied artifacts and reported results against every acceptance criterion. Missing execution logs or evidence cannot pass.",
    "deliverables": [
      "Criterion checks",
      "Quality outcome",
      "Review summary"
    ],
    "handoff": "Human owner accepts business outcomes; failure analysis investigates defects"
  },
  {
    "id": "principal-decision-scientist",
    "name": "Principal Decision Scientist",
    "source": "agents/principal-decision-scientist.md",
    "mission": "Frame the decision, compare simple baselines with ML approaches, design an evaluation with leakage controls, and document cost of error.",
    "deliverables": [
      "Decision and alternatives",
      "Evaluation protocol",
      "Technical review"
    ],
    "handoff": "Applied ML implements the chosen approach"
  },
  {
    "id": "lead-data-engineer",
    "name": "Lead Data Engineer",
    "source": "agents/lead-data-engineer.md",
    "mission": "Design raw, cleaned and curated data layers; specify schema, ownership, lineage, freshness, access and recovery contracts.",
    "deliverables": [
      "Data architecture",
      "Schema and lineage contracts",
      "Data quality checks"
    ],
    "handoff": "Analytics Engineer implements transformations"
  },
  {
    "id": "senior-mlops-engineer",
    "name": "MLOps / Platform Engineer",
    "source": "agents/senior-mlops-engineer.md",
    "mission": "Produce serving and CI configuration drafts, a measurable monitoring plan and a rollback runbook with explicit approval gates.",
    "deliverables": [
      "Deployment configuration draft",
      "Monitoring and alerts",
      "Rollback runbook"
    ],
    "handoff": "Human operator reviews and executes deployment"
  },
  {
    "id": "ai-governance-risk-compliance",
    "name": "Governance / Risk Lead",
    "source": "agents/ai-governance-risk-compliance.md",
    "mission": "Identify privacy, model and operational risks from supplied facts; draft a risk register, model card and human oversight controls. Do not certify legal compliance.",
    "deliverables": [
      "Risk register",
      "Model card",
      "Human oversight controls"
    ],
    "handoff": "Qualified human reviews legal and high-risk decisions"
  },
  {
    "id": "domain-change-management-lead",
    "name": "Domain / Change Lead",
    "source": "agents/domain-change-management-lead.md",
    "mission": "Map stakeholders and current workflow, propose adoption and training steps, define observable adoption outcomes without inventing organizational facts.",
    "deliverables": [
      "Stakeholder and workflow map",
      "Adoption and training plan",
      "Adoption measures"
    ],
    "handoff": "Engagement Manager coordinates rollout"
  },
  {
    "id": "engagement-delivery-manager",
    "name": "Engagement / Delivery Manager",
    "source": "agents/engagement-delivery-manager.md",
    "mission": "Assess delivery health from supplied commitments and progress, draft a client update and change-control decision log without promising new dates or prices.",
    "deliverables": [
      "Delivery health report",
      "Client update draft",
      "Change-control log"
    ],
    "handoff": "Human commercial owner approves commitments"
  },
  {
    "id": "applied-ml-agent-engineer",
    "name": "Applied ML / Agent Engineer",
    "source": "agents/applied-ml-agent-engineer.md",
    "mission": "Draft runnable implementation code with explicit inputs, dependencies, validation splits, deterministic seeds and meaningful evaluation tests. Do not claim execution.",
    "deliverables": [
      "Implementation code",
      "Evaluation tests",
      "Reproduction instructions"
    ],
    "handoff": "MLOps and Validation review implementation"
  },
  {
    "id": "platform-integration-specialist",
    "name": "Platform / Integration Specialist",
    "source": "agents/platform-integration-specialist.md",
    "mission": "Draft interface contracts and connector code with timeouts, least-privilege authentication, bounded retries and idempotency. Use environment placeholders for secrets.",
    "deliverables": [
      "API and auth contract",
      "Connector code",
      "Failure and recovery tests"
    ],
    "handoff": "Human integrator supplies credentials and executes tests"
  },
  {
    "id": "mid-level-data-engineer",
    "name": "Analytics Engineer",
    "source": "agents/mid-level-data-engineer.md",
    "mission": "Draft concrete SQL or transformation code based on supplied schema, with lineage and tests for nulls, duplicates, schema drift and freshness.",
    "deliverables": [
      "Transformation SQL or code",
      "Data tests",
      "Lineage and handoff"
    ],
    "handoff": "Lead Data Engineer reviews contracts"
  },
  {
    "id": "business-development-client-success",
    "name": "Business Development / Client Success",
    "source": "agents/business-development-client-success.md",
    "mission": "Qualify inbound needs, draft a discovery brief and follow-up, identify retention risks without inventing contacts, commercial terms, or sending messages.",
    "deliverables": [
      "Discovery qualification",
      "Follow-up draft",
      "Client success actions"
    ],
    "handoff": "Human owner approves and sends commercial communications"
  },
  {
    "id": "failure-analysis-improvement-agent",
    "name": "Failure Analysis / Improvement",
    "source": "agents/failure-analysis-improvement-agent.md",
    "mission": "Analyze supplied failing logs and artifacts, distinguish root cause hypotheses from verified causes, rank impact, draft a fix and regression test.",
    "deliverables": [
      "Root-cause analysis",
      "Corrective patch or actions",
      "Regression verification plan"
    ],
    "handoff": "Relevant engineer implements; Validation checks the correction"
  },
  {
    "id": "customer-support-agent",
    "name": "Customer Support",
    "source": "agents/customer-support-agent.md",
    "mission": "Answer using supplied project/service context, identify missing details and draft a helpful response plus escalation. Never invent bookings, live status, prices or ticket creation.",
    "deliverables": [
      "Support response draft",
      "Routing and escalation",
      "Information needed"
    ],
    "handoff": "Human support owner handles bookings, sensitive requests and external actions"
  }
] as const;
export type CatalogRole = typeof AGENT_CATALOG[number]["id"];
export function findAgent(id:string) { return AGENT_CATALOG.find(agent=>agent.id===id); }
