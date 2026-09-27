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

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      setFormStatus("success");
      form.reset();
    } catch {
      setFormStatus("error");
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            Elite-Data-Intelligence
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <Link href="#capabilities" className="hover:text-foreground transition-colors">
              Capabilities
            </Link>
            <Link href="#solutions" className="hover:text-foreground transition-colors">
              Solutions
            </Link>
            <Link href="#projects" className="hover:text-foreground transition-colors">
              Research & Projects
            </Link>
            <Link href="#about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="#contact"
              className="hidden rounded-full bg-lime px-5 py-2 text-sm font-medium text-lime-foreground transition-opacity hover:opacity-90 sm:inline-flex"
            >
              Book a Call
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-5 bg-foreground transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-foreground transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-foreground transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-background px-6 py-6 md:hidden">
            <nav className="flex flex-col gap-4 text-sm">
              <Link href="#capabilities" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">
                Capabilities
              </Link>
              <Link href="#solutions" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">
                Solutions
              </Link>
              <Link href="#projects" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">
                Research & Projects
              </Link>
              <Link href="#about" onClick={() => setMenuOpen(false)} className="text-muted hover:text-foreground">
                About
              </Link>
              <Link
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex w-fit rounded-full bg-lime px-5 py-2 text-sm font-medium text-lime-foreground"
              >
                Book a Call
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center px-6 pt-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/20 via-background to-background" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-6 text-sm font-medium uppercase tracking-widest text-lime">
              AI · Data Science · Advanced Analytics
            </p>
            <h1 className="display-2xl max-w-xl text-foreground">
              Measurable outcomes.
              <br />
              <span className="text-muted">Disciplined delivery.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg text-muted">
              I built Elite-Data-Intelligence to solve the real reasons most AI projects fail.
              Production-grade systems. Clear ownership. Results you can measure.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href="#contact"
                className="rounded-full bg-lime px-8 py-3.5 text-sm font-semibold text-lime-foreground transition-opacity hover:opacity-90"
              >
                Book a Discovery Call
              </Link>
              <Link
                href="#capabilities"
                className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-white/5"
              >
                View Capabilities
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative h-[420px] w-[420px] max-w-full">
              <Image
                src="/images/wireframe-head.gif.GIF"
                alt="AI neural wireframe"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(200,255,0,0.25)]"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="border-t border-white/10 px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-6 text-foreground">Capabilities</h2>
          <p className="mb-16 max-w-2xl text-lg text-muted">
            End-to-end delivery from data readiness to production systems and measurable business value.
          </p>
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

      {/* Solutions / Approach */}
      <section id="solutions" className="border-t border-white/10 bg-card px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-16 text-foreground">How we deliver</h2>
          <div className="grid gap-12 md:grid-cols-5">
            {[
              { step: "01", title: "Data", desc: "Readiness, quality, and governed access" },
              { step: "02", title: "Models & Agents", desc: "Purpose-built for the decision" },
              { step: "03", title: "Production", desc: "MLOps, monitoring, reliability" },
              { step: "04", title: "Adoption", desc: "Change management and user uptake" },
              { step: "05", title: "Value", desc: "Measured outcomes, not just models" },
            ].map((item) => (
              <div key={item.step}>
                <span className="text-sm font-medium text-lime">{item.step}</span>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research & Projects */}
      <section id="projects" className="border-t border-white/10 px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="display-lg mb-6 text-foreground">Research & Projects</h2>
              <p className="mb-8 max-w-xl text-lg text-muted">
                Technical demonstrations and delivery patterns. Real architecture, validation practices, and production thinking — not marketing slides.
              </p>
              <p className="text-sm text-muted">
                Detailed case studies and live demos will appear here as engagements close. Until then, the operating model, validation agents, and delivery process remain the primary proof points.
              </p>
            </div>
            <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-white/10">
              <Image
                src="/images/data-lattice.gif.GIF"
                alt="Data architecture"
                fill
                className="object-cover opacity-80"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-white/10 bg-card px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-6 text-foreground">About</h2>
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xl font-semibold text-foreground">Leadership & Human Oversight</h3>
              <p className="mb-6 text-muted">
                Elite-Data-Intelligence is founder-led. I retain direct ownership of strategy, client relationships, final quality gates, and risk. A small senior human core works alongside 16 specialized agents that handle high-volume technical production, testing, and coordination.
              </p>
              <p className="text-muted">
                Agents accelerate delivery. Humans remain accountable for outcomes, compliance, and the decisions that actually matter to the client.
              </p>
            </div>
            <div>
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

          <div className="mt-16 relative h-[280px] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10">
            <Image
              src="/images/network-brain.gif.GIF"
              alt="Network structure"
              fill
              className="object-contain opacity-90"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-white/10 px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-4 text-foreground">Tell us what you’re building</h2>
          <p className="mb-12 max-w-xl text-lg text-muted">
            Share a few details to help us understand your project. We’ll respond with next steps.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm text-muted">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-lg border border-white/15 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-lime"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-muted">Work email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-white/15 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-lime"
              />
            </div>
            <div>
              <label htmlFor="project" className="mb-1.5 block text-sm text-muted">What do you need help with?</label>
              <textarea
                id="project"
                name="project"
                rows={4}
                required
                placeholder="Project overview, goals, timeline, or constraints…"
                className="w-full rounded-lg border border-white/15 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-lime"
              />
            </div>

            <button
              type="submit"
              disabled={formStatus === "submitting"}
              className="w-full rounded-full bg-lime py-3.5 text-sm font-semibold text-lime-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {formStatus === "submitting" ? "Sending…" : "Request a discovery call"}
            </button>

            {formStatus === "success" && (
              <p className="text-sm text-lime">Thank you. Your request has been received. We’ll be in touch shortly.</p>
            )}
            {formStatus === "error" && (
              <p className="text-sm text-red-400">Something went wrong. Please try again or email us directly.</p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
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
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Elite-Data-Intelligence
          </p>
        </div>
      </footer>

      {/* Customer Support Agent Chat */}
      <SupportChat />
    </main>
  );
}
