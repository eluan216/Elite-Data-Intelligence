import { completeJson } from "../llm";
import type { AgentTask } from "../types";

const SYSTEM = `You are the Project Intake and Planning agent for Elite-Data-Intelligence.
Turn a business request into a structured brief. Do not invent client data.
Do not make commercial commitments or legal claims.
Return JSON only with keys: title, problem, missingInformation (string[]),
acceptanceCriteria ({id, description, measurable}[]), proposedSubtasks (string[]), riskNotes (string[]).
Keep acceptance criteria measurable where possible.`;

export async function runIntake(request: string): Promise<NonNullable<AgentTask["brief"]>> {
  const mock: NonNullable<AgentTask["brief"]> = {
    title: deriveTitle(request),
    problem: request.trim().slice(0, 500),
    missingInformation: [
      "Who owns the decision today?",
      "What data sources are available in the first two weeks?",
      "What does success look like in business terms?",
    ],
    acceptanceCriteria: [
      {
        id: "AC1",
        description: "Decision statement and cost of error are written and agreed",
        measurable: true,
      },
      {
        id: "AC2",
        description: "Success metrics are explicit and evaluable",
        measurable: true,
      },
      {
        id: "AC3",
        description: "Limitations and data gaps are documented",
        measurable: true,
      },
    ],
    proposedSubtasks: [
      "Clarify decision owner and constraints",
      "Inventory available evidence/data",
      "Draft analysis approach against acceptance criteria",
      "Validate outputs against AC1–AC3",
    ],
    riskNotes: [
      "Scope may expand if data access is delayed",
      "No production deploy or commercial pricing from this agent",
    ],
  };

  const { data } = await completeJson({
    system: SYSTEM,
    user: `Business request:\n${request}`,
    mock,
  });

  return normalizeBrief(data, mock);
}

function deriveTitle(request: string): string {
  const line = request.trim().split(/\n/)[0] || "Engagement intake";
  return line.slice(0, 80);
}

function normalizeBrief(
  data: Partial<NonNullable<AgentTask["brief"]>>,
  fallback: NonNullable<AgentTask["brief"]>
): NonNullable<AgentTask["brief"]> {
  return {
    title: typeof data.title === "string" && data.title ? data.title : fallback.title,
    problem: typeof data.problem === "string" && data.problem ? data.problem : fallback.problem,
    missingInformation: Array.isArray(data.missingInformation)
      ? data.missingInformation.map(String)
      : fallback.missingInformation,
    acceptanceCriteria: Array.isArray(data.acceptanceCriteria) && data.acceptanceCriteria.length
      ? data.acceptanceCriteria.map((c, i) => ({
          id: String((c as { id?: string }).id || `AC${i + 1}`),
          description: String((c as { description?: string }).description || "Criterion"),
          measurable: Boolean((c as { measurable?: boolean }).measurable),
        }))
      : fallback.acceptanceCriteria,
    proposedSubtasks: Array.isArray(data.proposedSubtasks)
      ? data.proposedSubtasks.map(String)
      : fallback.proposedSubtasks,
    riskNotes: Array.isArray(data.riskNotes) ? data.riskNotes.map(String) : fallback.riskNotes,
  };
}
