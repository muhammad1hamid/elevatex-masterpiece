export interface ProcessStep {
  id: 'discover' | 'strategize' | 'design' | 'develop' | 'launch';
  number: string;
  title: string;
  eyebrow: string;
  description: string;
  details: string[];
  outcome: string;
  visual: string;
  visualWidth: number;
  visualHeight: number;
}

export const processSteps: ProcessStep[] = [
  {
    id: 'discover',
    number: '01',
    title: 'Discover',
    eyebrow: 'First, we understand.',
    description:
      'We learn about your business, audience, goals, challenges, and what the project actually needs to achieve.',
    details: ['Business goals', 'Audience needs', 'Project requirements'],
    outcome: 'Clear project direction',
    visual: '/images/process/process-discover.webp',
    visualWidth: 1240,
    visualHeight: 1240,
  },
  {
    id: 'strategize',
    number: '02',
    title: 'Strategize',
    eyebrow: 'Then, we make a plan.',
    description:
      'We define the scope, priorities, structure, and technical approach before moving into design and development.',
    details: [
      'Project scope',
      'Information architecture',
      'Technical approach',
    ],
    outcome: 'A considered build plan',
    visual: '/images/process/process-strategize.webp',
    visualWidth: 1240,
    visualHeight: 1240,
  },
  {
    id: 'design',
    number: '03',
    title: 'Design',
    eyebrow: 'Make the experience matter.',
    description:
      'We shape the visual direction, layouts, interactions, and user journeys into an experience that is clear, useful, and distinctive.',
    details: ['Visual direction', 'Responsive layouts', 'User experience'],
    outcome: 'An approved design direction',
    visual: '/images/process/process-design.webp',
    visualWidth: 1240,
    visualHeight: 1240,
  },
  {
    id: 'develop',
    number: '04',
    title: 'Develop',
    eyebrow: 'Turn design into reality.',
    description:
      'We implement the experience, connect the necessary systems, and test usability, responsiveness, performance, and functionality.',
    details: ['Development', 'Integrations', 'Quality assurance'],
    outcome: 'A tested working build',
    visual: '/images/process/process-develop.webp',
    visualWidth: 1240,
    visualHeight: 1240,
  },
  {
    id: 'launch',
    number: '05',
    title: 'Launch & Evolve',
    eyebrow: 'Ready for the real world.',
    description:
      'We review the final experience, prepare deployment, verify essential user journeys, and define sensible next steps where needed.',
    details: ['Launch checks', 'Deployment', 'Handoff and next steps'],
    outcome: 'A ready-to-use solution',
    visual: '/images/process/process-launch.webp',
    visualWidth: 1200,
    visualHeight: 800,
  },
];
