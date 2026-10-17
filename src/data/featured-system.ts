import type { ServiceSlug } from './site';

interface FeaturedSystem {
  id: string;
  title: string;
  type: string;
  description: string;
  summary: string;
  projectUrl: string | null;
  relatedServices: ServiceSlug[];
  verifiedCapabilities: string[];
  prototypeCapabilities: string[];
  capabilities: { name: string; status: 'illustrative' }[];
  message: string;
  process: { id: string; label: string }[];
  order: { status: string; items: { name: string; quantity: number }[] };
}

/** Fictional illustration; no verified restaurant deployment or integration. */
export const featuredSystem: FeaturedSystem = {
  id: 'restaurant-ai-ordering-system',
  title: 'Restaurant AI Ordering System',
  type: 'Product Demo',
  description:
    'A closer look at a restaurant AI ordering demo — showing how a customer message can be interpreted and organized into a structured order draft.',
  summary:
    "This restaurant AI ordering demo illustrates how a customer's conversational request can be interpreted and organized into an order draft for restaurant review.",
  projectUrl: null,
  relatedServices: ['ai-automation', 'ai-chatbots'],
  verifiedCapabilities: [],
  prototypeCapabilities: [],
  capabilities: [
    { name: 'Customer message interpretation', status: 'illustrative' },
    { name: 'Structured order draft', status: 'illustrative' },
    { name: 'Human confirmation', status: 'illustrative' },
  ],
  message: "Hi, I'd like one chicken burger and fries.",
  process: [
    { id: 'message', label: 'Message received' },
    { id: 'processing', label: 'Request interpreted' },
    { id: 'draft', label: 'Order draft prepared' },
  ],
  order: {
    status: 'Awaiting confirmation',
    items: [
      { name: 'Chicken Burger', quantity: 1 },
      { name: 'Fries', quantity: 1 },
    ],
  },
};
