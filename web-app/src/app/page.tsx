import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight text-white">
            Elite-Data-Intelligence
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <Link href="#mission" className="hover:text-white transition-colors">
              Mission
            </Link>
            <Link href="#approach" className="hover:text-white transition-colors">
              Approach
            </Link>
            <Link href="#impact" className="hover:text-white transition-colors">
              Impact
            </Link>
            <Link href="#contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </nav>
          <Link
            href="#contact"
            className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Book a Call
          </Link>
        </div>
      </header>

      {/* Hero – wireframe head visual */}
      <section className="relative flex min-h-screen items-center px-6 pt-24">
        {/* subtle grid background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-black to-black" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-6 text-sm font-medium uppercase tracking-widest text-cyan-400/80">
              AI · Data Science · Advanced Analytics
            </p>
            <h1 className="display-2xl max-w-xl text-white">
              Measurable outcomes.
              <br />
              <span className="text-zinc-500">Disciplined delivery.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg text-zinc-400">
              I built Elite-Data-Intelligence to solve the real reasons most AI projects fail.
              Production-grade systems. Clear ownership. Results you can measure.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href="#contact"
                className="rounded-full bg-cyan-400 px-8 py-3.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                Book a Discovery Call
              </Link>
              <Link
                href="#approach"
                className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                How We Work
              </Link>
            </div>
          </div>

          {/* Hero visual – glowing wireframe head */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative h-[420px] w-[420px] max-w-full">
              <Image
                src="/images/wireframe-head.png"
                alt="AI neural wireframe"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(34,211,238,0.25)]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="relative border-t border-white/10 px-6 py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="display-lg mb-8 max-w-xl text-white">
              Built to overcome the limitations that stop most AI programs.
            </h2>
            <p className="max-w-xl text-lg text-zinc-400">
              High failure rates, talent scarcity, weak production hand-off, compliance gaps, and
              cash-flow pressure. I designed the operating model — senior human core plus specialized
              agents — to address each of them systematically while delivering measurable business value.
            </p>
          </div>
          <div className="relative flex justify-center">
            <div className="relative h-[340px] w-[340px]">
              <Image
                src="/images/network-brain.png"
                alt="Neural network structure"
                fill
                className="object-contain opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="border-t border-white/10 bg-zinc-950 px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-16 text-white">The path from data to value</h2>
          <div className="grid gap-12 md:grid-cols-5">
            {[
              { step: "01", title: "Data", desc: "Readiness, quality, and governed access" },
              { step: "02", title: "Models & Agents", desc: "Purpose-built for the decision" },
              { step: "03", title: "Production", desc: "MLOps, monitoring, reliability" },
              { step: "04", title: "Adoption", desc: "Change management and user uptake" },
              { step: "05", title: "Value", desc: "Measured outcomes, not just models" },
            ].map((item) => (
              <div key={item.step}>
                <span className="text-sm font-medium text-cyan-400">{item.step}</span>
                <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual break – geometric lattice */}
      <section className="relative border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="relative mx-auto h-[280px] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10">
            <Image
              src="/images/data-lattice.png"
              alt="Data architecture lattice"
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="text-sm font-medium text-cyan-400">Architecture</p>
              <p className="text-lg text-white">Systems designed for production, not demos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="border-t border-white/10 px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1">
              <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-white/10">
                <Image
                  src="/images/terminal-interface.png"
                  alt="Systems interface"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="display-lg mb-8 text-white">Impact</h2>
              <p className="max-w-xl text-lg text-zinc-400">
                Outcome metrics and selected work will appear here as engagements close. Every project
                is measured against the original business case.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-white/10 bg-zinc-950 px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <h2 className="display-lg mb-6 text-white">Start a conversation</h2>
          <p className="mb-12 max-w-xl text-lg text-zinc-400">
            Book a discovery call. The Customer Support Agent will capture the essentials and route
            it to me and the delivery team.
          </p>
          <form className="max-w-md space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-400"
            />
            <input
              type="email"
              placeholder="Work email"
              className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-400"
            />
            <input
              type="text"
              placeholder="Company"
              className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-400"
            />
            <textarea
              placeholder="What are you trying to achieve?"
              rows={4}
              className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-400"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-cyan-400 py-3.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              Request Discovery Call
            </button>
          </form>
          <p className="mt-8 text-sm text-zinc-500">
            Prefer chat? The support agent will be available here shortly.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <span className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Elite-Data-Intelligence
          </span>
          <span className="text-sm text-zinc-500">Built for measurable enterprise outcomes</span>
        </div>
      </footer>
    </main>
  );
}
