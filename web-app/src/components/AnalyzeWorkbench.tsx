"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseCsv, type DataTable } from "@/lib/analyze/csv";
import {
  categoryCounts,
  histogram,
  pearsonCorrelations,
  profileTable,
  summaryText,
  type ColumnProfile,
} from "@/lib/analyze/stats";

const HISTORY_KEY = "edi-analyze-history-v1";
const MAX_HISTORY = 12;
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 5000;

interface HistoryItem {
  id: string;
  fileName: string;
  savedAt: string;
  rowCount: number;
  colCount: number;
  summary: string;
}

export default function AnalyzeWorkbench() {
  const [table, setTable] = useState<DataTable | null>(null);
  const [profiles, setProfiles] = useState<ColumnProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chartCol, setChartCol] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tab, setTab] = useState<"overview" | "data" | "charts" | "history">("overview");

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
    if (next.rowCount > MAX_ROWS) {
      next = {
        ...next,
        rows: next.rows.slice(0, MAX_ROWS),
        rowCount: MAX_ROWS,
      };
    }
    const p = profileTable(next);
    setTable(next);
    setProfiles(p);
    setChartCol(0);
    setError(null);
    setTab("overview");

    const item: HistoryItem = {
      id: `${Date.now()}`,
      fileName: next.fileName,
      savedAt: new Date().toISOString(),
      rowCount: next.rowCount,
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
    if (!/\.csv$/i.test(file.name) && file.type && !file.type.includes("csv") && !file.type.includes("text")) {
      setError("Please upload a .csv file.");
      return;
    }
    try {
      const text = await file.text();
      const parsed = parseCsv(text, file.name);
      loadTable(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not parse CSV.");
    }
  }

  function exportSummary() {
    if (!table) return;
    const text = summaryText(table, profiles);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `${baseName(table.fileName)}-summary.txt`);
  }

  function exportCsvSlice() {
    if (!table) return;
    const lines = [
      table.headers.join(","),
      ...table.rows.map((r) =>
        r
          .map((c) => {
            if (c === null) return "";
            const s = String(c);
            return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `${baseName(table.fileName)}-export.csv`);
  }

  const maxBar = Math.max(1, ...chartData.map((d) => d.count));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-lime">Workbench</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Data analysis</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Upload a CSV in your browser. Profiling, charts, and exports run locally — files are not sent to our servers.
            History is stored only on this device. Account-backed private reports come later.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-lime-foreground hover:opacity-90">
          Upload CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!table && (
        <div className="rounded-xl border border-dashed border-white/20 bg-card/50 px-8 py-16 text-center">
          <p className="text-foreground">Drop in a CSV to explore structure, metrics, and simple charts.</p>
          <p className="mt-2 text-sm text-muted">Max 2 MB · up to {MAX_ROWS.toLocaleString()} rows shown</p>
        </div>
      )}

      {table && (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {(
              [
                ["overview", "Overview"],
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="File" value={table.fileName} />
                <Stat label="Rows" value={String(table.rowCount)} />
                <Stat label="Columns" value={String(table.colCount)} />
                <Stat
                  label="Numeric cols"
                  value={String(profiles.filter((p) => p.type === "numeric").length)}
                />
              </div>
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
                    {profiles.map((p) => (
                      <tr key={p.name} className="border-b border-white/5">
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
                  <h2 className="mb-3 text-sm font-semibold text-foreground">Strongest numeric correlations</h2>
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

          {tab === "data" && (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-card">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-muted">
                  <tr>
                    {table.headers.map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">
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
              {table.rowCount > 100 && (
                <p className="px-3 py-2 text-xs text-muted">Showing first 100 of {table.rowCount} rows.</p>
              )}
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
                    <option key={h} value={i}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-xl border border-white/10 bg-card p-5">
                <p className="mb-4 text-sm text-muted">
                  {profiles[chartCol]?.type === "numeric" ? "Distribution (histogram)" : "Top categories"}
                </p>
                <div className="space-y-2">
                  {chartData.map((d) => (
                    <div key={d.label} className="flex items-center gap-3 text-sm">
                      <span className="w-28 truncate text-muted" title={d.label}>
                        {d.label}
                      </span>
                      <div className="h-2 flex-1 rounded bg-white/10">
                        <div
                          className="h-2 rounded bg-lime"
                          style={{ width: `${(d.count / maxBar) * 100}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-foreground">{d.count}</span>
                    </div>
                  ))}
                  {!chartData.length && <p className="text-sm text-muted">No chartable values in this column.</p>}
                </div>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              {history.length === 0 && <p className="text-sm text-muted">No local history yet.</p>}
              {history.map((h) => (
                <div key={h.id} className="rounded-xl border border-white/10 bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{h.fileName}</p>
                    <p className="text-xs text-muted">{new Date(h.savedAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {h.rowCount} rows · {h.colCount} cols
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
