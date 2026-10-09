# Agent runtime v0

Based on the functional-agent review: three working agents on a shared runtime — not 16 autonomous apps.

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

Returns task `id`, `status`, `brief`, `research`, `validation`, `steps`, `mode`.

```http
GET /api/agents/tasks/:id
```

**Note:** Task store is **in-memory per server instance**. On Vercel, prefer the POST response body. Replace with Postgres (Supabase) before multi-instance production.

## Modes

| Mode | When |
|------|------|
| `mock` | No `OPENAI_API_KEY` — deterministic structured outputs (CI + local) |
| `llm` | `OPENAI_API_KEY` set (server-side only). Optional `OPENAI_MODEL` (default `gpt-4o-mini`) |

Never put API keys in the browser or the git repo.

## Permissions (v0)

Agents **cannot**: run shell commands, deploy, access private client systems, browse the open web, or make commercial commitments.

## Tests

```bash
cd web-app && npm test
```

Includes `runtime.test.ts` end-to-end mock pipeline.

## Next (not in v0)

- Supabase (or similar) for durable task state and audit log
- Background worker for long jobs
- GitHub tool (issues/PRs) behind explicit allow-list
- Founder approval UI
- Expand roles only after this vertical slice is reliable
