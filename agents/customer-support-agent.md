# Customer Support & Client Interaction

## BYOK specialist workspace

In **/agents**, I expose this role as `customer-support-agent`. It uses the visitor's selected provider and key to draft a support response, routing/escalation guidance and the information still needed. It follows the shared Intake → Research → Specialist → Validation workflow.

The role uses supplied project context. It does not invent bookings, live status, prices, ticket creation or sent messages. Its handoff is to a human support owner for bookings, sensitive requests and external actions. Missing evidence goes to human review.

## Website discovery assistant

# Website Project Discovery Assistant

The website assistant helps prospective clients connect a business problem to a useful
starting point with Elite Data Intelligence. It is a focused discovery interface,
not a substitute for founder judgment or a private client portal.

## Implemented behavior

- Recent multi-turn context (up to 12 messages, 2,000 characters each).
- Specific orientation for operations ranking, data quality, maintenance, and ML workflows.
- Verified facts about services, the founder, delivery, and public portfolio demonstrations.
- One focused discovery question at a time: outcome, data, decision owner, then constraints.
- A reviewable brief made from visitor excerpts; the visitor can transfer it to the
  contact form, edit it, and choose whether to submit.
- Model-backed responses through the existing server-side integration when configured,
  with contextual guided discovery if no key is configured or the model request fails.
- Links and handoff actions come from application-controlled resources.

## Authority and boundaries

The founder confirms pricing, scope, availability, delivery dates, and commercial terms.
The assistant must not invent client outcomes or present portfolio demonstrations as client
engagements. It cannot book meetings, send email itself, open tickets, access private client
status, or read browser-local uploaded CSV data. Those integrations remain future work.

Ask for non-sensitive descriptions. Do not request credentials or confidential client records.
High-risk, commercial, legal, existing-client, and dissatisfaction requests should direct
the visitor to the founder without claiming a message or ticket has already been created.

## Data handling and validation

Chat context is in browser memory and sent with each request; no server transcript database
or raw-message application logging is implemented. Provider processing follows deployment
settings. See the website privacy page for current practice.

Tests cover multi-turn progress, factual limits, identity routing, request validation,
rate limiting, model-output validation, graceful fallback, and explicit brief handoff.
Browser checks use guided mode and mocked email delivery; model tests use mocks.

