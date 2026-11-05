"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Arrow } from "./BrandIcons";
import { parseCsv, SAMPLE_CSV, tableToCsv, type CellValue, type DataTable } from "@/lib/analyze/csv";
import { buildQualityReport } from "@/lib/analyze/quality";
import { categoryCounts, histogram, pearsonCorrelations, profileTable, summaryText } from "@/lib/analyze/stats";
import { ANALYSIS_HISTORY_KEY, MAX_ANALYSIS_HISTORY, readAnalysisHistory, type HistoryItem } from "@/lib/analyze/history";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 5000;
const PAGE_SIZE = 20;
const TABS = [
  ["overview", "Overview", "01"],
  ["quality", "Data quality", "02"],
  ["data", "Data explorer", "03"],
  ["charts", "Charts", "04"],
  ["history", "Local history", "05"],
] as const;
type Tab = typeof TABS[number][0];

export default function AnalyzeWorkbench() {
  const [table, setTable] = useState<DataTable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [chartCol, setChartCol] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [dragOver, setDragOver] = useState(false);
  const [query, setQuery] = useState("");
  const [dataPage, setDataPage] = useState(0);
  const [compact, setCompact] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const operation = useRef(0);

  useEffect(() => {
    try { setHistory(readAnalysisHistory(localStorage.getItem(ANALYSIS_HISTORY_KEY))); } catch { /* storage may be disabled */ }
    const media = window.matchMedia("(max-width: 900px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const profiles = useMemo(() => table ? profileTable(table) : [], [table]);
  const quality = useMemo(() => table ? buildQualityReport(table, profiles) : null, [table, profiles]);
  const correlations = useMemo(() => table ? pearsonCorrelations(table, 6, 20) : [], [table]);
  const chartData = useMemo(() => {
    if (!table || !profiles[chartCol]) return [];
    return profiles[chartCol].type === "numeric" ? histogram(table, chartCol, 10) : categoryCounts(table, chartCol, 10);
  }, [table, profiles, chartCol]);
  const filtered = useMemo(() => {
    if (!table) return [];
    const text = query.trim().toLowerCase();
    return table.rows.map((row, index) => ({ row, index })).filter(({ row }) =>
      !text || row.some((value) => value !== null && String(value).toLowerCase().includes(text))
    );
  }, [table, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(dataPage, pageCount - 1);
  const shownRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const selectedProfile = profiles[chartCol];
  const columnLabels = useMemo(() => {
    if (!table) return [];
    const counts = new Map<string, number>();
    for (const header of table.headers) counts.set(header, (counts.get(header) || 0) + 1);
    return table.headers.map((header, index) => counts.get(header)! > 1 ? `${header} · column ${index + 1}` : header);
  }, [table]);

  const loadTable = useCallback((next: DataTable) => {
    const nextProfiles = profileTable(next);
    setTable(next);
    setChartCol(Math.max(0, nextProfiles.findIndex((profile) => profile.type === "numeric")));
    setError(null);
    setReading(false);
    setQuery("");
    setDataPage(0);
    setStatus(next.truncated
      ? `Loaded ${next.rowCount.toLocaleString()} of ${next.sourceRowCount.toLocaleString()} source rows.`
      : `Loaded ${countLabel(next.rowCount, "row")} · ${countLabel(next.colCount, "column")}.`);
    setTab("overview");
    requestAnimationFrame(() => document.querySelector(".aw-main")?.scrollIntoView({ block: "start", behavior: "auto" }));
    const item: HistoryItem = {
      id: crypto.randomUUID(), fileName: next.fileName, savedAt: new Date().toISOString(),
      rowCount: next.rowCount, sourceRowCount: next.sourceRowCount, colCount: next.colCount,
      summary: summaryText(next, nextProfiles),
    };
    setHistory((previous) => {
      const nextHistory = [item, ...previous].slice(0, MAX_ANALYSIS_HISTORY);
      try { localStorage.setItem(ANALYSIS_HISTORY_KEY, JSON.stringify(nextHistory)); } catch { /* keep the current session usable */ }
      return nextHistory;
    });
  }, []);

  async function onFile(file: File | null) {
    if (!file) return;
    const current = ++operation.current;
    setReading(false);
    setError(null);
    if (file.size > MAX_FILE_BYTES) { setError("File too large. Choose a CSV of 2 MB or less."); return; }
    if (!/\.csv$/i.test(file.name)) { setError("Please choose a file with a .csv extension."); return; }
    setReading(true);
    setStatus(`Reading ${file.name}…`);
    try {
      const text = await file.text();
      if (current !== operation.current) return;
      loadTable(parseCsv(text, file.name, { maxRows: MAX_ROWS }));
    } catch (cause) {
      if (current === operation.current) {
        setError(cause instanceof Error ? cause.message : "Could not read this CSV.");
        setStatus(null);
      }
    } finally {
      if (current === operation.current) setReading(false);
    }
  }

  function loadSample() {
    operation.current++;
    loadTable(parseCsv(SAMPLE_CSV, "sample-sales.csv", { maxRows: MAX_ROWS }));
  }

  function clearAnalysis() {
    operation.current++;
    setReading(false);
    setTable(null);
    setError(null);
    setStatus(null);
    setQuery("");
    setDataPage(0);
    setTab("overview");
  }

  function clearHistory() {
    setHistory([]);
    try { localStorage.removeItem(ANALYSIS_HISTORY_KEY); } catch { /* storage may be disabled */ }
  }

  function exportCsv(rows?: CellValue[][], suffix = "analyzed") {
    if (!table) return;
    downloadText(tableToCsv({ ...table, rows: rows ?? table.rows }), `${baseName(table.fileName)}-${suffix}.csv`, "text/csv");
  }

  function activateTab(next: Tab) {
    setTab(next);
    requestAnimationFrame(() => document.getElementById(`aw-tab-${next}`)?.focus());
  }

  function changeTabKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + buttons.length - 1) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else return;
    event.preventDefault();
    setTab(buttons[next].dataset.tab as Tab);
    buttons[next].focus();
  }

  return (
    <div className="aw-shell edi-frame">
      <input ref={fileInput} type="file" accept=".csv,text/csv" className="sr-only" tabIndex={-1} aria-label="Choose a CSV file" onChange={(event) => { void onFile(event.target.files?.[0] ?? null); event.target.value = ""; }} />
      <div className="aw-titlebar">
        <div><p className="aw-eyebrow">Your data. A clearer picture.</p><h1>Data <em>workbench.</em></h1><p className="aw-description">Explore the structure, spot the gaps, and see what your data is telling you.</p></div>
        <div className="aw-local-badge"><span className="edi-dot" /> Runs in your browser<span>Files stay on your device</span></div>
      </div>

      <div className="aw-workspace">
        <aside className="aw-sidebar">
          <div className="aw-session"><span className="aw-eyebrow">Current session</span><strong title={table?.fileName}>{table?.fileName || "No dataset loaded"}</strong><p>{table ? `${countLabel(table.rowCount, "row")} · ${countLabel(table.colCount, "column")}` : "Upload a CSV or explore the sample."}</p></div>
          <div className="aw-view-nav" role="tablist" aria-label="Analysis views" aria-orientation={compact ? "horizontal" : "vertical"} onKeyDown={changeTabKey}>
            {TABS.map(([id, label, number]) => {
              const disabled = !table && id !== "overview" && id !== "history";
              return <button key={id} id={`aw-tab-${id}`} data-tab={id} type="button" role="tab" aria-selected={tab === id} aria-controls={`aw-panel-${id}`} tabIndex={tab === id ? 0 : -1} disabled={disabled} onClick={() => setTab(id)}><span>{number}</span>{label}{id === "history" && history.length > 0 && <small>{history.length}</small>}</button>;
            })}
          </div>
          <div className="aw-sidebar-note"><span className="aw-eyebrow">Local by design</span><p>Analysis happens on this device. History keeps text summaries here, not full datasets.</p><a href="/privacy">Privacy details<Arrow diagonal /></a></div>
        </aside>

        <div className="aw-main" aria-busy={reading}>
          <div className="aw-toolbar"><div><span className="aw-eyebrow">{table ? "Dataset workspace" : "Start with a question"}</span><p title={table?.fileName}>{table ? table.fileName : "A useful first look at your data"}</p></div><div className="aw-toolbar-actions">{table && <><button type="button" className="aw-button aw-button-quiet" onClick={() => downloadText(summaryText(table, profiles), `${baseName(table.fileName)}-summary.txt`)}>Export summary<Arrow /></button><button type="button" className="aw-button aw-button-quiet" onClick={() => exportCsv()}>Export CSV<Arrow /></button><button type="button" className="aw-clear" onClick={clearAnalysis}>Clear analysis</button></>}<button type="button" className="aw-button aw-button-accent" onClick={() => fileInput.current?.click()}>{table ? "Replace CSV" : "Upload CSV"}<span aria-hidden="true">↑</span></button></div></div>
          <div className="aw-feedback" aria-live="polite" aria-atomic="true">{error ? <p role="alert" className="aw-error">{error}</p> : status ? <p role="status">{reading && <span className="edi-dot" />} {status}</p> : <p>CSV · up to 2 MB · first 5,000 rows analyzed</p>}</div>
          {table?.truncated && <div className="aw-subset-note"><strong>Analyzing a subset.</strong> All profiles, charts, and exports use the first {table.rowCount.toLocaleString()} of {table.sourceRowCount.toLocaleString()} source rows.</div>}

          <section id="aw-panel-overview" role="tabpanel" aria-labelledby="aw-tab-overview" hidden={tab !== "overview"} tabIndex={0}>
            {!table ? <div className="aw-empty-grid">
              <div className={`aw-dropzone ${dragOver ? "is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(event) => { event.preventDefault(); setDragOver(false); void onFile(event.dataTransfer.files?.[0] ?? null); }}>
                <span className="aw-upload-icon" aria-hidden="true">↑</span><p className="aw-eyebrow">Bring your own data</p><h2>Drop a CSV.<br /><em>Find your starting point.</em></h2><p>Get column profiles, missing values, duplicate checks, and useful charts in one place.</p><button type="button" className="aw-button aw-button-accent" onClick={() => fileInput.current?.click()}>Choose a CSV file<Arrow diagonal /></button><small>Up to 2 MB · your first row should contain column names</small>
              </div>
              <div className="aw-sample-card"><span className="aw-eyebrow">Take a look around</span><h2>A sample to<br /><em>get you started.</em></h2><p>Explore a small sales dataset before bringing your own.</p><SamplePreview /><button type="button" className="aw-button aw-button-paper" aria-label="Load sample sales dataset" onClick={loadSample}>Explore sample data<Arrow diagonal /></button><button type="button" className="aw-text-button" onClick={() => downloadText(SAMPLE_CSV, "sample-sales.csv", "text/csv")}>Download the sample CSV ↓</button></div>
            </div> : quality && <>
              <div className="aw-stat-grid"><Stat label="Rows analyzed" value={table.rowCount.toLocaleString()} note={table.truncated ? `of ${table.sourceRowCount.toLocaleString()} source rows` : "All source rows"} /><Stat label="Columns" value={String(table.colCount)} note={`${profiles.filter((profile) => profile.type === "numeric").length} numeric columns`} /><Stat label="Complete cells" value={`${(100 - quality.missingPct).toFixed(1)}%`} note={`${quality.totalMissingCells.toLocaleString()} missing cells`} /><Stat label="Duplicate rows" value={String(quality.duplicateRowCount)} note="Exact row matches" /></div>
              <div className="aw-overview-grid">
                <div className="aw-panel"><div className="aw-panel-heading"><div><span className="aw-eyebrow">Know the structure</span><h2>Column profiles</h2></div><span className="aw-count">{profiles.length} columns</span></div><div className="aw-table-scroll" tabIndex={0} role="region" aria-label="Column profiles table"><table><caption className="sr-only">Profiles of analyzed CSV columns</caption><thead><tr><th scope="col">Column</th><th scope="col">Type</th><th scope="col">Missing</th><th scope="col">Distinct</th><th scope="col">Summary</th></tr></thead><tbody>{profiles.map((profile, index) => <tr key={table.headerKeys[index]}><th scope="row">{columnLabels[index]}</th><td><span className={`aw-type aw-type-${profile.type}`}>{profile.type}</span></td><td>{profile.missingPct.toFixed(1)}%</td><td>{profile.unique.toLocaleString()}</td><td>{profile.type === "numeric" ? `Mean ${formatNumber(profile.mean)} · median ${formatNumber(profile.median)}` : profile.topValues?.[0] ? `Top: ${profile.topValues[0].value} (${profile.topValues[0].count})` : "No non-missing values"}</td></tr>)}</tbody></table></div></div>
                <div className="aw-panel aw-paper-panel"><div className="aw-panel-heading"><div><span className="aw-eyebrow">A first look</span><h2>{columnLabels[chartCol]}</h2></div></div><Chart data={chartData} numeric={selectedProfile?.type === "numeric"} compact /><p className="aw-chart-note">{selectedProfile?.type === "numeric" ? "Value distribution across analyzed rows." : "Most frequent non-missing categories."}</p><button type="button" className="aw-text-button" onClick={() => activateTab("charts")}>Explore charts<Arrow /></button></div>
              </div>
              <div className="aw-overview-grid aw-overview-secondary"><div className="aw-panel"><div className="aw-panel-heading"><div><span className="aw-eyebrow">Before you make a decision</span><h2>Quality at a glance</h2></div><button type="button" className="aw-text-button" onClick={() => activateTab("quality")}>View all<Arrow /></button></div>{quality.findings.length ? <ul className="aw-findings">{quality.findings.slice(0, 3).map((finding, index) => <li key={`${finding.code}-${index}`}><span className={`aw-severity aw-severity-${finding.severity}`}>{finding.severity}</span><p>{finding.message}</p></li>)}</ul> : <p className="aw-body-copy">No major quality flags in the analyzed rows. Review the column profiles against your intended use.</p>}</div><div className="aw-panel"><div className="aw-panel-heading"><div><span className="aw-eyebrow">Connections to explore</span><h2>Numeric correlations</h2></div></div>{correlations.length ? <ul className="aw-correlations">{correlations.slice(0, 4).map((pair, index) => <li key={`${pair.a}-${pair.b}-${index}`}><span>{pair.a} ↔ {pair.b}</span><strong>{pair.r.toFixed(3)}</strong></li>)}</ul> : <p className="aw-body-copy">Use at least two varying numeric columns with three shared observations to explore correlations.</p>}<p className="aw-chart-note">{profiles.filter((profile) => profile.type === "numeric").length > 20 && "Showing pairs from the first 20 numeric columns only. "}Pearson r uses pairwise complete observations. Correlation does not establish causation.</p></div></div>
            </>}
          </section>

          <section id="aw-panel-quality" role="tabpanel" aria-labelledby="aw-tab-quality" hidden={tab !== "quality"} tabIndex={0}>
            {table && quality && <><div className="aw-view-heading"><div><p className="aw-eyebrow">A closer look</p><h2>Know the gaps.</h2><p>Review these findings before treating the data as evidence.</p></div></div><div className="aw-stat-grid aw-three-stats"><Stat label="Missing cells" value={`${quality.missingPct.toFixed(1)}%`} note={`${quality.totalMissingCells} cells in the analyzed rows`} /><Stat label="Duplicate rows" value={String(quality.duplicateRowCount)} note="Additional exact row matches" /><Stat label="Constant columns" value={String(quality.constantColumns.length)} note="One non-missing distinct value" /></div><div className="aw-panel"><div className="aw-panel-heading"><h2>Quality findings</h2><span className="aw-count">{quality.findings.length} findings</span></div>{quality.findings.length ? <ul className="aw-findings aw-findings-full">{quality.findings.map((finding, index) => <li key={`${finding.code}-${index}`}><span className={`aw-severity aw-severity-${finding.severity}`}>{finding.severity}</span><p>{finding.message}</p></li>)}</ul> : <p className="aw-body-copy">No major flags in these checks. This does not establish fitness for every business use.</p>}<p className="aw-chart-note">Outlier hints use 1.5×IQR where enough values exist. They are exploratory, not definitive anomaly labels.</p></div></>}
          </section>

          <section id="aw-panel-data" role="tabpanel" aria-labelledby="aw-tab-data" hidden={tab !== "data"} tabIndex={0}>
            {table && <><div className="aw-view-heading"><div><p className="aw-eyebrow">Look at the source</p><h2>Data explorer.</h2><p>Search across analyzed rows. Row numbers refer to the data after the header.</p></div></div><div className="aw-explorer-tools"><div><label htmlFor="aw-search">Search rows</label><input id="aw-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setDataPage(0); }} placeholder="Find a value across any column…" /></div>{query.trim() && <button type="button" className="aw-button aw-button-quiet" disabled={!filtered.length} onClick={() => exportCsv(filtered.map(({ row }) => row), "filtered")}>Export filtered CSV<Arrow /></button>}</div><div className="aw-panel"><div className="aw-table-scroll aw-data-table" tabIndex={0} role="region" aria-label="CSV data table"><table><caption className="sr-only">CSV rows matching the current search</caption><thead><tr><th scope="col">Row</th>{columnLabels.map((header, index) => <th key={table.headerKeys[index]} scope="col">{header}</th>)}</tr></thead><tbody>{shownRows.map(({ row, index }) => <tr key={index}><th scope="row">{index + 1}</th>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell === null ? <span className="aw-missing">Missing</span> : String(cell)}</td>)}</tr>)}</tbody></table>{!shownRows.length && <p className="aw-no-results">No rows match “{query}”. Try a different search.</p>}</div><div className="aw-pagination"><p>{filtered.length ? `${safePage * PAGE_SIZE + 1}–${Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length.toLocaleString()} ${query.trim() ? "matching" : "analyzed"} rows` : "0 matching rows"}</p><div><button type="button" disabled={safePage === 0} onClick={() => setDataPage(safePage - 1)} aria-label="Previous data page">←</button><span>Page {safePage + 1} of {pageCount}</span><button type="button" disabled={safePage >= pageCount - 1} onClick={() => setDataPage(safePage + 1)} aria-label="Next data page">→</button></div></div></div><p className="aw-chart-note">Export CSV includes all analyzed rows. A filtered export includes only matching rows.</p></>}
          </section>

          <section id="aw-panel-charts" role="tabpanel" aria-labelledby="aw-tab-charts" hidden={tab !== "charts"} tabIndex={0}>
            {table && <><div className="aw-view-heading"><div><p className="aw-eyebrow">See the pattern</p><h2>Explore a column.</h2><p>Numeric distributions and category frequencies from the analyzed rows.</p></div><div className="aw-column-picker"><label htmlFor="aw-chart-column">Column</label><select id="aw-chart-column" value={chartCol} onChange={(event) => setChartCol(Number(event.target.value))}>{columnLabels.map((label, index) => <option key={table.headerKeys[index]} value={index}>{label}</option>)}</select></div></div><div className="aw-panel aw-paper-panel aw-chart-panel"><div className="aw-panel-heading"><div><span className="aw-eyebrow">{selectedProfile?.type === "numeric" ? "Numeric distribution" : "Top categories"}</span><h2>{columnLabels[chartCol]}</h2></div><span className="aw-count">{selectedProfile?.type}</span></div><Chart data={chartData} numeric={selectedProfile?.type === "numeric"} /><p className="aw-chart-note">{selectedProfile?.type === "mixed" ? "Mixed numeric/text data uses category counts; partial numeric statistics would omit text values." : selectedProfile?.type === "numeric" ? "Ten bins across the observed range. Missing values are excluded." : "Up to ten most frequent non-missing categories."}</p><details className="aw-chart-values"><summary>View chart values</summary><table><caption className="sr-only">Exact counts used in the chart</caption><thead><tr><th scope="col">{selectedProfile?.type === "numeric" ? "Bin" : "Category"}</th><th scope="col">Count</th></tr></thead><tbody>{chartData.map((item, index) => <tr key={index}><th scope="row">{item.label}</th><td>{item.count}</td></tr>)}</tbody></table></details></div></>}
          </section>

          <section id="aw-panel-history" role="tabpanel" aria-labelledby="aw-tab-history" hidden={tab !== "history"} tabIndex={0}>
            <div className="aw-view-heading"><div><p className="aw-eyebrow">On this device</p><h2>Your recent summaries.</h2><p>Up to {MAX_ANALYSIS_HISTORY} text summaries. Original CSV files are not stored.</p></div>{history.length > 0 && <button type="button" className="aw-button aw-button-quiet" onClick={clearHistory}>Clear history</button>}</div>
            {!history.length ? <div className="aw-panel aw-history-empty"><h3>A clean slate.</h3><p>Load a CSV or the sample dataset to save a summary on this device.</p><button type="button" className="aw-text-button" onClick={() => activateTab("overview")}>Back to overview<Arrow /></button></div> : <div className="aw-history-list">{history.map((item) => <details key={item.id} className="aw-panel aw-history-item"><summary><span><strong>{item.fileName}</strong><small>{item.rowCount.toLocaleString()} analyzed rows · {item.colCount} columns{item.sourceRowCount > item.rowCount ? ` · ${item.sourceRowCount.toLocaleString()} source rows` : ""}</small></span><time dateTime={item.savedAt}>{new Date(item.savedAt).toLocaleDateString()}</time></summary><pre tabIndex={0} aria-label="Saved analysis summary">{item.summary}</pre><button type="button" className="aw-text-button" onClick={() => downloadText(item.summary, `${baseName(item.fileName)}-summary.txt`)}>Download this summary<Arrow /></button></details>)}</div>}
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="aw-stat"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function SamplePreview() {
  const sample = useMemo(() => parseCsv(SAMPLE_CSV), []);
  const values = categoryCounts(sample, 0);
  const max = Math.max(...values.map((value) => value.count), 1);
  return <div className="aw-sample-preview"><div><span>Rows by region</span><span>Sample · {sample.rowCount} rows</span></div><ul>{values.map((value) => <li key={value.label}><span>{value.label}</span><span aria-hidden="true"><i style={{ width: `${value.count / max * 100}%` }} /></span><strong>{value.count}</strong></li>)}</ul><p>{sample.colCount} columns · built-in sample data</p></div>;
}

function Chart({ data, numeric, compact = false }: { data: { label: string; count: number }[]; numeric?: boolean; compact?: boolean }) {
  if (!data.length) return <p className="aw-no-results">No non-missing values to chart.</p>;
  const max = Math.max(...data.map((item) => item.count), 1);
  if (numeric) return <div className={`aw-distribution ${compact ? "is-compact" : ""}`} role="img" aria-label={`Histogram with ${data.length} bins containing ${data.reduce((sum, item) => sum + item.count, 0)} numeric values. Exact bin counts are available in the chart view.`}><div className="aw-histogram">{data.map((item, index) => <div key={index} title={`${item.label}: ${item.count}`}><span style={{ bottom: `calc(${item.count / max * 100}% + 8px)` }}>{item.count}</span><i style={{ height: `${item.count / max * 100}%` }} /></div>)}</div><div className="aw-chart-axis" aria-hidden="true"><span>{data[0].label.split("–")[0]}</span><span>{data[data.length - 1].label.split("–").at(-1)}</span></div></div>;
  return <ul className="aw-category-bars" aria-label="Category counts">{data.map((item, index) => <li key={index}><span title={item.label}>{item.label}</span><span aria-hidden="true"><i style={{ width: `${item.count / max * 100}%` }} /></span><strong>{item.count}</strong></li>)}</ul>;
}

function formatNumber(value?: number) {
  if (value === undefined) return "—";
  if (value !== 0 && Math.abs(value) < 0.001) return value.toExponential(3);
  return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function downloadText(text: string, name: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function baseName(name: string) { return name.replace(/\.csv$/i, "") || "analysis"; }

function countLabel(value: number, noun: string) { return `${value.toLocaleString()} ${noun}${value === 1 ? "" : "s"}`; }
