"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  parseCsv,
  SAMPLE_CSV,
  tableToCsv,
  type DataTable,
} from "@/lib/analyze/csv";
import { buildQualityReport, type QualityReport } from "@/lib/analyze/quality";
import {
  categoryCounts,
  histogram,
  pearsonCorrelations,
  profileTable,
  summaryText,
  type ColumnProfile,
} from "@/lib/analyze/stats";

const HISTORY_KEY = "edi-analyze-history-v2";
const MAX_HISTORY = 12;
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 5000;

interface HistoryItem {
  id: string;
  fileName: string;
  savedAt: string;
  rowCount: number;
  sourceRowCount: number;
  colCount: number;
  summary: string;
}

type Tab = "overview" | "quality" | "data" | "charts" | "history";

export default function AnalyzeWorkbench() {
  const [table, setTable] = useState<DataTable | null>(null);
  const [profiles, setProfiles] = useState<ColumnProfile[]>([]);
  const [quality, setQuality] = useState<QualityReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [chartCol, setChartCol] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as HistoryItem[]);
    } catch {
      /* ignore */
    }
  }, []);

  const correlations = useMemo(
    () => (table ? pearsonCorrelations(table) : []),
    [table]
  );

  const chartData = useMemo(() => {
    if (!table) return [];
    const p = profiles[chartCol];
    if (!p) return [];
    if (p.type === "numeric") return histogram(table, chartCol, 10);
    return categoryCounts(table, chartCol, 10);
  }, [table, profiles, chartCol]);

  const loadTable = useCallback((next: DataTable) => {
    const p = profileTable(next);
    const q = buildQualityReport(next, p);
    setTable(next);
    setProfiles(p);
    setQuality(q);
    setChartCol(0);
    setError(null);
    setStatus(
      next.truncated
        ? `Loaded ${next.rowCount.toLocaleString()} of ${next.sourceRowCount.toLocaleString()} source rows.`
        : `Loaded ${next.rowCount.toLocaleString()} rows · ${next.colCount} columns.`
    );
    setTab("overview");

    const item: HistoryItem = {
      id: `${Date.now()}`,
      fileName: next.fileName,
      savedAt: new Date().toISOString(),
      rowCount: next.rowCount,
      sourceRowCount: next.sourceRowCount,
      colCount: next.colCount,
      summary: summaryText(next, p),
    };
    setHistory((prev) => {
      const nextHist = [item, ...prev].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHist));
      } catch {
        /* quota */
      }
      return nextHist;
    });
  }, []);

  async function onFile(file: File | null) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError("File too large (max 2 MB for browser analysis).");
      return;
    }
    const okName = /\.csv$/i.test(file.name);
    const okType =
      !file.type ||
      file.type.includes("csv") ||
      file.type.includes("text") ||
      file.type === "application/vnd.ms-excel";
    if (!okName && !okType) {
      setError("Please upload a .csv file.");
      return;
    }
    try {
      setStatus(`Reading ${file.name}…`);
      const text = await file.text();
      const parsed = parseCsv(text, file.name, { maxRows: MAX_ROWS });
      loadTable(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not parse CSV.");
      setStatus(null);
    }
  }

  function loadSample() {
    try {
      const parsed = parseCsv(SAMPLE_CSV, "sample-sales.csv", { maxRows: MAX_ROWS });
      loadTable(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sample failed to load.");
    }
  }

  function clearAnalysis() {
    setTable(null);
    setProfiles([]);
    setQuality(null);
    setError(null);
    setStatus(null);
    setTab("overview");
  }

  function clearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
  }

  function exportSummary() {
    if (!table) return;
    const text = summaryText(table, profiles);
    downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), `${baseName(table.fileName)}-summary.txt`);
  }

  function exportCsvSlice() {
    if (!table) return;
    downloadBlob(
      new Blob([tableToCsv(table)], { type: "text/csv;charset=utf-8" }),
      `${baseName(table.fileName)}-export.csv`
    );
  }

  const maxBar = Math.max(1, ...chartData.map((d) => d.count));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-lime">Workbench</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Data analysis</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Descriptive profiling in your browser. Files are not uploaded to our servers. History stores
            text summaries only on this device — not full datasets. Correlation is not causation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {table && (
            <button
              type="button"
              onClick={clearAnalysis}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-muted hover:text-foreground"
            >
              Clear analysis
            </button>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-lime-foreground hover:opacity-90">
            {table ? "Replace CSV" : "Upload CSV"}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                void onFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {status && !error && (
        <div className="mb-4 rounded-lg border border-white/10 bg-card px-4 py-2 text-sm text-muted">{status}</div>
      )}

      {!table && (
        <div
          className={`rounded-xl border border-dashed px-8 py-14 text-center transition-colors ${
            dragOver ? "border-lime bg-lime/5" : "border-white/20 bg-card/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void onFile(e.dataTransfer.files?.[0] ?? null);
          }}
        >
          <p className="text-lg text-foreground">Drop a CSV here or use Upload CSV</p>
          <p className="mt-2 text-sm text-muted">
            Requirements: .csv · max 2 MB · first {MAX_ROWS.toLocaleString()} rows analyzed if larger
          </p>
          <p className="mt-1 text-sm text-muted">
            You get: column types, missing %, means, correlations, charts, quality checks, exports
          </p>
          <button
            type="button"
            onClick={loadSample}
            className="mt-6 rounded-full border border-lime/40 px-5 py-2 text-sm font-medium text-lime hover:bg-lime/10"
          >
            Load sample sales dataset
          </button>
        </div>
      )}

      {table && quality && (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {(
              [
                ["overview", "Overview"],
                ["quality", "Quality"],
                ["data", "Data"],
                ["charts", "Charts"],
                ["history", "History"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full px-4 py-1.5 text-sm ${
                  tab === id
                    ? "bg-lime text-lime-foreground"
                    : "border border-white/15 text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportSummary}
                className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-muted hover:text-foreground"
              >
                Export summary
              </button>
              <button
                type="button"
                onClick={exportCsvSlice}
                className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-muted hover:text-foreground"
              >
                Export CSV
              </button>
            </div>
          </div>

          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Stat label="File" value={table.fileName} />
                <Stat
                  label={table.truncated ? "Analyzed rows" : "Rows"}
                  value={
                    table.truncated
                      ? `${table.rowCount.toLocaleString()} / ${table.sourceRowCount.toLocaleString()}`
                      : table.rowCount.toLocaleString()
                  }
                />
                <Stat label="Columns" value={String(table.colCount)} />
                <Stat label="Missing cells" value={quality.totalMissingCells.toLocaleString()} />
                <Stat label="Duplicate rows" value={String(quality.duplicateRowCount)} />
                <Stat
                  label="Numeric cols"
                  value={String(profiles.filter((p) => p.type === "numeric").length)}
                />
              </div>

              {table.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted">
                  <p className="mb-2 font-medium text-foreground">Parse notes</p>
                  <ul className="list-inside list-disc space-y-1">
                    {table.warnings.map((w, i) => (
                      <li key={`${w.code}-${i}`}>{w.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-card">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Column</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Missing %</th>
                      <th className="px-4 py-3 font-medium">Unique</th>
                      <th className="px-4 py-3 font-medium">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p, i) => (
                      <tr key={table.headerKeys[i]} className="border-b border-white/5">
                        <td className="px-4 py-2 text-foreground">{p.name}</td>
                        <td className="px-4 py-2 text-muted">{p.type}</td>
                        <td className="px-4 py-2 text-muted">{p.missingPct.toFixed(1)}</td>
                        <td className="px-4 py-2 text-muted">{p.unique}</td>
                        <td className="px-4 py-2 text-muted">
                          {p.type === "numeric"
                            ? `mean ${p.mean?.toFixed(2) ?? "—"} · median ${p.median?.toFixed(2) ?? "—"}`
                            : p.topValues?.[0]
                              ? `top: ${p.topValues[0].value} (${p.topValues[0].count})`
                              : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {correlations.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-card p-5">
                  <h2 className="mb-1 text-sm font-semibold text-foreground">Strongest numeric correlations</h2>
                  <p className="mb-3 text-xs text-muted">Pearson r on pairwise complete cases. Not causal.</p>
                  <ul className="space-y-2 text-sm text-muted">
                    {correlations.map((c) => (
                      <li key={`${c.a}-${c.b}`}>
                        {c.a} ↔ {c.b}: <span className="text-foreground">{c.r.toFixed(3)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === "quality" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Missing % (cells)" value={`${quality.missingPct.toFixed(1)}%`} />
                <Stat label="Duplicate rows" value={String(quality.duplicateRowCount)} />
                <Stat label="Constant columns" value={String(quality.constantColumns.length)} />
              </div>
              <div className="rounded-xl border border-white/10 bg-card p-5">
                <h2 className="mb-3 text-sm font-semibold text-foreground">Findings</h2>
                {quality.findings.length === 0 && (
                  <p className="text-sm text-muted">No major quality flags on the analyzed subset.</p>
                )}
                <ul className="space-y-3">
                  {quality.findings.map((f, i) => (
                    <li key={`${f.code}-${i}`} className="text-sm">
                      <span
                        className={
                          f.severity === "high"
                            ? "text-red-300"
                            : f.severity === "warn"
                              ? "text-amber-300"
                              : "text-muted"
                        }
                      >
                        [{f.severity}]
                      </span>{" "}
                      <span className="text-foreground">{f.message}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted">
                  Outlier hints use 1.5×IQR on numeric columns with enough values — exploratory only.
                </p>
              </div>
            </div>
          )}

          {tab === "data" && (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-card">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-muted">
                  <tr>
                    {table.headers.map((h, i) => (
                      <th key={table.headerKeys[i]} className="whitespace-nowrap px-3 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.slice(0, 100).map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {row.map((c, j) => (
                        <td key={j} className="whitespace-nowrap px-3 py-1.5 text-muted">
                          {c === null ? "" : String(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-3 py-2 text-xs text-muted">
                Showing first {Math.min(100, table.rowCount)} of {table.rowCount} analyzed rows
                {table.truncated ? ` (source file had ${table.sourceRowCount.toLocaleString()})` : ""}.
              </p>
            </div>
          )}

          {tab === "charts" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-muted" htmlFor="chart-col">
                  Column
                </label>
                <select
                  id="chart-col"
                  value={chartCol}
                  onChange={(e) => setChartCol(Number(e.target.value))}
                  className="rounded-lg border border-white/15 bg-background px-3 py-2 text-sm text-foreground"
                >
                  {table.headers.map((h, i) => (
                    <option key={table.headerKeys[i]} value={i}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-xl border border-white/10 bg-card p-5">
                <p className="mb-1 text-sm text-foreground">
                  {profiles[chartCol]?.type === "numeric" ? "Distribution (histogram)" : "Top categories"}
                </p>
                <p className="mb-4 text-xs text-muted">Counts of values in the analyzed subset.</p>
                <div className="space-y-2">
                  {chartData.map((d) => (
                    <div key={d.label} className="flex items-center gap-3 text-sm" title={`${d.label}: ${d.count}`}>
                      <span className="w-32 truncate text-muted">{d.label}</span>
                      <div className="h-2 flex-1 rounded bg-white/10">
                        <div
                          className="h-2 rounded bg-lime"
                          style={{ width: `${(d.count / maxBar) * 100}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-foreground">{d.count}</span>
                    </div>
                  ))}
                  {!chartData.length && (
                    <p className="text-sm text-muted">No chartable values in this column.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted">
                  Local summaries only — original CSVs are not stored. Max {MAX_HISTORY} entries.
                </p>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-sm text-muted underline hover:text-foreground"
                  >
                    Clear history
                  </button>
                )}
              </div>
              {history.length === 0 && <p className="text-sm text-muted">No local history yet.</p>}
              {history.map((h) => (
                <div key={h.id} className="rounded-xl border border-white/10 bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{h.fileName}</p>
                    <p className="text-xs text-muted">{new Date(h.savedAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Analyzed {h.rowCount}
                    {h.sourceRowCount !== h.rowCount ? ` / ${h.sourceRowCount} source` : ""} rows · {" "}
                    {h.colCount} cols
                  </p>
                  <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-muted">
                    {h.summary}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function baseName(name: string) {
  return name.replace(/\.csv$/i, "") || "analysis";
}
