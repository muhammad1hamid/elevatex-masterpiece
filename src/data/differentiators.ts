export type DifferenceIcon =
  'target' | 'network' | 'layers' | 'messages' | 'workflow' | 'blocks';

export interface Differentiator {
  id: string;
  title: string;
  description: string;
  icon: DifferenceIcon;
}

/** Approved descriptions of our intended working approach, not outcome guarantees. */
export const differentiators: readonly Differentiator[] = [
  {
    id: 'business-first',
    title: 'Business-First Thinking',
    description:
      'We start by understanding your business, your audience, and the problem that needs solving before choosing the technology.',
    icon: 'target',
  },
  {
    id: 'tailored-solutions',
    title: 'Tailored Solutions',
    description:
      'Every project is shaped around its goals, workflows, and requirements rather than forced into a one-size-fits-all approach.',
    icon: 'network',
  },
  {
    id: 'design-engineering',
    title: 'Design Meets Engineering',
    description:
      'We bring premium visual design together with performance, usability, and practical functionality.',
    icon: 'layers',
  },
  {
    id: 'clear-communication',
    title: 'Clear Communication',
    description:
      'We aim to keep requirements, progress, and important decisions understandable throughout the project.',
    icon: 'messages',
  },
  {
    id: 'practical-ai',
    title: 'Practical AI Integration',
    description:
      'We focus on AI tools and automations that address real tasks, from customer inquiries to connected business workflows.',
    icon: 'workflow',
  },
  {
    id: 'built-to-evolve',
    title: 'Built to Evolve',
    description:
      'We consider performance, maintainability, and future improvements so solutions can adapt as business needs change.',
    icon: 'blocks',
  },
];
