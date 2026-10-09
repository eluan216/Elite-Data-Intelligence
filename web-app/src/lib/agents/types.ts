/** Shared types for the agent runtime (v0). */

export type AgentRole = "intake" | "research" | "validation";

export type TaskStatus =
  | "queued"
  | "running"
  | "awaiting_human"
  | "completed"
  | "failed";

export type StepStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export interface AcceptanceCriterion {
  id: string;
  description: string;
  measurable: boolean;
}

export interface AgentStep {
  role: AgentRole;
  status: StepStatus;
  inputSummary: string;
  output?: unknown;
  evidence?: string[];
  error?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface AgentTask {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: TaskStatus;
  /** Original user/business request */
  request: string;
  /** Structured brief from intake */
  brief?: {
    title: string;
    problem: string;
    missingInformation: string[];
    acceptanceCriteria: AcceptanceCriterion[];
    proposedSubtasks: string[];
    riskNotes: string[];
  };
  /** Research findings */
  research?: {
    findings: string[];
    facts: string[];
    assumptions: string[];
    limitations: string[];
    evidence: string[];
  };
  /** Validation result */
  validation?: {
    outcome: "pass" | "fail" | "needs_human_review";
    checks: { criterionId: string; result: "pass" | "fail" | "unknown"; note: string }[];
    summary: string;
  };
  steps: AgentStep[];
  mode: "mock" | "llm";
  error?: string;
  estimatedCostUsd?: number;
}

export interface CreateTaskInput {
  request: string;
  /** Optional evidence text the research agent may use */
  evidence?: string;
}
