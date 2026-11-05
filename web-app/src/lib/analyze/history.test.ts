import { describe, expect, it } from "vitest";
import { MAX_ANALYSIS_HISTORY, readAnalysisHistory } from "./history";

const entry = {
  id: "example", fileName: "sales.csv", savedAt: "2026-01-01T00:00:00.000Z",
  rowCount: 10, sourceRowCount: 10, colCount: 5, summary: "Dataset summary",
};

describe("local analysis summaries", () => {
  it.each([null, "", "{", "null", "42", "{}", '"text"'])("ignores unreadable history: %s", (raw) => {
    expect(readAnalysisHistory(raw)).toEqual([]);
  });
  it("keeps valid existing entries and ignores partial or invalid ones", () => {
    expect(readAnalysisHistory(JSON.stringify([
      null, {}, entry, { ...entry, savedAt: "not-a-date" },
      { ...entry, rowCount: -1 }, { ...entry, sourceRowCount: 5 },
      { ...entry, colCount: 0 }, { ...entry, summary: null },
    ]))).toEqual([entry]);
  });
  it("caps retained summaries", () => {
    const entries = Array.from({ length: 20 }, (_, index) => ({ ...entry, id: String(index) }));
    expect(readAnalysisHistory(JSON.stringify(entries))).toEqual(entries.slice(0, MAX_ANALYSIS_HISTORY));
  });
});
