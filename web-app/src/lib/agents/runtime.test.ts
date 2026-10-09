import { beforeEach, describe, expect, it } from "vitest";
import { createAndRunTask } from "./runtime";
import { clearTasksForTests } from "./store";

beforeEach(() => {
  clearTasksForTests();
  delete process.env.OPENAI_API_KEY;
});

describe("agent runtime v0 (mock mode)", () => {
  it("runs intake → research → validation and returns a task id", async () => {
    const task = await createAndRunTask({
      request:
        "We need to prioritize ops tickets by impact. Decision owner is the ops lead. Data may be available in the ticket system.",
      evidence: "Last quarter 12% of tickets were critical; queue depth averages 40.",
    });

    expect(task.id).toBeTruthy();
    expect(task.mode).toBe("mock");
    expect(task.brief?.title).toBeTruthy();
    expect(task.brief?.acceptanceCriteria.length).toBeGreaterThan(0);
    expect(task.research?.limitations.length).toBeGreaterThan(0);
    expect(task.validation?.outcome).toMatch(/pass|fail|needs_human_review/);
    expect(task.steps).toHaveLength(3);
    expect(task.steps.every((s) => s.status === "passed" || s.status === "failed")).toBe(true);
  });

  it("rejects empty request", async () => {
    await expect(createAndRunTask({ request: "   " })).rejects.toThrow(/required/i);
  });

  it("validator can fail when limitations would be missing path is simulated via thin request still passes AC structure", async () => {
    const task = await createAndRunTask({
      request: "Short ops prioritization decision for the triage team with clear ownership.",
    });
    // Mock research always documents limitations → AC3 pass; overall should not crash
    expect(["completed", "awaiting_human", "failed"]).toContain(task.status);
    expect(task.validation).toBeDefined();
  });
});
