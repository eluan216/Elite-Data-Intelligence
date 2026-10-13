import type { AgentTask, TaskPersistence } from "./types";

/**
 * Durable audit record for terminal tasks.
 * When GITHUB_TOKEN is set, creates an issue on the agency repo (audit trail).
 * Without a token, reports memory-only (serverless memory is still not cross-instance).
 */

function repoSlug(): { owner: string; repo: string } {
  const raw = process.env.GITHUB_REPO || "eluan216/Elite-Data-Intelligence";
  const [owner, repo] = raw.split("/");
  return { owner: owner || "eluan216", repo: repo || "Elite-Data-Intelligence" };
}

function issueBody(task: AgentTask): string {
  const lines = [
    `## Agent runtime task`,
    ``,
    `| Field | Value |`,
    `| ----- | ----- |`,
    `| Task ID | \`${task.id}\` |`,
    `| Status | **${task.status}** |`,
    `| Mode | ${task.mode} |`,
    `| Created | ${task.createdAt} |`,
    `| Updated | ${task.updatedAt} |`,
    ``,
    `### Request`,
    ``,
    "```",
    task.request.slice(0, 4000),
    "```",
    ``,
  ];

  if (task.error) {
    lines.push(`### Error`, ``, "```", task.error.slice(0, 1500), "```", ``);
  }

  if (task.brief) {
    lines.push(
      `### Intake brief`,
      ``,
      `- **Title:** ${task.brief.title}`,
      `- **Problem:** ${task.brief.problem.slice(0, 500)}`,
      `- **Missing info:** ${(task.brief.missingInformation || []).join("; ") || "—"}`,
      `- **Subtasks:** ${(task.brief.proposedSubtasks || []).join("; ") || "—"}`,
      ``
    );
  }

  if (task.research) {
    lines.push(
      `### Research`,
      ``,
      `- **Findings:** ${(task.research.findings || []).join("; ") || "—"}`,
      `- **Facts:** ${(task.research.facts || []).join("; ") || "—"}`,
      `- **Assumptions:** ${(task.research.assumptions || []).join("; ") || "—"}`,
      `- **Limitations:** ${(task.research.limitations || []).join("; ") || "—"}`,
      ``
    );
  }

  if (task.validation) {
    lines.push(
      `### Validation`,
      ``,
      `- **Outcome:** ${task.validation.outcome}`,
      `- **Summary:** ${task.validation.summary}`,
      ``
    );
  }

  lines.push(
    `### Steps`,
    ``,
    ...task.steps.map(
      (s) =>
        `- **${s.role}**: ${s.status}${s.error ? ` — ${s.error.slice(0, 200)}` : ""}`
    ),
    ``,
    `---`,
    `*Written by agent runtime persistence. Founder review when status is awaiting_human or failed.*`
  );

  return lines.join("\n");
}

export async function persistTerminalTask(task: AgentTask): Promise<TaskPersistence> {
  const token = process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim();

  if (!token) {
    return {
      kind: "memory",
      error: "No GITHUB_TOKEN — task kept in instance memory only. Set GITHUB_TOKEN on Vercel for durable audit issues.",
    };
  }

  const { owner, repo } = repoSlug();
  const title = `[agent-runtime] ${task.status} · ${(task.brief?.title || task.request).slice(0, 60)}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body: issueBody(task),
        labels: ["agent:runtime", "quality-gate"],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        kind: "memory",
        error: `GitHub issue create failed (${res.status}): ${text.slice(0, 200)}`,
      };
    }

    const json = (await res.json()) as { html_url?: string };
    return {
      kind: "github_issue",
      url: json.html_url,
    };
  } catch (e) {
    return {
      kind: "memory",
      error: e instanceof Error ? e.message : "GitHub persist failed",
    };
  }
}
