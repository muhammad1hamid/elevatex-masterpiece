import { mkdir, writeFile } from 'node:fs/promises';

// Read-only crawl. Does not run the legacy app or change remote infrastructure.
const origin = 'https://www.elevatexlab.com';
const output = new URL('../docs/migration/', import.meta.url);
await mkdir(new URL('snapshots/', output), { recursive: true });
const seeds = [
  'https://elevatexlab.com/',
  `${origin}/`,
  `${origin}/robots.txt`,
  `${origin}/sitemap.xml`,
  `${origin}/sitemap-pages.xml`,
  `${origin}/sitemap-blog.xml`,
  `${origin}/sitemap-images.xml`,
];
const resources = [];
const urls = new Set([`${origin}/`]);
async function read(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
    const body = await response.text();
    const record = {
      url,
      finalUrl: response.url,
      status: response.status,
      contentType: response.headers.get('content-type'),
      title: body.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? null,
      canonical:
        body.match(
          /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i,
        )?.[1] ?? null,
      hasEmptyRoot: /<div id="root"><\/div>/.test(body),
    };
    resources.push(record);
    return { body, record };
  } catch (error) {
    resources.push({ url, error: String(error) });
    return null;
  }
}
for (const [index, url] of seeds.entries()) {
  const result = await read(url);
  if (!result) continue;
  await writeFile(
    new URL(
      `snapshots/${index}-${new URL(url).pathname.replaceAll('/', '_') || 'home'}.txt`,
      output,
    ),
    result.body,
  );
  if (url.includes('sitemap') && !url.endsWith('/sitemap.xml')) {
    for (const match of result.body.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const entry = new URL(match[1]);
      if (
        ['elevatexlab.com', 'www.elevatexlab.com'].includes(entry.hostname) &&
        !/\.(xml|jpg|png|webp|svg)$/i.test(entry.pathname)
      )
        urls.add(entry.href);
    }
  }
}
// Bounded crawl; sitemap URLs are evidence of advertised URLs, not indexing or traffic.
for (const url of [...urls].slice(0, 100))
  if (!resources.some((item) => item.url === url)) await read(url);
await writeFile(
  new URL('live-audit.json', output),
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      method:
        'HTTP and advertised sitemap inventory; no search-console/backlink data',
      resources,
      advertisedUrls: [...urls],
    },
    null,
    2,
  ),
);
await writeFile(
  new URL('url-inventory.csv', output),
  'old_url,action,proposed_destination,status,notes\n' +
    [...urls]
      .map(
        (url) =>
          `"${url}",REVIEW,,pending,"Advertised in live sitemap or seed; assess content and search value"`,
      )
      .join('\n') +
    '\n',
);
console.log(
  `Captured ${resources.length} responses and ${urls.size} advertised page URLs.`,
);
