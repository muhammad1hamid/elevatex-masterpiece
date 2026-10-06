/** Verified brand facts only. Add contact/person/social fields after confirmation. */
export const site = {
  name: 'ElevateX',
  origin: 'https://www.elevatexlab.com',
  language: 'en',
  locale: 'en_US',
  headline: 'Premium Digital Systems For Serious Growth.',
  description:
    'We help ambitious businesses grow with high-converting websites, AI systems, and smart chatbots.',
} as const;

export const serviceSlugs = [
  'web-development',
  'ai-automation',
  'ai-chatbots',
  'landing-pages',
] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];
export const services: ReadonlyArray<{ slug: ServiceSlug; name: string }> = [
  { slug: 'web-development', name: 'Web Development' },
  { slug: 'ai-automation', name: 'AI Automation' },
  { slug: 'ai-chatbots', name: 'AI Chatbots' },
  { slug: 'landing-pages', name: 'Landing Pages' },
];

/** Set indexable only after that page has approved, useful public content. */
export const staticPages = [{ path: '/', indexable: false }] as const;
