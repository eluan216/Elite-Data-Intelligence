"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import SupportChat from "@/components/SupportChat";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormStatus("submitting");
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          project: formData.get("project"),
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setFormStatus("success");
      form.reset();
    } catch {
      setFormStatus("error");
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            Elite-Data-Intelligence
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <Link href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</Link>
            <Link href="#solutions" className="hover:text-foreground transition-colors">Solutions</Link>
            <Link href="#projects" className="hover:text-foreground transition-colors">Research & Projects</Link>
            <Link href="#about" className="hover:text-foreground transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="#contact" className="hidden rounded-full bg-lime px-5 py-2 text-sm font-medium text-lime-foreground transition-opacity hover:opacity-90 sm:inline-flex">Book a Call</Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Toggle menu">
              <span className={`block h-0.5 w-5 bg-foreground transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-foreground transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-foreground transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-white/10 bg-background px-6 py-6 md:hidden">
            <nav className="flex flex-col gap-4 text-sm">
              <Link href="#capabilities" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">Capabilities</Link>
              <Link href="#solutions" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">Solutions</Link>
              <Link href="#projects" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">Research & Projects</Link>
              <Link href="#about" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">About</Link>
              <Link href="#contact" onClick={() => setMenuOpen(false)} className="mt-2 inline-flex w-fit rounded-full bg-lime px-5 py-2 text-sm font-medium text-lime-foreground">Book a Call</Link>
            </nav>
          </div>
        )}
      </header>

      <section className="relative flex min-h-screen items-center px-6 pt-24">
        <div className="absolute inset-0">
          <Image src="/images/hero-background.png.jpg" alt="" fill className="object-cover object-center" priority quality={90} />
          <div className="absolute inset-0 bg-background/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-widest text-lime">AI · Data Science · Advanced Analytics</p>
            <h1 className="display-2xl text-foreground">Measurable outcomes.<br /><span className="text-muted">Disciplined delivery.</span></h1>
            <p className="mt-8 max-w-lg text-lg text-muted">I built Elite-Data-Intelligence to solve the real reasons most AI projects fail. Production-grade systems. Clear ownership. Results you can measure.</p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link href="#contact" className="rounded-full bg-lime px-8 py-3.5 text-sm font-semibold text-lime-foreground transition-opacity hover:opacity-90">Book a Discovery Call</Link>
              <Link href="#solutions" className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-white/5">View Solutions</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="border-t border-white/10 px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-6 text-foreground">Capabilities</h2>
          <p className="mb-16 max-w-2xl text-lg text-muted">End-to-end delivery from data readiness to production systems and measurable business value.</p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Decision Sciences", desc: "Frame high-stakes problems, design decision frameworks, and align models to real business outcomes." },
              { title: "Machine Learning & Agents", desc: "Custom models and agentic systems built for production, not demos." },
              { title: "MLOps & Platforms", desc: "Lakehouse architectures, monitoring, CI/CD for models, and reliable deployment." },
              { title: "Data Engineering", desc: "Governed pipelines, quality frameworks, and reliable data foundations." },
              { title: "Governance & Risk", desc: "EU AI Act readiness, model cards, audit trails, and human oversight." },
              { title: "Change & Adoption", desc: "User uptake, process redesign, and sustained value after go-live." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-card p-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="border-t border-white/10 bg-card px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-6 text-foreground">Solutions</h2>
          <p className="mb-16 max-w-2xl text-lg text-muted">Engagement shapes designed around a decision, not a technology. Each path includes validation gates and human ownership.</p>
          <div className="mb-20 grid gap-8 lg:grid-cols-3">
            {[
              { title: "Decision systems", body: "High-stakes choices where the cost of being wrong is real. We frame the decision, define success metrics, build the model or agent stack, and wire it into the process that already owns the outcome.", outcomes: ["Clear decision statement", "Evaluated against business metrics", "Human review on critical paths"] },
              { title: "Production ML & agents", body: "Systems that must keep working after the pilot. Lakehouse foundations, CI/CD for models, monitoring, drift detection, and rollback — not notebook-only delivery.", outcomes: ["Deployed with observability", "Documented runbooks", "Validation before go-live"] },
              { title: "Data & governance foundations", body: "When models fail because the data layer is ungoverned. Pipelines, quality contracts, lineage, access control, and the artifacts regulators and auditors actually ask for.", outcomes: ["Tested data contracts", "Lineage you can trust", "Model cards and audit trail"] },
            ].map((s) => (
              <div key={s.title} className="flex flex-col rounded-xl border border-white/10 bg-background p-8">
                <h3 className="mb-4 text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">{s.body}</p>
                <ul className="space-y-2 border-t border-white/10 pt-6">
                  {s.outcomes.map((o) => (
                    <li key={o} className="text-sm text-muted"><span className="mr-2 text-lime">→</span>{o}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <h3 className="mb-10 text-sm font-medium uppercase tracking-widest text-lime">How every engagement runs</h3>
          <div className="grid gap-10 md:grid-cols-5">
            {[
              { step: "01", title: "Data", desc: "Readiness, quality, governed access" },
              { step: "02", title: "Models & Agents", desc: "Built for the decision" },
              { step: "03", title: "Production", desc: "MLOps, monitoring, reliability" },
              { step: "04", title: "Adoption", desc: "Process fit and user uptake" },
              { step: "05", title: "Value", desc: "Measured against the original case" },
            ].map((item) => (
              <div key={item.step}>
                <span className="text-sm font-medium text-lime">{item.step}</span>
                <h4 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h4>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research & Projects — GIF more pronounced */}
      <section id="projects" className="relative border-t border-white/10 px-6 py-32">
        <div className="absolute inset-0">
          <Image src="/images/data-lattice.gif.GIF" alt="" fill className="object-cover object-center" unoptimized />
          <div className="absolute inset-0 bg-background/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/45" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <h2 className="display-lg mb-6 text-foreground">Research & Projects</h2>
          <p className="mb-16 max-w-2xl text-lg text-muted">Delivery patterns we actually use. Architecture and validation practice — not slideware.</p>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-background/80 p-8 backdrop-blur-md shadow-xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-lime">Pattern · Production decision system</p>
              <h3 className="mb-4 text-2xl font-semibold text-foreground">From decision statement to monitored release</h3>
              <p className="mb-8 text-sm leading-relaxed text-muted">A reference path for a single high-stakes decision (fraud, credit, ops prioritization, clinical triage-style workflows). The same skeleton scales to agentic systems when the decision needs multi-step tooling.</p>
              <ol className="space-y-5 text-sm text-muted">
                <li className="flex gap-3"><span className="font-mono text-lime">01</span><span><strong className="text-foreground">Decision & metrics</strong> — who decides, cost of error, success metric tied to the business case.</span></li>
                <li className="flex gap-3"><span className="font-mono text-lime">02</span><span><strong className="text-foreground">Governed data path</strong> — contracted features, quality tests, lineage into the training and serving sets.</span></li>
                <li className="flex gap-3"><span className="font-mono text-lime">03</span><span><strong className="text-foreground">Model / agent</strong> — simplest method that hits the metric; explicit failure modes documented.</span></li>
                <li className="flex gap-3"><span className="font-mono text-lime">04</span><span><strong className="text-foreground">Validation gate</strong> — acceptance criteria issue, automated checklist, PASS/FAIL with evidence before release.</span></li>
                <li className="flex gap-3"><span className="font-mono text-lime">05</span><span><strong className="text-foreground">Production</strong> — versioned deploy, monitoring, drift alerts, rollback, model card and runbook.</span></li>
              </ol>
              <p className="mt-8 border-t border-white/10 pt-6 text-xs text-muted">Operating artifacts live in our GitHub delivery model: engagement → validation → failure analysis. See the public playbook in-repo under <span className="text-foreground">docs/delivery-playbook.md</span>.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-background/80 p-8 backdrop-blur-md shadow-xl">
              <h3 className="mb-3 text-lg font-semibold text-foreground">What we do not claim</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>• Client case studies before engagements close and permission is granted</li>
                <li>• Safeguards that are not implemented in the operating model</li>
                <li>• Fixed package pricing without a decision and scope</li>
              </ul>
              <p className="mt-6 text-sm text-muted">Credibility comes from process you can inspect: validation agents, quality gates, and founder accountability — not from invented logos.</p>
              <Link href="#contact" className="mt-6 inline-flex text-sm font-medium text-lime hover:opacity-90">Discuss a decision system →</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="relative border-t border-white/10 px-6 py-32">
        <div className="absolute inset-0">
          <Image src="/images/network-brain.gif.GIF" alt="" fill className="object-cover object-center" unoptimized />
          <div className="absolute inset-0 bg-background/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/75 to-background/70" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <h2 className="display-lg mb-10 text-foreground">About</h2>
          <div className="grid gap-16 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-background/50 p-8 backdrop-blur-sm">
              <h3 className="mb-4 text-xl font-semibold text-foreground">Leadership & Human Oversight</h3>
              <p className="mb-6 text-muted">Elite-Data-Intelligence is founder-led. I retain direct ownership of strategy, client relationships, final quality gates, and risk. A small senior human core works alongside 16 specialized agents that handle high-volume technical production, testing, and coordination.</p>
              <p className="text-muted">Agents accelerate delivery. Humans remain accountable for outcomes, compliance, and the decisions that actually matter to the client.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-background/50 p-8 backdrop-blur-sm">
              <h3 className="mb-4 text-xl font-semibold text-foreground">Security & Responsible AI</h3>
              <ul className="space-y-3 text-muted">
                <li>• Human review required before any client-facing or production deliverable</li>
                <li>• Continuous validation via dedicated test-execution and failure-analysis agents</li>
                <li>• Clear escalation paths for commercial, legal, and high-risk decisions</li>
                <li>• Version-controlled artifacts, model cards, and audit-ready documentation</li>
                <li>• Only safeguards that are actually implemented are claimed</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-white/10 px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-4 text-foreground">Tell us what you’re building</h2>
          <p className="mb-12 max-w-xl text-lg text-muted">Share a few details to help us understand your project. We’ll respond with next steps.</p>
          <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm text-muted">Name</label>
              <input id="name" name="name" type="text" required className="w-full rounded-lg border border-white/15 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-lime" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-muted">Work email</label>
              <input id="email" name="email" type="email" required className="w-full rounded-lg border border-white/15 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-lime" />
            </div>
            <div>
              <label htmlFor="project" className="mb-1.5 block text-sm text-muted">What do you need help with?</label>
              <textarea id="project" name="project" rows={4} required placeholder="Project overview, goals, timeline, or constraints…" className="w-full rounded-lg border border-white/15 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-lime" />
            </div>
            <button type="submit" disabled={formStatus === "submitting"} className="w-full rounded-full bg-lime py-3.5 text-sm font-semibold text-lime-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
              {formStatus === "submitting" ? "Sending…" : "Request a discovery call"}
            </button>
            {formStatus === "success" && <p className="text-sm text-lime">Thank you. Your request has been received. We’ll be in touch shortly.</p>}
            {formStatus === "error" && <p className="text-sm text-red-400">Something went wrong. Please try again or email us directly.</p>}
          </form>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Elite-Data-Intelligence</p>
            <p className="mt-1 text-sm text-muted">Measurable enterprise outcomes</p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-muted">
            <Link href="#capabilities" className="hover:text-foreground">Capabilities</Link>
            <Link href="#solutions" className="hover:text-foreground">Solutions</Link>
            <Link href="#projects" className="hover:text-foreground">Research & Projects</Link>
            <Link href="#about" className="hover:text-foreground">About</Link>
            <Link href="#contact" className="hover:text-foreground">Contact</Link>
          </nav>
          <p className="text-sm text-muted">© {new Date().getFullYear()} Elite-Data-Intelligence</p>
        </div>
      </footer>

      <SupportChat />
    </main>
  );
}
