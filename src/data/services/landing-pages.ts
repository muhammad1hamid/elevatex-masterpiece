import type { ServiceFAQItem } from './types';

export const landingPages = {
  path: '/services/landing-pages/',
  title: 'Landing Page Design & Development Services',
  description:
    'ElevateX designs and develops focused landing pages with clear messaging, responsive design, and a deliberate path from your offer to the next action.',
  heading: 'One page. One clear goal. Built around action.',
  supporting:
    'ElevateX designs and develops focused landing pages that combine clear messaging, strong visual hierarchy, responsive design, and a deliberate path toward the action that matters.',
  image: {
    src: '/images/social/landing-pages.png',
    alt: 'ElevateX Landing Pages — one page, one clear goal, built around action.',
    width: 1200,
    height: 630,
  },
} as const;

export const anatomy = [
  [
    'Hook',
    'Make the offer immediately clear.',
    'Answer “What is this, and why should I care?” with a specific headline and a useful first screen.',
  ],
  [
    'Context / problem',
    'Start from the visitor’s situation.',
    'Explain the problem or need the offer addresses, in language the intended audience recognizes.',
  ],
  [
    'Value',
    'Show what the offer changes.',
    'Connect relevant features to practical benefits without promising an outcome you cannot support.',
  ],
  [
    'Proof',
    'Give the message a foundation.',
    'Use legitimate examples, demonstrations, or verified evidence where available. Leave unsupported claims out.',
  ],
  [
    'Offer',
    'Make the decision concrete.',
    'Explain what is included, who it is for, and the important boundaries of the offer.',
  ],
  [
    'Objection handling',
    'Resolve the remaining questions.',
    'Address the uncertainties that matter before someone commits: fit, scope, process, and next steps.',
  ],
  [
    'CTA',
    'Make one next step obvious.',
    'Use a clear action label and an appropriate destination. Ask only for information needed at this stage.',
  ],
] as const;

export const journey = [
  [
    'Visitor arrives',
    'A familiar starting point.',
    'Match the page to the campaign or link that brought the visitor here.',
    'The promise carries through.',
  ],
  [
    'Understands the offer',
    'Clarity before complexity.',
    'State what is offered, who it is for, and what makes it relevant.',
    'The headline does its job.',
  ],
  [
    'Sees why it matters',
    'Value with a purpose.',
    'Connect the offer to a need the visitor actually has.',
    'Benefits have context.',
  ],
  [
    'Finds proof',
    'A reason to believe.',
    'Place legitimate evidence close to the claims it supports.',
    'Evidence answers doubt.',
  ],
  [
    'Resolves questions',
    'Less uncertainty.',
    'Explain the scope and answer the questions that affect the decision.',
    'Important details stay visible.',
  ],
  [
    'Takes action',
    'A clear next step.',
    'Keep the main action easy to find and explain what happens afterward.',
    'The journey has a destination.',
  ],
] as const;

export const useCases = [
  [
    'Lead generation',
    'A relevant inquiry',
    'Visitors evaluating a specific service',
    'Send an inquiry',
    'Clear offer, legitimate proof, and a concise inquiry flow.',
  ],
  [
    'Service campaigns',
    'Interest in one offer',
    'People arriving from a focused campaign',
    'Discuss the service',
    'Message continuity, service scope, and useful answers.',
  ],
  [
    'Product launches',
    'Explain a new product',
    'Prospective users discovering the product',
    'Request access',
    'Product context, a demonstration, and availability details.',
  ],
  [
    'Paid advertising',
    'A focused campaign destination',
    'Visitors responding to an ad',
    'Take the agreed campaign action',
    'Ad-to-page consistency, mobile clarity, and relevant measurement.',
  ],
  [
    'Events & early access',
    'An informed registration',
    'People considering an event or waitlist',
    'Register interest',
    'A clear proposition, participation details, and a short form.',
  ],
] as const;

export const landingProcess = [
  [
    'Clarify',
    'Understand the offer, audience, campaign goal, and primary action.',
  ],
  [
    'Structure',
    'Plan what the visitor needs to understand before taking action.',
  ],
  [
    'Write / refine',
    'Organize the headline, value, proof, objections, and CTA. The level of copy support is agreed in scope.',
  ],
  [
    'Design',
    'Build the visual hierarchy around the content and desired action.',
  ],
  [
    'Build',
    'Develop the responsive page and the agreed forms or supported integrations.',
  ],
  [
    'Test & launch',
    'Check key journeys, responsive behavior, forms, performance, and agreed tracking before launch.',
  ],
] as const;

