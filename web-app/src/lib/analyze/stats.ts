import type { CellValue, DataTable } from "./csv";
import { columnValues, isNumericColumn } from "./csv";

export interface ColumnProfile {
  name: string;
  index: number;
  type: "numeric" | "categorical" | "mixed";
  missing: number;
  missingPct: number;
  unique: number;
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  std?: number;
  topValues?: { value: string; count: number }[];
}

export interface CorrelationPair {
  a: string;
  b: string;
  r: number;
}

export function profileTable(table: DataTable): ColumnProfile[] {
  return table.headers.map((name, index) => profileColumn(table, index, name));
}

function profileColumn(table: DataTable, index: number, name: string): ColumnProfile {
  const vals = columnValues(table, index);
  const missing = vals.filter((v) => v === null).length;
  const present = vals.filter((v) => v !== null);
  const unique = new Set(present.map(String)).size;
  const numeric = isNumericColumn(table, index);
  const base: ColumnProfile = {
    name,
    index,
    type: numeric ? "numeric" : "categorical",
    missing,
    missingPct: table.rowCount ? (missing / table.rowCount) * 100 : 0,
    unique,
  };
  if (numeric) {
    const nums = present.filter((v): v is number => typeof v === "number");
    if (nums.length) {
      const sorted = [...nums].sort((a, b) => a - b);
      const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
      const variance = nums.reduce((s, n) => s + (n - mean) ** 2, 0) / nums.length;
      base.mean = mean;
      base.median = percentile(sorted, 0.5);
      base.min = sorted[0];
      base.max = sorted[sorted.length - 1];
      base.std = Math.sqrt(variance);
    }
  } else {
    const counts = new Map<string, number>();
    for (const v of present) {
      const k = String(v);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    base.topValues = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));
  }
  return base;
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] * (hi - idx) + sorted[hi] * (idx - lo);
}

export function pearsonCorrelations(table: DataTable, maxPairs = 12): CorrelationPair[] {
  const numericIdx = table.headers.map((_, i) => i).filter((i) => isNumericColumn(table, i));
  const pairs: CorrelationPair[] = [];
  for (let i = 0; i < numericIdx.length; i++) {
    for (let j = i + 1; j < numericIdx.length; j++) {
      const a = numericIdx[i];
      const b = numericIdx[j];
      const r = pearson(columnValues(table, a), columnValues(table, b));
      if (r !== null) {
        pairs.push({ a: table.headers[a], b: table.headers[b], r });
      }
    }
  }
  return pairs.sort((x, y) => Math.abs(y.r) - Math.abs(x.r)).slice(0, maxPairs);
}

function pearson(xs: CellValue[], ys: CellValue[]): number | null {
  const pairs: [number, number][] = [];
  for (let i = 0; i < xs.length; i++) {
    if (typeof xs[i] === "number" && typeof ys[i] === "number") {
      pairs.push([xs[i] as number, ys[i] as number]);
    }
  }
  if (pairs.length < 3) return null;
  const n = pairs.length;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (const [x, y] of pairs) {
    const ax = x - mx;
    const ay = y - my;
    num += ax * ay;
    dx += ax * ax;
    dy += ay * ay;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

export function histogram(
  table: DataTable,
  colIndex: number,
  bins = 10
): { label: string; count: number }[] {
  const nums = columnValues(table, colIndex).filter((v): v is number => typeof v === "number");
  if (!nums.length) return [];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (min === max) return [{ label: String(min), count: nums.length }];
  const width = (max - min) / bins;
  const counts = Array.from({ length: bins }, () => 0);
  for (const n of nums) {
    let b = Math.floor((n - min) / width);
    if (b >= bins) b = bins - 1;
    counts[b]++;
  }
  return counts.map((count, i) => {
    const lo = min + i * width;
    const hi = lo + width;
    return { label: `${lo.toFixed(1)}–${hi.toFixed(1)}`, count };
  });
}

export function categoryCounts(
  table: DataTable,
  colIndex: number,
  top = 8
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const v of columnValues(table, colIndex)) {
    if (v === null) continue;
    const k = String(v);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label, count]) => ({ label, count }));
}

export function summaryText(table: DataTable, profiles: ColumnProfile[]): string {
  const lines = [
    `Dataset: ${table.fileName}`,
    `Source rows: ${table.sourceRowCount}`,
    `Analyzed rows: ${table.rowCount}${table.truncated ? " (truncated)" : ""}`,
    `Columns: ${table.colCount}`,
    "",
    "Column profiles:",
  ];
  for (const p of profiles) {
    if (p.type === "numeric") {
      lines.push(
        `- ${p.name}: numeric · mean=${fmt(p.mean)} median=${fmt(p.median)} min=${fmt(p.min)} max=${fmt(p.max)} missing=${p.missingPct.toFixed(1)}%`
      );
    } else {
      lines.push(
        `- ${p.name}: categorical · unique=${p.unique} missing=${p.missingPct.toFixed(1)}%`
      );
    }
  }
  if (table.warnings.length) {
    lines.push("", "Warnings:");
    for (const w of table.warnings) lines.push(`- ${w.message}`);
  }
  lines.push(
    "",
    "Method note: descriptive statistics only. Correlations are not causation. Outlier hints use 1.5×IQR when available."
  );
  return lines.join("\n");
}

function fmt(n?: number): string {
  if (n === undefined || Number.isNaN(n)) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(3);
}
