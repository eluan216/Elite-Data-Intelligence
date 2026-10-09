import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  escapeHtml,
  parseContactBody,
} from "@/lib/contact-helpers";

/** Simple in-memory rate limit (per serverless instance). */
const hits = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 8;
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

/** Lazy so tests can set env before first send. */
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

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
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = parseContactBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { name, email, project } = parsed;

    console.log(
      JSON.stringify({
        event: "discovery_request",
        at: new Date().toISOString(),
        ip,
        emailDomain: email.includes("@") ? email.split("@")[1] : null,
        nameLen: name.length,
        projectLen: project.length,
      })
    );

    const resend = getResend();
    const toEmail = process.env.CONTACT_TO_EMAIL || "";

    if (!resend || !toEmail) {
      console.error("Contact misconfigured: RESEND_API_KEY or CONTACT_TO_EMAIL missing");
      return NextResponse.json(
        { error: "Unable to deliver your request right now. Please email us directly." },
        { status: 503 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeProject = escapeHtml(project);

    const { error } = await resend.emails.send({
      from: "Elite-Data-Intelligence <onboarding@resend.dev>",
      to: [toEmail],
      replyTo: email,
      subject: `Discovery Call Request — ${name.slice(0, 80)}`,
      text: [
        "New discovery call request from the website.",
        "",
        `Name: ${name}`,
        `Work email: ${email}`,
        "",
        "What they need help with:",
        project,
        "",
        `Received: ${new Date().toISOString()}`,
      ].join("\n"),
      html: `
        <h2>New Discovery Call Request</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Work email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <p><strong>What they need help with:</strong></p>
        <p style="white-space: pre-wrap;">${safeProject}</p>
        <hr />
        <p style="color:#666;font-size:12px;">Received ${new Date().toISOString()}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Unable to deliver your request. Please try again or email us directly." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Request received. We will be in touch shortly." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Unable to process your request. Please try again." },
      { status: 500 }
    );
  }
}
