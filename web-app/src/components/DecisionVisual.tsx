/** A lightweight, static illustration of the delivery process, not live telemetry. */
export default function DecisionVisual() {
  return (
    <div className="edi-blueprint">
      <div className="edi-blueprint-heading">
        <span className="edi-dot" />
        <span>From signal to action</span>
        <span className="edi-mono">EDI / 01</span>
      </div>
      <svg className="edi-system-map" viewBox="0 0 480 410" role="img" aria-labelledby="system-map-title system-map-desc">
        <title id="system-map-title">A clear path from data to decisions</title>
        <desc id="system-map-desc">Source data moves through a model and rules, human review, and a decision. Monitoring feeds learning back into the system.</desc>
        <defs>
          <pattern id="edi-dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#455149" />
          </pattern>
          <linearGradient id="edi-path" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#d6fa60" />
            <stop offset="1" stopColor="#6d8b3e" />
          </linearGradient>
        </defs>
        <rect width="480" height="410" fill="url(#edi-dot-grid)" opacity=".45" />
        <circle cx="240" cy="192" r="150" fill="none" stroke="#2c3930" strokeDasharray="3 9" />
        <circle cx="240" cy="192" r="112" fill="none" stroke="#28342c" />
        <path d="M108 108h77q25 0 25 25v19M372 108h-77q-25 0-25 25v19M240 232v60M240 334v35H108V151" stroke="url(#edi-path)" strokeWidth="1.5" fill="none" />
        <path d="m235 283 5 9 5-9" stroke="#d6fa60" fill="none" />
        <rect x="32" y="66" width="152" height="85" rx="8" fill="#141d18" stroke="#354338" />
        <text x="48" y="91" fill="#a9b5ac" fontSize="10" letterSpacing="1.4">01 / INPUT</text>
        <text x="48" y="119" fill="#f3f4e9" fontSize="16">Source data</text>
        <rect x="296" y="66" width="152" height="85" rx="8" fill="#141d18" stroke="#354338" />
        <text x="312" y="91" fill="#a9b5ac" fontSize="10" letterSpacing="1.4">02 / INTELLIGENCE</text>
        <text x="312" y="119" fill="#f3f4e9" fontSize="16">Model + rules</text>
        <rect x="154" y="152" width="172" height="80" rx="8" fill="#d6fa60" />
        <circle cx="177" cy="176" r="4" fill="#253214" />
        <text x="191" y="180" fill="#253214" fontSize="10" letterSpacing="1">03 / ACCOUNTABILITY</text>
        <text x="174" y="211" fill="#16200e" fontSize="19" fontWeight="600">Human review</text>
        <rect x="161" y="292" width="158" height="42" rx="21" fill="#141d18" stroke="#71834c" />
        <text x="240" y="318" textAnchor="middle" fill="#eaf4ce" fontSize="14">A decision to act on</text>
        <text x="53" y="391" fill="#a9b5ac" fontSize="10" letterSpacing="1.5">MONITOR → LEARN → IMPROVE</text>
        <circle cx="108" cy="232" r="4" fill="#d6fa60" />
        <circle cx="372" cy="108" r="3" fill="#d6fa60" />
      </svg>
      <div className="edi-blueprint-caption">
        <span>Built for the people making the call.</span>
        <span>Illustrative workflow</span>
      </div>
    </div>
  );
}
