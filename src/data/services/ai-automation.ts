import type { ServiceFAQItem } from './types';

export const aiAutomation = {
  path: '/services/ai-automation/',
  title: 'AI Automation Services for Businesses',
  description:
    'ElevateX builds practical AI automation systems that connect tools, reduce repetitive work, organize information, and help business workflows move efficiently.',
  heading: 'Turn repetitive work into systems that run smarter.',
  supporting:
    'ElevateX designs practical AI-powered workflows that help businesses handle repetitive tasks, organize information, connect tools, and move routine processes forward more efficiently.',
  image: {
    src: '/images/social/ai-automation.png',
    alt: 'ElevateX AI automation workflow: receive an input, validate a decision and coordinate an action, with human control.',
    width: 1200,
    height: 630,
  },
} as const;

export const automationProblems = [
  'Repeated customer questions',
  'Manual lead entry',
  'Copying data between tools',
  'Follow-ups that depend on memory',
  'Sorting incoming requests',
  'Repetitive notifications',
  'Manual status updates',
  'Routine document processing',
] as const;

export const automationCapabilities = [
  {
    title: 'Lead capture & routing',
    detail:
      'Capture an inquiry, check required fields, and route it to the right person.',
  },
  {
    title: 'Customer inquiry handling',
    detail: 'Organize incoming questions and prepare a useful next step.',
  },
  {
    title: 'Follow-up workflows',
    detail:
      'Schedule follow-ups around an agreed status, timing, and stopping rule.',
  },
  {
    title: 'CRM & data updates',
    detail: 'Keep selected records in sync through supported connections.',
  },
  {
    title: 'Internal notifications',
    detail: 'Tell the right team when a defined event needs attention.',
  },
  {
    title: 'AI-assisted information processing',
    detail:
      'Extract, classify, or summarize information for validation and review.',
  },
  {
    title: 'Website-to-business workflows',
    detail: 'Connect a website submission to the process that handles it.',
  },
  {
    title: 'Custom operational automations',
    detail: 'Design the sequence around your tools, decisions, and boundaries.',
  },
] as const;

export const inquirySteps = [
  {
    id: 'received',
    title: 'Receive the inquiry',
    kind: 'Input',
    description: 'Start with a request from a supported form or channel.',
    key: 'Example request',
    value: '“Hi, I’d like to know if you can help with a website redesign.”',
    details: [
      'Accept only the fields the workflow needs.',
      'The current website and project goals have not been supplied.',
    ],
    boundary:
      'A received request is not a qualified lead or an approved action.',
  },
  {
    id: 'intent',
    title: 'Interpret & validate',
    kind: 'AI assistance + rules',
    description:
      'Suggest an intent, extract available details, then apply explicit rules.',
    key: 'Structured context',
    value: 'Website redesign · New inquiry · Current site and scope missing',
    details: [
      'AI suggests the supported service category; it does not decide permissions.',
      'Validation preserves missing fields. Defined rules select a qualification response.',
      'Unclear intent or an unsupported request goes to review.',
    ],
    boundary:
      'Missing information stays missing; the system does not invent it.',
  },
  {
    id: 'approval',
    title: 'Review the draft',
    kind: 'Human checkpoint',
    description:
      'An authorized person checks the proposed response and next action.',
    key: 'Example draft / Not sent',
    value:
      '“Please share your current website and what you would like to improve.”',
    details: [
      'The reviewer can approve, edit or decline the draft.',
      'In this example, sending and any supported system update wait for approval.',
      'Expired approval stops the action.',
    ],
    boundary:
      'A prepared message is not a sent message. Uncertain or sensitive actions stay paused.',
  },
  {
    id: 'record',
    title: 'Make a permitted update',
    kind: 'Validated integration',
    description:
      'Only an approved, valid record may reach the connected system.',
    key: 'Proposed record',
    value:
      'Website redesign inquiry · Needs qualification · Review status attached',
    details: [
      'Check access, required fields and duplicates before a write.',
      'Confirm the connected system accepted the update.',
      'A rejected or timed-out write is not reported as successful.',
    ],
    boundary:
      'On failure, preserve the inquiry for review; retry only when safe and without creating a duplicate.',
  },
  {
    id: 'followup',
    title: 'Notify & follow up',
    kind: 'Confirmed continuation',
    description:
      'Notify the owner of the confirmed status and schedule only the agreed next step.',
    key: 'Controlled continuation',
    value:
      'Owner receives the accepted result or an exception needing attention.',
    details: [
      'Only after confirmation may an agreed follow-up be scheduled.',
      'Follow up only if no reply arrives within the agreed interval.',
      'Cancel on reply, opt-out or manual closure; failed actions return to review.',
    ],
    boundary:
      'Notification must distinguish a completed update from a failed or pending one.',
  },
] as const;

