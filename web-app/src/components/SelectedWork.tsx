"use client";

import Image from "next/image";

const PORTFOLIO = [
  {
    tag: "Systems · C++20",
    title: "NeuralForge",
    body: "CPU inference and training runtime: tensors, autograd, Adam, stable cross-entropy, model export, tests and CI. Production-minded systems work under the ML layer.",
    href: "https://github.com/eluan216/NeuralForge",
    points: ["Train → export → reload path", "ctest + CMake release builds", "MIT licensed"],
  },
  {
    tag: "ML pipeline · serving",
    title: "ECG arrhythmia detection",
    body: "Full pipeline pattern: morphology features, multi-model benchmark, stratified CV, MLflow, FastAPI, Docker, CI. Research/education only — not a medical device.",
    href: "https://github.com/eluan216/ecg-arrhythmia-detection",
    points: ["Macro-F1 under class imbalance", "Inter-patient evaluation discipline", "API + container path"],
  },
  {
    tag: "Industrial · predictive",
    title: "Predictive maintenance (oil & gas)",
    body: "Random Forest failure prediction with signal processing and noise reduction for mechanical anomaly detection on industrial-style data.",
    href: "https://github.com/eluan216/predictive-maintenance-oil-gas",
    points: ["Anomaly-oriented framing", "Python ML pipeline", "Domain-shaped features"],
  },
  {
    tag: "Analytics · IoT",
    title: "Industrial IoT analytics",
    body: "Industrial analytics and signal intelligence suite — operational telemetry work behind maintenance and process decisions.",
    href: "https://github.com/eluan216/industrial-iot-analytics",
    points: ["Signal-oriented analysis", "Python stack", "Operations-facing theme"],
  },
  {
    tag: "Imaging · exploration",
    title: "3D CT scan explorer",
    body: "Interactive multi-planar CT anatomy explorer built from clinical-style CT data — spatial data handling and synchronized views.",
    href: "https://github.com/eluan216/3d-ct-scan-explorer",
    points: ["Synced plane views", "Python interactive stack", "Imaging data craft"],
  },
  {
    tag: "Agents · ranking",
    title: "AI internship agent",
    body: "Pure Python agent that finds, filters, and ranks live internship postings — tool-using automation with a clear ranking objective.",
    href: "https://github.com/eluan216/ai-internship-agent",
    points: ["Filter + rank objective", "Live posting intake", "Lightweight agent pattern"],
  },
] as const;

export default function SelectedWork() {
  return (
    <section id="projects" className="relative border-t border-white/10 px-6 py-32">
      <div className="absolute inset-0">
        <Image src="/images/data-lattice.gif.GIF" alt="" fill className="object-cover object-center" unoptimized />
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/45" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <h2 className="display-lg mb-6 text-foreground">Selected work</h2>
        <p className="mb-4 max-w-2xl text-lg text-muted">
          Public, inspectable projects from my GitHub — not invented client logos. Portfolio systems that show how I build.
        </p>
        <p className="mb-12 max-w-2xl text-sm text-muted">
          Only public repositories are linked. Clinical and research demos are educational, not production medical devices.
        </p>

        <div className="mb-10 rounded-xl border border-lime/30 bg-background/85 p-8 backdrop-blur-md shadow-xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-lime">Flagship · Agency demonstration</p>
          <h3 className="mb-4 text-2xl font-semibold text-foreground">Ops priority decision system</h3>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted">
            End-to-end triage ranking decision: feature contracts, Ridge scorer, evaluation metrics, pytest suite, and model card. Synthetic data — explicit limits documented.
          </p>
          <ul className="mb-6 grid gap-2 text-sm text-muted sm:grid-cols-2">
            <li>• Decision + cost of error defined</li>
            <li>• Spearman ≥ 0.70 · top-20% capture ≥ 0.30</li>
            <li>• Schema, metrics, and determinism tests</li>
            <li>• Model card and limitations in-repo</li>
          </ul>
          <a
            href="https://github.com/eluan216/Elite-Data-Intelligence/tree/main/projects/ops-priority-decision-system"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-medium text-lime hover:opacity-90"
          >
            Open on GitHub →
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PORTFOLIO.map((p) => (
            <div key={p.title} className="rounded-xl border border-white/10 bg-background/80 p-6 backdrop-blur-md shadow-lg">
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-lime">{p.tag}</p>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{p.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-muted">{p.body}</p>
              <ul className="mb-5 space-y-1 text-sm text-muted">
                {p.points.map((pt) => (
                  <li key={pt}>• {pt}</li>
                ))}
              </ul>
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-medium text-lime hover:opacity-90">
                View repository →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-white/10 bg-background/70 p-6 backdrop-blur-sm">
          <p className="text-sm text-muted">
            Additional public work includes a sales performance dashboard (Python · SQL · Power BI path). Client engagements are scoped separately — portfolio code demonstrates method, not guaranteed client outcomes.
          </p>
          <a
            href="https://github.com/eluan216"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-medium text-lime hover:opacity-90"
          >
            Full GitHub profile →
          </a>
        </div>
      </div>
    </section>
  );
}
