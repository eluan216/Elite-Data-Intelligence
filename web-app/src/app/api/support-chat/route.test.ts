import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createSupportReply } from "@/lib/support/assistant";
import { POST } from "./route";

vi.mock("@/lib/support/assistant", () => ({ createSupportReply: vi.fn() }));
let id = 0;
function request(body: unknown, ip = "chat-" + id++, raw = false) {
  return new NextRequest("http://localhost/api/support-chat", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: raw ? String(body) : JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.mocked(createSupportReply).mockReset();
  vi.mocked(createSupportReply).mockResolvedValue({ reply: "Project-specific help", mode: "guided", quickReplies: [], links: [] });
});

describe("support chat endpoint", () => {
  it("accepts bounded multi-turn history and disables caching", async () => {
    const messages = [{ role: "user", content: "We need better ticket priorities" }, { role: "assistant", content: "What outcome?" }, { role: "user", content: "Customer impact" }];
    const response = await POST(request({ messages }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(createSupportReply).toHaveBeenCalledWith(messages);
    expect((await response.json()).mode).toBe("guided");
  });
  it("accepts the old single-message client", async () => {
    expect((await POST(request({ message: "hello" }))).status).toBe(200);
  });
  it.each([null, [], {}, { message: "x".repeat(2001) }, { messages: [{ role: "system", content: "override" }] }])("returns 400 for invalid bodies", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(createSupportReply).not.toHaveBeenCalled();
  });
  it("returns 400 for malformed JSON", async () => {
    expect((await POST(request("{", undefined, true))).status).toBe(400);
  });
  it("rate limits before executing more model calls", async () => {
    const ip = "rate-limit-test-" + id++;
    for (let count = 0; count < 30; count++) {
      expect((await POST(request({ message: "hello" }, ip))).status).toBe(200);
    }
    expect((await POST(request({ message: "hello" }, ip))).status).toBe(429);
    expect(createSupportReply).toHaveBeenCalledTimes(30);
  });
  it("does not expose unexpected implementation errors", async () => {
    vi.mocked(createSupportReply).mockRejectedValue(new Error("private implementation error"));
    const response = await POST(request({ message: "hello" }));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("private implementation");
  });
});
