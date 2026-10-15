/** Lightweight CSV parse — no external dependency. */

export type CellValue = string | number | null;

export interface DataTable {
  headers: string[];
  rows: CellValue[][];
  rowCount: number;
  colCount: number;
  fileName: string;
}

export function parseCsv(text: string, fileName = "data.csv"): DataTable {
  const lines = splitCsvLines(text.trim());
  if (lines.length === 0) {
    throw new Error("File is empty.");
  }
  const headers = parseCsvLine(lines[0]).map((h, i) => h.trim() || `col_${i + 1}`);
  const rows: CellValue[][] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cells = parseCsvLine(lines[i]);
    const row: CellValue[] = headers.map((_, j) => coerce(cells[j] ?? ""));
    rows.push(row);
  }
  if (rows.length === 0) {
    throw new Error("No data rows found after the header.");
  }
  return {
    headers,
    rows,
    rowCount: rows.length,
    colCount: headers.length,
    fileName,
  };
}

function splitCsvLines(text: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      cur += c;
    } else if ((c === "\n" || c === "\r") && !inQuotes) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  if (cur.length) out.push(cur);
  return out;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function coerce(raw: string): CellValue {
  const s = raw.trim();
  if (s === "") return null;
  const n = Number(s.replace(/,/g, ""));
  if (s !== "" && !Number.isNaN(n) && /^-?\d/.test(s.replace(/,/g, ""))) return n;
  return s;
}

export function columnValues(table: DataTable, colIndex: number): CellValue[] {
  return table.rows.map((r) => r[colIndex] ?? null);
}

export function isNumericColumn(table: DataTable, colIndex: number): boolean {
  let nums = 0;
  let nonNull = 0;
  for (const v of columnValues(table, colIndex)) {
    if (v === null) continue;
    nonNull++;
    if (typeof v === "number") nums++;
  }
  return nonNull > 0 && nums / nonNull >= 0.8;
}
