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

export const landingEvidenceNotes = [
  {
    title: 'Offer → One treatment',
    text: 'Visible now: a broad hair and beauty proposition. Proposed campaign adaptation: name one treatment and its intended audience; match the promise made by the incoming link.',
  },
  {
    title: 'Evidence → Relevant, verified detail',
    text: 'Visible now: studio imagery and demo trust labels. For a campaign, retain only evidence the business can substantiate and put it beside the offer. Screenshot ratings and review counts are not verified proof.',
  },
  {
    title: 'Questions → Explain the commitment',
    text: 'Proposed: state what the request includes, what is still subject to availability, and how a person will confirm it. Do not infer these answers from the image.',
  },
  {
    title: 'Action → Request an appointment',
    text: 'Visible now: appointment and call actions plus full-site navigation. Proposed: prioritize one appointment-request action, reduce competing destinations and explain the confirmation step. This adaptation is not built or measured.',
  },
] as const;

export const landingFit = [
  [
    'One service offer',
    'A campaign or ad about that same service',
    'Request an inquiry',
    'Service-specific scope and genuine evidence',
  ],
  [
    'A product launch',
    'An announcement or relevant campaign link',
    'Request access',
    'Availability, demonstration and access terms',
  ],
  [
    'An event or waitlist',
    'An invitation or registration campaign',
    'Register interest',
    'Participation details and a concise request',
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
