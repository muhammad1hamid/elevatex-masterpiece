/** Editorial About content: no inferred dates, office, staff or business results. */
export const aboutMetadata = {
  title: 'About — Websites, AI & Digital Systems',
  description:
    'Meet Hamid, the founder of ElevateX, and explore the thinking behind its websites, AI automation, chatbots and digital experiences.',
  path: '/about/',
  image: {
    src: '/images/social/elevatex-about.png',
    alt: 'ElevateX About cover with the words Built with intention and an illustrated architectural design workspace.',
    width: 1200,
    height: 630,
  },
} as const;

export const aboutStory = [
  'ElevateX brings design, development and automation together. The aim is to build digital experiences and systems that look considered, communicate clearly and make sense for the business using them.',
  'Some projects need a stronger website. Others need repetitive work simplified, better customer conversations or a more focused landing experience. The work starts by understanding the problem.',
] as const;

export const aboutThinking = [
  {
    title: 'Understand the need',
    text: 'Start with the people, the business and the problem the work needs to solve.',
  },
  {
    title: 'Design with purpose',
    text: 'Give information a clear structure. Make every visual choice earn its place.',
  },
  {
    title: 'Build with care',
    text: 'Connect the design to practical functionality and a usable experience.',
  },
  {
    title: 'Improve through testing',
    text: 'Review the details across screens, interactions and real use cases.',
  },
] as const;

export const aboutWorkflow = [
  {
    title: 'Discover',
    text: 'Understand the goals, audience and practical constraints.',
  },
  {
    title: 'Structure',
    text: 'Map the content, user journey and system requirements.',
  },
  {
    title: 'Design',
    text: 'Shape the visual direction and the way people move through it.',
  },
  {
    title: 'Develop',
    text: 'Build the interface and connect the functionality the project needs.',
  },
  {
    title: 'Refine',
    text: 'Test, review and improve the details before the next step.',
  },
] as const;

export const aboutPrinciples = [
  {
    title: 'Clarity over complexity',
    text: 'The right solution should make things easier to understand and use.',
  },
  {
    title: 'Design with purpose',
    text: 'Visual choices should support the message and what the visitor needs to do.',
  },
  {
    title: 'Practical technology',
    text: 'Technology is valuable when it solves a problem or improves how work gets done.',
  },
  {
    title: 'Craft in the details',
    text: 'Typography, spacing, responsiveness, interaction and implementation all matter.',
  },
] as const;

export const aboutCapabilities = [
  {
    slug: 'web-development',
    title: 'Web Development',
    text: 'Considered websites with a clear structure, useful functionality and room to grow.',
  },
  {
    slug: 'ai-automation',
    title: 'AI Automation',
    text: 'Connected workflows that simplify repetitive tasks and keep people in control.',
  },
  {
    slug: 'ai-chatbots',
    title: 'AI Chatbots',
    text: 'Purposeful conversations, grounded answers and a clear route to human support.',
  },
  {
    slug: 'landing-pages',
    title: 'Landing Pages',
    text: 'Focused experiences built around one audience, one offer and a clear next step.',
  },
] as const;

/** Curated collection IDs; previews and classification remain collection-owned. */
export const aboutProjectIds = ['qadeer-jewellers', 'infinity-salon'] as const;
