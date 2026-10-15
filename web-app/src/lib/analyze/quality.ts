import type { DataTable } from "./csv";
import { columnValues, isNumericColumn } from "./csv";
import type { ColumnProfile } from "./stats";

export interface QualityFinding {
  severity: "info" | "warn" | "high";
  code: string;
  message: string;
}

export interface QualityReport {
  totalMissingCells: number;
  missingPct: number;
  duplicateRowCount: number;
  constantColumns: string[];
  outlierHints: { column: string; count: number }[];
  findings: QualityFinding[];
}

export function buildQualityReport(
  table: DataTable,
  profiles: ColumnProfile[]
): QualityReport {
  const findings: QualityFinding[] = [];

  let totalMissingCells = 0;
  for (const p of profiles) totalMissingCells += p.missing;
  const totalCells = table.rowCount * table.colCount || 1;
  const missingPct = (totalMissingCells / totalCells) * 100;

  if (missingPct > 20) {
    findings.push({
      severity: "high",
      code: "missing_heavy",
      message: `${missingPct.toFixed(1)}% of cells are missing across the analyzed rows.`,
    });
  } else if (missingPct > 5) {
    findings.push({
      severity: "warn",
      code: "missing_moderate",
      message: `${missingPct.toFixed(1)}% of cells are missing.`,
    });
  }

  const constantColumns: string[] = [];
  for (const p of profiles) {
    if (p.unique <= 1 && p.missing < table.rowCount) {
      constantColumns.push(p.name);
      findings.push({
        severity: "info",
        code: "constant_column",
        message: `Column "${p.name}" has only one distinct non-null value.`,
      });
    }
  }

  const duplicateRowCount = countDuplicateRows(table);
  if (duplicateRowCount > 0) {
    findings.push({
      severity: duplicateRowCount > table.rowCount * 0.1 ? "warn" : "info",
      code: "duplicate_rows",
      message: `${duplicateRowCount} exact duplicate row(s) among analyzed data.`,
    });
  }

  const outlierHints: { column: string; count: number }[] = [];
  for (let i = 0; i < table.colCount; i++) {
    if (!isNumericColumn(table, i)) continue;
    const count = countIqrOutliers(columnValues(table, i));
    if (count > 0) {
      outlierHints.push({ column: table.headers[i], count });
      findings.push({
        severity: "info",
        code: "outlier_iqr",
        message: `Column "${table.headers[i]}": ${count} value(s) outside 1.5×IQR (exploratory hint, not a definitive anomaly label).`,
      });
    }
  }

  for (const w of table.warnings) {
    findings.push({
      severity: w.code === "truncated" || w.code === "unclosed_quote" ? "warn" : "info",
      code: w.code,
      message: w.message,
    });
  }

  if (table.truncated) {
    findings.push({
      severity: "warn",
      code: "subset_only",
      message: `Quality checks apply to the analyzed subset (${table.rowCount.toLocaleString()} of ${table.sourceRowCount.toLocaleString()} source rows).`,
    });
  }

  return {
    totalMissingCells,
    missingPct,
    duplicateRowCount,
    constantColumns,
    outlierHints,
    findings,
  };
}

function countDuplicateRows(table: DataTable): number {
  const seen = new Map<string, number>();
  for (const row of table.rows) {
    const key = row.map((c) => (c === null ? "" : String(c))).join("\u0001");
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  let dupes = 0;
  for (const n of seen.values()) {
    if (n > 1) dupes += n - 1;
  }
  return dupes;
}

function countIqrOutliers(vals: (string | number | null)[]): number {
  const nums = vals.filter((v): v is number => typeof v === "number").sort((a, b) => a - b);
  if (nums.length < 8) return 0;
  const q1 = quantile(nums, 0.25);
  const q3 = quantile(nums, 0.75);
  const iqr = q3 - q1;
  if (iqr === 0) return 0;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  return nums.filter((n) => n < lo || n > hi).length;
}

function quantile(sorted: number[], p: number): number {
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] * (hi - idx) + sorted[hi] * (idx - lo);
}
