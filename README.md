# Elite Data Intelligence

An open-source, bring-your-own-key workspace for AI and analytics work, alongside the Elite Data Intelligence consulting website.

## Use the agents

```sh
git clone https://github.com/eluan216/Elite-Data-Intelligence.git
cd Elite-Data-Intelligence/web-app
npm install
npm run dev
```

Requires Node.js 22+. Open **http://localhost:3000/agents**. Choose a role, select OpenAI, Anthropic or Google Gemini, enter a model ID and your API key, then submit a request with relevant evidence. Your key is used for that request only. No platform subscription is required; provider API usage is billed to your own account. Only enter keys on a deployment you trust.

**15 specialist roles are callable.** Every run uses Intake → Research → Validation; additional specialists generate their required deliverables before the shared quality gate. The Founder is a human authority, not an autonomous agent.

Roles cover project planning, research, validation, decision science, data architecture, MLOps, governance, adoption, engagement delivery, applied ML, integrations, analytics engineering, client success, failure analysis and customer support.

They draft work products such as code, SQL, tests, reports and runbooks. They do not execute code, deploy infrastructure, contact third parties, create bookings, or access private systems. Missing evidence and unresolved requirements require human review. Demo mode uses templates and makes no model calls.

[Full setup, role contracts, API and privacy boundaries](docs/agents/byok-workspace.md)

## Privacy

Public requests never use the deployment owner's model key. Visitor keys are not stored in browser storage, task records or GitHub issues. Public results are returned directly and are not retained in shared server history; download your JSON result before leaving. Requests and evidence go through the hosting server to the selected provider. Self-host for control over the deployment and its logging.

## Development

```sh
cd web-app
npm install
npm test
npm run build
```

Tests mock model APIs and persistence; they do not spend provider credits. The repository also includes Python accelerator tests in CI.

## Structure

- `web-app/`: Next.js website, agent workspace and CSV analyzer
- `web-app/src/lib/agents/`: provider adapters, role catalog, contracts and orchestration
- `agents/`: role definitions; each identifies current executable capabilities
- `accelerators/`: reusable analytics and machine-learning examples
- `docs/`: setup, operating playbooks and implementation notes

See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute. The software is provided under the [MIT license](LICENSE). Third-party dependencies, datasets and assets retain their own licenses; the project license does not grant rights to external client data.
