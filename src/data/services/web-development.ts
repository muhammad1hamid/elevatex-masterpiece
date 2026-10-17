import type { ServiceFAQItem } from './types';

interface ContentItem {
  readonly title: string;
  readonly description: string;
}

export type WebsiteVisual =
  'business' | 'landing' | 'portfolio' | 'service' | 'redesign';

interface WebsiteType extends ContentItem {
  readonly visual: WebsiteVisual;
}

export interface WebProjectStory {
  readonly brief: string;
  readonly direction: string;
  readonly implementation: string;
}

interface DeliverableGroup {
  readonly title: string;
  readonly items: readonly string[];
}

export const webDevelopment = {
  path: '/services/web-development/',
  title: 'Web Development Services for Modern Businesses',
  description:
    'ElevateX designs and develops responsive business websites with clear journeys, considered design, performance, and technical SEO foundations. Explore our approach.',
  heading: 'Websites built to look exceptional. And work even better.',
  supporting:
    'ElevateX designs and develops modern websites built around your business, your audience, and the actions you want visitors to take — with careful attention to design, performance, responsiveness, and technical quality.',
  image: {
    src: '/images/social/web-development.png',
    alt: 'ElevateX Web Development with a responsive website browser composition.',
    width: 1200,
    height: 630,
  },
  indexable: true,
} as const;

export const websiteProblems = [
  {
    title: 'Unclear messaging',
    description:
      'Visitors struggle to understand the offer, who it is for, or why it matters.',
  },
  {
    title: 'Weak conversion paths',
    description:
      'The next step is buried, competing calls to action create friction, or key questions go unanswered.',
  },
  {
    title: 'Poor mobile experience',
    description:
      'Crowded layouts, difficult navigation, and small controls make everyday browsing harder.',
  },
  {
    title: 'Slow performance',
    description:
      'Heavy media and unnecessary scripts delay useful content and interaction.',
  },
  {
    title: 'Outdated visual design',
    description:
      'Inconsistent typography, imagery, and page hierarchy make the business harder to understand.',
  },
  {
    title: 'Hard-to-maintain structure',
    description:
      'Simple content changes become difficult when the website lacks a clear, reusable structure.',
  },
] as const satisfies readonly ContentItem[];

export const websiteTypes = [
  {
    title: 'Business websites',
    description:
      'Multi-page websites that explain what your business does, organize its offer, and guide visitors toward a relevant next step.',
    visual: 'business',
  },
  {
    title: 'Landing pages',
    description:
      'Focused pages built around one offer, campaign, product, or action, with a clear message and a deliberate visitor journey.',
    visual: 'landing',
  },
  {
    title: 'Portfolio & personal brand websites',
    description:
      'A considered presence for founders, professionals, and creators, bringing selected work, expertise, and contact paths together.',
    visual: 'portfolio',
  },
  {
    title: 'Service business websites',
    description:
      'Websites that explain services, answer buyer questions, present relevant work, and make enquiries straightforward.',
    visual: 'service',
  },
  {
    title: 'Website redesigns',
    description:
      'A review of an existing website followed by agreed improvements to its structure, presentation, usability, and technical foundation.',
    visual: 'redesign',
  },
] as const satisfies readonly WebsiteType[];

/** Stories describe the verified concepts; no client outcomes or project stacks are inferred. */
export const webProjectStories: Readonly<Record<string, WebProjectStory>> = {
  'qadeer-jewellers': {
    brief:
      'A jewellery website concept connecting collection browsing with a showroom visit.',
    direction:
      'Dark backgrounds, gold jewellery photography, and generous editorial typography keep the collections at the centre of the experience.',
    implementation:
      'Gold, diamond, and bridal collections, galleries, and showroom visit calls to action.',
  },
  'infinity-salon': {
    brief:
      'A salon website concept bringing treatments, studio imagery, and appointment enquiries into one experience.',
    direction:
      'Warm photography, a light palette, and clear service navigation establish a calm visual identity.',
    implementation:
      'Hair and beauty service information, a studio gallery, and an appointment enquiry interface.',
  },
  'apex-detailing': {
    brief:
      'An automotive website concept explaining detailing and paint protection, with a guided quote enquiry.',
    direction:
      'Dark vehicle photography, strong typographic hierarchy, and restrained gold accents frame the service offer.',
    implementation:
      'Ceramic coating and paint protection information, a transformation interface, and a guided quote enquiry.',
  },
};

export const technicalStandards = [
  {
    title: 'Responsive design',
    description:
      'Plan navigation, content hierarchy, imagery, and controls for the screens people actually use.',
  },
  {
    title: 'Performance',
    description:
      'Keep page weight and JavaScript purposeful, and measure important loading and interaction journeys where applicable.',
  },
  {
    title: 'Semantic HTML',
    description:
      'Use meaningful headings, landmarks, links, and native controls so the page has a clear underlying structure.',
  },
  {
    title: 'Accessibility',
    description:
      'Consider keyboard access, visible focus, readable contrast, useful labels, and reduced motion throughout the build.',
  },
  {
    title: 'Technical SEO',
    description:
      'Plan metadata, crawlable content, canonical URLs, internal links, and appropriate structured data within the agreed scope.',
  },
  {
    title: 'Optimized media',
    description:
      'Choose suitable formats and responsive image sizes, reserve layout space, and defer media that is not needed immediately.',
  },
  {
    title: 'Maintainable architecture',
    description:
      'Keep content, components, and styles organized so agreed updates and future additions have a clear place.',
  },
  {
    title: 'Cross-browser QA',
    description:
      'Review agreed browsers, screen sizes, and key journeys before deployment, then address the issues found.',
  },
] as const satisfies readonly ContentItem[];

