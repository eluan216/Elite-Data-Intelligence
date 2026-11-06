import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv";
import { buildQualityReport } from "./quality";
import { histogram, profileTable, summaryText, pearsonCorrelations } from "./stats";

describe("workbench chart and quality contracts", () => {
  it("uses distinguishable boundaries for small decimal distributions", () => {
    const table = parseCsv("value\n0.001\n0.002\n0.003\n0.004");
    const bins = histogram(table, 0, 3);
    expect(new Set(bins.map((bin) => bin.label)).size).toBe(3);
    expect(bins.every((bin) => bin.label !== "0.0–0.0")).toBe(true);
    expect(bins.reduce((total, bin) => total + bin.count, 0)).toBe(4);
  });
  it("keeps small nonzero values visible in exported summaries", () => {
    const table = parseCsv("value\n0.000001\n0.000002");
    expect(summaryText(table, profileTable(table))).toContain("mean=1.500e-6");
  });
  it.each([0, -1, 1.5, NaN, Infinity])("rejects invalid histogram bin counts: %s", (bins) => {
    expect(() => histogram(parseCsv("value\n1\n2"), 0, bins)).toThrow(/positive integer/);
  });
  it("keeps every observation in the histogram, including the maximum edge", () => {
    const bins = histogram(parseCsv("value\n-1\n0\n1\n2"), 0, 3);
    expect(bins.map((bin) => bin.count)).toEqual([1, 1, 2]);
  });
  it("supports a bounded correlation scan without including later columns", () => {
    const table = parseCsv("x,y,z\n1,2,3\n2,4,2\n3,6,1");
    const pairs = pearsonCorrelations(table, 6, 2);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toMatchObject({ a: "x", b: "y", r: 1 });
  });
  it("surfaces mixed numeric/text columns as an actionable quality finding", () => {
    const table = parseCsv("value\n1\n2\nunknown\n4");
    const report = buildQualityReport(table, profileTable(table));
    expect(report.findings).toContainEqual(expect.objectContaining({
      code: "mixed_column", severity: "warn",
    }));
  });
});
