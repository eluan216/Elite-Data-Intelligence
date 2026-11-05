import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv";
import { buildQualityReport } from "./quality";
import { histogram, profileTable } from "./stats";

describe("workbench chart and quality contracts", () => {
  it("uses distinguishable boundaries for small decimal distributions", () => {
    const table = parseCsv("value\n0.001\n0.002\n0.003\n0.004");
    const bins = histogram(table, 0, 3);
    expect(new Set(bins.map((bin) => bin.label)).size).toBe(3);
    expect(bins.every((bin) => bin.label !== "0.0–0.0")).toBe(true);
    expect(bins.reduce((total, bin) => total + bin.count, 0)).toBe(4);
  });
  it.each([0, -1, 1.5, NaN, Infinity])("rejects invalid histogram bin counts: %s", (bins) => {
    expect(() => histogram(parseCsv("value\n1\n2"), 0, bins)).toThrow(/positive integer/);
  });
  it("keeps every observation in the histogram, including the maximum edge", () => {
    const bins = histogram(parseCsv("value\n-1\n0\n1\n2"), 0, 3);
    expect(bins.map((bin) => bin.count)).toEqual([1, 1, 2]);
  });
  it("surfaces mixed numeric/text columns as an actionable quality finding", () => {
    const table = parseCsv("value\n1\n2\nunknown\n4");
    const report = buildQualityReport(table, profileTable(table));
    expect(report.findings).toContainEqual(expect.objectContaining({
      code: "mixed_column", severity: "warn",
    }));
  });
});
