# Agent workspace: bring your own key

## Start locally

Requires Node.js 22+ and npm.

```sh
git clone https://github.com/eluan216/Elite-Data-Intelligence.git
cd Elite-Data-Intelligence/web-app
npm install
npm run dev
```

Open http://localhost:3000/agents. Choose a role, a provider, and a model ID available in your provider account. Enter your API key, describe your request, paste the relevant evidence, and run. No account or platform subscription is required. Provider API access and billing are your responsibility; a chat-product subscription is not an API key.

Supported providers: OpenAI, Anthropic, Google Gemini. Other vendors and arbitrary base URLs are not supported. Model IDs are explicit because availability and JSON support vary by account. The adapters call the providers' public JSON/text generation APIs, not code-execution tools.

Demo mode is a deliberate checkbox. It makes no provider requests, even if the deployment has an owner API key. Demo deliverables are templates and always require human review.

## Roles and execution

15 executable specialist roles are registered in `web-app/src/lib/agents/catalog.ts`. The Founder remains a human authority. The catalog defines each role's mission, required deliverables, source definition, and handoff.

Every request runs Intake → Research → Validation. Selecting an additional specialist inserts that specialist after Research and before Validation. Selecting Project Manager / Intake, Data Scientist / Research, or Validation runs the three core stages without a redundant fourth call. This provides shared framing and a consistent quality gate for every selected role.

### Project Manager / Intake (`intake`)

Turn the request into a scoped brief, explicit acceptance criteria, sequenced tasks and unresolved questions.

Required outputs: Brief; Acceptance criteria; Work breakdown.

Handoff: Human owner approves scope and dates.

### Data Scientist / Research (`research`)

Analyze supplied evidence, distinguish observations from assumptions, describe uncertainty and recommend a defensible decision.

Required outputs: Findings; Facts and assumptions; Source quotes.

Handoff: Validation reviews evidence against acceptance criteria.

### Validation / Quality (`validation`)

Evaluate supplied artifacts and reported results against every acceptance criterion. Missing execution logs or evidence cannot pass.

Required outputs: Criterion checks; Quality outcome; Review summary.

Handoff: Human owner accepts business outcomes; failure analysis investigates defects.

### Principal Decision Scientist (`principal-decision-scientist`)

Frame the decision, compare simple baselines with ML approaches, design an evaluation with leakage controls, and document cost of error.

Required outputs: Decision and alternatives; Evaluation protocol; Technical review.

Handoff: Applied ML implements the chosen approach.

### Lead Data Engineer (`lead-data-engineer`)

Design raw, cleaned and curated data layers; specify schema, ownership, lineage, freshness, access and recovery contracts.

Required outputs: Data architecture; Schema and lineage contracts; Data quality checks.

Handoff: Analytics Engineer implements transformations.

### MLOps / Platform Engineer (`senior-mlops-engineer`)

Produce serving and CI configuration drafts, a measurable monitoring plan and a rollback runbook with explicit approval gates.

Required outputs: Deployment configuration draft; Monitoring and alerts; Rollback runbook.

Handoff: Human operator reviews and executes deployment.

### Governance / Risk Lead (`ai-governance-risk-compliance`)

Identify privacy, model and operational risks from supplied facts; draft a risk register, model card and human oversight controls. Do not certify legal compliance.

Required outputs: Risk register; Model card; Human oversight controls.

Handoff: Qualified human reviews legal and high-risk decisions.

### Domain / Change Lead (`domain-change-management-lead`)

Map stakeholders and current workflow, propose adoption and training steps, define observable adoption outcomes without inventing organizational facts.

Required outputs: Stakeholder and workflow map; Adoption and training plan; Adoption measures.

Handoff: Engagement Manager coordinates rollout.

### Engagement / Delivery Manager (`engagement-delivery-manager`)

Assess delivery health from supplied commitments and progress, draft a client update and change-control decision log without promising new dates or prices.

Required outputs: Delivery health report; Client update draft; Change-control log.

Handoff: Human commercial owner approves commitments.

### Applied ML / Agent Engineer (`applied-ml-agent-engineer`)

Draft runnable implementation code with explicit inputs, dependencies, validation splits, deterministic seeds and meaningful evaluation tests. Do not claim execution.

Required outputs: Implementation code; Evaluation tests; Reproduction instructions.

Handoff: MLOps and Validation review implementation.

### Platform / Integration Specialist (`platform-integration-specialist`)

Draft interface contracts and connector code with timeouts, least-privilege authentication, bounded retries and idempotency. Use environment placeholders for secrets.

Required outputs: API and auth contract; Connector code; Failure and recovery tests.

Handoff: Human integrator supplies credentials and executes tests.

### Analytics Engineer (`mid-level-data-engineer`)

Draft concrete SQL or transformation code based on supplied schema, with lineage and tests for nulls, duplicates, schema drift and freshness.

Required outputs: Transformation SQL or code; Data tests; Lineage and handoff.

Handoff: Lead Data Engineer reviews contracts.

### Business Development / Client Success (`business-development-client-success`)

