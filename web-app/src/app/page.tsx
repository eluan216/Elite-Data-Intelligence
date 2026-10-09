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
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">Elite-Data-Intelligence</Link>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <Link href="#problems" className="hover:text-foreground transition-colors">Problems</Link>
            <Link href="#approach" className="hover:text-foreground transition-colors">Approach</Link>
            <Link href="#projects" className="hover:text-foreground transition-colors">Work</Link>
            <Link href="#how-we-work" className="hover:text-foreground transition-colors">How we work</Link>
            <Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link>
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
              <Link href="#problems" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">Problems</Link>
              <Link href="#approach" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">Approach</Link>
              <Link href="#projects" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">Work</Link>
              <Link href="#how-we-work" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">How we work</Link>
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
            <p className="mb-6 text-sm font-medium uppercase tracking-widest text-lime">AI · Data · Engineering</p>
            <h1 className="display-2xl text-foreground">AI systems built around<br /><span className="text-muted">real business problems.</span></h1>
            <p className="mt-8 max-w-xl text-lg text-muted">I help operations and technology teams turn complex data into decisions and working systems — with documented testing, clear ownership, and human accountability on every release.</p>
            <p className="mt-4 max-w-xl text-sm text-muted">Primary focus today: <span className="text-foreground">decision systems and production-ready ML workflows</span> for teams that cannot afford silent model failure.</p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link href="#contact" className="rounded-full bg-lime px-8 py-3.5 text-sm font-semibold text-lime-foreground transition-opacity hover:opacity-90">Discuss a business problem</Link>
              <Link href="#projects" className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-white/5">See how we work →</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="problems" className="border-t border-white/10 px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-6 text-foreground">Problems we solve</h2>
          <p className="mb-16 max-w-2xl text-lg text-muted">Written for the buyer, not the model card.</p>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              { title: "Decisions that still depend on gut feel", outcome: "A defined decision, metrics that match the business case, and a system people will actually use." },
              { title: "Pilots that never become operations", outcome: "Validation gates, monitoring, and hand-off so a model does not die in a notebook." },
              { title: "Data teams firefighting quality", outcome: "Contracts, tests, and lineage so downstream AI is not built on sand." },
              { title: "Nobody owns the model after go-live", outcome: "Runbooks, escalation paths, and human review where the cost of error is real." },
            ].map((p) => (
              <div key={p.title} className="rounded-xl border border-white/10 bg-card p-8">
                <h3 className="mb-3 text-lg font-semibold text-foreground">{p.title}</h3>
                <p className="text-sm text-muted"><span className="text-lime">→</span> {p.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="approach" className="border-t border-white/10 bg-card px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-6 text-foreground">What we deliver</h2>
          <p className="mb-16 max-w-2xl text-lg text-muted">Technical work paired with the business result it is meant to produce.</p>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { tech: "Decision systems", biz: "Fewer high-stakes calls made without evidence or accountability." },
              { tech: "ML & agents", biz: "Automation of repetitive judgment work — with human checkpoints where risk is high." },
              { tech: "Data engineering", biz: "Fewer downstream failures caused by silent data drift or broken pipelines." },
              { tech: "Production assurance", biz: "Earlier detection when a model degrades; a path to roll back." },
              { tech: "Governance documentation", biz: "Model cards, audit trails, and clear ownership — not compliance theater." },
              { tech: "Adoption support", biz: "Process fit so the system is used after the project ends." },
            ].map((item) => (
              <div key={item.tech} className="rounded-xl border border-white/10 bg-background p-6">
                <h3 className="mb-2 text-base font-semibold text-foreground">{item.tech}</h3>
                <p className="text-sm text-muted">{item.biz}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-5">
            {[
              { step: "01", title: "Discover", desc: "Decision, risk, success metric" },
              { step: "02", title: "Design", desc: "Data path and method bar" },
              { step: "03", title: "Build", desc: "Model or workflow" },
              { step: "04", title: "Validate", desc: "Evidence before release" },
              { step: "05", title: "Operate", desc: "Monitor, adopt, measure" },
            ].map((item) => (
              <div key={item.step}>
                <span className="text-sm font-medium text-lime">{item.step}</span>
                <h4 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h4>
                <p className="mt-1 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="relative border-t border-white/10 px-6 py-32">
        <div className="absolute inset-0">
          <Image src="/images/data-lattice.gif.GIF" alt="" fill className="object-cover object-center" unoptimized />
          <div className="absolute inset-0 bg-background/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/45" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <h2 className="display-lg mb-6 text-foreground">Selected work</h2>
          <p className="mb-4 max-w-2xl text-lg text-muted">Inspectable artifacts — not client logos. Case studies appear only with permission after engagements close.</p>
          <p className="mb-16 max-w-2xl text-sm text-muted">Flagship internal project is public in the repository: code, tests, model card, and limitations.</p>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-background/80 p-8 backdrop-blur-md shadow-xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-lime">Flagship · Internal demonstration</p>
              <h3 className="mb-4 text-2xl font-semibold text-foreground">Ops priority decision system</h3>
              <p className="mb-6 text-sm leading-relaxed text-muted">
                End-to-end demo of a triage ranking decision: feature contracts, Ridge scorer, evaluation metrics, pytest suite, and model card. Synthetic data only — honest about limits.
              </p>
              <ul className="mb-8 space-y-2 text-sm text-muted">
                <li>• Decision statement + cost of error defined</li>
                <li>• Spearman ≥ 0.70 and top-20% capture ≥ 0.30 on holdout</li>
                <li>• Automated tests for schema, metrics, determinism</li>
                <li>• Model card and limitations documented</li>
              </ul>
              <a
                href="https://github.com/eluan216/Elite-Data-Intelligence/tree/main/projects/ops-priority-decision-system"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-sm font-medium text-lime hover:opacity-90"
              >
                Open project on GitHub →
              </a>
            </div>
            <div className="rounded-xl border border-white/10 bg-background/80 p-8 backdrop-blur-md shadow-xl">
              <h3 className="mb-3 text-lg font-semibold text-foreground">What is live in the operating model</h3>
              <ul className="mb-6 space-y-2 text-sm text-muted">
                <li>• GitHub engagement → validation → failure-analysis workflows</li>
                <li>• Auto-posted checklists when quality labels are applied</li>
                <li>• Founder-owned commercial and risk gates</li>
                <li>• Website support agent + discovery form to founder email</li>
              </ul>
              <h3 className="mb-3 text-lg font-semibold text-foreground">What we do not claim</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>• Client results we have not delivered and cannot name</li>
                <li>• Fully autonomous LLM agents running all 16 roles unattended</li>
                <li>• Legal certification under the EU AI Act</li>
                <li>• Fixed package pricing without a scoped decision</li>
              </ul>
              <Link href="#contact" className="mt-8 inline-flex text-sm font-medium text-lime hover:opacity-90">Discuss a decision system →</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how-we-work" className="relative border-t border-white/10 px-6 py-32">
        <div className="absolute inset-0">
          <Image src="/images/network-brain.gif.GIF" alt="" fill className="object-cover object-center" unoptimized />
          <div className="absolute inset-0 bg-background/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/75 to-background/70" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <h2 className="display-lg mb-6 text-foreground">How we work</h2>
          <p className="mb-16 max-w-2xl text-lg text-muted">Founder-led. Specialized roles. Automation where it is implemented. Human authority where it matters.</p>
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-background/50 p-8 backdrop-blur-sm">
              <h3 className="mb-4 text-xl font-semibold text-foreground">Leadership</h3>
              <p className="mb-4 text-muted">Elite-Data-Intelligence is founder-led. I own strategy, client relationships, final quality gates, and risk. Commercial terms and high-risk acceptance are not delegated.</p>
              <p className="text-sm text-muted">Contact for discovery: the form below reaches my inbox directly.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-background/50 p-8 backdrop-blur-sm">
              <h3 className="mb-4 text-xl font-semibold text-foreground">Operating model — 16 roles</h3>
              <p className="mb-4 text-muted">Sixteen specialized role definitions guide delivery. Some steps are automated in GitHub today: Project Manager intake, Validation checklists, Failure Analysis intake, and the website Support agent.</p>
              <p className="text-sm text-muted">The rest are executed by the senior core using those definitions — not by unsupervised LLM agents.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-background/50 p-8 backdrop-blur-sm lg:col-span-2">
              <h3 className="mb-4 text-xl font-semibold text-foreground">Security & responsible delivery</h3>
              <ul className="grid gap-3 text-sm text-muted md:grid-cols-2">
                <li>• Human review before client-facing or production release</li>
                <li>• Validation and failure-analysis workflows on material deliverables</li>
                <li>• Escalation for commercial, legal, and high-risk decisions</li>
                <li>• Version-controlled artifacts and documentation practices</li>
                <li>• Governance language limited to what we actually implement</li>
                <li>• No claim of EU AI Act certification or legal advice</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-white/10 px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h2 className="display-lg mb-4 text-foreground">Discuss a business problem</h2>
              <p className="mb-6 max-w-xl text-lg text-muted">A short discovery conversation — free, no obligation. I respond personally.</p>
              <ul className="mb-8 space-y-3 text-sm text-muted">
                <li><span className="text-lime">1.</span> Submit the form with a work email and a short description of the problem.</li>
                <li><span className="text-lime">2.</span> I reply within <span className="text-foreground">one business day</span> with next steps or clarifying questions.</li>
                <li><span className="text-lime">3.</span> If it is a fit, we schedule a discovery call to define decision, risk, and scope.</li>
              </ul>
              <p className="text-sm text-muted">Prefer email? Write directly to <a href="mailto:ogumaeluan@gmail.com" className="text-lime hover:opacity-90">ogumaeluan@gmail.com</a>.</p>
              <p className="mt-4 text-xs text-muted">We use your details only to respond to this inquiry. No marketing list, no sharing with third parties for advertising.</p>
            </div>
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
                <label htmlFor="project" className="mb-1.5 block text-sm text-muted">What problem are you trying to solve?</label>
                <textarea id="project" name="project" rows={4} required placeholder="Decision, team, constraints, timeline…" className="w-full rounded-lg border border-white/15 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-lime" />
              </div>
              <button type="submit" disabled={formStatus === "submitting"} className="w-full rounded-full bg-lime py-3.5 text-sm font-semibold text-lime-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
                {formStatus === "submitting" ? "Sending…" : "Request a discovery call"}
              </button>
              {formStatus === "success" && <p className="text-sm text-lime">Received. I will respond within one business day.</p>}
              {formStatus === "error" && <p className="text-sm text-red-400">Something went wrong. Email ogumaeluan@gmail.com directly.</p>}
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Elite-Data-Intelligence</p>
            <p className="mt-1 text-sm text-muted">Decision systems · Production ML · Founder accountability</p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-muted">
            <Link href="#problems" className="hover:text-foreground">Problems</Link>
            <Link href="#approach" className="hover:text-foreground">Approach</Link>
            <Link href="#projects" className="hover:text-foreground">Work</Link>
            <Link href="#how-we-work" className="hover:text-foreground">How we work</Link>
            <Link href="#contact" className="hover:text-foreground">Contact</Link>
          </nav>
          <p className="text-sm text-muted">© {new Date().getFullYear()} Elite-Data-Intelligence</p>
        </div>
      </footer>

      <SupportChat />
    </main>
  );
}
