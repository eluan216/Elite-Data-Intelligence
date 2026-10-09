import type { AgentTask } from "./types";

/**
 * In-process task store for v0.
 * Serverless instances do not share memory — replace with Postgres (e.g. Supabase)
 * before multi-instance production use. Sufficient for local demo, tests, and single-instance trials.
 */
const tasks = new Map<string, AgentTask>();

export function saveTask(task: AgentTask): void {
  tasks.set(task.id, task);
}

export function getTask(id: string): AgentTask | undefined {
  return tasks.get(id);
}

export function listTasks(): AgentTask[] {
  return [...tasks.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function clearTasksForTests(): void {
  tasks.clear();
}