export const automationUseCases = [
  {
    title: 'Restaurant inquiries & order drafts',
    label: 'Product Demo · Illustrative',
    trigger: 'A customer sends a meal request.',
    automation:
      'Interpret the message and structure the available order details.',
    output: 'An organized order draft for the restaurant to review.',
    human:
      'Confirm items, availability, and the next action before proceeding.',
    demo: true,
  },
  {
    title: 'Lead qualification',
    label: 'Illustrative workflow',
    trigger: 'A visitor submits a form or sends an inquiry.',
    automation:
      'Extract relevant details, categorize the request, and choose the follow-up path.',
    output: 'A structured lead record with a defined next step.',
    human:
      'Review unclear requirements or requests that fall outside the agreed criteria.',
    demo: false,
  },
  {
    title: 'Customer support routing',
    label: 'Illustrative workflow',
    trigger: 'A customer asks for help through a supported channel.',
    automation:
      'Classify the request, check available context, and route it to the right queue.',
    output: 'An organized support request, ready for the next action.',
    human:
      'Handle exceptions, sensitive issues, and decisions that require judgment.',
    demo: false,
  },
] as const;

export const integrationGroups = [
  {
    title: 'Capture',
    items: 'Website forms · Email · Messaging channels',
    detail: 'Receive events through supported access and agreed permissions.',
  },
  {
    title: 'Coordinate',
    items: 'CRM systems · Google Sheets · Internal dashboards',
    detail: 'Move validated information into the tools your team uses.',
  },
  {
    title: 'Connect',
    items: 'APIs · Webhooks · Databases',
    detail:
      'Use documented interfaces with scoped access and practical limits.',
  },
] as const;

export const automationBuildStages = [
  {
    title: 'Map',
    description:
      'Understand the current workflow, people, tools, and decision points.',
    outcome: 'A shared process map',
  },
  {
    title: 'Simplify',
    description: 'Remove unnecessary steps and define what should stay manual.',
    outcome: 'Clear rules and boundaries',
  },
  {
    title: 'Connect',
    description:
      'Build the logic and connect the required systems and data sources.',
    outcome: 'A connected workflow',
  },
  {
    title: 'Test',
    description:
      'Check normal paths, missing data, failures, and human escalation.',
    outcome: 'Reviewed behavior and fallbacks',
  },
  {
    title: 'Monitor',
    description:
      'Review behavior in use and refine it where agreed support includes this.',
    outcome: 'An agreed handoff and support plan',
  },
] as const;

export const automationDeliverables = [
  { title: 'Understand', detail: 'Workflow discovery · Process mapping' },
  { title: 'Design', detail: 'Automation architecture · AI and system logic' },
  {
    title: 'Build',
    detail: 'Integrations · Validation rules · Approval points',
  },
  {
    title: 'Validate',
    detail: 'Normal-path testing · Exceptions · Human escalation',
  },
  {
    title: 'Deploy',
    detail: 'Deployment · Documentation · Handoff · Agreed support',
  },
] as const;

export const automationFAQs: readonly ServiceFAQItem[] = [
  {
    id: 'automation-capabilities',
    question: 'What can AI automation actually automate?',
    answer:
      'AI automation is most useful for repeatable workflows involving information handling, classification, communication, routing, data updates, follow-ups, or decisions that can be defined with clear rules and boundaries. The right opportunities depend on how your current process works.',
  },
  {
    id: 'automation-existing-tools',
    question: 'Can AI automation work with my existing tools?',
    answer:
      'Often, yes. Automations can connect existing tools when suitable APIs, webhooks, integrations, or other supported connection methods are available. We first review the systems you already use before recommending the architecture.',
  },
  {
    id: 'automation-software',
    question: 'Do I need to replace my current software?',
    answer:
      'Not necessarily. A useful automation may connect existing tools rather than replace them. If an existing system creates a technical limitation, that can be identified during workflow planning before implementation begins.',
  },
  {
    id: 'automation-errors',
    question: 'What happens if the AI gets something wrong?',
    answer:
      'AI output should not be treated as infallible. Workflows can include validation rules, checks against expected output, fallback paths, and human review for actions where an incorrect result would matter.',
  },
  {
    id: 'automation-approval',
    question: 'Can a human approve actions before they happen?',
    answer:
      'Yes. Human approval can be included at selected points in a workflow, such as before sending sensitive communication, updating important records, or triggering a high-impact action.',
  },
  {
    id: 'automation-whatsapp',
    question: 'Can you automate WhatsApp workflows?',
    answer:
      'WhatsApp-based workflows can be developed for suitable use cases when the required platform access and integration setup are available. The exact capabilities depend on the project, account setup, platform rules, and integration method.',
  },
  {
    id: 'automation-cost',
    question: 'How much does an AI automation project cost?',
    answer:
      'Pricing depends on the complexity of the workflow, number of systems involved, integrations, AI usage, testing requirements, and level of ongoing support. Once the process is understood, ElevateX can define the scope and provide an appropriate estimate.',
  },
  {
    id: 'automation-timeline',
    question: 'How long does an automation take to build?',
    answer:
      'The timeline depends on workflow complexity, integration access, number of systems involved, testing requirements, and how clearly the existing process is defined. The expected timeline is established after the workflow is mapped.',
  },
  {
    id: 'automation-maintenance',
    question: 'Does automation require ongoing maintenance?',
    answer:
      'Some workflows can run with minimal changes, while others may require updates when APIs, business rules, prompts, tools, or processes change. Any ongoing support should be defined as part of the project scope.',
  },
  {
    id: 'automation-start',
    question: 'How do we start?',
    answer:
      'Start by showing us the repetitive workflow you want to improve. We’ll map the current process, identify what can realistically be automated, and recommend the most appropriate next step.',
  },
];
