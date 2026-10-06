import type { APIRoute } from 'astro';
import { staticPages } from '../data/site';
import { publishedInsights, publishedCaseStudies } from '../utils/content';
import { contentPath } from '../utils/publication';
import { canIndex, canonicalUrl, escapeXml } from '../utils/seo';

export const GET: APIRoute = async () => {
  const entries: { path: string; modified?: Date }[] = [];
  if (canIndex(true)) {
    for (const page of staticPages)
      if (page.indexable) entries.push({ path: page.path });
    for (const entry of await publishedInsights())
      entries.push({
        path: contentPath('insights', entry.id),
        modified: entry.data.updatedDate ?? entry.data.publishedDate,
      });
    for (const entry of await publishedCaseStudies())
      entries.push({
        path: contentPath('caseStudies', entry.id),
        modified: entry.data.updatedDate ?? entry.data.publishedDate,
      });
  }
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    entries
      .map(
        ({ path, modified }) =>
          `\n  <url><loc>${escapeXml(canonicalUrl(path))}</loc>${modified ? `<lastmod>${modified.toISOString()}</lastmod>` : ''}</url>`,
      )
      .join('') +
    '\n</urlset>\n';
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
