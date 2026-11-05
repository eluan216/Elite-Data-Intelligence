"use client";

import { useState, useRef, useEffect } from "react";
import { MAX_CHAT_MESSAGES, MAX_CHAT_MESSAGE_LENGTH, type ChatLink, type SupportReply } from "@/lib/support/types";

type Message = {
  id: number;
  role: "user" | "agent";
  text: string;
  links?: ChatLink[];
  brief?: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: "agent",
    text: "Hi — I’m Elite Data Intelligence’s project assistant. Tell me what your team is trying to improve. I’ll help connect the problem to a useful starting point, relevant public work, and a focused inquiry for Oguma, our founder.",
  },
];

const SUGGESTIONS = [
  "We need to prioritize support tickets",
  "Our data quality is unreliable",
  "We want to evaluate an ML workflow",
];

export default function SupportChat({ onUseBrief }: { onUseBrief?: (brief: string) => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>(SUGGESTIONS);
  const [mode, setMode] = useState<SupportReply["mode"] | null>(null);
  const nextId = useRef(2);
  const latest = messages[messages.length - 1];
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  function closeChat() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeChat();
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  }, [messages, loading, open]);

  async function sendMessage(text: string) {
    if (!text.trim() || text.length > MAX_CHAT_MESSAGE_LENGTH || loading) return;

    const userMsg: Message = {
      id: nextId.current++,
      role: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setQuickReplies([]);

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].slice(-MAX_CHAT_MESSAGES).map((message) => ({
            role: message.role === "agent" ? "assistant" : "user",
            content: message.text,
          })),
        }),
      });
      const data = await res.json() as Partial<SupportReply> & { error?: string };
      const replyText =
        res.ok && typeof data.reply === "string"
          ? data.reply
          : data.error || "I couldn’t process that just now. Please try again or use the inquiry form.";
      setQuickReplies(res.ok && Array.isArray(data.quickReplies) ? data.quickReplies : []);
      setMode(data.mode === "llm" ? "llm" : data.mode === "guided" ? "guided" : null);

      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "agent", text: replyText, links: res.ok ? data.links : undefined, brief: res.ok ? data.brief : undefined },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
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
        ref={launcherRef}
        type="button"
        onClick={() => open ? closeChat() : setOpen(true)}
        aria-expanded={open}
        aria-controls={open ? "support-chat" : undefined}
        className="edi-chat-launcher"
        aria-label={open ? "Close support chat" : "Open support chat"}
      >
        {open ? (
          <span className="text-xl font-bold">×</span>
        ) : (
          <><span className="edi-chat-label">Let’s talk <span aria-hidden="true">↗</span></span><svg className="edi-chat-glyph" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-6 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="M7 9h10M7 13h6" /></svg></>
        )}
      </button>

      {open && (
        <section id="support-chat" role="dialog" aria-labelledby="support-chat-title" className="edi-chat-panel">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <h2 id="support-chat-title" className="text-sm font-semibold text-foreground">Project discovery assistant</h2>
              <p className="text-xs text-muted">{mode === "llm" ? "AI project support" : mode === "guided" ? "Guided discovery" : "Elite Data Intelligence"}</p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setMessages(INITIAL_MESSAGES);
                setQuickReplies(SUGGESTIONS);
                setMode(null);
                nextId.current = 2;
                inputRef.current?.focus();
              }}
              className="min-h-10 px-2 text-[10px] text-muted hover:text-foreground disabled:opacity-50"
              aria-label="Start a new chat"
            >New chat</button>
            <button
              type="button"
              onClick={closeChat}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-muted hover:text-foreground"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div role="log" tabIndex={0} aria-live="polite" aria-label="Support conversation" aria-busy={loading} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
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
                  <span className="whitespace-pre-wrap break-words">{m.text}</span>
                  {m.links && m.links.length > 0 && (
                    <ul className="mt-3 space-y-2 border-t border-white/15 pt-2 text-xs">
                      {m.links.map((link) => <li key={link.href}><a href={link.href} onClick={() => { if (link.href.startsWith("#")) closeChat(); }} className="inline-flex min-h-8 items-center text-lime underline underline-offset-4" {...(link.href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{link.label} ↗</a></li>)}
                    </ul>
                  )}
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
            {quickReplies.length > 0 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickReplies.map((s) => (
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
            {latest.role === "agent" && latest.brief && !loading && (
              <div className="rounded-xl border border-lime/30 bg-card p-3">
                <details>
                  <summary className="cursor-pointer text-xs font-medium text-foreground">Review inquiry brief</summary>
                  <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted">{latest.brief}</p>
                </details>
                {onUseBrief && <button type="button" className="mt-3 min-h-11 w-full rounded-lg bg-lime px-3 py-2 text-xs font-medium text-lime-foreground" onClick={() => { closeChat(); onUseBrief(latest.brief!); }}>Use this brief in the inquiry form</button>}
                <p className="mt-2 text-[10px] leading-relaxed text-muted">You can edit it before submitting. Nothing has been emailed or booked.</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form aria-label="Support message" onSubmit={handleSubmit} className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <label htmlFor="support-message" className="sr-only">Your message</label>
              <input
                ref={inputRef}
                id="support-message"
                maxLength={MAX_CHAT_MESSAGE_LENGTH}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell us about your project…"
                disabled={loading}
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-background px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-lime disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-full bg-lime px-4 py-2 text-sm font-medium text-lime-foreground disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </form>
          <p className="px-4 pb-3 text-[10px] leading-relaxed text-muted">Use a non-sensitive description. <a href="/privacy" className="underline underline-offset-2">Chat privacy</a> · <a href="#contact" onClick={closeChat} className="underline underline-offset-2">Contact the founder</a></p>
        </section>
      )}
    </>
  );
}
