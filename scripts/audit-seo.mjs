import { chromium } from '@playwright/test';
import { readFile, readdir, writeFile, access, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Inspect built HTML, not source templates. Never submit forms or load analytics.
const root = path.resolve(process.argv[2] ?? 'dist');
const output = path.resolve(process.argv[3] ?? 'artifacts/seo/audit.json');
const live = process.argv.includes('--live');
const origin = 'https://elevatexlab.org';
const files = (await readdir(root, { recursive: true }))
  .filter((name) => name.endsWith('.html'))
  .sort();
const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_CHANNEL
    ? { channel: process.env.PLAYWRIGHT_CHANNEL }
    : {}),
});
const context = await browser.newContext({ javaScriptEnabled: false });
await context.route('**/*', (route) => route.abort());
const page = await context.newPage();
const pages = [];
try {
  for (const file of files) {
    const route = '/' + file.replaceAll('\\', '/').replace(/index\.html$/, '');
    const html = await readFile(path.join(root, file), 'utf8');
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const data = await page.evaluate(() => {
      const attr = (selector, attribute) =>
        [...document.querySelectorAll(selector)].map((el) =>
          el.getAttribute(attribute),
        );
      return {
        title: document.title,
        titles: document.querySelectorAll('title').length,
        description: attr('meta[name="description"]', 'content'),
        canonical: attr('link[rel="canonical"]', 'href'),
        robots: attr('meta[name="robots"]', 'content'),
        social: Object.fromEntries(
          [
            ...document.querySelectorAll(
              'meta[property^="og:"],meta[name^="twitter:"]',
            ),
          ].map((el) => [
            el.getAttribute('property') ?? el.getAttribute('name'),
            el.getAttribute('content'),
          ]),
        ),
        headings: [
          ...document.querySelectorAll('main h1,main h2,main h3,main h4'),
        ].map((el) => ({
          level: Number(el.tagName[1]),
          text: el.textContent.replace(/\s+/g, ' ').trim(),
        })),
        textLength:
          document.querySelector('main')?.textContent.trim().length ?? 0,
        links: [...document.querySelectorAll('a[href]')].map((el) => ({
          href: el.getAttribute('href'),
          text: (el.getAttribute('aria-label') ?? el.textContent)
            .replace(/\s+/g, ' ')
            .trim(),
        })),
        ids: attr('[id]', 'id'),
        images: [...document.images].map((el) => ({
          src: el.getAttribute('src'),
          alt: el.getAttribute('alt'),
          width: el.getAttribute('width'),
          height: el.getAttribute('height'),
          loading: el.getAttribute('loading'),
        })),
        assets: [
          ...attr('img[src],script[src],source[src]', 'src'),
          ...attr(
            'link[rel="stylesheet"],link[rel="preload"],link[rel="icon"]',
            'href',
          ),
          ...attr('[srcset]', 'srcset').flatMap((value) =>
            value.split(',').map((part) => part.trim().split(/\s+/)[0]),
          ),
        ].filter(Boolean),
        schema: [
          ...document.querySelectorAll('script[type="application/ld+json"]'),
        ].flatMap((el) => {
          try {
            const value = JSON.parse(el.textContent);
            return Array.isArray(value) ? value : [value];
          } catch {
            return [{ invalidJson: true }];
          }
        }),
      };
    });
    pages.push({ route, bytes: Buffer.byteLength(html), ...data });
  }
} finally {
  await browser.close();
}
const byRoute = new Map(pages.map((entry) => [entry.route, entry]));
const issues = [],
  warnings = [];
