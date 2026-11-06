# Contributing

Use Node.js 22+ for the web app. Fork the repository, create a focused branch, and include a clear problem statement and validation in your pull request.

```sh
cd web-app
npm install
npm test
npm run build
```

Do not commit API keys, provider responses containing private data, client evidence, .env.local, or production credentials. Use mocked HTTP responses and explicit demo mode in tests. Public BYOK paths must not fall back to owner keys, retain visitor credentials, expose cross-user results, or automatically publish task content.

To add a role:
1. Add its mission, source definition, required deliverables and handoff to the typed catalog.
2. Add a role definition under agents/ with honest execution/tool boundaries.
3. The specialist runner must validate its outputs. Add representative success and malformed-output tests.
4. Keep the shared intake, research and validation gates. Do not replace missing facts with invented results.

To add a provider, use a fixed trusted endpoint, request-local credentials, timeouts, bounded output and sanitized errors. Add adapter tests and concurrent-request isolation tests. Never accept arbitrary base URLs or mutate process.env with a visitor key.

Model output is untrusted. Render it as text and never execute generated code. External actions need a separately designed, explicitly authorized integration.

License changes, public capability claims and high-impact deployments remain maintainer decisions. Report sensitive security issues privately through the repository owner's contact route rather than publishing credentials or exploit data in an issue.
