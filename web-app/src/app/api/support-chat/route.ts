import { NextRequest, NextResponse } from "next/server";

/**
 * Customer Support — keyword knowledge base (not an LLM agent).
 * Mode is always "knowledge" until a real model integration is wired and tested.
 */

const KNOWLEDGE = {
  identity: `I am the Elite-Data-Intelligence support assistant (FAQ). I help with capabilities, delivery process, security posture, and how to start. I do not make commercial commitments — discovery calls and the founder handle scope and pricing.`,

  capabilities: `We deliver Decision Sciences, Machine Learning & Agents, MLOps & Platforms, Data Engineering, Governance documentation, and Change & Adoption support. Work runs with senior human oversight and validation gates before client-facing or production release.`,

  process: `Delivery path: Discover → Design → Build → Validate → Operate. Engagements are sequenced in GitHub. Material deliverables go through Validation before release; failures route to Failure Analysis. High-risk work requires an explicit human gate.`,

  security: `Human review is required before production or client-facing deliverables. We keep version-controlled artifacts and document limitations honestly. We only claim safeguards that are implemented.`,

  start: `Best next step is a discovery call via the form on this site (name, work email, problem description). That reaches the founder directly. I can answer orientation questions here; detailed scoping happens on the call.`,

  team: `Operating model: documented specialized roles plus a senior human core. Some GitHub workflows automate intake and checklists. Autonomous LLM workers are not the production workforce yet — humans execute using the role definitions.`,

  pricing: `We do not publish fixed package prices here. Engagements are scoped to the decision and outcome. Share the problem on a discovery call and we will propose a clear shape of work.`,

  fallback: `I can help with capabilities, delivery process, security/governance, our team model, or how to start a discovery call. For project-specific advice, use the contact form so the founder can respond directly.`,
} as const;

function composeReply(userText: string): string {
  const t = userText.toLowerCase().trim();
  if (!t) return KNOWLEDGE.fallback;

  const rules: { keys: string[]; reply: string }[] = [
    { keys: ["price", "pricing", "cost", "fee", "budget", "how much"], reply: KNOWLEDGE.pricing },
    { keys: ["security", "privacy", "gdpr", "compliance", "govern", "risk", "audit"], reply: KNOWLEDGE.security },
    { keys: ["process", "deliver", "how do you", "methodology", "lifecycle", "playbook"], reply: KNOWLEDGE.process },
    { keys: ["team", "agent", "who", "people", "staff", "human"], reply: KNOWLEDGE.team },
    { keys: ["capabilit", "service", "what do you", "offer", "mlops", "machine learning", "data eng"], reply: KNOWLEDGE.capabilities },
    { keys: ["start", "call", "contact", "book", "discovery", "talk", "meeting", "email"], reply: KNOWLEDGE.start },
    { keys: ["hello", "hi", "hey", "who are you"], reply: KNOWLEDGE.identity },
  ];

  for (const rule of rules) {
    if (rule.keys.some((k) => t.includes(k))) return rule.reply;
  }
  return KNOWLEDGE.fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.slice(0, 2000) : "";

    if (!message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const reply = composeReply(message);

    return NextResponse.json({
      reply,
      agent: "customer-support",
      mode: "knowledge",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process that message. Please try again or use the discovery form." },
      { status: 500 }
    );
  }
}
