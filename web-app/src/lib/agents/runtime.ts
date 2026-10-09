import { randomUUID } from "crypto";
import { getLlmMode } from "./llm";
import { runIntake } from "./roles/intake";
import { runResearch } from "./roles/research";
import { runValidation } from "./roles/validation";
import { getTask, saveTask } from "./store";
import type { AgentTask, CreateTaskInput } from "./types";

const MAX_REQUEST = 8000;
const MAX_EVIDENCE = 20000;

/**
 * Orchestrator v0: sequential Intake → Research → Validation.
 * Narrow permissions: no shell, no deploy, no commercial commits, no private data access.
 */
export async function createAndRunTask(input: CreateTaskInput): Promise<AgentTask> {
  const request = (input.request || "").trim();
  if (!request || request.length > MAX_REQUEST) {
    throw new Error("Request is required and must be under 8000 characters.");
  }
  const evidence = input.evidence?.trim().slice(0, MAX_EVIDENCE);

  const now = new Date().toISOString();
  const task: AgentTask = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "running",
    request,
    steps: [
      { role: "intake", status: "pending", inputSummary: "Business request" },
      { role: "research", status: "pending", inputSummary: "Request + optional evidence" },
      { role: "validation", status: "pending", inputSummary: "Brief + research vs criteria" },
    ],
    mode: getLlmMode(),
  };
  saveTask(task);

  try {
    // 1 Intake
    task.steps[0].status = "running";
    task.steps[0].startedAt = new Date().toISOString();
    saveTask(task);
    task.brief = await runIntake(request);
    task.steps[0].status = "passed";
    task.steps[0].finishedAt = new Date().toISOString();
    task.steps[0].output = task.brief;
    task.updatedAt = new Date().toISOString();
    saveTask(task);

    // 2 Research
    task.steps[1].status = "running";
    task.steps[1].startedAt = new Date().toISOString();
    saveTask(task);
    task.research = await runResearch({ request, evidence, brief: task.brief });
    task.steps[1].status = "passed";
    task.steps[1].finishedAt = new Date().toISOString();
    task.steps[1].output = task.research;
    task.updatedAt = new Date().toISOString();
    saveTask(task);

    // 3 Validation
    task.steps[2].status = "running";
    task.steps[2].startedAt = new Date().toISOString();
    saveTask(task);
    task.validation = await runValidation(task);
    task.steps[2].status =
      task.validation.outcome === "fail" ? "failed" : "passed";
    task.steps[2].finishedAt = new Date().toISOString();
    task.steps[2].output = task.validation;
    task.updatedAt = new Date().toISOString();

    if (task.validation.outcome === "needs_human_review") {
      task.status = "awaiting_human";
    } else if (task.validation.outcome === "fail") {
      task.status = "failed";
    } else {
      task.status = "completed";
    }
    saveTask(task);
    return task;
  } catch (e) {
    task.status = "failed";
    task.error = e instanceof Error ? e.message : "Unknown agent error";
    task.updatedAt = new Date().toISOString();
    const running = task.steps.find((s) => s.status === "running");
    if (running) {
      running.status = "failed";
      running.error = task.error;
      running.finishedAt = task.updatedAt;
    }
    saveTask(task);
    return task;
  }
}

export function readTask(id: string): AgentTask | undefined {
  return getTask(id);
}
