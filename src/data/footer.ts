import { serviceOverview } from './services';
import { staticPages } from './site';
import { verifiedContactMethods } from './contact';

const publishedServices = new Set<string>(staticPages.map(({ path }) => path));

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterGroup {
  label: string;
  links: readonly FooterLink[];
}

export const footerStatement =
  'Thoughtful websites, practical AI systems, and digital experiences built with purpose.';

/** Dedicated pages take precedence; upcoming services use real homepage content. */
export const footerServices: readonly FooterLink[] = serviceOverview.map(
  ({ title, slug, plannedHref }) => ({
    label: title,
    href: publishedServices.has(plannedHref)
      ? plannedHref
      : `/#${slug}-heading`,
  }),
);

export const footerExplore: readonly FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About ElevateX', href: '/about/' },
  { label: 'Our Work', href: '/work/' },
  { label: 'Insights', href: '/insights/' },
  { label: 'Contact', href: '/contact/' },
];

export const footerGroups: readonly FooterGroup[] = [
  { label: 'Explore', links: footerExplore },
  { label: 'Services', links: footerServices },
];
/** Reuse owner-confirmed contact data; never invent a separate footer identity. */
export const footerContactMethods = verifiedContactMethods;

/** Handoff only: do not render these links until their real pages exist. */
export const pendingFooterRoutes = [
  ...serviceOverview
    .filter(({ plannedHref }) => !publishedServices.has(plannedHref))
    .map(({ plannedHref }) => plannedHref),
  '/privacy/',
  '/terms/',
] as const;

// No verified social profiles, email, location or legal pages are available.
