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

## Parsing and analysis contract

- Leading-zero identifiers and integers outside JavaScript's safe integer range stay as text.
- Signed decimals, scientific notation, and correctly grouped thousands are numeric when finite.
- A column is numeric only when all its non-missing values are numeric. Mixed columns are
  labeled explicitly and use category counts instead of partial numeric statistics.
- Duplicate headers retain their display names and receive collision-free internal keys.
- Only the first 5,000 rows are retained for analysis; source row counts still cover the file.
- Duplicate checks compare complete typed rows. IQR hints also work when the middle half
  of the values are identical; they remain exploratory, not definitive anomaly labels.
