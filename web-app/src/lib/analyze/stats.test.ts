import { describe, expect, it } from "vitest";
import { escapeCsvField, parseCsv, tableToCsv } from "./csv";
import { buildQualityReport } from "./quality";
import { histogram, pearsonCorrelations, profileTable } from "./stats";

const SAMPLE = `region,sales,units
North,100,10
South,200,20
East,150,15
West,50,5
North,120,12
`;

describe("analyze csv v2", () => {
  it("parses csv and profiles columns", () => {
    const table = parseCsv(SAMPLE, "sample.csv");
    expect(table.rowCount).toBe(5);
    expect(table.sourceRowCount).toBe(5);
    expect(table.truncated).toBe(false);
    expect(table.headers).toEqual(["region", "sales", "units"]);
    const profiles = profileTable(table);
    const sales = profiles.find((p) => p.name === "sales");
    expect(sales?.type).toBe("numeric");
    expect(sales?.mean).toBe(124);
  });

  it("preserves source row count when truncated", () => {
    const many = ["a,b", ...Array.from({ length: 20 }, (_, i) => `${i},1`)].join("\n");
    const table = parseCsv(many, "big.csv", { maxRows: 5 });
    expect(table.sourceRowCount).toBe(20);
    expect(table.rowCount).toBe(5);
    expect(table.truncated).toBe(true);
  });

  it("disambiguates duplicate headers", () => {
    const table = parseCsv("x,x\n1,2\n");
    expect(table.headers).toEqual(["x", "x"]);
    expect(table.headerKeys[0]).not.toBe(table.headerKeys[1]);
    expect(table.warnings.some((w) => w.code === "duplicate_header")).toBe(true);
  });

  it("warns on ragged rows and pads", () => {
    const table = parseCsv("a,b,c\n1,2\n3,4,5\n");
    expect(table.rowCount).toBe(2);
    expect(table.rows[0]).toEqual([1, 2, null]);
    expect(table.warnings.some((w) => w.code === "ragged_row")).toBe(true);
  });

  it("escapes newlines and quotes on export", () => {
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvField("a\nb")).toBe('"a\nb"');
    const table = parseCsv('name,note\n"Ada","line1\nline2"\n');
    const csv = tableToCsv(table);
    expect(csv).toContain('"');
    expect(csv.split("\n").length).toBeGreaterThanOrEqual(2);
  });

  it("computes correlation between sales and units", () => {
    const table = parseCsv(SAMPLE);
    const pairs = pearsonCorrelations(table);
    const pair = pairs.find((p) => p.a === "sales" && p.b === "units");
    expect(pair).toBeTruthy();
    expect(Math.abs(pair!.r)).toBeGreaterThan(0.99);
  });

  it("builds histogram and quality report", () => {
    const table = parseCsv(SAMPLE);
    const h = histogram(table, 1, 4);
    expect(h.reduce((s, b) => s + b.count, 0)).toBe(5);
    const profiles = profileTable(table);
    const q = buildQualityReport(table, profiles);
    expect(q.findings.length).toBeGreaterThanOrEqual(0);
    expect(q.duplicateRowCount).toBe(0);
  });

  it("detects duplicate rows", () => {
    const table = parseCsv("a,b\n1,2\n1,2\n3,4\n");
    const q = buildQualityReport(table, profileTable(table));
    expect(q.duplicateRowCount).toBe(1);
  });
});
