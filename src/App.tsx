import { useEffect, useRef, useState } from "react";
import Modeler from "bpmn-js/lib/Modeler";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  FileSearch,
  FolderOpen,
  GitBranch,
  Home,
  Lightbulb,
  Menu,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  UsersRound,
  WandSparkles,
} from "lucide-react";
import { ownerQuestions, processes, Question } from "./data";
import { sampleBpmn } from "./sampleBpmn";
type Page =
  | "dashboard"
  | "repository"
  | "owner"
  | "sme"
  | "workspace"
  | "bpmn"
  | "diagnosis"
  | "improvements"
  | "readiness"
  | "reports";
type Message = { role: "ai" | "user"; text: string };
type Answers = Record<string, string>;
type Analysis = {
  name: string;
  improvement: number;
  readiness: number;
  roadblocks: { title: string; detail: string; element: string }[];
  recommendations: string[];
  pathway: string;
};
const nav: [Page, any, string][] = [
  ["dashboard", Home, "Dashboard"],
  ["repository", FolderOpen, "Process Repository"],
  ["owner", UserRound, "Process Owner Discovery"],
  ["workspace", ClipboardList, "Process Workspace"],
  ["bpmn", GitBranch, "Current-State Map"],
  ["diagnosis", FileSearch, "Roadblocks & Score"],
  ["improvements", Lightbulb, "Recommendations"],
  ["readiness", ShieldCheck, "AI & Automation Readiness"],
  ["reports", BarChart3, "PrimeOne Handoff"],
];
const numberFrom = (s: string, fallback: number) =>
  Number((s || "").match(/\d+(\.\d+)?/)?.[0] || fallback);
