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
    text: "Hello. I’m the Elite-Data-Intelligence support agent. I can help with capabilities, delivery process, security, our team model, or how to start a discovery call. What do you need?",
  },
];

const SUGGESTIONS = [
  "What capabilities do you offer?",
  "How does delivery work?",
  "How do you handle security?",
  "How do I start?",
];

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();
      const replyText =
        res.ok && data.reply
          ? data.reply
          : "I couldn’t process that just now. Please try again or use the discovery form on this page.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "agent", text: replyText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "agent",
          text: "Connection issue. Please use the discovery form at the bottom of the page and the founder will respond by email.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
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

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[460px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Support Agent</p>
              <p className="text-xs text-muted">Customer Support · Elite-Data-Intelligence</p>
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
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-lime text-lime-foreground"
                      : "border border-white/10 bg-card text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-card px-3.5 py-2 text-sm text-muted">
                  Thinking…
                </div>
              </div>
            )}
            {messages.length <= 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted transition hover:border-lime hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about capabilities, process, security…"
                disabled={loading}
                className="flex-1 rounded-full border border-white/15 bg-background px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-lime disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-lime px-4 py-2 text-sm font-medium text-lime-foreground disabled:opacity-60"
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
