export const ANALYSIS_HISTORY_KEY = "edi-analyze-history-v2";
export const MAX_ANALYSIS_HISTORY = 12;

export interface HistoryItem {
  id: string;
  fileName: string;
  savedAt: string;
  rowCount: number;
  sourceRowCount: number;
  colCount: number;
  summary: string;
}

/** Local storage is versioned but still untrusted and may contain partial/old entries. */
export function readAnalysisHistory(raw: string | null): HistoryItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is HistoryItem => {
      if (!value || typeof value !== "object") return false;
      const item = value as Partial<HistoryItem>;
      return typeof item.id === "string" && typeof item.fileName === "string" &&
        typeof item.savedAt === "string" && Number.isFinite(Date.parse(item.savedAt)) &&
        typeof item.summary === "string" &&
        typeof item.rowCount === "number" && Number.isSafeInteger(item.rowCount) && item.rowCount >= 0 &&
        typeof item.sourceRowCount === "number" && Number.isSafeInteger(item.sourceRowCount) && item.sourceRowCount >= item.rowCount &&
        typeof item.colCount === "number" && Number.isSafeInteger(item.colCount) && item.colCount > 0;
    }).slice(0, MAX_ANALYSIS_HISTORY);
  } catch {
    return [];
  }
}
