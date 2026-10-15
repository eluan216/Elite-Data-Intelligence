/** Lightweight CSV parse — no external dependency. */

export type CellValue = string | number | null;

export interface ParseWarning {
  code: "ragged_row" | "duplicate_header" | "unclosed_quote" | "truncated";
  message: string;
  row?: number;
}

export interface DataTable {
  headers: string[];
  /** Stable unique keys for React (headers may duplicate). */
  headerKeys: string[];
  rows: CellValue[][];
  /** Rows retained for analysis after optional truncation. */
  rowCount: number;
  colCount: number;
  fileName: string;
  /** Total data rows found in the file before truncation. */
  sourceRowCount: number;
  truncated: boolean;
  warnings: ParseWarning[];
}

const MAX_ROWS_DEFAULT = 5000;

export function parseCsv(
  text: string,
  fileName = "data.csv",
  options?: { maxRows?: number }
): DataTable {
  const maxRows = options?.maxRows ?? MAX_ROWS_DEFAULT;
  const warnings: ParseWarning[] = [];

  if (!text || !text.trim()) {
    throw new Error("File is empty.");
  }

  const { lines, unclosedQuote } = splitCsvLines(text);
  if (unclosedQuote) {
    warnings.push({
      code: "unclosed_quote",
      message: "Possible unclosed quotation mark — some rows may be merged incorrectly.",
    });
  }
  if (lines.length === 0) {
    throw new Error("File is empty.");
  }

  const rawHeaders = parseCsvLine(lines[0]).map((h) => h.trim());
  const headers = rawHeaders.map((h, i) => h || `col_${i + 1}`);
  const headerKeys = uniqueHeaderKeys(headers);

  const seen = new Map<string, number>();
  for (const h of headers) {
    const n = (seen.get(h) || 0) + 1;
    seen.set(h, n);
    if (n === 2) {
      warnings.push({
        code: "duplicate_header",
        message: `Duplicate column name "${h}" — display keys were disambiguated.`,
      });
    }
  }

  const allRows: CellValue[][] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cells = parseCsvLine(lines[i]);
    if (cells.length !== headers.length) {
      warnings.push({
        code: "ragged_row",
        message: `Row ${i + 1} has ${cells.length} fields; expected ${headers.length}. Missing cells filled with empty values.`,
        row: i + 1,
      });
    }
    const row: CellValue[] = headers.map((_, j) => coerce(cells[j] ?? ""));
    allRows.push(row);
  }

  if (allRows.length === 0) {
    throw new Error("No data rows found after the header.");
  }

  const sourceRowCount = allRows.length;
  const truncated = sourceRowCount > maxRows;
  const rows = truncated ? allRows.slice(0, maxRows) : allRows;

  if (truncated) {
    warnings.push({
      code: "truncated",
      message: `File has ${sourceRowCount.toLocaleString()} data rows; analyzing the first ${maxRows.toLocaleString()} only.`,
    });
  }

  // Cap ragged-row warnings listed (keep first few)
  const ragged = warnings.filter((w) => w.code === "ragged_row");
  const other = warnings.filter((w) => w.code !== "ragged_row");
  const capped =
    ragged.length > 5
      ? [
          ...other,
          ...ragged.slice(0, 5),
          {
            code: "ragged_row" as const,
            message: `…and ${ragged.length - 5} more rows with inconsistent field counts.`,
          },
        ]
      : warnings;

  return {
    headers,
    headerKeys,
    rows,
    rowCount: rows.length,
    colCount: headers.length,
    fileName,
    sourceRowCount,
    truncated,
    warnings: capped,
  };
}

function uniqueHeaderKeys(headers: string[]): string[] {
  const counts = new Map<string, number>();
  return headers.map((h) => {
    const n = (counts.get(h) || 0) + 1;
    counts.set(h, n);
    return n === 1 ? h : `${h}__${n}`;
  });
}

function splitCsvLines(text: string): { lines: string[]; unclosedQuote: boolean } {
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
  return { lines: out, unclosedQuote: inQuotes };
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
  const cleaned = s.replace(/,/g, "");
  const n = Number(cleaned);
  if (!Number.isNaN(n) && /^-?\d/.test(cleaned)) return n;
  return s;
}

/** RFC-style CSV field escape for export. */
export function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function tableToCsv(table: DataTable): string {
  const headerLine = table.headers.map((h) => escapeCsvField(h)).join(",");
  const body = table.rows.map((r) =>
    r
      .map((c) => {
        if (c === null) return "";
        return escapeCsvField(String(c));
      })
      .join(",")
  );
  return [headerLine, ...body].join("\n");
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

/** Built-in sample for first-time users (not uploaded to a server). */
export const SAMPLE_CSV = `region,product,sales,units,returns
North,Widget,1200,40,2
South,Widget,980,32,1
East,Gadget,1500,28,0
West,Gadget,720,18,3
North,Gadget,1100,22,1
South,Widget,1300,45,2
East,Widget,890,30,0
West,Widget,640,20,4
North,Accessory,400,80,5
South,Accessory,350,70,3
`;
