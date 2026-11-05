import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseURL = process.env.DESIGN_QA_URL || "http://127.0.0.1:3000";
await mkdir("design-artifacts", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
const accessibilityViolations = [];
page.on("pageerror", (error) => errors.push(error.message));

async function checkLayout(width) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Complex data.");
  const overflow = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll("main h1, main h2, .edi-button, .edi-brand, form input, form textarea")];
    return nodes.filter((node) => {
      const box = node.getBoundingClientRect();
      return box.width > 0 && (box.left < -1 || box.right > innerWidth + 1);
    }).map((node) => node.textContent || node.id);
  });
  expect(overflow).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  console.log("Layout passed at " + width + "px");
}

await checkLayout(1440);
await expect(page.locator(".edi-repository-visual")).toHaveCount(4);
await expect.poll(() => page.locator(".edi-hero-art img").evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
expect(await page.evaluate(() => performance.getEntriesByType("resource").filter((entry) => /\.gif(?:\?|$)/i.test(entry.name)).length)).toBe(0);
await page.screenshot({ path: "design-artifacts/desktop-full.jpg", type: "jpeg", quality: 65, fullPage: true });
const desktop = await page.screenshot({ path: "design-artifacts/desktop-hero.jpg", type: "jpeg", quality: 60 });
console.log("EDI_DESKTOP_JPEG=" + desktop.toString("base64"));
const desktopA11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
console.log("DESKTOP_A11Y=" + JSON.stringify(desktopA11y.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map((node) => node.target) }))));
accessibilityViolations.push(...desktopA11y.violations);

const visual = page.locator(".edi-service-visual").first();
await visual.getByRole("button", { name: "Play conceptual intelligence animation", exact: true }).click();
await expect(visual.locator("img")).toHaveAttribute("src", /wireframe-head\.gif\.GIF/);
await expect.poll(() => visual.locator("img").evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
await visual.getByRole("button", { name: "Pause conceptual intelligence animation", exact: true }).click();
await expect(visual.locator("img")).toHaveAttribute("src", /wireframe-head-poster\.webp/);
await page.goto(baseURL, { waitUntil: "networkidle" });
console.log("REPOSITORY_VISUALS_PASSED: four imagery placements; no GIF requests by default; play/pause restores the static preview.");

let submissions = 0;
await page.route("**/api/contact", (route) => {
  submissions++;
  return route.fulfill({ status: submissions === 1 ? 503 : 200, contentType: "application/json", body: JSON.stringify(submissions === 1 ? { error: "Test failure" } : { success: true }) });
});
const form = page.getByRole("form", { name: "Project inquiry" });
await form.getByLabel("Your name").fill("Design QA");
await form.getByLabel("Work email").fill("design@example.com");
await form.getByLabel("What are you trying to solve?").fill("A browser test. No email is sent.");
await form.getByRole("button", { name: "Let’s start a conversation" }).click();
await expect(form.getByRole("alert")).toContainText("couldn’t send");
await expect(form.getByLabel("Your name")).toHaveValue("Design QA");
await form.getByRole("button", { name: "Let’s start a conversation" }).click();
await expect(form.getByText("Thank you. Your inquiry is in", { exact: false })).toBeVisible();
await expect(form.getByLabel("Your name")).toHaveValue("");
expect(submissions).toBe(2);

for (const width of [768, 390, 320]) await checkLayout(width);
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseURL, { waitUntil: "networkidle" });
const toggle = page.getByRole("button", { name: "Open navigation" });
await toggle.click();
await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
await page.keyboard.press("Escape");
await expect(toggle).toBeFocused();
await expect(toggle).toHaveAttribute("aria-expanded", "false");
await toggle.click();
await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Capabilities" }).click();
await expect(toggle).toHaveAttribute("aria-expanded", "false");

await page.getByRole("button", { name: "Open support chat" }).click();
await expect(page.getByLabel("Your message")).toBeFocused();
const chatA11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
console.log("MOBILE_CHAT_A11Y=" + JSON.stringify(chatA11y.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map((node) => node.target) }))));
accessibilityViolations.push(...chatA11y.violations);
await page.getByRole("button", { name: "We need to prioritize support tickets", exact: true }).click();
await expect(page.getByRole("button", { name: "Customer impact", exact: true })).toBeVisible();
await page.getByRole("button", { name: "Customer impact", exact: true }).click();
await expect(page.getByRole("button", { name: "A database", exact: true })).toBeVisible();
await page.getByLabel("Your message").fill("Zendesk");
await page.getByRole("form", { name: "Support message" }).getByRole("button", { name: "Send", exact: true }).click();
await expect(page.getByRole("button", { name: "I own the decision", exact: true })).toBeVisible();
await expect(page.getByLabel("Your message")).toBeFocused();
const inquiry = page.getByRole("button", { name: "Use this brief in the inquiry form", exact: true });
await expect(inquiry).toBeVisible();
const conversationShot = await page.screenshot({ path: "design-artifacts/project-chat.jpg", type: "jpeg", quality: 60 });
console.log("EDI_CHAT_JPEG=" + conversationShot.toString("base64"));
const discoveryA11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
console.log("DISCOVERY_A11Y=" + JSON.stringify(discoveryA11y.violations.map(({ id, impact }) => ({ id, impact }))));
accessibilityViolations.push(...discoveryA11y.violations);
await inquiry.click();
await expect(form.getByLabel("What are you trying to solve?")).toBeFocused();
await expect(form.getByLabel("What are you trying to solve?")).toHaveValue(/Zendesk/);
await expect(form.getByLabel("What are you trying to solve?")).toHaveValue(/Customer impact/);
expect(submissions).toBe(2);
await page.getByRole("button", { name: "Open support chat" }).click();
await page.getByRole("button", { name: "Start a new chat" }).click();
await expect(page.getByRole("log")).not.toContainText("Zendesk");
await page.keyboard.press("Escape");
await expect(page.getByRole("button", { name: "Open support chat" })).toBeFocused();

await page.goto(baseURL, { waitUntil: "networkidle" });
const mobile = await page.screenshot({ path: "design-artifacts/mobile-full.jpg", type: "jpeg", quality: 55, fullPage: true });
console.log("EDI_MOBILE_JPEG=" + mobile.toString("base64"));
await page.goto(baseURL + "/analyze", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Load sample sales dataset" }).click();
await expect(page.getByText("Loaded 10 rows · 5 columns.")).toBeVisible();
expect(errors).toEqual([]);
expect(accessibilityViolations).toEqual([]);
console.log("DESIGN_QA_PASSED: 4 viewport widths, accessibility, navigation, mocked contact flow, chat focus, and workbench smoke.");
await browser.close();
