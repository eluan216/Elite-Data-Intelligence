import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseURL = process.env.DESIGN_QA_URL || "http://127.0.0.1:3000";
await mkdir("design-artifacts", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce", acceptDownloads: true });
const page = await context.newPage();
const errors = [];
const posts = [];
const violations = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("request", (request) => { if (request.method() === "POST") posts.push(request.url()); });

async function accessibility(state) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  console.log("ANALYZER_A11Y=" + JSON.stringify({ state, violations: result.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map((node) => node.target) })) }));
  violations.push(...result.violations);
}
async function downloadText(action) {
  const pending = page.waitForEvent("download");
  await action();
  const download = await pending;
  const stream = await download.createReadStream();
  if (!stream) throw new Error("Download stream not available");
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return { text: Buffer.concat(chunks).toString("utf8"), name: download.suggestedFilename() };
}
const csvInput = page.getByLabel("Choose a CSV file", { exact: true });
const sampleButton = page.getByRole("button", { name: "Load sample sales dataset", exact: true });
const tab = (name) => page.getByRole("tab", { name: new RegExp(name, "i") });
const upload = (name, text, mimeType = "text/csv") => csvInput.setInputFiles({ name, mimeType, buffer: Buffer.from(text) });

await page.goto(baseURL + "/analyze", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.setItem("edi-analyze-history-v2", '{"broken":true}'));
await page.reload({ waitUntil: "networkidle" });
await expect(page.getByRole("heading", { level: 1 })).toContainText("Data workbench.");
await tab("Local history").click();
await expect(page.getByText("A clean slate.", { exact: true })).toBeVisible();
await tab("Overview").click();
await accessibility("empty");
const emptyShot = await page.screenshot({ path: "design-artifacts/analyzer-empty.jpg", type: "jpeg", quality: 60, fullPage: true });
console.log("EDI_ANALYZER_EMPTY=" + emptyShot.toString("base64"));
await upload("notes.txt", "a,b\n1,2", "text/plain");
await expect(page.locator(".aw-feedback").getByRole("alert")).toContainText(".csv extension");
await csvInput.setInputFiles({ name: "large.csv", mimeType: "text/csv", buffer: Buffer.alloc(2 * 1024 * 1024 + 1, 97) });
await expect(page.locator(".aw-feedback").getByRole("alert")).toContainText("2 MB");
await upload("empty.csv", "");
await expect(page.locator(".aw-feedback").getByRole("alert")).toContainText("empty");

await sampleButton.click();
await expect(page.getByText("Loaded 10 rows · 5 columns.", { exact: true })).toBeVisible();
await accessibility("sample overview");
await page.evaluate(() => window.scrollTo(0, 0));
const desktop = await page.screenshot({ path: "design-artifacts/analyzer-desktop.jpg", type: "jpeg", quality: 60, fullPage: true });
console.log("EDI_ANALYZER_DESKTOP=" + desktop.toString("base64"));
const fixtureRows = Array.from({ length: 60 }, (_, index) => {
  const n = index + 1;
  return String(n).padStart(3, "0") + "," + (n % 2 ? "North" : "South") + "," + n * 10 + "," + (n % 10 ? "record" + n : "");
});
const fixture = ["id,region,sales,note", ...fixtureRows, fixtureRows[0]].join("\n");
await upload("operations.csv", fixture);
await expect(page.getByText("Loaded 61 rows · 4 columns.", { exact: true })).toBeVisible();
await tab("Overview").focus();
await page.keyboard.press("ArrowDown");
await expect(tab("Data quality")).toBeFocused();
await expect(tab("Data quality")).toHaveAttribute("aria-selected", "true");
await expect(page.locator("#aw-panel-quality")).toContainText("1 exact duplicate");
await tab("Data explorer").click();
const explorer = page.locator("#aw-panel-data");
await expect(explorer.locator("tbody tr")).toHaveCount(20);
await explorer.getByRole("button", { name: "Next data page" }).click();
await expect(explorer).toContainText("21–40 of 61 analyzed rows");
await explorer.getByLabel("Search rows").fill("record59");
await expect(explorer.locator("tbody tr")).toHaveCount(1);
await expect(explorer.locator("tbody tr")).toContainText("059");
const filtered = await downloadText(() => explorer.getByRole("button", { name: "Export filtered CSV" }).click());
expect(filtered.name).toBe("operations-filtered.csv");
expect(filtered.text.trim().split(/\r?\n/)).toHaveLength(2);
expect(filtered.text).toContain("059,North,590,record59");
const analyzed = await downloadText(() => page.getByRole("button", { name: "Export CSV", exact: true }).click());
expect(analyzed.text.trim().split(/\r?\n/)).toHaveLength(62);
const summary = await downloadText(() => page.getByRole("button", { name: "Export summary", exact: true }).click());
expect(summary.text).toContain("Analyzed rows: 61");
await accessibility("searchable explorer");

