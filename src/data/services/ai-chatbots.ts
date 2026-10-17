import type { ServiceFAQItem } from './types';

export const aiChatbots = {
  path: '/services/ai-chatbots/',
  title: 'AI Chatbot Development Services for Businesses',
  description:
    'ElevateX builds AI chatbots for websites and supported messaging channels to answer questions, qualify inquiries, connect workflows, and support human handoff.',
  heading: 'Conversations that do more than just reply.',
  supporting:
    'ElevateX builds AI chatbot experiences that can understand common requests, collect useful information, guide customers, and connect conversations with the next business action.',
  image: {
    src: '/images/social/ai-chatbots.png',
    alt: 'ElevateX AI Chatbots — conversation, context, and a considered next step.',
    width: 1200,
    height: 630,
  },
} as const;

export const conversation = [
  {
    role: 'Customer',
    text: 'Hi, I run a beauty salon and need a new website. Can you tell me what I need?',
    label: 'The request',
    intent: 'New project',
    business: 'Beauty salon',
    requirement: 'Business website',
    details: 'Booking needs and existing tools are not yet known.',
    next: 'Ask what the website needs to support.',
  },
  {
    role: 'ElevateX assistant',
    text: 'Absolutely. Do you mainly need the site to showcase services, take booking requests, or both? And do you already use a booking tool?',
    label: 'A useful question',
    intent: 'Clarify the website scope',
    business: 'Beauty salon',
    requirement: 'Services, booking requests, or both',
    details: 'One focused question about the experience and existing tools.',
    next: 'Wait for the customer’s context.',
  },
  {
    role: 'Customer',
    text: 'Both. We want to show our treatments and let people request an appointment. We currently confirm appointments by phone.',
    label: 'Context collected',
    intent: 'New project',
    business: 'Beauty salon',
    requirement: 'Service pages + appointment requests',
    details:
      'Appointments are currently confirmed by phone. No booking integration is confirmed.',
    next: 'Summarize the need and offer a human follow-up.',
  },
  {
    role: 'ElevateX assistant',
    text: 'That gives us a clear starting point: treatment pages and an appointment-request flow, with your team confirming availability. Would you like to share a preferred contact method so someone at ElevateX can discuss the scope?',
    label: 'A considered next step',
    intent: 'Website project inquiry',
    business: 'Beauty salon',
    requirement: 'Treatment pages + appointment-request flow',
    details:
      'Human confirmation stays in the process. Contact details have not been collected.',
    next: 'Offer a human follow-up; wait for the customer’s agreement.',
  },
] as const;

export const chatbotCapabilities = [
  {
    verb: 'Answer',
    title: 'Common questions',
    text: 'Use approved FAQs, service details, product information or menus to answer appropriate questions.',
  },
  {
    verb: 'Guide',
    title: 'A clearer choice',
    text: 'Help visitors explore services, relevant pages, or appointment options without inventing availability.',
  },
  {
    verb: 'Collect',
    title: 'Useful context',
    text: 'Ask focused questions, qualify an inquiry, and structure relevant details for follow-up.',
  },
  {
    verb: 'Route',
    title: 'The right destination',
    text: 'Organize support requests and direct them to a suitable team or agreed workflow.',
  },
  {
    verb: 'Escalate',
    title: 'Human judgment',
    text: 'Recognize defined handoff situations and pass along the conversation context.',
  },
  {
    verb: 'Trigger',
    title: 'An agreed action',
    text: 'Prepare an inquiry or order draft and connect supported business actions after required checks.',
  },
] as const;

export const handoffPaths = [
  ['Normal question', 'Answer from approved information'],
  ['Unclear request', 'Ask a focused clarification'],
  ['High-value inquiry', 'Offer a follow-up with a person'],
  ['Sensitive issue', 'Pause and hand over context'],
  ['Understanding fails', 'Explain the limit and offer another route'],
] as const;

export const chatbotProcess = [
  ['Define', 'Clarify what the chatbot should and should not do.'],
  [
    'Map',
    'Map expected conversations, intents, required information, and handoff paths.',
  ],
  [
    'Ground',
    'Prepare approved source material and the instructions for using it.',
  ],
  ['Connect', 'Connect the required channels and supported business systems.'],
  [
    'Test',
    'Check expected conversations, missing context, unclear requests, and escalation.',
  ],
  [
    'Launch & improve',
    'Deploy and refine agreed areas as usage and business requirements change.',
  ],
] as const;

