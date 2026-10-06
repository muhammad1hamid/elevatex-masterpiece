import { site } from '../data/site';
import { canonicalUrl } from './seo';

export type JsonLd = Record<string, unknown>;
export interface Breadcrumb {
  name: string;
  path: string;
}
const organizationId = `${site.origin}/#organization`;
const websiteId = `${site.origin}/#website`;

export function organizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId,
    name: site.name,
    url: `${site.origin}/`,
    description: site.description,
  };
}

export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    name: site.name,
    url: `${site.origin}/`,
    publisher: { '@id': organizationId },
    inLanguage: site.language,
  };
}

export function webPageSchema(input: {
  title: string;
  description: string;
  path: string;
  type?: 'WebPage' | 'AboutPage' | 'ContactPage';
}): JsonLd {
  const url = canonicalUrl(input.path);
  return {
    '@context': 'https://schema.org',
    '@type': input.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: input.title,
    description: input.description,
    isPartOf: { '@id': websiteId },
    inLanguage: site.language,
  };
}

export function breadcrumbSchema(items: Breadcrumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.path),
    provider: { '@id': organizationId },
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  publishedDate: Date;
  updatedDate?: Date | undefined;
  author: { name: string; url?: string | undefined };
  image?: string | undefined;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    mainEntityOfPage: canonicalUrl(input.path),
    datePublished: input.publishedDate.toISOString(),
    ...(input.updatedDate
      ? { dateModified: input.updatedDate.toISOString() }
      : {}),
    author: {
      '@type': 'Person',
      name: input.author.name,
      ...(input.author.url ? { url: input.author.url } : {}),
    },
    publisher: { '@id': organizationId },
    ...(input.image ? { image: new URL(input.image, site.origin).href } : {}),
  };
}

/** Prevent content containing </script> from escaping the JSON-LD script element. */
export function serializeJsonLd(value: JsonLd | JsonLd[]): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