Qualify inbound needs, draft a discovery brief and follow-up, identify retention risks without inventing contacts, commercial terms, or sending messages.

Required outputs: Discovery qualification; Follow-up draft; Client success actions.

Handoff: Human owner approves and sends commercial communications.

### Failure Analysis / Improvement (`failure-analysis-improvement-agent`)

Analyze supplied failing logs and artifacts, distinguish root cause hypotheses from verified causes, rank impact, draft a fix and regression test.

Required outputs: Root-cause analysis; Corrective patch or actions; Regression verification plan.

Handoff: Relevant engineer implements; Validation checks the correction.

### Customer Support (`customer-support-agent`)

Answer using supplied project/service context, identify missing details and draft a helpful response plus escalation. Never invent bookings, live status, prices or ticket creation.

Required outputs: Support response draft; Routing and escalation; Information needed.

Handoff: Human support owner handles bookings, sensitive requests and external actions.


## What functioning means

Each role accepts project context and returns validated, role-specific work products. Engineering roles draft code, SQL, configurations and tests; delivery roles draft scoped plans, reports and communications. Outputs remain model-generated drafts until reviewed. These roles do not execute generated code, run user test suites, browse the web, access databases, send email, book calendars, or deploy systems. Those actions need separately authorized integrations and execution environments. Generated text is never rendered as HTML or executed.

Intake requires typed fields and unique acceptance-criterion IDs. Research and specialists can cite only exact substrings of the original evidence. Validation checks all criterion IDs, rejects duplicate/unknown checks, derives outcomes from individual results, and routes missing evidence, malformed checks, or unresolved questions to human review. A model review is not independent authentication of evidence, a legal certification, or a release approval.

## API

```http
POST /api/agents/tasks
Content-Type: application/json
X-Agent-Api-Key: YOUR_PROVIDER_KEY

{
  "provider": "openai",
  "model": "YOUR_MODEL_ID",
  "agent": "mid-level-data-engineer",
  "request": "Draft a transformation with duplicate and null tests",
  "evidence": "orders(id integer, amount numeric, created_at timestamp)"
}
```

Omit `agent` for the core workflow. The result contains `id`, `mode`, `status`, `steps`, `brief`, `research`, optional `specialist`, `validation`, optional sanitized `error`/`errorCode`, and `persistence: {"kind":"response"}`.

Explicit demo request (no key header):

```json
{"demo":true,"request":"Plan an evidence-based sales analysis"}
```

Missing credentials return 400; rejected keys/access return 401; provider rate/quota failures return 429; transport/provider failures return 502. Failed task responses include available completed stages. Other agent failures can return a created task with `status:"failed"`; always inspect status and validation rather than HTTP success alone.

Requests are limited to 128,000 bytes; request text to 8,000 characters, evidence to 20,000. Core runs make up to three model calls, specialists up to four, each requesting at most 4,096 output tokens. Calls have a 25-second timeout and the total request has a 105-second deadline. No automatic retries incur extra calls. Cost depends on model and token use, not a fixed quoted price.

## Credential and tenant isolation

- Keys live only in the current request context via Node AsyncLocalStorage. They are never written to process.env, localStorage, sessionStorage, task objects, prompts, GitHub issues, or application logs.
- Keys are transmitted to this server over HTTPS and forwarded only to the fixed endpoint of the selected provider. Use a deployment whose operator you trust. The operator's infrastructure can observe requests; configure tracing/reverse proxies not to log sensitive headers or request bodies.
- Public routes never fall back to deployment-owner credentials. Internal direct runtime calls retain optional server environment configuration for maintainers.
- Provider error bodies are never returned. Transport errors are sanitized; a provider echo of the current key is redacted from model output.
- Public runs bypass both the shared in-memory task store and GitHub persistence, even if GITHUB_TOKEN is set. No cross-user result retrieval exists: GET /api/agents/tasks/:id returns 410.
- Results remain in the page's memory until cleared or navigation, and can be downloaded as JSON. There is no automatic server recovery/history. Avoid sending secrets or unauthorized data in the request/evidence.
- Rate limiting is best-effort per instance, not distributed account quotas. Public endpoints reject cross-origin browser requests. Use HTTPS outside localhost.

## Self-hosting and verification

```sh
cd web-app
npm test
npm run build
npm start
```

Deploy as a Next.js Node application with at least a 120-second request allowance for the full synchronous workflow. No provider key or GitHub token is required on the server for public BYOK runs. Hosting plans with lower execution limits need a background worker before supporting long workflows. No shared multi-tenant database or account system is implied.

Provider tests use mocked HTTP responses. Every role is exercised through all three provider adapters, and separate tests cover interleaved user keys, malformed JSON, invalid credentials, quota errors, deadlines, demo isolation, source quotes, missing evidence and persistence failures. These do not establish live model accuracy or account billing/access.

Provider references:
- [OpenAI Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)
- [Anthropic Messages](https://platform.claude.com/docs/en/api/messages/create)
- [Gemini generateContent](https://ai.google.dev/api/generate-content)

For contribution and licensing details, see CONTRIBUTING.md and LICENSE in the repository root.
