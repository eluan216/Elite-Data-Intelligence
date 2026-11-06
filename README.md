# Elite Data Intelligence

[![CI](https://github.com/eluan216/Elite-Data-Intelligence/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/eluan216/Elite-Data-Intelligence/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**AI, data science, and analytics work—with clear evidence and human accountability.**

I’m **Oguma Eluanatein Odo**, founder of Elite Data Intelligence. I built this project to bring together the way I approach consulting: define the decision, understand the data, build something useful, and test what it actually does.

I’m opening the source so other people can use the tools, inspect the implementation, and help improve it. The repository includes my consulting website, a browser-local CSV workbench, and an agent workspace that runs on your own model API key.

[Visit the website](https://web-app-flame-nu.vercel.app) · [Use the agents](https://web-app-flame-nu.vercel.app/agents) · [Analyze a CSV](https://web-app-flame-nu.vercel.app/analyze) · [Read the setup guide](docs/agents/byok-workspace.md)

![Monochrome collage illustration used on the Elite Data Intelligence website](web-app/public/images/optimized/hero-collage.webp)

## Why I built it

I care about the gap between an impressive prototype and a system someone can trust. A model score alone does not tell me whether the data is suitable, the decision is useful, or the result will survive real use.

This project is where I make that approach visible: explicit acceptance criteria, evidence separated from assumptions, reproducible examples, and a human quality gate. I keep demonstrations labeled as demonstrations. I do not present synthetic experiments as client outcomes.

## What you can use today

| Tool | What it does |
| --- | --- |
| **Agent workspace — `/agents`** | Runs 15 specialist roles using your OpenAI, Anthropic, or Gemini key, with structured outputs and a shared quality review. |
| **Data workbench — `/analyze`** | Profiles CSV columns, flags quality issues, explores rows, draws charts, and exports results in your browser. |
| **Website project assistant** | Uses conversation context to help visitors clarify a project and prepare a reviewable inquiry brief. Guided mode works without a server model key. |
| **Operations-priority demonstration** | Shows a reproducible ranking workflow, feature contracts, evaluation, tests, and a model card using synthetic data. |
| **Consulting website** | Presents my approach, selected public work, and a contact form with configurable email delivery. |

The client portal and internal operations pages are **placeholders**. I have not connected authenticated client records, live project dashboards, or a booking system.

## Get started locally

You need **Node.js 22+** and npm. Python is optional unless you want to run the operations-priority example.

```sh
git clone https://github.com/eluan216/Elite-Data-Intelligence.git
cd Elite-Data-Intelligence/web-app
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). The agent workspace is at [localhost:3000/agents](http://localhost:3000/agents), and the CSV workbench is at [localhost:3000/analyze](http://localhost:3000/analyze).

**No server API key is needed to explore the site, analyze a CSV, or try the agent demo.**

For optional website chat and contact-form configuration, copy [web-app/.env.example](web-app/.env.example) to `web-app/.env.local` and fill in only the settings you need. Never commit real credentials.

## Use your own model key

1. Open **Agent workspace** and choose the core workflow or a specialist.
2. Select **OpenAI**, **Anthropic**, or **Google Gemini**.
3. Enter a text model ID available in your account and your provider API key.
4. Describe the work, including the desired output, owner, constraints, and success criteria.
5. Paste relevant evidence—such as schemas, source notes, code, or test logs—and run.
6. Review the quality checks and download your result as JSON.

You do not need a subscription to this project. Your provider may charge for API usage, and a chat-product subscription does not provide an API key. The key is used for one run; the field clears when the run begins. Only enter a key on a deployment you trust, or self-host.

If you just want to explore, select **demo mode**. Its outputs are clearly labeled templates, and it makes no model calls.

[Provider setup, API examples, privacy boundaries, and hosting limits →](docs/agents/byok-workspace.md)

## How I organize the agents

Every request follows:

```text
Intake → Research → Selected specialist (when needed) → Validation → Your review
```

Intake defines the brief and acceptance criteria. Research examines the supplied evidence. A selected specialist produces its required work products. Validation checks the result against the criteria and requests human review when information or evidence is missing.

| Area | Callable roles |
| --- | --- |
| Planning and delivery | Project Manager / Intake; Engagement / Delivery Manager; Domain / Change Lead |
| Decisions and analysis | Principal Decision Scientist; Data Scientist / Research |
| Engineering | Lead Data Engineer; Analytics Engineer; Applied ML / Agent Engineer; MLOps / Platform Engineer; Platform / Integration Specialist |
| Quality and governance | Validation / Quality; Failure Analysis / Improvement; Governance / Risk Lead |
| Client-facing work | Business Development / Client Success; Customer Support |

That is **15 callable specialist roles**. The Founder remains a human role. I keep each role’s mission, required deliverables, and handoff in a [typed catalog](web-app/src/lib/agents/catalog.ts), alongside the [written role definitions](agents/AGENTS.md).

The agents generate work products: analyses, code, SQL, test drafts, configurations, plans, reports, and runbooks. They do not execute generated code, deploy systems, send messages, create bookings, or access private systems. Those actions need separate, explicitly authorized integrations. A model-generated review does not replace my—or your—judgment.

## Data handling and practical limits

- **CSV files stay in your browser.** The workbench accepts files up to 2 MB and analyzes the first 5,000 data rows. It labels subsets and stores only optional local summaries, which you can clear.
- **Agent keys are request-local.** Public runs never fall back to my deployment key. The application does not store visitor keys in browser storage, task records, or GitHub issues.
- **Public agent results are returned directly.** Download your result before leaving; there is no shared server task-history service.
- **AI requests go through the hosting server to your selected provider.** Avoid secrets and data you are not authorized to share. Self-host if you need control over the deployment.
- **Hosting limits matter.** The synchronous agent workflow uses up to three model calls, or four with an additional specialist. Full workflows require a host that allows 120-second requests.
- **Automated tests use mocked model APIs.** They verify contracts, isolation, and failure handling; they do not establish live model accuracy or provider account access.

I document the details in the [agent guide](docs/agents/byok-workspace.md), [CSV workbench guide](docs/analyze-workbench.md), and website [privacy page](https://web-app-flame-nu.vercel.app/privacy).

## Run the checks

From `web-app/`:

```sh
npm test
npm run build
```

For the Python demonstration, from the repository root:

```sh
cd projects/ops-priority-decision-system
python -m pip install -r requirements.txt
python -m pytest -q
python -m src.train_eval
```

GitHub Actions also runs production-browser checks for the website, agent workspace, and CSV workbench, including keyboard interactions, mobile layouts, downloads, and accessibility.

## Find your way around

```text
.
├── web-app/       Next.js website, agent workspace, CSV tools, and tests
├── agents/        Role definitions and current capability boundaries
├── projects/      Reproducible demonstrations and their documentation
├── docs/          Setup guides, design notes, and delivery playbooks
├── accelerators/  Index of reusable patterns and templates
└── .github/       CI, browser QA, and issue templates
```

Start with the [documentation index](docs/README.md) or the [web application guide](web-app/README.md).

## Where I’m taking this

My next priorities are durable, access-controlled task history; background processing for longer runs; better live-model evaluations; and carefully scoped integrations for actions beyond drafting. I will keep the documentation aligned with what the software can actually do.

## Contribute or get in touch

I welcome focused bug reports, reproducible examples, documentation improvements, and useful role or provider contributions. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Do not include API keys, private client data, or confidential logs in issues.

You can reach me at **[ogumaeluan@gmail.com](mailto:ogumaeluan@gmail.com)** or through [my GitHub profile](https://github.com/eluan216).

## License

I’m releasing the software under the [MIT License](LICENSE). Dependencies, external datasets, and third-party assets retain their own licenses.
