# Agent runtime v0

Three working agents on a shared runtime — not 16 autonomous apps.

## Agents

| Agent | Role |
|-------|------|
| **Intake** | Structured brief, missing info, acceptance criteria, subtasks |
| **Research** | Facts vs assumptions vs limitations from supplied evidence only |
| **Validation** | Pass / fail / needs_human_review against criteria |

## API

```http
POST /api/agents/tasks
Content-Type: application/json

{
  "request": "Business problem description…",
  "evidence": "Optional pasted notes or data summary"
}
```

Returns task `id`, `status`, `mode`, `brief`, `research`, `validation`, `steps`, `persistence`.

```http
GET /api/agents/tasks/:id
```

Rate limit: ~10 requests / 15 minutes / IP (per instance).

## Persistence

| Setup | Behavior |
|-------|----------|
| Default | In-memory only (POST response is source of truth on Vercel) |
| `GITHUB_TOKEN` set on Vercel | Terminal tasks create a GitHub issue (label `agent:runtime`) |

Optional: `GITHUB_REPO` (default `eluan216/Elite-Data-Intelligence`).

Token needs `issues: write` on the repo. Never commit the token.

Response field:

```json
"persistence": {
  "kind": "github_issue",
  "url": "https://github.com/.../issues/N"
}
```

or `{ "kind": "memory", "error": "…" }` when no token / create failed.

Postgres/Supabase remains the longer-term multi-instance store; GitHub issues are the audit trail that fits the current operating model without a new database.

## Modes

| Mode | When |
|------|------|
| `mock` | No OpenAI key — deterministic outputs (CI + local) |
| `llm` | `OPENAI_API_KEY` or `OPEN_AI_KEY` set server-side. Optional `OPENAI_MODEL` |

Requires OpenAI **credits** for successful LLM runs. Without credits you get `mode: llm` but step errors (HTTP 429).

## Permissions (v0)

Agents **cannot**: run shell, deploy, access private client systems, open-web browse, or make commercial commitments.

## Tests

```bash
cd web-app && npm test
```

## Roadmap after this slice

1. ~~Secure contact + CI~~
2. ~~Runtime + three agents~~
3. ~~GitHub issue persistence (when token set)~~
4. Background worker for long jobs
5. Founder approval UI on `/ops`
6. Expand roles only after this path is reliable with credits
