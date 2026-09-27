"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: number;
  role: "user" | "agent";
  text: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: "agent",
    text: "Hello. I’m the Elite-Data-Intelligence support agent. I can help with questions about our capabilities, delivery process, or how to start a discovery call. How can I assist you?",
  },
];

const QUICK_REPLIES: Record<string, string> = {
  capabilities:
    "We focus on Decision Sciences, Machine Learning & Agents, MLOps & Platforms, Data Engineering, Governance & Risk, and Change & Adoption. Everything is delivered with senior human oversight and continuous validation.",
  process:
    "Our delivery path is: Data readiness → Models & Agents → Production → Adoption → Measured Value. Every stage has clear quality gates and human review before client-facing release.",
  start:
    "The best next step is a discovery call. Scroll to the contact form at the bottom of the page, or tell me a bit about what you’re building and I can guide you.",
  security:
    "We require human review before any production or client-facing deliverable. Validation agents continuously test work, and we maintain version-controlled artifacts and audit-ready documentation. We only claim safeguards that are actually implemented.",
};

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simple rule-based responses (replace with real agent later)
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply =
        "Thank you. For detailed project discussions I recommend the discovery call form. You can also ask me about our capabilities, delivery process, or security practices.";

      if (lower.includes("capabilit") || lower.includes("service") || lower.includes("what do you"))
        reply = QUICK_REPLIES.capabilities;
      else if (lower.includes("process") || lower.includes("how") || lower.includes("deliver"))
        reply = QUICK_REPLIES.process;
      else if (lower.includes("start") || lower.includes("call") || lower.includes("contact") || lower.includes("book"))
        reply = QUICK_REPLIES.start;
      else if (lower.includes("security") || lower.includes("privacy") || lower.includes("risk") || lower.includes("govern"))
        reply = QUICK_REPLIES.security;

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "agent", text: reply },
      ]);
    }, 600);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-lime text-lime-foreground shadow-lg transition-transform hover:scale-105"
        aria-label={open ? "Close support chat" : "Open support chat"}
      >
        {open ? (
          <span className="text-xl font-bold">×</span>
        ) : (
          <span className="text-sm font-semibold">Chat</span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[420px] w-[340px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Support Agent</p>
              <p className="text-xs text-muted">Elite-Data-Intelligence</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted hover:text-foreground"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-lime text-lime-foreground"
                      : "bg-card text-foreground border border-white/10"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about capabilities, process…"
                className="flex-1 rounded-full border border-white/15 bg-background px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-lime"
              />
              <button
                type="submit"
                className="rounded-full bg-lime px-4 py-2 text-sm font-medium text-lime-foreground"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
