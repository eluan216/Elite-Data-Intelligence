# Phase 1 security notes (2026-10-09)

Implemented in repo:

- Contact API: HTML escape on all interpolated fields
- Contact API: success only after Resend accepts (503 if misconfigured)
- Contact API: field length limits, basic rate limit (per instance)
- Contact API: logs email domain + lengths only (not full message body)
- Support chat: mode always `knowledge` until real LLM is wired
- `robots.ts`: disallow `/ops`, `/portal`, `/api/`
- Privacy page at `/privacy`
- Ops/portal: noindex metadata + explicit placeholder warnings

Founder actions outside code:

1. Test the public URL in a **logged-out** browser (Vercel SSO protection on *.vercel.app).
2. Review Resend key security warning in Vercel; rotate if exposure is possible.
3. Prefer production-only scope for `RESEND_API_KEY` when practical.
4. Submit a test discovery form and confirm email arrives.
