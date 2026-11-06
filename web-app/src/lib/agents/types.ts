import type { CatalogRole } from "./catalog";
/** Shared types for the agent runtime (v0). */

export type AgentRole = CatalogRole;

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

export interface TaskPersistence {
  kind: "memory" | "github_issue" | "response";
  /** GitHub issue URL when dual-written */
  url?: string;
  error?: string;
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
  specialist?: SpecialistOutput;
  steps: AgentStep[];
  mode: "mock" | "llm";
  error?: string;
  estimatedCostUsd?: number;
  errorCode?: string;
  /** Where the terminal record was stored */
  persistence?: TaskPersistence;
}

export interface CreateTaskInput {
  request: string;
  /** Optional specialist; core roles use the shared pipeline. */
  agent?: CatalogRole;
  /** Optional evidence text the research agent may use */
  evidence?: string;
}

export interface SpecialistOutput {
 role:CatalogRole; summary:string; deliverables:{name:string;content:string}[];
 assumptions:string[]; limitations:string[]; missingInformation:string[]; nextSteps:string[]; evidence:string[];
}
