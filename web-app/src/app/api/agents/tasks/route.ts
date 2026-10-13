import { NextRequest, NextResponse } from "next/server";
import { createAndRunTask } from "@/lib/agents/runtime";

/** Simple in-memory rate limit (per serverless instance). */
const hits = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function clientIp(request: NextRequest): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now > row.reset) {
    hits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  row.count += 1;
  return row.count > RATE_LIMIT;
}

/**
 * POST /api/agents/tasks
 * Creates a task and runs Intake → Research → Validation (v0 synchronous).
 * Terminal tasks persist to a GitHub issue when GITHUB_TOKEN is set.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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
        persistence: task.persistence,
      },
      { status: 201 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Task failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
