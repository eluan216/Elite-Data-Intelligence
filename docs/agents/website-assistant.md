# Website project assistant

## Conversation contract

POST `/api/support-chat` accepts `messages: [{role: "user" | "assistant", content: string}]`.
The last turn must be a user message. Up to 12 recent messages are accepted; each
contains 1–2,000 characters. The old `{message: "..."}` shape remains supported.
Invalid payloads return 400. The best-effort per-instance limit is 30 messages per
15 minutes per IP; global quotas should be handled at the hosting edge.

Responses contain `reply`, `quickReplies`, controlled `links`, optional visitor
excerpt `brief`, `agent: "project-discovery"`, and `mode: "llm" | "guided"`.
Responses are not cached. The application does not log message bodies.

## Grounding and modes

The assistant's company facts, examples, boundaries, and source links live in
`web-app/src/lib/support/conversation.ts`. Public portfolio work is identified
as demonstrations; clinical demos retain their research-only limits.

The existing `OPENAI_API_KEY` / `OPEN_AI_KEY` server-side configuration enables
model-backed answers. `OPENAI_MODEL` uses the shared runtime setting. The support
request has a 12-second model timeout and validates response shape/length before
rendering it. Provider failure or invalid output falls back to guided discovery
with the same recent visitor context. No provider details are exposed to visitors.
A model key and available provider credits are required for live AI responses.

The guided flow uses message boundaries, recent answers, and the preceding
question to progress from outcome to data, ownership, and constraints. It does
not merely match one keyword and repeat a generic FAQ.

## Handoff

The brief consists of labeled excerpts of visitor messages, not invented facts.
The visitor explicitly selects “Use this brief in the inquiry form,” reviews or
edits the field, adds contact details, and submits. The assistant itself does not
send email, book a call, or create a ticket.

History lives in page memory, not local storage. Starting a new chat resets it.
The privacy page explains server/model processing and the browser-local CSV
workbench remains separate.

## Verification

Unit tests mock model calls and cover the success, failure, and malformed-output
paths without live API spend. Browser QA walks through ticket prioritization,
customer impact, Zendesk, and form prefill. It verifies that prefill does not send
an email and that a new chat resets the visible conversation.
