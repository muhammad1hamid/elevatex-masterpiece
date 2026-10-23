import { site } from '../data/site';
import { socialProfiles } from '../data/social';
import { founder } from '../data/founder';
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
    alternateName: 'ElevateX Lab',
    sameAs: socialProfiles.map((profile) => profile.href),
    url: `${site.origin}/`,
    description: site.description,
    founder: {
      '@type': 'Person',
      '@id': `${site.origin}/#hamid`,
      name: founder.name,
      jobTitle: 'Founder',
    },
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
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
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

/** The About page describes the same verified organization and founder IDs. */
export function aboutPageSchema(input: {
  title: string;
  description: string;
  path: string;
}): JsonLd {
  return {
    ...webPageSchema({ ...input, type: 'AboutPage' }),
    about: { '@id': organizationId },
    mainEntity: { '@id': organizationId },
  };
}

export function founderPersonSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${site.origin}/#hamid`,
    name: founder.name,
    jobTitle: 'Founder',
    url: `${canonicalUrl('/about/')}#founder`,
    image: new URL('/images/founder/hamid-founder-840.webp', site.origin).href,
    worksFor: { '@id': organizationId },
  };
}

export function contactPageSchema(input: {
  title: string;
  description: string;
  path: string;
}): JsonLd {
  return {
    ...webPageSchema({ ...input, type: 'ContactPage' }),
    about: { '@id': organizationId },
    mainEntity: { '@id': organizationId },
  };
}

export function projectListSchema(
  projects: { title: string; liveUrl: string; typeLabel: string }[],
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${canonicalUrl('/work/')}#projects`,
    name: 'ElevateX website concepts',
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${project.title} — ${project.typeLabel}`,
      url: project.liveUrl,
    })),
  };
}

/** Describes the editorial project study, without asserting retail products or results. */
export function projectStudySchema(input: {
  title: string;
  description: string;
  path: string;
  publishedDate: Date;
  updatedDate?: Date | undefined;
  liveUrl: string;
  projectName: string;
  projectType?: 'concept' | 'demo' | 'client' | 'internal';
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${canonicalUrl(input.path)}#study`,
    name: input.title,
    description: input.description,
    url: canonicalUrl(input.path),
    datePublished: input.publishedDate.toISOString(),
    ...(input.updatedDate
      ? { dateModified: input.updatedDate.toISOString() }
      : {}),
    genre: `Website ${input.projectType ?? 'concept'} project study`,
    creator: { '@id': organizationId },
    about: {
      '@type': 'WebSite',
      name: `${input.projectName} website ${input.projectType ?? 'concept'}`,
      url: input.liveUrl,
    },
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
  author: {
    name: string;
    url?: string | undefined;
    type?: 'Person' | 'Organization' | undefined;
  };
  image?: string | undefined;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonicalUrl(input.path)}#article`,
    url: canonicalUrl(input.path),
    inLanguage: site.language,
    headline: input.title,
    description: input.description,
    mainEntityOfPage: canonicalUrl(input.path),
    datePublished: input.publishedDate.toISOString(),
    ...(input.updatedDate
      ? { dateModified: input.updatedDate.toISOString() }
      : {}),
    author: {
      '@type': input.author.type ?? 'Person',
      ...(input.author.type === 'Organization' &&
      input.author.name === site.name
        ? { '@id': organizationId }
        : {}),
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
