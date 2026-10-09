/** Pure helpers for contact API — unit-tested without network. */

export const MAX_NAME = 120;
export const MAX_EMAIL = 254;
export const MAX_PROJECT = 4000;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= MAX_EMAIL;
}

export function parseContactBody(body: unknown): {
  ok: true;
  name: string;
  email: string;
  project: string;
} | { ok: false; status: number; error: string } {
  if (body === null || typeof body !== "object") {
    return { ok: false, status: 400, error: "Invalid request body." };
  }
  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const project = typeof raw.project === "string" ? raw.project.trim() : "";

  if (!name || !email || !project) {
    return {
      ok: false,
      status: 400,
      error: "Name, email, and project details are required.",
    };
  }
  if (name.length > MAX_NAME || project.length > MAX_PROJECT) {
    return {
      ok: false,
      status: 400,
      error: "One or more fields exceed the allowed length.",
    };
  }
  if (!isValidEmail(email)) {
    return {
      ok: false,
      status: 400,
      error: "Please provide a valid work email.",
    };
  }
  return { ok: true, name, email, project };
}
