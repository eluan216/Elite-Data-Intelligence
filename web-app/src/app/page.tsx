import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Elite-Data-Intelligence
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <Link href="#mission" className="hover:text-foreground transition-colors">
              Mission
            </Link>
            <Link href="#approach" className="hover:text-foreground transition-colors">
              Approach
            </Link>
            <Link href="#impact" className="hover:text-foreground transition-colors">
              Impact
            </Link>
            <Link href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <Link
            href="#contact"
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Book a Call
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col justify-center px-6 pt-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 text-sm font-medium uppercase tracking-widest text-muted">
            AI · Data Science · Advanced Analytics
          </p>
          <h1 className="display-2xl max-w-4xl text-foreground">
            Measurable outcomes.
            <br />
            <span className="text-muted">Disciplined delivery.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted">
            I built Elite-Data-Intelligence to solve the real reasons most AI projects fail.
            Production-grade systems. Clear ownership. Results you can measure.
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="#contact"
              className="rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Book a Discovery Call
            </Link>
            <Link
              href="#approach"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              How We Work
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="border-t border-border px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-8 max-w-3xl">
            Built to overcome the limitations that stop most AI programs.
          </h2>
          <p className="max-w-2xl text-lg text-muted">
            High failure rates, talent scarcity, weak production hand-off, compliance gaps, and
            cash-flow pressure. I designed the operating model — senior human core plus specialized
            agents — to address each of them systematically while delivering measurable business value.
          </p>
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="border-t border-border bg-card px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-16">The path from data to value</h2>
          <div className="grid gap-12 md:grid-cols-5">
            {[
              { step: "01", title: "Data", desc: "Readiness, quality, and governed access" },
              { step: "02", title: "Models & Agents", desc: "Purpose-built for the decision" },
              { step: "03", title: "Production", desc: "MLOps, monitoring, reliability" },
              { step: "04", title: "Adoption", desc: "Change management and user uptake" },
              { step: "05", title: "Value", desc: "Measured outcomes, not just models" },
            ].map((item) => (
              <div key={item.step}>
                <span className="text-sm font-medium text-accent">{item.step}</span>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact placeholder */}
      <section id="impact" className="border-t border-border px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-8">Impact</h2>
          <p className="max-w-2xl text-lg text-muted">
            Outcome metrics and selected work will appear here as engagements close. Every project
            is measured against the original business case.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-border bg-card px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-6">Start a conversation</h2>
          <p className="mb-12 max-w-xl text-lg text-muted">
            Book a discovery call. The Customer Support Agent will capture the essentials and route
            it to me and the delivery team.
          </p>
          <form className="max-w-md space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <input
              type="email"
              placeholder="Work email"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="Company"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <textarea
              placeholder="What are you trying to achieve?"
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Request Discovery Call
            </button>
          </form>
          <p className="mt-8 text-sm text-muted">
            Prefer chat? The support agent will be available here shortly.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <span className="text-sm text-muted">
            © {new Date().getFullYear()} Elite-Data-Intelligence
          </span>
          <span className="text-sm text-muted">Built for measurable enterprise outcomes</span>
        </div>
      </footer>
    </main>
  );
}
