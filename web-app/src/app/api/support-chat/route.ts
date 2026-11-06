import { NextRequest, NextResponse } from "next/server";
import { createSupportReply } from "@/lib/support/assistant";
import { ChatInputError, parseConversation } from "@/lib/support/conversation";

const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 30;

/** Best-effort per-instance limiter; the hosting edge should enforce global quotas. */
function rateLimited(request: NextRequest): boolean {
  const now = Date.now();
  for (const [key, value] of hits) if (value.reset <= now) hits.delete(key);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") || "unknown";
  const current = hits.get(ip);
  if (current) {
    current.count++;
    return current.count > LIMIT;
  }
  if (hits.size >= 2000) return true;
  hits.set(ip, { count: 1, reset: now + WINDOW_MS });
  return false;
}

export async function POST(request: NextRequest) {
  if (rateLimited(request)) {
    return NextResponse.json(
      { error: "Too many chat messages. Please try later or use the inquiry form." },
      { status: 429 }
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  try {
    const messages = parseConversation(body);
    const response = await createSupportReply(messages);
    return NextResponse.json(
      { ...response, agent: "project-discovery" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof ChatInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Chat is unavailable right now. Please use the inquiry form." },
      { status: 503 }
    );
  }
}
