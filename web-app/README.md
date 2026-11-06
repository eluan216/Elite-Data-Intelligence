# Web application

I use this Next.js application for my consulting website, the public agent workspace, and the browser-local CSV workbench.

## Local development

Requires Node.js 22+ and npm.

```sh
cd web-app
npm install
npm run dev
```

Open http://localhost:3000. For optional server integrations, copy [.env.example](.env.example) to `.env.local`. Public BYOK runs do not need a server model key.

## Routes

| Route | Current behavior |
| --- | --- |
| `/` | Editorial consulting website, selected work, project chat and inquiry form |
| `/agents` | 15 specialist roles using a visitor's key or explicit demo mode |
| `/analyze` | Browser-local CSV analysis, quality checks, charts and exports |
| `/privacy` | Current data-handling practices |
| `/portal` | Placeholder; no authenticated client data |
| `/ops` | Placeholder; no access-controlled operations dashboard |

## Server settings

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Optional model-backed website discovery chat and internal direct runtime calls |
| `OPENAI_MODEL` | Optional server model override; defaults to `gpt-4o-mini` |
| `RESEND_API_KEY` | Optional contact-form email delivery |
| `CONTACT_TO_EMAIL` | Destination for contact inquiries |

`OPEN_AI_KEY` is supported as a legacy key alias. Public `/agents` runs always require the visitor's key or explicit demo; they never borrow the server key. The separate website discovery chat uses server configuration and falls back to guided mode.

Contact delivery is unavailable until both email settings are configured. The current sender is Resend's onboarding address; configure an appropriate verified sender before using a self-hosted deployment for general public delivery.

Optional GitHub issue persistence applies only to trusted internal runtime calls; see [the internal setup notes](../docs/agents/github-token-setup.md). It is disabled for public visitor runs.

## Verification

```sh
npm test
npm run build
npm start
```

GitHub Actions runs unit tests, production builds and browser QA. Browser scripts need their workflow's Playwright/axe tooling and installed Chrome; see [.github/workflows](../.github/workflows).

## Implementation map

- `src/app/`: pages and API routes
- `src/components/`: website and workbench interfaces
- `src/lib/agents/`: request-local credentials, adapters, role catalog, contracts and orchestration
- `src/lib/analyze/`: CSV parsing, statistics, quality checks and local summaries
- `src/lib/support/`: grounded website discovery conversation
- `scripts/`: browser QA and image preparation
- `public/images/`: source imagery and optimized posters

## Guides

- [Agent setup, API and limits](../docs/agents/byok-workspace.md)
- [CSV workbench](../docs/analyze-workbench.md)
- [Website assistant](../docs/agents/website-assistant.md)
- [Website design system](../docs/website-design.md)
- [Contribution guide](../CONTRIBUTING.md)

I keep the original [product requirements](../docs/PRD-web-app.md) as planning context. They include future capabilities; the route table and current guides describe what is implemented.