export const landingDeliverables = [
  ['Goal', 'Offer discovery · Audience clarification · Primary action'],
  ['Message', 'Content hierarchy · Agreed copy refinement'],
  ['Structure', 'Page sequence · Offer, proof, and questions'],
  ['Design', 'Visual direction · Responsive layouts'],
  ['Build', 'Development · Forms · Supported integrations · Technical SEO'],
  ['Measure', 'Analytics readiness · Testing · Deployment · Handoff'],
] as const;

export const landingFAQs: readonly ServiceFAQItem[] = [
  {
    id: 'landing-question-1',
    question:
      'What is the difference between a landing page and a normal website?',
    answer:
      'A website usually supports multiple goals, pages, and visitor journeys. A landing page is more focused — it is built around a specific audience, offer, campaign, or action and intentionally reduces unnecessary navigation or competing decisions.',
  },
  {
    id: 'landing-question-2',
    question: 'How long should a landing page be?',
    answer:
      'There is no single ideal length. The page should be long enough to explain the offer, provide the proof and context a visitor needs, address important questions, and make the next action clear without adding unnecessary content.',
  },
  {
    id: 'landing-question-3',
    question: 'Can ElevateX help with the copy?',
    answer:
      'ElevateX can help organize and refine the page messaging so the headline, value proposition, supporting sections, and calls to action work together clearly. The exact level of copywriting or content support depends on the project scope.',
  },
  {
    id: 'landing-question-4',
    question: 'Can a landing page work with my existing domain?',
    answer:
      'Yes. A landing page can usually be published on an existing domain or subdomain depending on the current hosting, DNS setup, and technical architecture.',
  },
  {
    id: 'landing-question-5',
    question: 'Can you connect forms, WhatsApp, CRM, or booking tools?',
    answer:
      'Supported forms, messaging links, CRM systems, booking platforms, APIs, and other services can be integrated where the required technical access or integration method is available. The exact setup depends on the tools involved.',
  },
  {
    id: 'landing-question-6',
    question: 'Are landing pages good for SEO?',
    answer:
      'Landing pages can be search-friendly when they contain useful content, clear structure, appropriate metadata, strong technical foundations, and match genuine search intent. Pages created only for advertising may follow a different strategy from pages intended to rank organically.',
  },
  {
    id: 'landing-question-7',
    question: 'Can you build landing pages for paid advertising campaigns?',
    answer:
      'Yes. Landing pages can be designed around a specific campaign, offer, audience, and conversion action so the experience is more focused than sending ad traffic to a general website page.',
  },
  {
    id: 'landing-question-8',
    question: 'Will the landing page work on mobile?',
    answer:
      'Yes. Responsive behavior is part of the landing-page experience. Content hierarchy, typography, imagery, forms, and calls to action should be adapted and tested for relevant mobile screen sizes rather than simply shrinking the desktop layout.',
  },
  {
    id: 'landing-question-9',
    question: 'Can analytics and conversion tracking be added?',
    answer:
      'Yes, where required. The page can be prepared to measure agreed actions such as CTA clicks, form submissions, campaign sources, and other useful conversion events using appropriate analytics or tracking tools.',
  },
  {
    id: 'landing-question-10',
    question: 'How much does a landing page cost?',
    answer:
      'Pricing depends on strategy, content requirements, design complexity, functionality, integrations, tracking requirements, and the level of customization involved. Once the scope is clear, ElevateX can provide an appropriate project estimate.',
  },
  {
    id: 'landing-question-11',
    question: 'How long does it take to build a landing page?',
    answer:
      'The timeline depends on content readiness, design complexity, feedback, integrations, and the level of strategy involved. A focused page can move more quickly than a larger custom website, but the expected timeline should be defined after the project scope is understood.',
  },
  {
    id: 'landing-question-12',
    question: 'How do I start?',
    answer:
      'Start by sharing the offer, audience, campaign or business goal, and the action you want visitors to take. ElevateX can then help define the structure and scope of the landing page.',
  },
];
