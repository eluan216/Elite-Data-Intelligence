# Data analysis workbench (`/analyze`) — v2

Public utility on the agency site — separate from the marketing homepage.

## Features

| Feature | Status |
|---------|--------|
| CSV upload + validation | Yes (browser, max 2 MB) |
| Source vs analyzed row counts | Yes (truncation labeled) |
| Duplicate headers / ragged rows | Warned + padded |
| Data explorer | Yes |
| Column profiles | Yes |
| Correlations | Yes (Pearson; not causation) |
| Charts | Histogram / top categories |
| Data quality report | Missing, duplicates, constants, IQR outlier hints |
| Export summary + CSV | Yes (newline/quote-safe fields) |
| Sample dataset | Yes |
| History | Local summaries only + clear action |
| User accounts | Not yet |
| AI narrative insights | Not yet |

## Design rules

- Files are **not** uploaded to Elite-Data-Intelligence servers in v0/v2.
- Trustworthy calculations before AI explanations.
- Honest limits in UI copy.

## Code

- `web-app/src/app/analyze/page.tsx`
- `web-app/src/components/AnalyzeWorkbench.tsx`
- `web-app/src/lib/analyze/*`

## Tests

```bash
cd web-app && npm test
```
