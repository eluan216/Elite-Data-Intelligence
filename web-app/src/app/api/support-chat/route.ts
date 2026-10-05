import { NextRequest, NextResponse } from "next/server";

/**
 * Customer Support Agent — server-side reply logic.
 * Structured so a real LLM can replace `composeReply` later without changing the client.
 * Knowledge is grounded in agency positioning and agent definitions; no invented claims.
 */

const KNOWLEDGE = {
  identity: `I am the Elite-Data-Intelligence Customer Support Agent. I help with capabilities, delivery process, security posture, and how to start. I do not make commercial commitments — discovery calls and the founder handle scope and pricing.`,

  capabilities: `We deliver Decision Sciences, Machine Learning & Agents, MLOps & Platforms, Data Engineering, Governance & Risk, and Change & Adoption. Work is run with senior human oversight, continuous validation, and clear quality gates before anything is client-facing or production.`,

  process: `Delivery path: Data readiness → Models & Agents → Production path → Adoption → Measured value. Engagements are sequenced in GitHub (Project Manager). Every material deliverable goes through Validation before release; failures route to Failure Analysis. High/regulated work requires an explicit human gate.`,

  security: `Human review is required before production or client-facing deliverables. Validation agents (and humans in those roles) test against stated acceptance criteria. We keep version-controlled artifacts and aim for audit-ready documentation. We only claim safeguards that are implemented — no theater.`,

  start: `Best next step is a discovery call via the form on this site (name, work email, what you need help with). That reaches the founder directly. I can answer orientation questions here; detailed scoping happens on the call.`,

  team: `Operating model: 16 specialized agent roles plus a senior human core. Agents accelerate delivery and quality loops; the founder retains authority on strategy, commercial terms, high-risk acceptance, and reputation.`,

  pricing: `We do not publish fixed package prices here. Engagements are scoped to the decision and outcome. Share the problem on a discovery call and we will propose a clear shape of work.`,

  fallback: `I can help with capabilities, delivery process, security/governance, our team model, or how to start a discovery call. For project-specific advice, use the contact form so the founder can respond directly.`,
} as const;

function composeReply(userText: string): string {
  const t = userText.toLowerCase().trim();

  if (!t) return KNOWLEDGE.fallback;

  // Intent ranking (simple, explicit — replaceable by LLM later)
  const rules: { keys: string[]; reply: string }[] = [
    {
      keys: ["price", "pricing", "cost", "fee", "budget", "how much"],
      reply: KNOWLEDGE.pricing,
    },
    {
      keys: ["security", "privacy", "gdpr", "compliance", "govern", "risk", "audit"],
      reply: KNOWLEDGE.security,
    },
    {
      keys: ["process", "deliver", "how do you", "methodology", "lifecycle", "playbook"],
      reply: KNOWLEDGE.process,
    },
    {
      keys: ["team", "agent", "who", "people", "staff", "human"],
      reply: KNOWLEDGE.team,
    },
    {
      keys: ["capabilit", "service", "what do you", "offer", "mlops", "machine learning", "data eng"],
      reply: KNOWLEDGE.capabilities,
    },
    {
      keys: ["start", "call", "contact", "book", "discovery", "talk", "meeting", "email"],
      reply: KNOWLEDGE.start,
    },
    {
      keys: ["hello", "hi", "hey", "who are you"],
      reply: KNOWLEDGE.identity,
    },
  ];

  for (const rule of rules) {
    if (rule.keys.some((k) => t.includes(k))) return rule.reply;
  }

  return KNOWLEDGE.fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message : "";

    if (!message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // Optional: if OPENAI_API_KEY (or similar) is set later, call an LLM here with KNOWLEDGE as system context.
    const reply = composeReply(message);

    return NextResponse.json({
      reply,
      agent: "customer-support",
      mode: process.env.SUPPORT_CHAT_LLM === "1" ? "llm" : "knowledge",
    });
  } catch (e) {
    console.error("Support chat error:", e);
    return NextResponse.json(
      { error: "Unable to process that message. Please try again or use the discovery form." },
      { status: 500 }
    );
  }
}
