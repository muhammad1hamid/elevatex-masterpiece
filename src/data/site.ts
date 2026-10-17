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

/** Homepage search and social metadata; the visible brand proposition stays above. */
export const homepageMetadata = {
  title: 'ElevateX — Web Development, AI Automation & Chatbots',
  description:
    'ElevateX builds premium websites, landing pages, AI automation systems, and chatbots that help businesses communicate clearly and simplify everyday workflows.',
  image: {
    src: '/images/social/elevatex-homepage.png',
    alt: 'ElevateX — Premium Digital Systems For Serious Growth. Web Development, AI Automation, AI Chatbots, and Landing Pages.',
    width: 1200,
    height: 630,
  },
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
export const staticPages = [
  { path: '/', indexable: false },
  { path: '/services/web-development/', indexable: true },
  { path: '/services/ai-automation/', indexable: true },
  { path: '/services/ai-chatbots/', indexable: true },
  { path: '/services/landing-pages/', indexable: true },
  { path: '/work/', indexable: true },
  { path: '/about/', indexable: true },
  // Frontend preview only; enable indexing after inquiry delivery is ready.
  { path: '/contact/', indexable: false },
] as const;
