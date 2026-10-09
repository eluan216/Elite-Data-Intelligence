import { completeJson } from "../llm";
import type { AgentTask } from "../types";

const SYSTEM = `You are the Validation and Quality agent for Elite-Data-Intelligence.
Check deliverables against explicit acceptance criteria only.
Outcome must be one of: pass, fail, needs_human_review.
Return JSON: outcome, checks ({criterionId, result: pass|fail|unknown, note}[]), summary.`;

export async function runValidation(task: AgentTask): Promise<NonNullable<AgentTask["validation"]>> {
  const criteria = task.brief?.acceptanceCriteria ?? [];
  const hasResearch = Boolean(task.research);
  const hasLimitations = (task.research?.limitations?.length ?? 0) > 0;
  const hasFindings = (task.research?.findings?.length ?? 0) > 0;

  // Deterministic mock checks against AC ids
  const checks = criteria.map((c) => {
    if (c.id === "AC1") {
      const ok = Boolean(task.brief?.problem && task.brief.problem.length > 10);
      return {
        criterionId: c.id,
        result: ok ? ("pass" as const) : ("fail" as const),
        note: ok ? "Decision/problem statement present" : "Missing problem statement",
      };
    }
    if (c.id === "AC2") {
      const ok = criteria.some((x) => x.measurable);
      return {
        criterionId: c.id,
        result: ok ? ("pass" as const) : ("unknown" as const),
        note: ok ? "At least one measurable criterion defined" : "No measurable criteria",
      };
    }
    if (c.id === "AC3") {
      const ok = hasLimitations;
      return {
        criterionId: c.id,
        result: ok ? ("pass" as const) : ("fail" as const),
        note: ok ? "Limitations documented" : "Limitations missing",
      };
    }
    return {
      criterionId: c.id,
      result: hasResearch && hasFindings ? ("pass" as const) : ("unknown" as const),
      note: hasResearch ? "Research artifact present" : "No research artifact",
    };
  });

  const anyFail = checks.some((c) => c.result === "fail");
  const anyUnknown = checks.some((c) => c.result === "unknown");
  const outcome = anyFail ? "fail" : anyUnknown ? "needs_human_review" : "pass";

  const mock: NonNullable<AgentTask["validation"]> = {
    outcome,
    checks,
    summary:
      outcome === "pass"
        ? "All checked criteria passed within v0 rules."
        : outcome === "fail"
          ? "One or more acceptance criteria failed."
          : "Some criteria could not be fully verified; human review required.",
  };

  if (!process.env.OPENAI_API_KEY) {
    return mock;
  }

  const { data } = await completeJson({
    system: SYSTEM,
    user: JSON.stringify({
      brief: task.brief,
      research: task.research,
      criteria,
    }),
    mock,
  });

  const allowed = new Set(["pass", "fail", "needs_human_review"]);
  const out = allowed.has(String(data.outcome)) ? (data.outcome as typeof outcome) : mock.outcome;

  return {
    outcome: out,
    checks: Array.isArray(data.checks) ? (data.checks as typeof checks) : mock.checks,
    summary: typeof data.summary === "string" ? data.summary : mock.summary,
  };
}
