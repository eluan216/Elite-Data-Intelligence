# Elite Data Intelligence agent system

The roster has 16 documented roles: **15 executable AI specialists and one human Founder**. Runtime code lives in web-app/src/lib/agents; the source of truth for executable missions, output contracts and handoffs is catalog.ts.

Public entry point: **/agents**. Visitors bring an OpenAI, Anthropic or Gemini key for each run, or explicitly choose demo mode. Keys are request-local and public results are response-only. See [setup and capability documentation](../docs/agents/byok-workspace.md).

## Executable workflow

Intake → Research → optional selected specialist → Validation.

- Project Manager uses Intake to produce the brief and acceptance criteria.
- Data Scientist uses Research to analyze supplied evidence.
- Validation evaluates criteria with complete, consistent checks.
- The other twelve specialists produce concrete role-specific drafts and structured handoffs, checked before the quality gate.
- Demo mode is not performed specialist work and cannot certify acceptance.

## Boundaries

Agents produce code, SQL, test drafts, configurations, analyses, reports and plans. They have no shell, deployment, web browsing, private-data, messaging, booking or GitHub-write tools. No agent may claim those actions have happened. Human review owns commercial commitments, regulated/high-risk decisions and releases. The Founder role is never impersonated as an autonomous executor.

Existing role documents include the agency's intended responsibilities. Their "Current executable capability" sections define what the current software actually does. External integrations and execution environments are future work, not implied by supplying a model key.

## Role catalog

- [Project Manager / Intake](project-manager-agent.md) — `intake`
- [Data Scientist / Research](data-scientist-decision-analyst.md) — `research`
- [Validation / Quality](validation-test-execution-agent.md) — `validation`
- [Principal Decision Scientist](principal-decision-scientist.md) — `principal-decision-scientist`
- [Lead Data Engineer](lead-data-engineer.md) — `lead-data-engineer`
- [MLOps / Platform Engineer](senior-mlops-engineer.md) — `senior-mlops-engineer`
- [Governance / Risk Lead](ai-governance-risk-compliance.md) — `ai-governance-risk-compliance`
- [Domain / Change Lead](domain-change-management-lead.md) — `domain-change-management-lead`
- [Engagement / Delivery Manager](engagement-delivery-manager.md) — `engagement-delivery-manager`
- [Applied ML / Agent Engineer](applied-ml-agent-engineer.md) — `applied-ml-agent-engineer`
- [Platform / Integration Specialist](platform-integration-specialist.md) — `platform-integration-specialist`
- [Analytics Engineer](mid-level-data-engineer.md) — `mid-level-data-engineer`
- [Business Development / Client Success](business-development-client-success.md) — `business-development-client-success`
- [Failure Analysis / Improvement](failure-analysis-improvement-agent.md) — `failure-analysis-improvement-agent`
- [Customer Support](customer-support-agent.md) — `customer-support-agent`

[Founder / Managing Partner](founder-managing-partner.md) remains human.

GitHub label automations are separate from the public BYOK workspace. They do not grant visitor tasks repository access or publish visitor content.

## Separate website discovery assistant

The homepage also has a contextual project-discovery chat with guided mode and optional server-configured OpenAI responses. It is separate from the visitor-key specialist workspace. See [its conversation and privacy contract](../docs/agents/website-assistant.md).
