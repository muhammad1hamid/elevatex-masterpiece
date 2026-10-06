import { site } from '../data/site';

export function canonicalUrl(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//') || /[\\?#]/.test(path)) {
    throw new Error(
      'Canonical paths must be root-relative paths without query strings or fragments.',
    );
  }
  const normalized =
    path === '/' || /\.[a-z0-9]+$/i.test(path)
      ? path
      : `${path.replace(/\/+$/, '')}/`;
  const url = new URL(normalized, site.origin);
  if (url.origin !== site.origin)
    throw new Error('Canonical URL must use the production origin.');
  return url.href;
}

export function pageTitle(title: string): string {
  return `${title} | ${site.name}`;
}

export function canIndex(approved: boolean): boolean {
  return import.meta.env.DEPLOYMENT_ENV === 'production' && approved;
}

export function escapeXml(value: string): string {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[character] ?? character,
  );
}