const add = (route, code, detail) => issues.push({ route, code, detail });
for (const entry of pages) {
  if (entry.titles !== 1 || !entry.title)
    add(entry.route, 'title', 'Expected one nonempty title');
  if (entry.route === '/services/') continue;
  if (entry.description.length !== 1 || !entry.description[0])
    add(entry.route, 'description', 'Expected one nonempty description');
  if (
    entry.canonical.length !== 1 ||
    entry.canonical[0] !== origin + entry.route
  )
    add(entry.route, 'canonical', entry.canonical);
  if (entry.headings.filter((h) => h.level === 1).length !== 1)
    add(entry.route, 'h1', 'Expected one primary heading');
  if (
    !entry.social['og:image'] &&
    entry.route !== '/404.html' &&
    entry.route !== '/services/'
  )
    warnings.push({
      route: entry.route,
      code: 'social-image',
      detail: 'No social image',
    });
  if (entry.schema.some((item) => item.invalidJson))
    add(entry.route, 'schema-json', 'Invalid JSON');
  for (const image of entry.images)
    if (image.alt === null || !image.width || !image.height)
      add(entry.route, 'image-attributes', image);
  for (const asset of new Set(entry.assets)) {
    if (!asset.startsWith('/')) continue;
    try {
      await access(path.join(root, new URL(asset, origin).pathname));
    } catch {
      add(entry.route, 'broken-asset', asset);
    }
  }
  for (const link of entry.links) {
    const url = new URL(link.href, origin + entry.route);
    if (url.origin !== origin) continue;
    const target = byRoute.get(url.pathname);
    if (!target) {
      try {
        await access(path.join(root, decodeURIComponent(url.pathname)));
      } catch {
        add(entry.route, 'broken-link', link.href);
      }
    } else if (
      url.hash &&
      !target.ids.includes(decodeURIComponent(url.hash.slice(1)))
    )
      add(entry.route, 'broken-fragment', link.href);
  }
}
for (const field of ['title', 'description']) {
  const seen = new Map();
  for (const entry of pages) {
    const value = field === 'title' ? entry.title : entry.description[0];
    if (seen.has(value))
      add(entry.route, 'duplicate-' + field, seen.get(value));
    seen.set(value, entry.route);
  }
}
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);
for (const url of urls) {
  const target = byRoute.get(new URL(url).pathname);
  if (
    !target ||
    target.robots.some((r) => r.includes('noindex')) ||
    target.canonical[0] !== url
  )
    add(url, 'sitemap-eligibility', 'URL is not canonical indexable HTML');
}
for (const entry of pages)
  if (
    entry.robots.some((r) => r.startsWith('index,')) &&
    !urls.includes(origin + entry.route)
  )
    add(entry.route, 'sitemap-missing', 'Indexable route absent from sitemap');
const visited = new Set(['/']),
  queue = ['/'];
while (queue.length) {
  for (const link of byRoute.get(queue.shift())?.links ?? []) {
    const url = new URL(link.href, origin);
    if (
      url.origin === origin &&
      byRoute.has(url.pathname) &&
      !visited.has(url.pathname)
    ) {
      visited.add(url.pathname);
      queue.push(url.pathname);
    }
  }
}
const orphans = pages
  .filter(
    (entry) =>
      !visited.has(entry.route) &&
      entry.robots.some((r) => r.startsWith('index,')),
  )
  .map((entry) => entry.route);
const liveResults = [];
if (live) {
  for (const route of [
    ...pages.map((entry) => entry.route),
    '/robots.txt',
    '/sitemap.xml',
    '/seo-missing-page-check-20261020/',
    '/services',
    '/contact',
    '/CONTACT/',
    '/contact/?service=web-development',
  ]) {
    try {
      const response = await fetch(origin + route, {
        redirect: 'manual',
        signal: AbortSignal.timeout(15000),
      });
      const body = await response.text();
      liveResults.push({
        route,
        status: response.status,
        location: response.headers.get('location'),
        robotsHeader: response.headers.get('x-robots-tag'),
        contentType: response.headers.get('content-type'),
        canonical: body.match(/rel="canonical" href="([^"]+)"/)?.[1],
        robots: body.match(/name="robots" content="([^"]+)"/)?.[1],
        body:
          route === '/robots.txt' || route === '/sitemap.xml'
            ? body
            : undefined,
      });
    } catch (error) {
      liveResults.push({ route, error: String(error) });
    }
  }
  for (const url of [
    'http://elevatexlab.org/contact/?service=web-development',
    'https://www.elevatexlab.org/contact/?service=web-development',
  ]) {
    try {
      const response = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(15000),
      });
      liveResults.push({
        url,
        status: response.status,
        location: response.headers.get('location'),
      });
    } catch (error) {
      liveResults.push({ url, error: String(error) });
    }
  }
}
await mkdir(path.dirname(output), { recursive: true });
await writeFile(
  output,
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      root,
      issues,
      warnings,
      orphans,
      sitemap: urls,
      robots: await readFile(path.join(root, 'robots.txt'), 'utf8'),
      pages,
      live: liveResults,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    output,
    pages: pages.length,
    issues,
    warnings,
    orphans,
    sitemap: urls.length,
  }),
);
