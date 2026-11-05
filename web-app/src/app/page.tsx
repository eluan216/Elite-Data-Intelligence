"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Arrow, BrandMark } from "@/components/BrandIcons";
import DecisionVisual from "@/components/DecisionVisual";
import SelectedWork from "@/components/SelectedWork";
import SupportChat from "@/components/SupportChat";
import { MAX_EMAIL, MAX_NAME, MAX_PROJECT } from "@/lib/contact-helpers";

const LINKS = [
  { href: "#approach", label: "Capabilities" },
  { href: "#projects", label: "Selected work" },
  { href: "#how-we-work", label: "Our process" },
  { href: "/analyze", label: "Data workbench" },
];

const CAPABILITIES = [
  {
    number: "01",
    title: "Decision intelligence",
    body: "Give a business decision a clear objective, the right evidence, and a system people can act on.",
    details: ["Prioritization & ranking", "Decision support", "Applied analytics"],
  },
  {
    number: "02",
    title: "Data foundations",
    body: "Build a dependable path from scattered source data to information your team can trust.",
    details: ["Data pipelines", "Quality contracts", "Analytics engineering"],
  },
  {
    number: "03",
    title: "ML built to operate",
    body: "Take models and agent workflows through validation, monitoring, and a practical handover.",
    details: ["ML & agent workflows", "Evaluation & monitoring", "Governance & ownership"],
  },
];

