import { completeJson } from "../llm";
import type { AgentTask } from "../types";

const SYSTEM = `You are the Research and Data Analysis agent for Elite-Data-Intelligence.
Analyze only the supplied request and evidence. Separate facts, assumptions, and limitations.
Do not invent external statistics. Do not access the network or private systems.
Return JSON: findings (string[]), facts (string[]), assumptions (string[]), limitations (string[]), evidence (string[]).`;

export async function runResearch(params: {
  request: string;
  evidence?: string;
  brief?: AgentTask["brief"];
}): Promise<NonNullable<AgentTask["research"]>> {
  const evidence = (params.evidence || "").trim();
  const mock: NonNullable<AgentTask["research"]> = {
    findings: [
      evidence
        ? "Supplied evidence was reviewed against the intake problem statement."
        : "No evidence text was supplied; findings are limited to the request wording.",
      params.brief
        ? `Intake title: ${params.brief.title}`
        : "Intake brief not yet attached.",
    ],
    facts: evidence
      ? [`Evidence length: ${evidence.length} characters`, "Evidence was provided by the requester"]
      : ["No external facts available without evidence or approved tools"],
    assumptions: [
      "Requester description is accurate unless contradicted by evidence",
      "Any numeric claims in the request are unverified until data is attached",
    ],
    limitations: [
      "No live database or web search in v0 research agent",
      "Cannot validate production metrics without authorized data access",
    ],
    evidence: evidence ? [evidence.slice(0, 2000)] : [],
  };

  const { data } = await completeJson({
    system: SYSTEM,
    user: JSON.stringify({
      request: params.request,
      brief: params.brief ?? null,
      evidence: evidence || null,
    }),
    mock,
  });

  return {
    findings: Array.isArray(data.findings) ? data.findings.map(String) : mock.findings,
    facts: Array.isArray(data.facts) ? data.facts.map(String) : mock.facts,
    assumptions: Array.isArray(data.assumptions) ? data.assumptions.map(String) : mock.assumptions,
    limitations: Array.isArray(data.limitations) ? data.limitations.map(String) : mock.limitations,
    evidence: Array.isArray(data.evidence) ? data.evidence.map(String) : mock.evidence,
  };
}
