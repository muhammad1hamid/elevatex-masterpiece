export interface FAQEntry {
  id: string;
  number: string;
  question: string;
  answer: string;
  tags: readonly string[];
  cta?: { label: string; href: string };
  featured: boolean;
}

export const faqs: readonly FAQEntry[] = [
  {
    id: 'what-elevatex-does',
    number: '01',
    question: 'What does ElevateX actually do?',
    answer:
      'ElevateX designs and builds premium websites, landing pages, AI automation systems, and AI chatbots. We combine thoughtful design with practical engineering to create digital solutions that help businesses improve their online presence, streamline repetitive work, and create better customer experiences.',
    tags: ['Web Development', 'AI Automation', 'AI Chatbots', 'Landing Pages'],
    featured: true,
  },
  {
    id: 'who-elevatex-serves',
    number: '02',
    question: 'Who is ElevateX best suited for?',
    answer:
      'ElevateX is best suited for businesses that want a stronger digital presence, a more effective website, or practical automation around customer communication and internal workflows. The right approach depends on the business problem, so we begin by understanding what actually needs to improve.',
    tags: [],
    featured: false,
  },
  {
    id: 'website-project-timeline',
    number: '03',
    question: 'How long does a typical website project take?',
    answer:
      'Project timelines depend on the size, complexity, content, integrations, and feedback cycle involved. A focused landing page can move faster than a larger custom website, so we define the expected timeline after understanding the scope.',
    tags: [],
    featured: false,
  },
  {
    id: 'website-redesign',
    number: '04',
    question: 'Can you redesign an existing website?',
    answer:
      'Yes. ElevateX can redesign an existing website when its structure, usability, performance, visual presentation, or conversion path needs improvement. We review the current experience first and determine what should be improved, preserved, or rebuilt.',
    tags: [],
    featured: false,
  },
  {
    id: 'custom-ai-automation',
    number: '05',
    question: 'Do you build custom AI automations?',
    answer:
      'Yes. ElevateX can design AI-assisted workflows around repetitive tasks, lead handling, customer inquiries, data movement, and connected business processes. The right automation depends on the tools already in use and the workflow to improve.',
    tags: [],
    featured: false,
  },
  {
    id: 'chatbot-channels',
    number: '06',
    question: 'Can AI chatbots work with WhatsApp or websites?',
    answer:
      'Yes, depending on the project and platform requirements. ElevateX can build chatbot experiences for websites and develop WhatsApp-based conversational workflows for inquiries, lead capture, customer support, and structured ordering.',
    tags: [],
    featured: false,
  },
  {
    id: 'project-cost',
    number: '07',
    question: 'How much does a project cost?',
    answer:
      'Project pricing depends on scope, functionality, design complexity, integrations, and the level of customization required. After understanding what you need, ElevateX can recommend an appropriate approach and provide a clear project estimate.',
    tags: [],
    featured: false,
  },
  {
    id: 'after-launch',
    number: '08',
    question: 'What happens after launch?',
    answer:
      'Before launch, ElevateX reviews the final experience and important user journeys. After deployment, a project can include handoff, agreed fixes, and next-step recommendations depending on its scope and support arrangement.',
    tags: [],
    featured: false,
  },
  {
    id: 'international-projects',
    number: '09',
    question: 'Do you work with businesses outside Pakistan?',
    answer:
      'Whether ElevateX can take on a project from outside Pakistan depends on the project requirements and communication needs. Share your location and goals so we can confirm whether the working arrangement is a fit.',
    tags: [],
    featured: false,
  },
  {
    id: 'start-a-project',
    number: '10',
    question: 'How do I start a project with ElevateX?',
    answer:
      'Start by sharing what you want to build, improve, or automate. ElevateX will review the goal, understand the requirements, and identify the most appropriate next step for the project.',
    tags: [],
    cta: { label: 'Start a Project', href: '/contact/' },
    featured: false,
  },
];
