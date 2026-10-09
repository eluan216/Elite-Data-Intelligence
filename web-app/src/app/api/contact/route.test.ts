import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

function makeRequest(
  body: unknown,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": headers["x-forwarded-for"] || `test-ip-${Math.random()}`,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.resetModules();
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "msg_1" }, error: null });
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_TO_EMAIL = "founder@example.com";
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
  });

  it("returns 400 when required fields are missing", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ name: "Ada" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/required/i);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid email", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest({
        name: "Ada",
        email: "bad",
        project: "Need help",
      })
    );
    expect(res.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 503 when Resend is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest({
        name: "Ada",
        email: "ada@example.com",
        project: "Decision system",
      })
    );
    expect(res.status).toBe(503);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 200 and sends email when configured", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest({
        name: "Ada Lovelace",
        email: "ada@example.com",
        project: "Ops triage ranking",
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    const arg = sendMock.mock.calls[0][0];
    expect(arg.to).toEqual(["founder@example.com"]);
    expect(arg.replyTo).toBe("ada@example.com");
    expect(arg.html).toContain("Ada Lovelace");
    expect(arg.html).not.toContain("<script");
  });

  it("escapes HTML in the outbound email body", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest({
        name: "<b>X</b>",
        email: "x@example.com",
        project: "<script>alert(1)</script>",
      })
    );
    expect(res.status).toBe(200);
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("&lt;b&gt;X&lt;/b&gt;");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toMatch(/<script>alert/);
  });

  it("returns 500 when Resend reports an error", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest({
        name: "Ada",
        email: "ada@example.com",
        project: "Help",
      })
    );
    expect(res.status).toBe(500);
  });
});
