import { MAX_CHAT_MESSAGES, MAX_CHAT_MESSAGE_LENGTH, type ChatLink, type ChatTurn, type SupportReply } from "./types";


export class ChatInputError extends Error {}

export function parseConversation(body: unknown): ChatTurn[] {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ChatInputError("Body must be a JSON object.");
  }
  const raw = body as Record<string, unknown>;
  if (raw.messages !== undefined && raw.message !== undefined) {
    throw new ChatInputError("Send messages or message, not both.");
  }
  const values = raw.messages ?? (typeof raw.message === "string" ? [{ role: "user", content: raw.message }] : null);
  if (!Array.isArray(values) || !values.length || values.length > MAX_CHAT_MESSAGES) {
    throw new ChatInputError("Provide 1–12 recent conversation messages.");
  }
  const messages = values.map((value): ChatTurn => {
    if (!value || typeof value !== "object") throw new ChatInputError("Invalid conversation message.");
    const { role, content } = value as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") throw new ChatInputError("Invalid conversation role.");
    if (typeof content !== "string" || !content.trim() || content.length > MAX_CHAT_MESSAGE_LENGTH) {
      throw new ChatInputError("Each message must contain 1–2000 characters.");
    }
    return { role, content: content.trim() };
  });
  if (messages[messages.length - 1].role !== "user") {
    throw new ChatInputError("The last message must be from the visitor.");
  }
  return messages;
}

const CONTACT: ChatLink = { label: "Project inquiry", href: "#contact" };
const WORKBENCH: ChatLink = { label: "Try the CSV workbench", href: "/analyze" };
const OPS: ChatLink = { label: "Inspect the ops priority project", href: "https://github.com/eluan216/Elite-Data-Intelligence/tree/main/projects/ops-priority-decision-system" };
const ECG: ChatLink = { label: "Inspect the ECG evaluation", href: "https://github.com/eluan216/ecg-arrhythmia-detection" };

export const SUPPORT_FACTS = `
Elite Data Intelligence is a founder-led AI, data science, and analytics consultancy.
Founder: Oguma Eluanatein Odo. Email: ogumaeluan@gmail.com.
Focus: decision intelligence (prioritization/ranking/decision support), data foundations
(pipelines/quality contracts/analytics engineering), and production ML/agent workflows
(evaluation/monitoring/handover/governance documentation).
Delivery: Discover, Design, Build, Validate, Operate. Humans own commercial terms,
high-risk decisions, and final quality gates.
Public portfolio demonstrations are not client engagements or guaranteed outcomes.
Ops priority project: synthetic operational triage, feature validation, Ridge ranking,
tests and a model card. No claims of client savings.
ECG research: 45-record MIT-BIH protocol, patient-disjoint seed-42 test split;
94.79% accuracy but only 35.83% macro-F1, weak minority-class performance.
Research/education only, not a medical device.
Other public projects: NeuralForge C++ runtime, industrial IoT analytics, predictive
maintenance, 3D CT exploration, internship ranking workflow.
CSV workbench at /analyze: browser-local descriptive analysis, maximum 2 MB,
first 5000 rows analyzed, quality checks/charts/exports. Chat is a separate server service.
Contact form #contact sends name, work email, and problem description to the founder.
Discovery conversation is free/no obligation. Expected personal reply within one business day.
Scope, fees, delivery dates, availability, and contracts require founder confirmation.
No published fixed prices, no ROI guarantees, no legal/certification claims.
The assistant cannot schedule meetings, send email, access private client projects,
inspect uploaded CSV contents, open support tickets, or confirm a booking.
There are 16 documented roles; some workflows and a three-role runtime are implemented.
Do not represent these as 16 autonomous production workers.
`;

const QUESTIONS = {
  goal: "What would a better result look like: customer impact, faster response, lower cost, or another measurable outcome?",
  data: "Where does the relevant history live today — a ticketing tool, database, spreadsheets, or somewhere else?",
  owner: "Who owns this decision or process in your team?",
  timing: "Is there a deadline or a constraint we should plan around?",
};

