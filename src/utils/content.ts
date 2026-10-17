import { getCollection } from 'astro:content';
import { existsSync } from 'node:fs';
import { isPublished, contentPath } from './publication';
import { services } from '../data/site';

export async function publishedInsights() {
  return (
    await getCollection('insights', ({ data }) => isPublished(data))
  ).sort(
    (a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime(),
  );
}

export async function publishedCaseStudies() {
  return (await getCollection('caseStudies', ({ data }) => isPublished(data)))
    .flatMap((entry) =>
      entry.data.entryType === 'case-study'
        ? [{ ...entry, data: entry.data }]
        : [],
    )
    .sort(
      (a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime(),
    );
}

export type CaseStudyEntry = Awaited<
  ReturnType<typeof publishedCaseStudies>
>[number];

/** Editorial studies retain the original, accurate showcase classification. */
export async function publishedProjectStudies() {
  return (
    await getCollection('caseStudies', ({ data }) => isPublished(data))
  ).flatMap((entry) =>
    entry.data.entryType === 'showcase' &&
    entry.data.projectStudy &&
    isPublished(entry.data.projectStudy)
      ? [{ ...entry, data: entry.data }]
      : [],
  );
}

/** One collection owns portfolio summaries and full, evidence-backed studies. */
export async function publishedWork() {
  const entries = await getCollection(
    'caseStudies',
    ({ data }) => isPublished(data) && Boolean(data.showcase),
  );
  return entries
    .map(({ id, data }) => {
      const preview = data.showcase;
      if (!preview)
        throw new Error(`Featured project ${id} needs showcase metadata.`);
      const imageBase = preview.image.src.replace(/-1200\.webp$/, '');
      if (imageBase === preview.image.src || imageBase.includes('..')) {
        throw new Error(
          `Featured project ${id} needs a local -1200.webp preview.`,
        );
      }
      const widths = [480, 800, 1200];
      for (const width of widths) {
        for (const format of ['avif', 'webp']) {
          if (!existsSync(`public${imageBase}-${width}.${format}`)) {
            throw new Error(`Missing ${id} preview: ${width}.${format}`);
          }
        }
      }
      const serviceNames = data.relatedServices.map(
        (slug) => services.find((service) => service.slug === slug)!.name,
      );
      if (!serviceNames.length)
        throw new Error(`Featured project ${id} needs a service.`);
      return {
        id,
        title: data.title,
        description: data.description,
        industry: data.industry,
        homepageFeatured: data.featured,
        caseStudyHref:
          data.entryType === 'showcase' &&
          data.projectStudy &&
          isPublished(data.projectStudy)
            ? contentPath('caseStudies', data.projectStudy.slug ?? id)
            : undefined,
        ...preview,
        serviceNames,
        typeLabel: {
          concept: 'Concept project',
          demo: 'Demo project',
          client: 'Client project',
          internal: 'Internal build',
        }[preview.projectType],
        href:
          data.entryType === 'case-study'
            ? contentPath('caseStudies', id)
            : preview.liveUrl,
        avifSrcSet: widths
          .map((width) => `${imageBase}-${width}.avif ${width}w`)
          .join(', '),
        webpSrcSet: widths
          .map((width) => `${imageBase}-${width}.webp ${width}w`)
          .join(', '),
      };
    })
    .sort((a, b) => a.order - b.order);
}

export async function featuredWork() {
  return (await publishedWork())
    .filter((project) => project.homepageFeatured)
    .slice(0, 3);
}

export type FeaturedProject = Awaited<ReturnType<typeof featuredWork>>[number];
