import type { APIRoute } from 'astro';
import { insightArticles } from '../../lib/insights/articles';
import { canonicalUrl, escapeXml } from '../../utils/seo';
import { site } from '../../data/site';
export const GET: APIRoute = async () => {
  const articles = await insightArticles();
  const latest = articles
    .map((article) => article.data.updatedDate ?? article.data.publishedDate)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>ElevateX Insights</title><link>${canonicalUrl('/insights/')}</link><description>Practical thinking on websites, AI automation and customer experience.</description><language>${site.language}</language><atom:link href="${canonicalUrl('/insights/rss.xml')}" rel="self" type="application/rss+xml"/>${latest ? `<lastBuildDate>${latest.toUTCString()}</lastBuildDate>` : ''}${articles.map((article) => `<item><title>${escapeXml(article.data.title)}</title><link>${canonicalUrl(article.href)}</link><guid isPermaLink="true">${canonicalUrl(article.href)}</guid><description>${escapeXml(article.data.description)}</description><pubDate>${article.data.publishedDate.toUTCString()}</pubDate><category>${escapeXml(article.data.category)}</category></item>`).join('')}</channel></rss>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
