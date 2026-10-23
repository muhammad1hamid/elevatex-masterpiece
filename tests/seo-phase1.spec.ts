import { test, expect } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
// Both checks share an Astro build; its content cache must have one writer.
test.describe.configure({ mode: 'serial' });
const article = '/insights/ai-slop-seo-2026/';
let production: string;
test.beforeAll(async ({ baseURL }, info) => {
  if (!baseURL) throw new Error('A local preview URL is required.');
  test.setTimeout(120000);
  production = path.resolve(`test-results/seo-production-${info.workerIndex}`);
  execFileSync(process.execPath, ['scripts/build-site.mjs', production], {
    env: { ...process.env, DEPLOYMENT_ENV: 'production', WORKERS_CI: '0' },
    stdio: 'pipe',
  });
});
test('all generated production pages have unique metadata, matching canonicals and valid JSON-LD', async ({
  page,
}) => {
  const files = (await readdir(production, { recursive: true })).filter(
    (f) => f.endsWith('.html') && f !== path.join('services', 'index.html'),
  );
  const titles = new Set(),
    descriptions = new Set();
  for (const file of files) {
    const route = '/' + file.replaceAll('\\', '/').replace(/index\.html$/, '');
    await page.setContent(await readFile(path.join(production, file), 'utf8'));
    const title = await page.title(),
      description = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
    expect(titles.has(title)).toBe(false);
    titles.add(title);
    expect(descriptions.has(description)).toBe(false);
    descriptions.add(description);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://elevatexlab.org' + route,
    );
    const schemas = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    for (const json of schemas)
      expect(Array.isArray(JSON.parse(json))).toBe(true);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  }
});
test('production indexability, sitemap XML and article RSS match the approved content', async ({
  page,
}) => {
  for (const file of [
    'index.html',
    'contact/index.html',
    article.slice(1) + 'index.html',
  ]) {
    expect(await readFile(path.join(production, file), 'utf8')).toContain(
      'index, follow, max-image-preview:large',
    );
  }
  const xml = await readFile(path.join(production, 'sitemap.xml'), 'utf8');
  expect(xml).toContain('<loc>https://elevatexlab.org/</loc>');
  expect(xml).toContain('<loc>https://elevatexlab.org/contact/</loc>');
  expect(xml).toContain('https://elevatexlab.org' + article);
  expect(xml).not.toMatch(
    /\/privacy\/|\/terms\/|\/cookies\/|\/404|\/services\/<|qa-/,
  );
  expect(
    await page.evaluate(
      (xml) =>
        new DOMParser()
          .parseFromString(xml, 'application/xml')
          .querySelector('parsererror')?.textContent ?? null,
      xml,
    ),
  ).toBeNull();
  const rss = await readFile(path.join(production, 'insights/rss.xml'), 'utf8');
  expect(rss).toContain('https://elevatexlab.org' + article);
});