const DOMAINS = [
  { name: "ops", match: /\b(tickets?|triage|queues?|backlogs?|prioriti[sz](?:e|ing|ation|ed)?|incidents?|zendesk|sla)\b/i,
    intro: "For an operations queue, I’d start with a ranked triage view: agree what makes an item important, validate the ticket fields, and compare the ranking with your current rules.", links: [OPS] },
  { name: "maintenance", match: /\b(maintenance|sensors?|equipment|downtime|machinery|vibration)\b/i,
    intro: "For maintenance decisions, the useful starting point is the failure history, sensor coverage, and cost of a missed warning. That determines whether a rule-based baseline or predictive model is justified.", links: [{ label: "Inspect predictive maintenance work", href: "https://github.com/eluan216/predictive-maintenance-oil-gas" }] },
  { name: "data", match: /\b(csv|spreadsheets?|data quality|duplicates?|missing data|pipelines?|sql|databases?)\b/i,
    intro: "I’d start by checking the data contract, missing values, duplicate records, and how those issues affect the decision you need to make. You can inspect a non-sensitive CSV in our browser-local workbench.", links: [WORKBENCH] },
  { name: "ml", match: /\b(models?|ml|machine learning|drift|mlops|deployment|monitoring|agents?|automation)\b/i,
    intro: "For a model or agent workflow, I’d first define the task, a baseline, failure cases, and the human review point. Then we can judge whether the workflow is ready for an evaluated pilot.", links: [OPS] },
];

function intent(text: string): string | undefined {
  if (/\b(who are you|what are you|introduce yourself)\b|^(hi|hello|hey)[!. ]*$/i.test(text)) return "identity";
  if (/\b(brief|summari[sz]e|summary|handoff)\b/i.test(text)) return "brief";
  if (/\b(pricing|prices?|fees?|rates?)\b|\bhow much\b|\b(?:project|engagement).*(?:cost|budget)\b/i.test(text)) return "pricing";
  if (/\b(book|booking|schedule|discovery call|contact|meeting|email)\b|after.*(?:submit|inquiry)/i.test(text)) return "contact";
  if (/\b(project status|my project|our project status|client portal|my deliverables)\b/i.test(text)) return "client";
  if (/\b(portfolio|examples?|case stud(?:y|ies)|proof|ecg|arrhythmia|neuralforge|relevant work|public work)\b/i.test(text)) return "work";
  if (/\b(not helpful|not helping|not useful|frustrated|complaint|human support|real person)\b|speak to (?:a )?human/i.test(text)) return "escalate";
  if (/\b(security|privacy|gdpr|compliance|certified|certification)\b/i.test(text)) return "security";
  if (/\b(who runs|your team|your founder|sixteen|16 agents|autonomous workers)\b/i.test(text)) return "team";
  if (/\b(your process|how does delivery|delivery process|how do you work)\b/i.test(text)) return "process";
  if (/\b(workbench|analy[sz]e a csv|upload a csv)\b/i.test(text)) return "workbench";
  if (/\b(what do you (do|offer)|services|capabilities)\b/i.test(text)) return "services";
  return undefined;
}

function visitorBrief(messages: ChatTurn[]): string | undefined {
  const turns = messages.filter((turn) => turn.role === "user" && !intent(turn.content));
  const hasProblem = turns.some((turn) => turn.content.length > 20 && (DOMAINS.some((domain) => domain.match.test(turn.content)) || /\b(we|our|need|help|want|trying|problem|struggling)\b/i.test(turn.content)));
  if (!hasProblem) return undefined;
  return "Website discovery conversation — visitor-provided details\nReview and edit these excerpts before sending.\n\n" +
    turns.slice(-6).map((turn, index) => `${index + 1}. ${turn.content.slice(0, 500)}${turn.content.length > 500 ? "…" : ""}`).join("\n\n");
}

