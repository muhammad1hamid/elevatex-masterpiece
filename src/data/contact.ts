import { services } from './site';

/** Sending and backend work are explicitly deferred by the user. */
export const contactMetadata = {
  title: 'Contact — Start a Website or AI Project',
  description:
    'Have a website, AI automation, chatbot or landing page project in mind? Explore the ElevateX project inquiry and the next steps for your idea.',
  path: '/contact/',
} as const;

export const inquiryServices = [
  ...services.map(({ slug, name }) => ({ value: slug, label: name })),
  { value: 'not-sure', label: 'Not Sure Yet' },
  { value: 'something-else', label: 'Something Else' },
] as const;
export const inquiryBudgets = [
  { value: 'not-sure', label: 'Not Sure Yet' },
  { value: 'discuss', label: 'Prefer to Discuss' },
] as const;
export const inquiryTimelines = [
  { value: 'soon', label: 'As Soon As Practical' },
  { value: 'one-month', label: 'Within 1 Month' },
  { value: 'one-to-three-months', label: 'Within 1–3 Months' },
  { value: 'flexible', label: 'Flexible / Exploring' },
] as const;

export const contactSteps = [
  {
    title: 'Share your idea',
    text: 'Tell us what you want to build, improve or automate. You don’t need a perfect brief to get started.',
  },
  {
    title: 'We review the details',
    text: 'We look at the information you share to understand the scope, requirements and possible approach.',
  },
  {
    title: 'Define the next step',
    text: 'If the project looks like a fit, we discuss the requirements, possible direction and what should happen next.',
  },
] as const;

export interface VerifiedContactMethod {
  kind: 'email' | 'whatsapp' | 'schedule';
  label: string;
  detail: string;
  href: string;
}
/** Public WhatsApp number supplied by the owner on 2026-10-16. */
export const verifiedContactMethods: readonly VerifiedContactMethod[] = [
  {
    kind: 'whatsapp',
    label: 'Chat on WhatsApp',
    detail: '+92 335 6709222',
    href: 'https://wa.me/923356709222',
  },
];
