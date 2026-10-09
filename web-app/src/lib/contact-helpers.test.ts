import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  isValidEmail,
  parseContactBody,
  MAX_NAME,
  MAX_PROJECT,
} from "./contact-helpers";

describe("escapeHtml", () => {
  it("escapes angle brackets and ampersands", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
    expect(escapeHtml("a & b")).toBe("a &amp; b");
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("passes through plain text", () => {
    expect(escapeHtml("Ops prioritization")).toBe("Ops prioritization");
  });
});

describe("isValidEmail", () => {
  it("accepts normal work emails", () => {
    expect(isValidEmail("lead@company.com")).toBe(true);
  });

  it("rejects missing at or domain", () => {
    expect(isValidEmail("nodomain")).toBe(false);
    expect(isValidEmail("@x.com")).toBe(false);
    expect(isValidEmail("a@")).toBe(false);
  });
});

describe("parseContactBody", () => {
  const valid = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    project: "Need a decision system for triage",
  };

  it("accepts valid payload", () => {
    const r = parseContactBody(valid);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.name).toBe("Ada Lovelace");
      expect(r.email).toBe("ada@example.com");
    }
  });

  it("trims fields", () => {
    const r = parseContactBody({
      name: "  Ada  ",
      email: "  ada@example.com ",
      project: "  hello  ",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.name).toBe("Ada");
      expect(r.email).toBe("ada@example.com");
      expect(r.project).toBe("hello");
    }
  });

  it("rejects missing fields", () => {
    const r = parseContactBody({ name: "Ada", email: "ada@example.com" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it("rejects invalid email", () => {
    const r = parseContactBody({ ...valid, email: "not-an-email" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/valid work email/i);
  });

  it("rejects overlong name", () => {
    const r = parseContactBody({
      ...valid,
      name: "x".repeat(MAX_NAME + 1),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/length/i);
  });

  it("rejects overlong project", () => {
    const r = parseContactBody({
      ...valid,
      project: "y".repeat(MAX_PROJECT + 1),
    });
    expect(r.ok).toBe(false);
  });
});
