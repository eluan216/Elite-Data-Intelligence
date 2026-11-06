import { beforeEach, describe, expect, it, vi } from "vitest";

const model = vi.hoisted(() => ({ completeJson: vi.fn(), getOpenAiKey: vi.fn() }));
vi.mock("../agents/llm", () => model);

import { createSupportReply } from "./assistant";
import type { ChatTurn } from "./types";

const history: ChatTurn[] = [
  { role: "user", content: "We need to prioritize support tickets" },
  { role: "assistant", content: "What outcome matters?" },
  { role: "user", content: "Customer impact" },
];

beforeEach(() => {
  model.completeJson.mockReset();
  model.getOpenAiKey.mockReturnValue(undefined);
});

describe("grounded support model layer", () => {
  it("uses contextual guided support without a model key", async () => {
    const response = await createSupportReply(history);
    expect(response.mode).toBe("guided");
    expect(response.reply).toContain("Where does");
    expect(model.completeJson).not.toHaveBeenCalled();
  });

  it("provides verified facts and all supplied conversation context to the model", async () => {
    model.getOpenAiKey.mockReturnValue("test-key-not-a-live-credential");
    model.completeJson.mockResolvedValue({
      mode: "llm",
      data: { reply: "Customer impact gives us a useful ranking objective. Where are the ticket records?", quickReplies: ["Zendesk"] },
    });
    const response = await createSupportReply(history);
    expect(response.mode).toBe("llm");
    const call = model.completeJson.mock.calls[0][0];
    expect(JSON.parse(call.user).conversation).toEqual(history);
    expect(call.system).toContain("VERIFIED AGENCY FACTS");
    expect(call.system).toContain("not a medical device");
    expect(call.timeoutMs).toBe(12000);
    expect(response.links[0].href).toContain("ops-priority");
    expect(response.brief).toContain("Customer impact");
  });

  it.each([null, {}, { reply: 42 }, { reply: "" }, { reply: "x".repeat(1801) }])("falls back on malformed output", async (data) => {
    model.getOpenAiKey.mockReturnValue("test-key");
    model.completeJson.mockResolvedValue({ mode: "llm", data });
    expect((await createSupportReply(history)).mode).toBe("guided");
  });

  it("handles provider failure without losing context or leaking its error", async () => {
    model.getOpenAiKey.mockReturnValue("test-key");
    model.completeJson.mockRejectedValue(new Error("Sensitive provider details"));
    const response = await createSupportReply(history);
    expect(response.mode).toBe("guided");
    expect(response.reply).toContain("Where does");
    expect(JSON.stringify(response)).not.toContain("Sensitive");
  });

  it("bounds model suggestions and does not accept model-provided links/actions", async () => {
    model.getOpenAiKey.mockReturnValue("test-key");
    model.completeJson.mockResolvedValue({
      mode: "llm",
      data: { reply: "Let’s clarify the outcome.", quickReplies: [null, 3, "x".repeat(81), "A", "B", "C", "D"], links: [{ href: "https://untrusted.example" }] },
    });
    const response = await createSupportReply(history);
    expect(response.quickReplies).toEqual(["A", "B", "C"]);
    expect(JSON.stringify(response.links)).not.toContain("untrusted");
  });
});