const PROCESS = [
  ["Discover", "Define the decision, the owner, and what success means."],
  ["Design", "Assess the data and choose a method that fits the risk."],
  ["Build", "Develop the smallest useful system and test its assumptions."],
  ["Validate", "Check performance, failure modes, and acceptance criteria."],
  ["Operate", "Document, hand over, monitor, and measure adoption."],
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formStatus === "submitting") return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    setFormStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          project: formData.get("project"),
        }),
      });
      if (!response.ok) throw new Error("Submission failed");
      setFormStatus("success");
      form.reset();
    } catch {
      setFormStatus("error");
    }
  }

  return (
    <div className="edi-home">
      <a href="#main-content" className="edi-skip-link">Skip to content</a>
      <header className="edi-header">
        <div className="edi-frame edi-header-row">
          <Link href="/" className="edi-brand" aria-label="Elite Data Intelligence home">
            <BrandMark />
            <span>ELITE DATA<span>INTELLIGENCE</span></span>
          </Link>
          <nav className="edi-desktop-nav" aria-label="Main navigation">
            {LINKS.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          </nav>
          <div className="edi-header-actions">
            <Link href="#contact" className="edi-header-cta">Let’s talk <Arrow diagonal /></Link>
            <button
              ref={menuButton}
              type="button"
              className="edi-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            >
              <span className={menuOpen ? "is-open" : ""} /><span className={menuOpen ? "is-open" : ""} />
            </button>
          </div>
        </div>
        <nav id="mobile-navigation" className="edi-mobile-nav edi-frame" hidden={!menuOpen} aria-label="Mobile navigation">
          {LINKS.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}<Arrow /></Link>)}
          <Link href="#contact" onClick={() => setMenuOpen(false)}>Start a conversation<Arrow diagonal /></Link>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="edi-hero edi-frame" aria-labelledby="hero-title">
          <div className="edi-hero-copy">
            <p className="edi-eyebrow"><span className="edi-dot" /> Independent AI & data consultancy</p>
            <h1 id="hero-title">Complex data.<br />Clear decisions.<br /><em>Real progress.</em></h1>
            <p className="edi-hero-description">We turn data, machine learning, and thoughtful engineering into systems that help your team make its next move.</p>
            <div className="edi-hero-actions">
              <Link href="#contact" className="edi-button edi-button-primary">Discuss your project<Arrow diagonal /></Link>
              <Link href="#projects" className="edi-text-link">Explore our work<Arrow /></Link>
            </div>
            <div className="edi-hero-note"><span className="edi-note-line" /> Founder-led. Evidence-driven. Built for everyday use.</div>
          </div>
          <div className="edi-hero-visual"><DecisionVisual /></div>
          <div className="edi-hero-footer">
            <span>Strategy meets engineering.</span>
            <a href="#approach">Explore what’s possible<span aria-hidden="true">↓</span></a>
            <span className="edi-mono">DATA / MODELS / DECISIONS</span>
          </div>
        </section>

        <section id="approach" className="edi-capabilities edi-section" aria-labelledby="capabilities-title">
          <div className="edi-frame">
            <div className="edi-section-heading">
              <p className="edi-eyebrow">01 / What we help you build</p>
              <div>
                <h2 id="capabilities-title">Good AI starts with<br /><em>a better question.</em></h2>
                <p>What decision needs to improve? What gets in the way? We start there, then bring the data and engineering together.</p>
              </div>
            </div>
            <div className="edi-capability-list">
              {CAPABILITIES.map((item) => (
                <article key={item.number} className="edi-capability">
                  <span className="edi-mono">{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <ul>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                </article>
              ))}
            </div>
            <div className="edi-workbench-callout">
              <div><span className="edi-mono">A useful place to start</span><h3>Get to know your data.</h3><p>Explore a CSV with column profiles, quality checks, and charts. Analysis stays in your browser.</p></div>
              <Link href="/analyze" className="edi-button edi-button-dark">Open the data workbench<Arrow diagonal /></Link>
            </div>
          </div>
        </section>

        <SelectedWork />

        <section id="how-we-work" className="edi-process edi-section" aria-labelledby="process-title">
          <div className="edi-frame">
            <div className="edi-section-heading">
              <p className="edi-eyebrow">03 / A clear path forward</p>
              <div><h2 id="process-title">From the first question<br /><em>to the working system.</em></h2><p>Clear milestones, documented decisions, and human review keep the work grounded in your business.</p></div>
            </div>
            <ol className="edi-process-steps">
              {PROCESS.map(([title, body], index) => (
                <li key={title}><span className="edi-mono">0{index + 1}</span><h3>{title}</h3><p>{body}</p></li>
              ))}
            </ol>
            <div className="edi-founder">
              <div className="edi-founder-monogram" aria-hidden="true">EO<span>Founder-led practice</span></div>
              <div>
                <p className="edi-eyebrow">People own the decisions.</p>
                <h3>Senior judgment.<br />Hands-on accountability.</h3>
                <p>I’m Oguma Eluanatein Odo, founder of Elite Data Intelligence. I lead discovery, own client relationships, and hold the final quality gate. Specialized roles and automated workflows support delivery, with human review at the decisions that matter.</p>
                <a href="https://github.com/eluan216" target="_blank" rel="noopener noreferrer" className="edi-text-link">Meet the work behind the practice<Arrow diagonal /></a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="edi-contact edi-section" aria-labelledby="contact-title">
          <div className="edi-frame edi-contact-grid">
            <div>
              <p className="edi-eyebrow">04 / Start a conversation</p>
              <h2 id="contact-title">Bring the problem.<br /><em>Let’s find a way forward.</em></h2>
              <p className="edi-contact-intro">Tell us what you’re working on, what’s getting in the way, and what a better outcome would look like.</p>
              <a className="edi-contact-email" href="mailto:ogumaeluan@gmail.com">ogumaeluan@gmail.com<Arrow diagonal /></a>
              <div className="edi-contact-note"><span className="edi-dot" /> A personal reply within one business day.<br /><span>No obligation. A practical first conversation.</span></div>
            </div>
            <form onSubmit={handleSubmit} className="edi-contact-form" aria-label="Project inquiry">
              <p className="edi-mono">A few details to get us started</p>
              <div className="edi-form-row">
                <div><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" maxLength={MAX_NAME} placeholder="Ada Lovelace" required /></div>
                <div><label htmlFor="email">Work email</label><input id="email" name="email" type="email" autoComplete="email" maxLength={MAX_EMAIL} placeholder="ada@company.com" required /></div>
              </div>
              <div><label htmlFor="project">What are you trying to solve?</label><textarea id="project" name="project" rows={5} maxLength={MAX_PROJECT} placeholder="Your goal, your team, and any constraints or timeline…" required /></div>
              <button type="submit" disabled={formStatus === "submitting"} className="edi-button edi-button-primary">{formStatus === "submitting" ? "Sending your inquiry…" : "Let’s start a conversation"}<Arrow diagonal /></button>
              <p className="edi-form-privacy">Your details are used to respond to this inquiry. Read our <Link href="/privacy">privacy policy</Link>.</p>
              <div aria-live="polite" aria-atomic="true" className="edi-form-feedback">
                {formStatus === "success" && <p className="edi-success">Thank you. Your inquiry is in — I’ll reply within one business day.</p>}
                {formStatus === "error" && <p role="alert" className="edi-error">We couldn’t send your inquiry. Please try again or email <a href="mailto:ogumaeluan@gmail.com">ogumaeluan@gmail.com</a>.</p>}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="edi-footer">
        <div className="edi-frame">
          <div className="edi-footer-top">
            <Link href="/" className="edi-brand"><BrandMark /><span>ELITE DATA<span>INTELLIGENCE</span></span></Link>
            <p>Thoughtful systems.<br />Better decisions.</p>
            <nav aria-label="Footer navigation"><Link href="/analyze">Data workbench</Link><a href="https://github.com/eluan216" target="_blank" rel="noopener noreferrer">GitHub<Arrow diagonal /></a><Link href="/privacy">Privacy</Link></nav>
          </div>
          <div className="edi-footer-bottom"><span>© {new Date().getFullYear()} Elite Data Intelligence</span><span>AI · Data science · Engineering</span><a href="#hero-title">Back to top ↑</a></div>
        </div>
      </footer>
      <SupportChat />
    </div>
  );
}
