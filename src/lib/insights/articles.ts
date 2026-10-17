import type { CollectionEntry } from 'astro:content';
import { existsSync } from 'node:fs';
import { publishedInsights } from '../../utils/content';
import { contentPath } from '../../utils/publication';

/** A transparent estimate: visible prose words divided by 220 words/minute. */
export function readingEstimate(body: string) {
  const prose = body
    .replace(/^import\s.+$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ');
  const words =
    prose.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return { words, minutes: Math.max(1, Math.ceil(words / 220)) };
}

export function insightImage(entry: CollectionEntry<'insights'>) {
  const image = entry.data.featuredImage;
  if (!image) return undefined;
  if (image.src.includes('..') || !existsSync(`public${image.src}`)) {
    throw new Error(
      `Missing local cover image for insight ${entry.id}: ${image.src}`,
    );
  }
  const match = image.src.match(/^(.*)-(wide|article)-(\d+)\.webp$/);
  if (!match) return image;
  const prefix = `${match[1]}-${match[2]}`;
  const widths = [480, 720, 768, 960, 1200, 1600].filter((width) =>
    existsSync(`public${prefix}-${width}.webp`),
  );
  const variant = (format: 'avif' | 'webp') =>
    widths
      .filter((width) => existsSync(`public${prefix}-${width}.${format}`))
      .map((width) => `${prefix}-${width}.${format} ${width}w`)
      .join(', ');
  const mobilePrefix = `${match[1]}-mobile`;
  const mobileWidths = [400, 640, 720].filter((width) =>
    existsSync(`public${mobilePrefix}-${width}.webp`),
  );
  const mobileVariant = (format: 'avif' | 'webp') =>
    mobileWidths
      .filter((width) => existsSync(`public${mobilePrefix}-${width}.${format}`))
      .map((width) => `${mobilePrefix}-${width}.${format} ${width}w`)
      .join(', ');
  return {
    ...image,
    avifSrcSet: variant('avif'),
    webpSrcSet: variant('webp'),
    mobileAvifSrcSet: mobileVariant('avif'),
    mobileWebpSrcSet: mobileVariant('webp'),
  };
}

export async function insightArticles() {
  return (await publishedInsights())
    .map((entry) => {
      if (
        entry.data.socialImage &&
        (entry.data.socialImage.src.includes('..') ||
          !existsSync(`public${entry.data.socialImage.src}`))
      ) {
        throw new Error(`Missing local social image for insight ${entry.id}`);
      }
      return {
        ...entry,
        href: contentPath('insights', entry.id),
        reading: readingEstimate(entry.body ?? ''),
        image: insightImage(entry),
      };
    })
    .sort(
      (a, b) =>
        Number(b.data.featured) - Number(a.data.featured) ||
        b.data.publishedDate.getTime() - a.data.publishedDate.getTime() ||
        a.id.localeCompare(b.id),
    );
}
export type InsightArticle = Awaited<
  ReturnType<typeof insightArticles>
>[number];

export function relatedInsights(
  current: InsightArticle,
  candidates: InsightArticle[],
  limit = 2,
) {
  const score = (article: InsightArticle) =>
    Number(article.data.category === current.data.category) * 4 +
    article.data.relatedServices.filter((service) =>
      current.data.relatedServices.includes(service),
    ).length *
      3 +
    article.data.tags.filter((tag) => current.data.tags.includes(tag)).length *
      2;
  return candidates
    .filter((article) => article.id !== current.id && score(article) > 0)
    .sort(
      (a, b) =>
        score(b) - score(a) ||
        b.data.publishedDate.getTime() - a.data.publishedDate.getTime() ||
        a.id.localeCompare(b.id),
    )
    .slice(0, limit);
}
export function formatInsightDate(date: Date) {
  return date.toLocaleDateString('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
