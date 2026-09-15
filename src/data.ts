export type Question = { id: string; question: string; help: string };
export const ownerQuestions: Question[] = [
  {
    id: "name",
    question: "What does your team usually call this process?",
    help: "This name will identify the process throughout Primo. Example: Vendor Invoice Review.",
  },
  {
    id: "description",
    question: "In a few sentences, what does this process accomplish?",
    help: "Describe what happens from the initial request through the final outcome.",
  },
  {
    id: "trigger",
    question: "What event or request starts the process?",
    help: "For example, an invoice arrives, a customer submits a request, or a scheduled date occurs.",
  },
  {
    id: "outcome",
    question: "What result indicates that the process is complete?",
    help: "Describe the final business outcome, record, approval, or customer response.",
  },
  {
    id: "department",
    question: "Which department or business unit owns the process?",
    help: "Name the area accountable for the process.",
  },
  {
    id: "problem",
    question: "What business problem led you to submit this process?",
    help: "Describe delays, errors, repetitive work, customer impact, risk, or another concern.",
  },
  {
    id: "success",
    question: "What would a successful improvement accomplish?",
    help: "Describe the measurable or observable result you want.",
  },
  {
    id: "urgency",
    question:
      "How urgent is this need, and is there a deadline or business event affecting it?",
    help: "Include regulatory commitments, system changes, audits, or customer deadlines.",
  },
  {
    id: "businessOwner",
    question: "Who is the business owner accountable for approving changes?",
    help: "Provide a name or role. This person owns the business decision.",
  },
  {
    id: "sme",
    question:
      "Who is the primary Process SME who can explain how the process works day to day?",
    help: "This person should know the steps, systems, decisions, exceptions, and common problems.",
  },
  {
    id: "documentation",
    question:
      "Is the process documented, and what supporting material is available?",
    help: "Examples include an SOP, job aid, process map, training guide, or informal notes.",
  },
  {
    id: "frequency",
    question:
      "How often does the process run, and what is the approximate transaction volume?",
    help: "An estimate or range is fine. The Process SME can validate it later.",
  },
  {
    id: "systems",
    question: "Which applications or systems are involved?",
    help: "Include portals, spreadsheets, email, shared drives, and internal applications.",
  },
  {
    id: "steps",
    question: "Please walk me through the current process, one step at a time.",
    help: "Number the steps if possible. Include the person, system, decision, and output for each step.",
  },
  {
    id: "decisions",
    question: "Where are decisions made, and what determines each path?",
    help: "Describe approval limits, matching rules, eligibility rules, or other conditions.",
  },
  {
    id: "exceptions",
    question:
      "What commonly goes wrong or causes the work to be delayed or repeated?",
    help: "Include missing information, errors, rejections, escalations, and rework.",
  },
  {
    id: "timing",
    question:
      "How long does one transaction take, including active work and waiting?",
    help: "An estimate or range is fine. Distinguish hands-on time from queue or waiting time.",
  },
  {
    id: "quality",
    question:
      "What percentage of transactions require correction, rework, or exception handling?",
    help: "Provide an estimate if an exact measurement is unavailable.",
  },
  {
    id: "controls",
    question:
      "Which approvals, reviews, evidence, or access controls must be preserved?",
    help: "Include audit, privacy, regulatory, and separation-of-duty requirements.",
  },
  {
    id: "stability",
    question:
      "How stable are the process, business rules, and supporting systems?",
    help: "Mention planned policy changes, upgrades, migrations, or replacements.",
  },
  {
    id: "data",
    question: "Are the primary inputs digital and consistently structured?",
    help: "For example: standard forms and system records versus email text, scans, or varying documents.",
  },
  {
    id: "objective",
    question:
      "Should Primo focus on process improvement, automation, or evaluate both?",
    help: "Process improvement is always considered first. Technology is recommended only when it adds value.",
  },
];
export const smeQuestions: Question[] = [
  {
    id: "trigger",
    question: "What exactly triggers the process?",
    help: "Describe the event and the information required to begin.",
  },
  {
    id: "first",
    question: "What is the first action after the process begins?",
    help: "Include who performs it and which system they use.",
  },
  {
    id: "steps",
    question: "Please walk me through the normal process, one step at a time.",
    help: "Include actions, roles, systems, decisions, handoffs, and outputs.",
  },
  {
    id: "decisions",
    question: "Where are decisions made, and what determines each path?",
    help: "State the business rule behind each decision.",
  },
  {
    id: "exceptions",
    question: "What can prevent the process from completing normally?",
    help: "Describe missing information, errors, rejected items, escalations, and rework.",
  },
  {
    id: "handoffs",
    question: "When does responsibility move to another person or team?",
    help: "Explain how work is transferred and how long it usually waits.",
  },
  {
    id: "timing",
    question: "How long does one transaction take when no exception occurs?",
    help: "Separate active work time from waiting time when possible.",
  },
  {
    id: "quality",
    question: "What are the current error, rework, or exception rates?",
    help: "An estimate or range is acceptable.",
  },
  {
    id: "sla",
    question: "Are there service-level or turnaround targets?",
    help: "Include the target and how often the process currently meets it.",
  },
  {
    id: "controls",
    question:
      "Which reviews, approvals, evidence, or access controls must be preserved?",
    help: "Include policy, audit, regulatory, privacy, or separation-of-duty requirements.",
  },
  {
    id: "validation",
    question: "Who must review and approve the current-state process map?",
    help: "Primo will route the model for validation before diagnosis.",
  },
];
export const processes = [
  {
    name: "Vendor Invoice Review",
    dept: "Finance",
    stage: "SME Discovery",
    health: 62,
    ready: 48,
    owner: "Maya Chen",
  },
  {
    name: "Employee Access Provisioning",
    dept: "IT Operations",
    stage: "PI Review",
    health: 74,
    ready: 69,
    owner: "James Cole",
  },
  {
    name: "Customer Address Change",
    dept: "Customer Service",
    stage: "Ready for PrimeOne",
    health: 91,
    ready: 88,
    owner: "Alicia Reed",
  },
  {
    name: "Mortgage Document Intake",
    dept: "Lending",
    stage: "Product Owner Intake",
    health: 0,
    ready: 0,
    owner: "David King",
  },
];