export const deliverableGroups = [
  {
    title: 'Strategy',
    items: [
      'Business, audience, and website goal discovery',
      'Functionality, requirements, and scope definition',
    ],
  },
  {
    title: 'Structure',
    items: [
      'Page hierarchy and navigation planning',
      'Content structure and key visitor journeys',
    ],
  },
  {
    title: 'Interface',
    items: [
      'Visual direction and interface design',
      'Responsive layouts and interaction patterns',
    ],
  },
  {
    title: 'Development',
    items: [
      'Front-end implementation and reusable components',
      'Forms and integrations agreed in the project scope',
    ],
  },
  {
    title: 'Optimization',
    items: [
      'Media and performance optimization',
      'Core technical SEO foundations',
      'Agreed device, browser, and journey checks',
    ],
  },
  {
    title: 'Launch',
    items: [
      'Deployment and domain connection',
      'Project handoff and agreed launch support',
    ],
  },
] as const satisfies readonly DeliverableGroup[];

export const technologyApproach = [
  {
    title: 'Content',
    description:
      'Structured content keeps pages consistent. If regular updates matter, an appropriate CMS can be planned for the content you need to manage.',
  },
  {
    title: 'Interface',
    description:
      'HTML, CSS, and TypeScript provide a clear foundation. For suitable websites, Astro delivers the pages as HTML with JavaScript added for specific interactions.',
  },
  {
    title: 'Connections',
    description:
      'Forms, booking tools, and APIs are selected around the required workflow. Each connection depends on the service, access, and agreed scope.',
  },
  {
    title: 'Delivery',
    description:
      'Hosting is chosen around the site’s technical needs and ownership arrangement. Cloudflare static hosting is an option for suitable builds.',
  },
] as const satisfies readonly ContentItem[];

export const webDevelopmentFAQs = [
  {
    id: 'website-cost',
    question: 'How much does a website cost?',
    answer:
      'Website pricing depends on the number of pages, design requirements, functionality, integrations, content needs, and level of customization. Once the scope is clear, ElevateX can recommend an appropriate approach and provide a project estimate.',
  },
  {
    id: 'website-timeline',
    question: 'How long does a website project take?',
    answer:
      'The timeline depends on project size, content readiness, design complexity, integrations, and feedback. A focused landing page can move more quickly than a larger custom website, so the expected timeline is defined after the scope is understood.',
  },
  {
    id: 'existing-website-redesign',
    question: 'Can you redesign my current website?',
    answer:
      'Yes. ElevateX can review an existing website and improve its structure, usability, visual design, responsiveness, performance, and conversion paths. A redesign can preserve elements that still work rather than rebuilding every part.',
  },
  {
    id: 'mobile-website',
    question: 'Will the website work properly on mobile?',
    answer:
      'Responsive behavior is part of the website’s design and development. Layouts, navigation, content hierarchy, imagery, and interactive elements are designed and tested across the relevant screen sizes agreed for the project.',
  },
  {
    id: 'technical-seo',
    question: 'Do you handle SEO?',
    answer:
      'Web projects can include technical SEO foundations such as semantic structure, metadata, crawlability, internal linking, sitemap support, and appropriate structured data. Performance and mobile usability are also considered. These foundations support discovery; ongoing search strategy requires separate planning, and rankings are not guaranteed.',
  },
  {
    id: 'website-updates',
    question: 'Can I update the website myself?',
    answer:
      'That depends on how the project is built. When regular content updates are important, ElevateX can plan an appropriate content-management approach for selected parts of the website. A CMS and the content it manages are agreed in the project scope.',
  },
  {
    id: 'website-hosting',
    question: 'Do you provide hosting?',
    answer:
      'Hosting and deployment can be planned as part of the project. The setup depends on the website’s technical requirements, expected traffic, integrations, and preferred ownership arrangement. Hosting costs and responsibilities are defined with the scope.',
  },
  {
    id: 'existing-domain',
    question: 'Can you work with my existing domain?',
    answer:
      'Yes, an existing domain can usually be connected to the new website during deployment. The steps depend on where the domain is registered and how its DNS and email services are configured. Those dependencies are reviewed before changes are made.',
  },
  {
    id: 'website-integrations',
    question:
      'Can you integrate forms, booking tools, or third-party services?',
    answer:
      'Yes, where the service and project requirements support it. Websites can connect with forms, booking platforms, CRM tools, APIs, and other external services. Availability depends on the service’s API or embed options, required access, and the agreed scope.',
  },
  {
    id: 'start-website-project',
    question: 'How do I start a website project?',
    answer:
      'Start by sharing what you want to build or improve, what the website needs to achieve, and any important functionality or deadlines. ElevateX can then review the requirements and recommend a suitable next step. Use Start a Website Project to reach the contact page.',
  },
] as const satisfies readonly ServiceFAQItem[];
