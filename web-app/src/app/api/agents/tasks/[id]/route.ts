import { NextRequest, NextResponse } from "next/server";
import { readTask } from "@/lib/agents/runtime";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const task = readTask(id);
  if (!task) {
    return NextResponse.json(
      {
        error: "Task not found",
        note: "v0 store is in-memory per instance; use the POST response body for immediate results.",
      },
      { status: 404 }
    );
  }
  return NextResponse.json(task);
}
