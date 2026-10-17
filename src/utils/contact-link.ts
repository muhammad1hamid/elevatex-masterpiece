import { serviceSlugs } from '../data/site';

/** Preserve intentional destinations; preselect only this page's known service. */
export function contactLinkForService(
  path: string,
  href = '/contact/',
): string {
  if (href !== '/contact/') return href;
  const slug = serviceSlugs.find((item) => path === `/services/${item}/`);
  return slug ? `/contact/?service=${slug}` : href;
}
