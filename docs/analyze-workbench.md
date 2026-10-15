# Data analysis workbench (`/analyze`)

Public utility on the agency site — separate from the marketing homepage.

## v0 features

| Feature | Status |
|---------|--------|
| CSV upload + validation | Yes (browser, max 2 MB, 5k rows displayed) |
| Data explorer | Yes (first 100 rows preview) |
| Column profiles, missing %, means | Yes |
| Correlations (numeric) | Yes |
| Charts (histogram / top categories) | Yes |
| Export summary + CSV | Yes |
| History | Local only (`localStorage`) |
| User accounts / private cloud reports | Not yet |

## Design rules

- Does not alter the homepage layout beyond a nav link.
- Files are **not** uploaded to Elite-Data-Intelligence servers in v0.
- Honest copy: local processing; accounts later.

## Code

- `web-app/src/app/analyze/page.tsx`
- `web-app/src/components/AnalyzeWorkbench.tsx`
- `web-app/src/lib/analyze/*`

## Tests

```bash
cd web-app && npm test
```
