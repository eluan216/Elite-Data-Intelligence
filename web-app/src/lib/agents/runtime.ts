import { randomUUID } from "crypto";
import { validateTaskInput } from "./input";
import { getLlmMode } from "./llm";
import { persistTerminalTask } from "./persist";
import { runIntake } from "./roles/intake";
import { runResearch } from "./roles/research";
import { runValidation } from "./roles/validation";
import { getTask, saveTask } from "./store";
import type { AgentTask, CreateTaskInput } from "./types";

/**
 * Orchestrator v0: sequential Intake → Research → Validation.
 * Narrow permissions: no shell, no deploy, no commercial commits, no private data access.
 * Terminal tasks dual-write to GitHub Issues when GITHUB_TOKEN is configured.
 */
export async function createAndRunTask(input: CreateTaskInput): Promise<AgentTask> {
  const { request, evidence } = validateTaskInput(input);

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
    task.steps[0].status = "running";
    task.steps[0].startedAt = new Date().toISOString();
    saveTask(task);
    task.brief = await runIntake(request);
    task.steps[0].status = "passed";
    task.steps[0].finishedAt = new Date().toISOString();
    task.steps[0].output = task.brief;
    task.updatedAt = new Date().toISOString();
    saveTask(task);

    task.steps[1].status = "running";
    task.steps[1].startedAt = new Date().toISOString();
    saveTask(task);
    task.research = await runResearch({ request, evidence, brief: task.brief });
    task.steps[1].status = "passed";
    task.steps[1].finishedAt = new Date().toISOString();
    task.steps[1].output = task.research;
    task.updatedAt = new Date().toISOString();
    saveTask(task);

    task.steps[2].status = "running";
    task.steps[2].startedAt = new Date().toISOString();
    saveTask(task);
    task.validation = await runValidation(task);
    task.steps[2].status = task.validation.outcome === "fail" ? "failed" : "passed";
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
    for (const step of task.steps) {
      if (step.status === "pending") {
        step.status = "skipped";
        step.finishedAt = task.updatedAt;
      }
    }
  }
  // Persistence is best-effort and must not alter the agent outcome or retry issue creation.
  saveTask(task);
  try {
    task.persistence = await persistTerminalTask(task);
  } catch {
    task.persistence = { kind: "memory", error: "Task persistence unavailable; result retained in memory." };
  }
  task.updatedAt = new Date().toISOString();
  saveTask(task);
  return task;
}

export function readTask(id: string): AgentTask | undefined {
  return getTask(id);
}