function analyze(a: Answers): Analysis {
  const q = numberFrom(a.quality, 12),
    systems = (a.systems || "").split(/,| and /).filter(Boolean).length || 2,
    steps = (a.steps || "")
      .split(/\n|\d+[.)]|, then | then /i)
      .filter((x) => x.trim().length > 3);
  const stable = /very stable|rarely|no change/i.test(a.stability || "")
    ? 90
    : /change|upgrade|migration|unstable/i.test(a.stability || "")
      ? 45
      : 68;
  const rules = (a.decisions || "").length > 35 ? 78 : 48;
  const structured = /yes|structured|standard|digital/i.test(a.data || "")
    ? 85
    : 45;
  const exception = Math.max(20, 100 - q * 2.5);
  const clarity = Math.min(92, 45 + steps.length * 6);
  const improvement = Math.round(
    clarity * 0.2 +
      exception * 0.2 +
      rules * 0.15 +
      (100 - Math.min(75, systems * 9)) * 0.15 +
      stable * 0.1 +
      structured * 0.1 +
      78 * 0.1,
  );
  const readiness = Math.round(
    stable * 0.2 +
      rules * 0.18 +
      structured * 0.18 +
      exception * 0.16 +
      Math.min(95, 55 + systems * 5) * 0.12 +
      clarity * 0.08 +
      78 * 0.08,
  );
  const roadblocks = [] as Analysis["roadblocks"];
  if (q > 8)
    roadblocks.push({
      title: "High exception and rework rate",
      detail: `Approximately ${q}% of transactions require correction or exception handling.`,
      element: "Exception",
    });
  if (systems > 2)
    roadblocks.push({
      title: "Multiple system handoffs",
      detail: `The process uses approximately ${systems} applications or tools, increasing manual navigation and delay.`,
      element: "Review",
    });
  if (rules < 60)
    roadblocks.push({
      title: "Business rules need clarification",
      detail:
        "Decision criteria are not specific enough to support a consistent target state.",
      element: "Match",
    });
  if (stable < 60)
    roadblocks.push({
      title: "Upcoming process or system change",
      detail:
        "Planned changes reduce readiness and should be addressed before technology implementation.",
      element: "Review",
    });
  if (/none|no exception/i.test(a.exceptions || "") && q > 0)
    roadblocks.push({
      title: "Contradiction requires validation",
      detail: `The discovery says there are no exceptions, but the stated rework or exception rate is ${q}%. Primo requires confirmation before approval.`,
      element: "Exception",
    });
  if (!roadblocks.length)
    roadblocks.push({
      title: "Manual handoff opportunity",
      detail:
        "The current-state flow contains a handoff that should be measured and standardized.",
      element: "Review",
    });
  const recommendations = roadblocks.map((r) =>
    r.title.includes("exception")
      ? "Classify exceptions by reason and assign a standard resolution path."
      : r.title.includes("system")
        ? "Consolidate the information required for review or integrate system data."
        : r.title.includes("rules")
          ? "Document one approved decision table and validate it with the business owner."
          : r.title.includes("change")
            ? "Complete the planned change and rebaseline the process before implementation."
            : "Define a standard handoff, owner, queue, and turnaround target.",
  );
  const pathway =
    readiness >= 75
      ? "Process improvement complete enough to evaluate workflow, RPA, IDP, or AI options."
      : readiness >= 55
        ? "Prioritize process improvements, then reassess selected automation opportunities."
        : "Process improvement pathway. Resolve foundational issues before recommending automation or AI.";
  return {
    name: a.name || "New Process",
    improvement,
    readiness,
    roadblocks,
    recommendations,
    pathway,
  };
}
const xmlSafe = (s: string) =>
  (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
function generatedBpmn(a: Answers) {
  const raw = (
    a.steps || "Review request, Validate information, Complete process"
  )
    .split(/\n|\d+[.)]|, then | then |,/i)
    .map((x) => x.trim())
    .filter((x) => x.length > 2)
    .slice(0, 5);
  const steps = raw.length
    ? raw
    : ["Review request", "Validate information", "Complete process"];
  const taskXml = steps
    .map(
      (s, i) =>
        `<bpmn:task id="${i === 0 ? "Review" : "Task" + i}" name="${xmlSafe(s)}"><bpmn:incoming>F${i}</bpmn:incoming><bpmn:outgoing>F${i + 1}</bpmn:outgoing></bpmn:task>`,
    )
    .join("");
  const flows = [
    `<bpmn:sequenceFlow id="F0" sourceRef="Start" targetRef="Review"/>`,
    ...steps
      .slice(0, -1)
      .map(
        (_, i) =>
          `<bpmn:sequenceFlow id="F${i + 1}" sourceRef="${i === 0 ? "Review" : "Task" + i}" targetRef="Task${i + 1}"/>`,
      ),
    `<bpmn:sequenceFlow id="F${steps.length}" sourceRef="${steps.length === 1 ? "Review" : "Task" + (steps.length - 1)}" targetRef="Match"/>`,
    `<bpmn:sequenceFlow id="Fyes" name="Normal" sourceRef="Match" targetRef="End"/>`,
    `<bpmn:sequenceFlow id="Fno" name="Exception" sourceRef="Match" targetRef="Exception"/>`,
    `<bpmn:sequenceFlow id="Frejoin" sourceRef="Exception" targetRef="End"/>`,
  ].join("");
  const shapes = steps
    .map(
      (_, i) =>
        `<bpmndi:BPMNShape id="S${i}" bpmnElement="${i === 0 ? "Review" : "Task" + i}"><dc:Bounds x="${200 + i * 145}" y="180" width="105" height="70"/></bpmndi:BPMNShape>`,
    )
    .join("");
  const edges = [
    `<bpmndi:BPMNEdge id="E0" bpmnElement="F0"><di:waypoint x="156" y="215"/><di:waypoint x="200" y="215"/></bpmndi:BPMNEdge>`,
    ...steps
      .slice(0, -1)
      .map(
        (_, i) =>
          `<bpmndi:BPMNEdge id="E${i + 1}" bpmnElement="F${i + 1}"><di:waypoint x="${305 + i * 145}" y="215"/><di:waypoint x="${345 + i * 145}" y="215"/></bpmndi:BPMNEdge>`,
      ),
    `<bpmndi:BPMNEdge id="EtoG" bpmnElement="F${steps.length}"><di:waypoint x="${305 + (steps.length - 1) * 145}" y="215"/><di:waypoint x="${350 + (steps.length - 1) * 145}" y="215"/></bpmndi:BPMNEdge>`,
    `<bpmndi:BPMNEdge id="Eyes" bpmnElement="Fyes"><di:waypoint x="${400 + (steps.length - 1) * 145}" y="215"/><di:waypoint x="${500 + (steps.length - 1) * 145}" y="215"/></bpmndi:BPMNEdge>`,
    `<bpmndi:BPMNEdge id="Eno" bpmnElement="Fno"><di:waypoint x="${375 + (steps.length - 1) * 145}" y="240"/><di:waypoint x="${375 + (steps.length - 1) * 145}" y="310"/></bpmndi:BPMNEdge>`,
    `<bpmndi:BPMNEdge id="Ere" bpmnElement="Frejoin"><di:waypoint x="${425 + (steps.length - 1) * 145}" y="345"/><di:waypoint x="${518 + (steps.length - 1) * 145}" y="233"/></bpmndi:BPMNEdge>`,
  ].join("");
  const gx = 350 + (steps.length - 1) * 145,
    ex = 500 + (steps.length - 1) * 145;
  return `<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="GeneratedProcess" isExecutable="false"><bpmn:startEvent id="Start" name="${xmlSafe(a.trigger || "Process starts")}"><bpmn:outgoing>F0</bpmn:outgoing></bpmn:startEvent>${taskXml}<bpmn:exclusiveGateway id="Match" name="Normal path?"><bpmn:incoming>F${steps.length}</bpmn:incoming><bpmn:outgoing>Fyes</bpmn:outgoing><bpmn:outgoing>Fno</bpmn:outgoing></bpmn:exclusiveGateway><bpmn:task id="Exception" name="Resolve exception"><bpmn:incoming>Fno</bpmn:incoming><bpmn:outgoing>Frejoin</bpmn:outgoing></bpmn:task><bpmn:endEvent id="End" name="${xmlSafe(a.outcome || "Process complete")}"><bpmn:incoming>Fyes</bpmn:incoming><bpmn:incoming>Frejoin</bpmn:incoming></bpmn:endEvent>${flows}</bpmn:process><bpmndi:BPMNDiagram><bpmndi:BPMNPlane bpmnElement="GeneratedProcess"><bpmndi:BPMNShape id="StartS" bpmnElement="Start"><dc:Bounds x="120" y="197" width="36" height="36"/></bpmndi:BPMNShape>${shapes}<bpmndi:BPMNShape id="GS" bpmnElement="Match" isMarkerVisible="true"><dc:Bounds x="${gx}" y="190" width="50" height="50"/></bpmndi:BPMNShape><bpmndi:BPMNShape id="XS" bpmnElement="Exception"><dc:Bounds x="${gx - 25}" y="310" width="105" height="70"/></bpmndi:BPMNShape><bpmndi:BPMNShape id="EndS" bpmnElement="End"><dc:Bounds x="${ex}" y="197" width="36" height="36"/></bpmndi:BPMNShape>${edges}</bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>`;
}
function Logo() {
  return (
    <div className="brand">
      <div className="primo">
        <Bot />
        <small>Primo™</small>
      </div>
      <b>▰PRIMUS</b>
    </div>
  );
}
function Header() {
  return (
    <header>
      <Logo />
      <div className="context">
        <b>Primo AI</b>
        <small>Process discovery and improvement</small>
      </div>
      <div className="headRight">
        <button>
          <Search />
        </button>
        <button>
          <Settings />
        </button>
        <div className="primeone">
          PRIME<span>O</span>NE<small>Powered by Primus</small>
        </div>
        <i>DJ</i>
        <div>
          <b>Danielle Jennings</b>
          <small>Administrator</small>
        </div>
      </div>
    </header>
  );
}
function Title({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string;
  title: string;
  sub: string;
  action?: any;
}) {
  return (
    <div className="title">
      <div>
        {eyebrow && <em>{eyebrow}</em>}
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}
function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [answers, setAnswers] = useState<Answers>(() =>
    JSON.parse(localStorage.getItem("primo-demo-answers") || "{}"),
  );
  const result = analyze(answers);
  function complete(a: Answers) {
    setAnswers(a);
    localStorage.setItem("primo-demo-answers", JSON.stringify(a));
    setPage("bpmn");
  }
  return (
    <>
      <Header />
      <div className="shell">
        <aside className={collapsed ? "collapsed" : ""}>
          <nav>
            {nav.map(([id, I, label]) => (
              <button
                className={page === id ? "active" : ""}
                onClick={() => setPage(id)}
                key={id}
              >
                <I />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <button className="collapse" onClick={() => setCollapsed(!collapsed)}>
            <Menu />
            <span>Collapse navigation</span>
          </button>
        </aside>
        <main>
          {page === "dashboard" && <Dashboard go={setPage} />}{" "}
          {page === "repository" && <Repository go={setPage} />}{" "}
          {page === "owner" && (
            <Guided initial={answers} onComplete={complete} />
          )}{" "}
          {page === "workspace" && <Workspace go={setPage} />}{" "}
          {page === "bpmn" && <Bpmn result={result} answers={answers} />}{" "}
          {page === "diagnosis" && <Diagnosis result={result} />}{" "}
          {page === "improvements" && <Improvements result={result} />}{" "}
          {page === "readiness" && <Readiness result={result} />}{" "}
          {page === "reports" && <Reports result={result} />}
        </main>
      </div>
    </>
  );
}
function Dashboard({ go }: { go: (p: Page) => void }) {
  return (
    <div className="page">
      <Title
        title="Good afternoon, Danielle"
        sub="Here is the current Primo process portfolio."
        action={
          <button className="primary" onClick={() => go("owner")}>
            <Sparkles />
            Start discovery
          </button>
        }
      />
      <div className="metrics">
        {[
          ["Total processes", "24", "Across 7 departments"],
          ["Discovery in progress", "6", "2 awaiting SME input"],
          ["Average process health", "72", "Up 4 this quarter"],
          ["Automation ready", "5", "3 awaiting approval"],
        ].map((x) => (
          <article>
            <small>{x[0]}</small>
            <strong>{x[1]}</strong>
            <em>{x[2]}</em>
          </article>
        ))}
      </div>
      <div className="cols">
        <section className="card wide">
          <CardHead
            title="Process portfolio"
            sub="Recent processes and accountable stage"
            action={
              <button className="link" onClick={() => go("repository")}>
                View all <ArrowRight />
              </button>
            }
          />
          <ProcessTable go={go} />
        </section>
        <section className="card">
          <CardHead
            title="Work requiring attention"
            sub="Items awaiting action"
          />
          {[
            ["Process SME input", "Vendor Invoice Review", "Maya Chen"],
            ["PI review", "Employee Access Provisioning", "You"],
            ["Business approval", "Customer Address Change", "Alicia Reed"],
          ].map((x, i) => (
            <div className="attention">
              <span>
                {i === 0 ? (
                  <UsersRound />
                ) : i === 1 ? (
                  <FileSearch />
                ) : (
                  <CheckCircle2 />
                )}
              </span>
              <div>
                <em>{x[0]}</em>
                <b>{x[1]}</b>
                <small>Owner: {x[2]}</small>
              </div>
              <ChevronRight />
            </div>
          ))}
        </section>
      </div>
      <section className="card lifecycle">
        <CardHead
          title="Discovery lifecycle"
          sub="Every stage has a distinct owner and approval gate"
        />
        <div>
          {[
            "Understand",
            "Map",
            "Diagnose",
            "Improve",
            "Assess",
            "PrimeOne Handoff",
          ].map((x, i) => (
            <span className={i < 2 ? "done" : i === 2 ? "current" : ""}>
              <i>{i < 2 ? <CheckCircle2 /> : i + 1}</i>
              <b>{x}</b>
              {i < 5 && <ArrowRight />}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
function CardHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: any;
}) {
  return (
    <div className="cardhead">
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}
function ProcessTable({ go }: { go: (p: Page) => void }) {
  return (
    <div className="processes">
      {processes.map((p) => (
        <button onClick={() => go("workspace")}>
          <span>
            <b>{p.name}</b>
            <small>
              {p.dept} · {p.owner}
            </small>
          </span>
          <em>{p.stage}</em>
          <span>
            <b>{p.health || "—"}</b>
            <small>Health</small>
          </span>
          <span>
            <b>{p.ready || "—"}</b>
            <small>Readiness</small>
          </span>
          <ChevronRight />
        </button>
      ))}
    </div>
  );
}
function Repository({ go }: { go: (p: Page) => void }) {
  return (
    <div className="page">
      <Title
        title="Process Repository"
        sub="Search and manage processes from intake through automation handoff."
        action={
          <button className="primary" onClick={() => go("owner")}>
            + New process
          </button>
        }
      />
      <div className="filters">
        <label>
          <Search />
          <input placeholder="Search processes" />
        </label>
        <button>All departments</button>
        <button>All stages</button>
      </div>
      <section className="card">
        <ProcessTable go={go} />
      </section>
    </div>
  );
}
function Guided({
  initial,
  onComplete,
}: {
  initial: Answers;
  onComplete: (a: Answers) => void;
}) {
  const qs = ownerQuestions;
  const [step, setStep] = useState(0);
  const [value, setValue] = useState("");
  const [answers, setAnswers] = useState<Answers>(initial);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text:
        "I will guide you through the business context and current-state process. " +
        qs[0].question,
    },
  ]);
  function followUp(q: Question, v: string) {
    if (q.id === "steps" && !/\d|then|next/i.test(v))
      return "To build the map accurately, please describe the sequence using numbered steps or words such as “then” and “next.”";
    if (
      q.id === "exceptions" &&
      !/none|error|delay|missing|reject|rework|exception/i.test(v)
    )
      return "What happens when information is missing, incorrect, or cannot be processed normally?";
    if (q.id === "timing" && !/\d/.test(v))
      return "A range is fine. About how many minutes or hours involve active work and how much involves waiting?";
    return "";
  }
  function send() {
    if (!value.trim()) return;
    const q = qs[step],
      clarify = followUp(q, value);
    setMessages((m) => [
      ...m,
      { role: "user", text: value },
      {
        role: "ai",
        text:
          clarify ||
          (step + 1 < qs.length
            ? `I captured that. ${qs[step + 1].question}`
            : "Discovery is complete. I can now generate the current-state map and analysis."),
      },
    ]);
    if (clarify) {
      setValue("");
      return;
    }
    const nextAnswers = { ...answers, [q.id]: value };
    setAnswers(nextAnswers);
    setValue("");
    const next = step + 1;
    setStep(next);
    if (next === qs.length) setTimeout(() => onComplete(nextAnswers), 700);
  }
  return (
    <div className="page guided">
      <Title
        eyebrow="BUSINESS AND CURRENT-STATE DISCOVERY"
        title="Process Owner Discovery"
        sub="Describe the business need and how the process works today."
      />
      <div className="role">
        <span>
          <UserRound />
        </span>
        <div>
          <b>Your role in this MVP</b>
          <p>
            You provide the process purpose, current steps, decisions,
            roadblocks, measures, systems, and desired outcome. Primo converts
            this information into a map and assessment.
          </p>
        </div>
        <strong>
          {Math.min(step, qs.length)} of {qs.length}
        </strong>
      </div>
      <div className="guideShell">
        <div className="questionList">
          <div className="progress">
            <i style={{ width: `${(step / qs.length) * 100}%` }} />
          </div>
          {qs.map((q, i) => (
            <div
              className={i < step ? "complete" : i === step ? "current" : ""}
              key={q.id}
            >
              <span>{i < step ? <CheckCircle2 /> : i + 1}</span>
              <p>{q.question}</p>
            </div>
          ))}
        </div>
        <section className="chat">
          <div className="messages">
            {messages.map((m, i) => (
              <div className={m.role} key={i}>
                <span>{m.role === "ai" ? <Bot /> : "PO"}</span>
                <div>
                  {m.text}
                  {m.role === "ai" &&
                    i === messages.length - 1 &&
                    step < qs.length && (
                      <small>
                        <Lightbulb />
                        {qs[step].help}
                      </small>
                    )}
                </div>
              </div>
            ))}
          </div>
          <div className="composer">
            <label>
              <WandSparkles />
              AI-guided discovery{" "}
              <small>
                Primo asks clarifying questions when an answer is incomplete.
              </small>
            </label>
            <div>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type your answer. You can also say “I don’t know.”"
              />
              <button onClick={send}>
                <Send />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
function Workspace({ go }: { go: (p: Page) => void }) {
  return (
    <div className="page">
      <Title
        eyebrow="FINANCE · ACTIVE PROCESS"
        title="Vendor Invoice Review"
        sub="Current-state discovery and assessment workspace"
        action={<button className="outline">Assign reviewer</button>}
      />
      <div className="tabs">
        {[
          ["Overview", "workspace"],
          ["Discovery", "sme"],
          ["Process Map", "bpmn"],
          ["Diagnosis", "diagnosis"],
          ["Improvements", "improvements"],
          ["Readiness", "readiness"],
          ["Reports", "reports"],
        ].map((x) => (
          <button
            className={x[1] === "workspace" ? "active" : ""}
            onClick={() => go(x[1] as Page)}
          >
            {x[0]}
          </button>
        ))}
      </div>
      <div className="three">
        <section className="card">
          <h2>Process summary</h2>
          <dl>
            <dt>Product Owner</dt>
            <dd>Maya Chen</dd>
            <dt>Process SME</dt>
            <dd>Andre Lewis</dd>
            <dt>Business Owner</dt>
            <dd>VP, Accounts Payable</dd>
            <dt>Department</dt>
            <dd>Finance</dd>
            <dt>Current stage</dt>
            <dd>
              <em className="pill">SME Discovery</em>
            </dd>
          </dl>
        </section>
        <section className="card">
          <h2>Assessment</h2>
          <Score n={62} label="Process Health" />
          <Score n={48} label="Automation Readiness" />
        </section>
        <section className="card">
          <h2>Stage ownership</h2>
          {[
            ["Product Owner intake", "Complete"],
            ["SME discovery", "In progress"],
            ["Map validation", "Not started"],
            ["PI review", "Not started"],
          ].map((x, i) => (
            <div className="status">
              <i className={i === 0 ? "ok" : i === 1 ? "now" : ""}>
                {i === 0 ? <CheckCircle2 /> : i + 1}
              </i>
              <b>{x[0]}</b>
              <small>{x[1]}</small>
            </div>
          ))}
        </section>
      </div>
      <section className="card objective">
        <CardHead
          title="Business objective"
          sub="Approved during Product Owner intake"
        />
        <blockquote>
          Reduce invoice cycle time and manual rework while preserving approval
          and separation-of-duty controls.
        </blockquote>
        <div>
          {[
            ["12,500", "invoices/year"],
            ["18 min", "active work"],
            ["14%", "exception rate"],
            ["4", "systems"],
          ].map((x) => (
            <span>
              <b>{x[0]}</b>
              {x[1]}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
function Score({ n, label }: { n: number; label: string }) {
  return (
    <div className="score">
      <i style={{ "--n": `${n * 3.6}deg` } as any}>
        <span>{n}</span>
      </i>
      <div>
        <b>{label}</b>
        <small>
          {n >= 80
            ? "Strong"
            : n >= 60
              ? "Needs review"
              : "Improvement required"}
        </small>
      </div>
    </div>
  );
}
function Bpmn({ result, answers }: { result: Analysis; answers: Answers }) {
  const host = useRef<HTMLDivElement>(null),
    modeler = useRef<any>();
  const [status, setStatus] = useState(
    "Current-state map generated from discovery",
  );
  useEffect(() => {
    if (!host.current) return;
    modeler.current = new Modeler({ container: host.current });
    modeler.current
      .importXML(Object.keys(answers).length ? generatedBpmn(answers) : sampleBpmn)
      .then(() => modeler.current.get("canvas").zoom("fit-viewport"));
    return () => modeler.current?.destroy();
  }, [answers]);
  async function load(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      await modeler.current.importXML(await f.text());
      modeler.current.get("canvas").zoom("fit-viewport");
      setStatus(`${f.name} loaded`);
    } catch {
      setStatus("The BPMN file could not be loaded");
    }
  }
  async function save() {
    const { x } = await modeler.current.saveXML({ format: true });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([x], { type: "application/xml" }));
    a.download =
      (result.name || "current-state").toLowerCase().replace(/\s+/g, "-") +
      ".bpmn";
    a.click();
  }
  return (
    <div className="page bpmn">
      <Title
        eyebrow={result.name.toUpperCase()}
        title="Generated Current-State Map"
        sub="Primo converted the discovery into an editable BPMN model and linked roadblocks to process elements."
        action={
          <div className="actions">
            <label className="outline">
              <Upload />
              Upload BPMN
              <input type="file" accept=".bpmn,.xml" onChange={load} />
            </label>
            <button className="primary" onClick={save}>
              <Download />
              Export BPMN
            </button>
          </div>
        }
      />
      <div className="editor">
        <div className="toolbar">
          <span>
            <i />
            {status}
          </span>
          <div>
            <button onClick={() => modeler.current?.get("commandStack").undo()}>
              Undo
            </button>
            <button onClick={() => modeler.current?.get("commandStack").redo()}>
              Redo
            </button>
            <button
              onClick={() =>
                modeler.current?.get("canvas").zoom("fit-viewport")
              }
            >
              Fit
            </button>
          </div>
        </div>
        <div ref={host} className="canvas" />
        <section className="findings">
          <em>AI FINDINGS</em>
          <h2>Roadblocks</h2>
          <p>Select a finding to highlight its related map element.</p>
          {result.roadblocks.map((x, i) => (
            <button
              key={x.title}
              onClick={() => {
                const c = modeler.current.get("canvas");
                c.addMarker(x.element, "highlight");
                c.zoom("fit-viewport");
              }}
            >
              <i>{i + 1}</i>
              <span>
                <b>{x.title}</b>
                <small>{x.detail}</small>
                <small>Confidence: {i === 0 ? "High" : "Medium"} · Evidence: discovery response and process structure</small>
              </span>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}
const cats = [
  ["Standardization and consistency", 68, 20],
  ["Errors, rework, and exceptions", 45, 20],
  ["Role and handoff clarity", 72, 15],
  ["Complexity and unnecessary steps", 58, 15],
  ["Business-rule clarity", 60, 10],
  ["Data and system stability", 70, 10],
  ["Controls and compliance", 84, 10],
];
function Bars({ items = cats }: { items?: any[] }) {
  return (
    <div className="bars">
      {items.map((x) => (
        <div>
          <span>
            {x[0]} {x[2] && <small>{x[2]}% weight</small>}
          </span>
          <i>
            <b style={{ width: x[1] + "%" }} />
          </i>
          <strong>{x[1]}</strong>
        </div>
      ))}
    </div>
  );
}
function Diagnosis({ result }: { result: Analysis }) {
  return (
    <div className="page">
      <Title
        eyebrow={result.name.toUpperCase()}
        title="Roadblocks and Process Improvement Score"
        sub="Evidence-based findings derived from the Process Owner discovery."
      />
      <div className="health">
        <section className="card hero">
          <Score n={result.improvement} label="Process Improvement Score" />
          <p>
            {result.improvement < 70
              ? "The current process has material improvement opportunities."
              : "The process has a sound foundation with targeted improvement opportunities."}
          </p>
          <button className="primary">Review scoring evidence</button>
        </section>
        <section className="card">
          <h2>Score categories</h2>
          <Bars />
        </section>
      </div>
      <section className="card">
        <CardHead
          title="Identified roadblocks"
          sub="Each roadblock links to evidence and the current-state map."
        />
        <div className="findingRows">
          {result.roadblocks.map((x, i) => (
            <div key={x.title}>
              <em className={i === 0 ? "high" : "medium"}>
                {i === 0 ? "High" : "Medium"}
              </em>
              <b>{x.title}</b>
              <p>{x.detail}</p>
              <span>AI finding</span>
              <ChevronRight />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
function Improvements({ result }: { result: Analysis }) {
  return (
    <div className="page">
      <Title
        eyebrow={result.name.toUpperCase()}
        title="Improvement Recommendations"
        sub="Primo recommends operational improvements whether or not automation is pursued."
        action={<button className="primary">Approve improvement plan</button>}
      />
      {result.recommendations.map((x, i) => (
        <section className="card rec" key={x}>
          <i>{i + 1}</i>
          <div>
            <h2>
              {[
                "Standardize the process",
                "Reduce manual effort",
                "Clarify decision rules",
                "Strengthen process stability",
              ][i] || "Improve the current state"}
            </h2>
            <p>{x}</p>
            <em>
              {i === 0
                ? "High impact · Medium effort"
                : "Targeted current-state improvement"}
            </em>
            <footer>
              <button>View evidence</button>
              <button>Modify</button>
              <button>Reject</button>
              <button>Accept recommendation</button>
            </footer>
          </div>
        </section>
      ))}
    </div>
  );
}
function Readiness({ result }: { result: Analysis }) {
  const factors = [
    ["Process stability", Math.min(90, result.readiness + 12)],
    ["Rule clarity", Math.max(35, result.readiness - 6)],
    ["Input structure", Math.min(92, result.readiness + 18)],
    ["Exception handling", Math.max(30, result.readiness - 14)],
    ["System accessibility", Math.min(86, result.readiness + 5)],
    ["Controls and compliance", 78],
  ];
  const ready = result.readiness >= 70;
  return (
    <div className="page">
      <Title
        eyebrow={result.name.toUpperCase()}
        title="AI and Automation Readiness"
        sub="Technology readiness is a separate decision from the value of process improvement."
        action={<button className="outline">Prepare PrimeOne package</button>}
      />
      <div className="decision">
        <ShieldCheck />
        <div>
          <em>READINESS THRESHOLD: 70</em>
          <h2>
            {ready
              ? "Ready to evaluate technology options"
              : "Process improvements required first"}
          </h2>
          <p>{result.pathway}</p>
        </div>
        <strong>{result.readiness}</strong>
      </div>
      <div className="cols">
        <section className="card wide">
          <h2>Readiness factors</h2>
          <Bars items={factors} />
        </section>
        <section className="card">
          <h2>
            {ready
              ? "Potential solution options"
              : "Required before reassessment"}
          </h2>
          {(ready
            ? [
                ["Workflow and API integration", "Evaluate"],
                ["RPA", "Evaluate"],
                ["Intelligent Document Processing", "Evaluate"],
                ["AI-assisted decision support", "Evaluate"],
              ]
            : result.recommendations.map((x) => [x, "Required"])
          ).map((x) => (
            <div className="solution" key={x[0]}>
              <b>{x[0]}</b>
              <span>{x[1]}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
function Reports({ result }: { result: Analysis }) {
  const [status, setStatus] = useState("Not sent");
  function send() {
    setStatus("Successfully staged for PrimeOne API");
  }
  return (
    <div className="page">
      <Title
        eyebrow={result.name.toUpperCase()}
        title="PrimeOne Handoff"
        sub="Package the approved discovery, BPMN, findings, scores, and recommendations for API transfer."
        action={
          <button className="primary" onClick={send}>
            <ArrowRight />
            Send to PrimeOne
          </button>
        }
      />
      <div className="decision">
        <ShieldCheck />
        <div>
          <em>DEMO API STATUS</em>
          <h2>{status}</h2>
          <p>
            The MVP simulates the API request and shows the payload that
            PrimeOne will receive.
          </p>
        </div>
        <strong>{result.readiness}</strong>
      </div>
      <div className="reportGrid">
        {[
          [
            ClipboardList,
            "Process Discovery",
            "Business context and current-state evidence",
          ],
          [GitBranch, "BPMN XML", "Generated and validated process model"],
          [FileSearch, "Improvement Score", String(result.improvement)],
          [
            Lightbulb,
            "Recommendations",
            `${result.recommendations.length} proposed actions`,
          ],
          [ShieldCheck, "Readiness Score", `${result.readiness} / 100`],
          [ArrowRight, "Recommended Pathway", result.pathway],
        ].map(([I, t, d]: any) => (
          <article className="card">
            <I />
            <h2>{t}</h2>
            <p>{d}</p>
            <button>
              <Download />
              Include in payload
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
export default App;
