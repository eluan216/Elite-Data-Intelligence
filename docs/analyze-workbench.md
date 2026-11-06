# Data workbench (`/analyze`)

A browser-local CSV workspace for descriptive analysis, styled alongside the
agency's editorial website. It does not send files or computed results to the
chat assistant or an analysis API.

## Workflow

1. Choose or drop a `.csv` file up to 2 MB, or explore the built-in sales sample.
2. Review dataset metrics and column profiles in Overview.
3. Check missing values, mixed types, exact duplicates, constants, and IQR hints.
4. Search analyzed rows in Data explorer, with 20 rows per page.
5. Explore numeric distributions or top-category counts and inspect the exact
   values used in the chart.
6. Export the summary, all analyzed rows, or the current search matches.

## Limits and interpretation

The first 5,000 data rows are retained for analysis. Source row counts still cover
the full file and a persistent subset notice applies to profiles, charts, and
exports. Export CSV means all analyzed rows, not necessarily the original file;
Export filtered CSV means only the current matches.

Leading-zero identifiers and unsafe integers stay as text. Signed decimals,
scientific notation, and valid grouped thousands are numeric when finite.
Mixed numeric/text columns are labeled, flagged, and use category counts rather
than statistics that silently omit text. Duplicate display headers receive
unique internal keys and numbered choices.

The overview correlation scan uses the first 20 numeric columns to bound browser work;
a notice appears for wider datasets. It reports up to six pairs. Correlations use
pairwise-complete observations and are not causal. IQR flags are
exploratory hints rather than definitive anomaly labels. No claim of general
fitness follows from an absence of flags.

## Local history and privacy

Up to 12 text summaries are stored in local storage on this device. Raw files and
full datasets are not persisted. History is accessible without loading a new
file, supports summary downloads, and can be cleared. Unreadable or partial
storage entries are ignored safely. Reloading after Clear history keeps it empty.

Browser storage is separate from the current in-memory dataset. Clear analysis
clears that dataset and cancels pending file reads; it does not erase saved
summaries. A later file selection takes precedence over an earlier slower read.

## Accessibility and design

The workspace uses ink surfaces, a light chart/sample panel, and restrained
chartreuse actions. Navigation is a keyboard-operable tablist with arrow keys,
Home, and End. Scrollable tables are keyboard-focusable and have captions.
Uploads, errors, loading, and successful reads have accessible labels/status.
Mobile layouts keep wide tables inside horizontal scroll regions.

## Verification

Unit tests cover parsing, feature/statistical contracts, histogram boundaries,
mixed-column findings, and malformed history. The production-browser workflow
checks upload rejection, sample/real fixtures, search, pagination, all export
scopes, mixed data, truncation, racing reads, keyboard navigation, and local
history. It asserts that no POST requests occur during analyzer use.

Screenshots and axe WCAG 2 A/AA reports are produced by:
`node scripts/analyzer-qa.mjs` in the Website design QA workflow.
