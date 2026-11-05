import { Arrow } from "./BrandIcons";

const PORTFOLIO = [
  { category: "Systems engineering", title: "NeuralForge", body: "A C++20 runtime exploring the mechanics of inference, training, and model export.", href: "NeuralForge", tags: ["C++20", "ML infrastructure"] },
  { category: "Research · ML pipeline", title: "ECG arrhythmia detection", body: "A documented patient-held-out evaluation, shared features, and an API serving path. Research and education only.", href: "ecg-arrhythmia-detection", tags: ["Python", "Evaluation", "FastAPI"] },
  { category: "Industrial intelligence", title: "Predictive maintenance", body: "Failure prediction and signal processing applied to industrial-style maintenance data.", href: "predictive-maintenance-oil-gas", tags: ["Machine learning", "Signal processing"] },
  { category: "Operations analytics", title: "Industrial IoT analytics", body: "Exploring operational telemetry and signals behind maintenance and process decisions.", href: "industrial-iot-analytics", tags: ["Python", "IoT"] },
  { category: "Spatial data", title: "3D CT scan explorer", body: "An interactive exploration of imaging data with synchronized anatomical views. Educational demonstration.", href: "3d-ct-scan-explorer", tags: ["Imaging", "Interactive analysis"] },
  { category: "Agent workflows", title: "AI internship agent", body: "A focused Python workflow for finding, filtering, and ranking internship postings.", href: "ai-internship-agent", tags: ["Python", "Ranking"] },
];

export default function SelectedWork() {
  return (
    <section id="projects" className="edi-work edi-section" aria-labelledby="work-title">
      <div className="edi-frame">
        <div className="edi-section-heading">
          <p className="edi-eyebrow">02 / Evidence in the open</p>
          <div><h2 id="work-title">The thinking.<br /><em>And the things we build.</em></h2><p>Public projects that make our methods inspectable. Explore the code, the tests, and the documented limits.</p></div>
        </div>
        <article className="edi-featured-work">
          <div className="edi-featured-copy">
            <span className="edi-project-label"><span className="edi-dot" /> Featured demonstration</span>
            <h3>Better priorities.<br />A clearer next action.</h3>
            <p>An operational triage system that connects feature contracts, a ranking model, and evaluation to one practical question: which work should come first?</p>
            <ul className="edi-tags"><li>Decision systems</li><li>Python</li><li>Synthetic data</li></ul>
            <a href="https://github.com/eluan216/Elite-Data-Intelligence/tree/main/projects/ops-priority-decision-system" target="_blank" rel="noopener noreferrer" className="edi-text-link">Explore the ops priority system<Arrow diagonal /></a>
          </div>
          <div className="edi-case-visual">
            <span className="edi-mono">A decision, by design</span>
            <div className="edi-case-step"><span>01</span><div><strong>Validate the inputs</strong><p>Clear features. Explicit contracts.</p></div><span aria-hidden="true">✓</span></div>
            <div className="edi-case-step"><span>02</span><div><strong>Score the priorities</strong><p>A model evaluated against impact.</p></div><Arrow /></div>
            <div className="edi-case-step"><span>03</span><div><strong>Review the next action</strong><p>Evidence for the decision owner.</p></div><Arrow diagonal /></div>
            <p className="edi-case-disclaimer">Portfolio demonstration using synthetic data.</p>
          </div>
        </article>
        <div className="edi-project-grid">
          {PORTFOLIO.map((project, index) => (
            <article key={project.href} className="edi-project-card">
              <div className="edi-project-top"><span className="edi-mono">0{index + 1}</span><span>{project.category}</span></div>
              <h3><a href={`https://github.com/eluan216/${project.href}`} target="_blank" rel="noopener noreferrer">{project.title}<Arrow diagonal /></a></h3>
              <p>{project.body}</p>
              <ul className="edi-tags">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="edi-work-footer"><p>Portfolio work demonstrates our methods. Client engagements are scoped around your context.</p><a href="https://github.com/eluan216" target="_blank" rel="noopener noreferrer" className="edi-text-link">All public work<Arrow diagonal /></a></div>
      </div>
    </section>
  );
}
