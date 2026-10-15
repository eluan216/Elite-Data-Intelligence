import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv";
import { histogram, pearsonCorrelations, profileTable } from "./stats";

const SAMPLE = `region,sales,units
North,100,10
South,200,20
East,150,15
West,50,5
North,120,12
`;

describe("analyze stats", () => {
  it("parses csv and profiles columns", () => {
    const table = parseCsv(SAMPLE, "sample.csv");
    expect(table.rowCount).toBe(5);
    expect(table.headers).toEqual(["region", "sales", "units"]);
    const profiles = profileTable(table);
    const sales = profiles.find((p) => p.name === "sales");
    expect(sales?.type).toBe("numeric");
    expect(sales?.mean).toBe(124);
  });

  it("computes correlation between sales and units", () => {
    const table = parseCsv(SAMPLE);
    const pairs = pearsonCorrelations(table);
    const pair = pairs.find((p) => p.a === "sales" && p.b === "units");
    expect(pair).toBeTruthy();
    expect(Math.abs(pair!.r)).toBeGreaterThan(0.99);
  });

  it("builds a histogram", () => {
    const table = parseCsv(SAMPLE);
    const h = histogram(table, 1, 4);
    expect(h.length).toBeGreaterThan(0);
    expect(h.reduce((s, b) => s + b.count, 0)).toBe(5);
  });
});
