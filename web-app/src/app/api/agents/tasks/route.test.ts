import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createAndRunTask } from "@/lib/agents/runtime";
import { POST } from "./route";

vi.mock("@/lib/agents/runtime", () => ({ createAndRunTask: vi.fn() }));

let requestId = 0;
function request(body: unknown, raw = false) {
  return new NextRequest("http://localhost/api/agents/tasks", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `test-${requestId++}`,
    },
    body: raw ? String(body) : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(createAndRunTask).mockReset();
  vi.mocked(createAndRunTask).mockResolvedValue({
    id: "task-1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    request: "test",
    status: "completed",
    mode: "mock",
    steps: [],
  });
});

describe("POST /api/agents/tasks input contract", () => {
  it.each([null, [], 42, true, "text"])("rejects non-object JSON: %j", async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(createAndRunTask).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    expect((await POST(request("{", true))).status).toBe(400);
    expect(createAndRunTask).not.toHaveBeenCalled();
  });

  it.each([
    {},
    { request: 42 },
    { request: "  " },
    { request: "x".repeat(8001) },
    { request: "test", evidence: null },
    { request: "test", evidence: 42 },
    { request: "test", evidence: "x".repeat(20001) },
  ])("rejects invalid fields without running agents", async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(createAndRunTask).not.toHaveBeenCalled();
  });

  it("accepts exact limits and passes normalized input without truncating evidence", async () => {
    const text = "x".repeat(8000);
    const evidence = "y".repeat(20000);
    const response = await POST(request({ request: ` ${text} `, evidence }));
    expect(response.status).toBe(201);
    expect(createAndRunTask).toHaveBeenCalledWith({ request: text, evidence });
    expect((await response.json()).id).toBe("task-1");
  });

  it("reports unexpected runtime failures as server errors", async () => {
    vi.mocked(createAndRunTask).mockRejectedValue(new Error("Task failed"));
    expect((await POST(request({ request: "test" }))).status).toBe(500);
  });
});
