import { NextRequest, NextResponse } from "next/server";
import { createAndRunTask } from "@/lib/agents/runtime";

/**
 * POST /api/agents/tasks
 * Creates a task and runs Intake → Research → Validation (v0 synchronous).
 * Long jobs should move to a background worker in a later phase.
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const raw = body as Record<string, unknown>;
    const reqText = typeof raw.request === "string" ? raw.request : "";
    const evidence = typeof raw.evidence === "string" ? raw.evidence : undefined;

    if (!reqText.trim()) {
      return NextResponse.json({ error: "Field 'request' is required." }, { status: 400 });
    }

    const task = await createAndRunTask({ request: reqText, evidence });

    return NextResponse.json(
      {
        id: task.id,
        status: task.status,
        mode: task.mode,
        brief: task.brief,
        research: task.research,
        validation: task.validation,
        steps: task.steps,
        error: task.error,
      },
      { status: 201 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Task failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