await tab("Charts").click();
await page.getByLabel("Column", { exact: true }).selectOption("1");
await expect(page.locator("#aw-panel-charts").getByRole("heading", { name: "region", exact: true })).toBeVisible();
await page.getByText("View chart values", { exact: true }).click();
await expect(page.locator(".aw-chart-values table")).toContainText("North");
await expect(page.locator(".aw-chart-values table")).toContainText("31");
await accessibility("category chart");
await page.getByLabel("Column", { exact: true }).selectOption("2");
await page.screenshot({ path: "design-artifacts/analyzer-chart.jpg", type: "jpeg", quality: 65 });

await upload("mixed.csv", "value,group\n1,a\n2,b\nunknown,c\n4,d");
await tab("Data quality").click();
await expect(page.locator("#aw-panel-quality")).toContainText("mixes numeric and text");
const many = ["value", ...Array.from({ length: 6001 }, (_, index) => String(index + 1))].join("\n");
await upload("truncated.csv", many);
await expect(page.locator(".aw-subset-note")).toContainText("5,000 of 6,001");
const subset = await downloadText(() => page.getByRole("button", { name: "Export CSV", exact: true }).click());
expect(subset.text.trim().split(/\r?\n/)).toHaveLength(5001);
expect(subset.text.trim().split(/\r?\n/).at(-1)).toBe("5000");

await page.evaluate(() => {
  const original = File.prototype.text;
  File.prototype.text = function () {
    const result = original.call(this);
    return this.name === "slow.csv" ? new Promise((resolve, reject) => setTimeout(() => result.then(resolve, reject), 300)) : result;
  };
});
await upload("slow.csv", "value\n999");
await upload("latest.csv", "value\n1\n2");
await expect(page.getByText("Loaded 2 rows · 1 column.", { exact: true })).toBeVisible();
await page.waitForTimeout(400);
await expect(page.locator(".aw-toolbar > div:first-child")).toContainText("latest.csv");
await page.getByRole("button", { name: "Clear analysis", exact: true }).click();
await tab("Local history").click();
await expect(page.locator("#aw-panel-history").getByText("operations.csv", { exact: true })).toBeVisible();
await page.getByRole("button", { name: "Clear history", exact: true }).click();
await page.reload({ waitUntil: "networkidle" });
await tab("Local history").click();
await expect(page.getByText("A clean slate.", { exact: true })).toBeVisible();
await tab("Overview").click();
await sampleButton.click();

for (const width of [768, 390, 320]) {
  await page.setViewportSize({ width, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  console.log("ANALYZER_LAYOUT_PASSED=" + width);
}
await page.setViewportSize({ width: 390, height: 844 });
await accessibility("mobile sample overview");
await page.evaluate(() => window.scrollTo(0, 0));
const mobile = await page.screenshot({ path: "design-artifacts/analyzer-mobile.jpg", type: "jpeg", quality: 60, fullPage: true });
console.log("EDI_ANALYZER_MOBILE=" + mobile.toString("base64"));
expect(posts).toEqual([]);
expect(errors).toEqual([]);
expect(violations).toEqual([]);
console.log("ANALYZER_QA_PASSED: upload validation, local-only processing, search/pagination, numeric/category charts, filtered/full/subset downloads, local history, malformed storage, keyboard navigation, and file-read race handling.");
await browser.close();
