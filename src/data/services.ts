import { services, type ServiceSlug } from './site';

export type ServiceVisual = 'website' | 'workflow' | 'conversation' | 'landing';
interface ServiceDetail {
  eyebrow: string;
  description: string;
  visualType: ServiceVisual;
}

const details: Record<ServiceSlug, ServiceDetail> = {
  'web-development': {
    eyebrow: 'Digital experiences',
    description:
      'We build premium, responsive websites that help businesses stand out, communicate clearly, and turn visitors into potential customers.',
    visualType: 'website',
  },
  'ai-automation': {
    eyebrow: 'Intelligent workflows',
    description:
      'Connect your tools, automate repetitive tasks, and create smarter workflows that save time and keep your business moving.',
    visualType: 'workflow',
  },
  'ai-chatbots': {
    eyebrow: 'Customer conversations',
    description:
      'Give customers faster answers with intelligent website and WhatsApp chatbots built for inquiries, lead capture, and customer support.',
    visualType: 'conversation',
  },
  'landing-pages': {
    eyebrow: 'Conversion experiences',
    description:
      'Focused landing pages designed to communicate your offer, capture qualified interest, and guide visitors toward a clear next step.',
    visualType: 'landing',
  },
};

/** Detail routes are reserved for the service-page phase, not published yet. */
export const serviceOverview = services.map(({ slug, name }, index) => ({
  slug,
  title: name,
  number: String(index + 1).padStart(2, '0'),
  ...details[slug],
  plannedHref: `/services/${slug}/`,
  href: '/contact/',
  ctaLabel: `Discuss ${name}`,
}));

export type ServicePanelContent = (typeof serviceOverview)[number];
