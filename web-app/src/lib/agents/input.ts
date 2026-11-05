import type { CreateTaskInput } from "./types";

export const MAX_TASK_REQUEST = 8000;
export const MAX_TASK_EVIDENCE = 20000;

export class TaskInputError extends Error {}

/** Shared HTTP/runtime contract; reject invalid input before any agent runs. */
export function validateTaskInput(value: unknown): CreateTaskInput {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TaskInputError("Body must be a JSON object.");
  }
  const raw = value as Record<string, unknown>;
  if (typeof raw.request !== "string" || !raw.request.trim()) {
    throw new TaskInputError("Field 'request' is required and must be a string.");
  }
  const request = raw.request.trim();
  if (request.length > MAX_TASK_REQUEST) {
    throw new TaskInputError("Request must be at most 8000 characters.");
  }
  if (raw.evidence !== undefined && typeof raw.evidence !== "string") {
    throw new TaskInputError("Field 'evidence' must be a string.");
  }
  const evidence = typeof raw.evidence === "string" ? raw.evidence.trim() : undefined;
  if (evidence && evidence.length > MAX_TASK_EVIDENCE) {
    throw new TaskInputError("Evidence must be at most 20000 characters.");
  }
  return { request, evidence };
}