export function guidedReply(messages: ChatTurn[]): SupportReply {
  const latest = messages[messages.length - 1].content;
  const users = messages.filter((turn) => turn.role === "user");
  const context = users.map((turn) => turn.content).join("\n");
  const currentIntent = intent(latest);
  const brief = visitorBrief(messages);
  const base = { mode: "guided" as const, brief };
  const answer = (reply: string, quickReplies: string[], links: ChatLink[] = []): SupportReply => ({ ...base, reply, quickReplies, links });
  if (currentIntent === "identity") return answer("I’m Elite Data Intelligence’s project assistant. I can help you identify a useful starting point, explore our public work, and prepare a focused inquiry for Oguma, our founder. What decision or workflow are you trying to improve?", ["Prioritize an operations queue", "Improve data quality", "Explore relevant work"]);
  if (currentIntent === "pricing") return answer("Fees depend on the decision, data readiness, risk, and scope; the founder confirms commercial terms. The initial discovery conversation is free. What would you want the project to change for your team?", ["Prepare a discovery brief", "Show relevant examples"], [CONTACT]);
  if (currentIntent === "contact") return answer("The inquiry form reaches Oguma directly. You can review a conversation brief and use it in the form, then add your name and work email. He confirms availability and next steps; this chat does not book a meeting.", ["Prepare a discovery brief", "Show relevant examples"], [CONTACT]);
  if (currentIntent === "client") return answer("I can explain our public services and delivery process, but I cannot access private project status or deliverables. Please contact Oguma at ogumaeluan@gmail.com with your project reference; avoid posting confidential details here.", ["How does delivery work?"], [{ label: "Email the founder", href: "mailto:ogumaeluan@gmail.com" }]);
  if (currentIntent === "escalate") return answer("Let’s bring Oguma into the conversation. The inquiry form or ogumaeluan@gmail.com reaches him directly. Include what you were trying to resolve and what went wrong; this chat has not opened a ticket or sent a message on your behalf.", ["Prepare a discovery brief"], [CONTACT, { label: "Email Oguma", href: "mailto:ogumaeluan@gmail.com" }]);
  if (currentIntent === "security") return answer("Our documented approach includes human release review, version-controlled artifacts, validation, and explicit ownership. Data access, retention, and engagement-specific safeguards need to be agreed during scoping. For this chat, please use a non-sensitive description rather than client records or credentials.", ["How does delivery work?", "Prepare a discovery brief"], [{ label: "Website privacy", href: "/privacy" }, CONTACT]);
  if (currentIntent === "team") return answer("Oguma Eluanatein Odo leads the practice and owns client relationships and final quality gates. Sixteen documented role definitions guide delivery; selected workflows and a three-role runtime are implemented. They are not sixteen autonomous production workers.", ["Show relevant examples", "How does delivery work?"], [CONTACT]);
  if (currentIntent === "process") return answer("We work through Discover → Design → Build → Validate → Operate. For your project, discovery should pin down the decision owner, the cost of error, available data, and an acceptance metric before building. What is the decision you need to improve?", ["Prioritize an operations queue", "Improve data quality"], [OPS]);
  if (currentIntent === "workbench") return answer("Open the data workbench to upload a non-sensitive CSV of up to 2 MB. It profiles columns, flags missing values and duplicates, and provides charts and exports. The first 5,000 rows are analyzed in your browser; this chat cannot see that uploaded file.", ["Our data quality is unreliable", "Prepare a discovery brief"], [WORKBENCH]);
  if (currentIntent === "services") return answer("Our focus is decision intelligence, data foundations, and ML or agent workflows that can be validated and handed over. Examples include ticket prioritization, data-quality checks, and model monitoring. Which decision or operational bottleneck matters most to you?", ["Prioritize an operations queue", "Improve data quality", "Evaluate an ML workflow"], [WORKBENCH, OPS]);
  if (currentIntent === "work") {
    if (/neuralforge/i.test(latest)) return answer("NeuralForge is a public C++20 project exploring CPU inference, training, and model export. It is inspectable systems work beneath the ML layer, rather than a promised client outcome.", ["Show the ops priority example", "Prepare a discovery brief"], [{ label: "Inspect NeuralForge", href: "https://github.com/eluan216/NeuralForge" }]);
    if (/maintenance|sensors?|equipment|downtime/i.test(latest)) return answer("The predictive-maintenance portfolio explores failure prediction and signal processing on industrial-style data. For your equipment, feasibility depends on actual failure labels, sensor coverage, and how much warning time would be useful.", ["Prepare a discovery brief"], [{ label: "Inspect predictive maintenance work", href: "https://github.com/eluan216/predictive-maintenance-oil-gas" }]);
    if (/ecg|arrhythmia/i.test(latest)) return answer("The ECG project demonstrates a patient-disjoint evaluation and serving pipeline. It measured 94.79% accuracy but only 35.83% macro-F1 on its 45-record protocol, so the report explicitly documents weak minority-class performance. It is research and education work, not a medical device or a client outcome.", ["Show the ops priority example", "Prepare a discovery brief"], [ECG]);
    return answer("The ops priority demonstration connects feature contracts, a Ridge ranking model, tests, and a model card to a triage decision. It uses synthetic data, so its evaluation is evidence of the method rather than a client result. The ECG project is another example of publishing results together with their limits.", ["Show the ECG example", "Prepare a discovery brief"], [OPS, ECG]);
  }
  if (currentIntent === "brief") return answer(brief ? "I’ve prepared excerpts of what you shared for you to review. Use “Use this brief in the inquiry form” below, edit it if needed, and submit only when you are ready." : "Let’s make the inquiry useful first. In a sentence or two, what is your team trying to improve and what is getting in the way?", brief ? ["What happens after I submit?"] : ["We need to prioritize support tickets", "Our data quality is unreliable"], [CONTACT]);

  const domain = DOMAINS.find((item) => item.match.test(context));
  const answered = new Set<string>();
  const signals: Record<string, RegExp> = {
    goal: /customer impact|response time|revenue|cost of|sla|reduce|faster|accuracy|success|outcome/i,
    data: /zendesk|jira|salesforce|spreadsheet|csv|database|sql|sensor|historical|history|no usable data/i,
    owner: /ops lead|operations lead|team lead|manager|head of|i own|decision owner|still identifying/i,
    timing: /deadline|timeline|\b\d+\s*(days?|weeks?|months?)\b|no fixed deadline|still exploring/i,
  };
  for (const [key, expression] of Object.entries(signals)) if (expression.test(context)) answered.add(key);
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role !== "user" || intent(messages[i].content) || /\?\s*$/.test(messages[i].content)) continue;
    for (const [key, question] of Object.entries(QUESTIONS)) {
      if (messages[i - 1].role === "assistant" && messages[i - 1].content.includes(question)) answered.add(key);
    }
  }
  const next = Object.keys(QUESTIONS).find((key) => !answered.has(key)) as keyof typeof QUESTIONS | undefined;
  if (!next && brief) return answer("You’ve shared enough for a useful first conversation. I’ve kept your own wording in the reviewable brief below. The founder can confirm feasibility, scope, and any commercial terms after reviewing it.", ["What happens after I submit?", "Show relevant examples"], [CONTACT]);
  const quickReplies: Record<string, string[]> = {
    goal: ["Customer impact", "Faster response", "Not sure yet"],
    data: ["A database", "Spreadsheets", "No usable data yet"],
    owner: ["I own the decision", "Our operations lead", "Still identifying an owner"],
    timing: ["Within 8 weeks", "Still exploring", "No fixed deadline"],
  };
  const intro = users.length === 1
    ? domain?.intro || "Let’s connect the work to a concrete business decision before choosing a tool or model."
    : "Thanks — I’ll keep that context in the inquiry brief.";
  return answer(`${intro}\n\n${QUESTIONS[next || "goal"]}`, quickReplies[next || "goal"], domain?.links || [CONTACT]);
}