export const chatbotDeliverables = [
  [
    'Conversation',
    'Conversation planning · Intent mapping · Chatbot interface',
  ],
  ['Context', 'Knowledge and content preparation · System instructions'],
  ['Logic', 'Validation · Conversation testing · Defined boundaries'],
  ['Integrations', 'Website or messaging integration · Lead/data capture'],
  ['Action', 'Workflow connections · Deployment · Documentation'],
  ['Handoff', 'Human handoff logic · Agreed support'],
] as const;

export const chatbotFAQs: readonly ServiceFAQItem[] = [
  {
    id: 'chatbot-question-1',
    question: 'What can an AI chatbot do for my business?',
    answer:
      'An AI chatbot can help with repeatable conversations such as answering appropriate questions, collecting information, qualifying inquiries, guiding users, organizing requests, and routing conversations toward a useful next step. The exact capabilities depend on the business process and integrations involved.',
  },
  {
    id: 'chatbot-question-2',
    question: 'Can the chatbot use information from my website?',
    answer:
      'Yes, chatbot responses can be designed around approved website content or other suitable information sources. The quality of the experience depends on how clearly that information is structured, maintained, and made available to the system.',
  },
  {
    id: 'chatbot-question-3',
    question: 'Can you build a chatbot for WhatsApp?',
    answer:
      'WhatsApp-based chatbot workflows can be developed when the required platform access, account setup, and integration method are available. The exact capabilities depend on the project and WhatsApp platform requirements.',
  },
  {
    id: 'chatbot-question-4',
    question: 'Can a chatbot capture leads?',
    answer:
      'Yes. A chatbot can collect relevant information during a conversation and structure it for a follow-up process, form, spreadsheet, CRM, or other supported workflow.',
  },
  {
    id: 'chatbot-question-5',
    question: 'Can a chatbot connect to a CRM or database?',
    answer:
      'It can when the required system provides an appropriate integration method such as an API, webhook, or supported connector. We review the existing systems before defining how data should move between them.',
  },
  {
    id: 'chatbot-question-6',
    question: 'What happens when the chatbot does not know the answer?',
    answer:
      'A well-designed chatbot should have clear fallback behavior. It can ask for clarification, explain that it does not have enough information, direct the user to another resource, or hand the conversation to a person when appropriate.',
  },
  {
    id: 'chatbot-question-7',
    question: 'Can a human take over the conversation?',
    answer:
      'Yes. Human handoff can be designed into the conversation for selected situations such as complex questions, sensitive requests, high-value leads, or cases where the chatbot cannot respond reliably.',
  },
  {
    id: 'chatbot-question-8',
    question: 'Can the chatbot remember previous messages?',
    answer:
      'A chatbot can maintain relevant context within a conversation, and some projects may support longer-term conversation or customer context depending on the technical architecture, privacy requirements, and data-storage approach.',
  },
  {
    id: 'chatbot-question-9',
    question: 'How much does an AI chatbot cost?',
    answer:
      'Pricing depends on the conversation complexity, channels, knowledge sources, integrations, workflow actions, AI usage, testing requirements, and support scope. Once the use case is clear, ElevateX can define the project and provide an appropriate estimate.',
  },
  {
    id: 'chatbot-question-10',
    question: 'How long does a chatbot take to build?',
    answer:
      'The timeline depends on the number of conversation paths, information sources, integrations, platform access, testing requirements, and overall scope. The expected timeline is defined after the use case and technical requirements are understood.',
  },
  {
    id: 'chatbot-question-11',
    question: 'Does a chatbot need ongoing maintenance?',
    answer:
      'Some chatbot systems need occasional updates as business information, prompts, APIs, integrations, or conversation patterns change. Any ongoing monitoring or support should be agreed as part of the project scope.',
  },
  {
    id: 'chatbot-question-12',
    question: 'How do I start?',
    answer:
      'Start by explaining which conversations your business handles repeatedly, where those conversations happen, and what you want to happen after the customer sends a message. ElevateX can then help identify the most useful chatbot approach.',
  },
];
