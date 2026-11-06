# Agent runtime: historical v0 documentation

The original three-role, server-key-only runtime has been expanded. See [the current BYOK workspace documentation](byok-workspace.md) for supported roles, API examples, privacy, limits, and self-hosting.

Public task runs require the visitor's provider key or explicit demo mode. They do not use the site owner's environment key and do not persist to GitHub issues or a shared task store. GET task history is intentionally disabled for public runs.

Internal direct runtime callers can still use a server-side OpenAI key and optional GitHub persistence. Do not expose that internal path to untrusted users or private task content without access control.
