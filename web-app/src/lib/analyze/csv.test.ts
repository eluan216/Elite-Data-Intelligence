import { describe, expect, it } from "vitest";
import { isNumericColumn, parseCsv, tableToCsv } from "./csv";
import { buildQualityReport } from "./quality";
import { pearsonCorrelations, profileTable, summaryText } from "./stats";

describe("CSV data integrity", () => {
  it("keeps generated header keys unique even when suffixes are original names", () => {
    const table = parseCsv("x,x,x__2,x,x__3\n1,2,3,4,5");
    expect(new Set(table.headerKeys).size).toBe(5);
    expect(table.headers).toEqual(["x", "x", "x__2", "x", "x__3"]);
    expect(table.headerKeys[2]).toBe("x__2");
    expect(table.headerKeys[4]).toBe("x__3");
  });

  it("preserves identifiers, unsafe integers, overflow and malformed grouping", () => {
    const table = parseCsv(
      'id,value\n00123,9007199254740993\n000,1e309\nA,"1,2,3"'
    );
    expect(table.rows).toEqual([
      ["00123", "9007199254740993"],
      ["000", "1e309"],
      ["A", "1,2,3"],
    ]);
    expect(parseCsv(tableToCsv(table)).rows).toEqual(table.rows);
  });

  it("recognizes signed decimals, exponents, and correctly grouped thousands", () => {
    const table = parseCsv('a,b,c,d\n+.5,-.25,1e3,"1,234.50"');
    expect(table.rows[0]).toEqual([0.5, -0.25, 1000, 1234.5]);
  });

  it("keeps quoted commas, escaped quotes, and multiline values", () => {
    const table = parseCsv('name,note\r\n"Ada, A.","say ""hi""\nnext line"\r\n');
    expect(table.rows).toEqual([["Ada, A.", 'say "hi"\nnext line']]);
    expect(parseCsv(tableToCsv(table)).rows).toEqual(table.rows);
  });

  it.each([0, -1, 1.5, NaN, Infinity])("rejects invalid row limits: %s", (maxRows) => {
    expect(() => parseCsv("a\n1", "test.csv", { maxRows })).toThrow(/maxRows/);
  });

  it("counts all source rows while retaining only the requested subset", () => {
    const text = ["a,b", ...Array.from({ length: 100 }, (_, i) => String(i))].join("\n");
    const table = parseCsv(text, "large.csv", { maxRows: 3 });
    expect(table.rows).toEqual([[0, null], [1, null], [2, null]]);
    expect(table.sourceRowCount).toBe(100);
    expect(table.truncated).toBe(true);
    expect(table.warnings.filter((w) => w.code === "ragged_row")).toHaveLength(6);
    expect(table.warnings.some((w) => w.message.includes("95 more"))).toBe(true);
  });

  it("marks mixed data explicitly instead of silently dropping text from statistics", () => {
    const table = parseCsv("value,other\n1,1\n2,2\n3,3\n4,4\nunknown,5");
    const profiles = profileTable(table);
    expect(profiles[0].type).toBe("mixed");
    expect(profiles[0].mean).toBeUndefined();
    expect(isNumericColumn(table, 0)).toBe(false);
    expect(pearsonCorrelations(table)).toEqual([]);
    expect(summaryText(table, profiles)).toContain("value: mixed");
  });

  it("does not confuse delimiter-containing cells with exact duplicate rows", () => {
    const table = parseCsv("a,b\na\u0001b,c\na,b\u0001c");
    expect(buildQualityReport(table, profileTable(table)).duplicateRowCount).toBe(0);
  });

  it("flags extreme values even when the central quartiles are identical", () => {
    const table = parseCsv(["value", ...Array(9).fill("0"), "100"].join("\n"));
    expect(buildQualityReport(table, profileTable(table)).outlierHints).toEqual([
      { column: "value", count: 1 },
    ]);
  });
});
