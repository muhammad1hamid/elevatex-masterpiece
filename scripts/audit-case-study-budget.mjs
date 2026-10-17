import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { parse } from 'yaml';
import { chromium } from '@playwright/test';
const entryPath = process.argv[2];
if (!/^src\/content\/case-studies\/[a-z0-9-]+\.md$/.test(entryPath ?? ''))
  throw new Error('Supply a local case-study content path.');
const project = parse((await readFile(entryPath, 'utf8')).split('---')[1]),
  study = project.projectStudy,
  slug = study.slug ?? entryPath.split('/').at(-1).replace('.md', '');
const html = await readFile(`dist/work/${slug}/index.html`, 'utf8'),
  scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(
    (m) => !m[1].includes('application/ld+json'),
  ),
  js = scripts.map((m) => m[2]).join('\n'),
  css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1])
    .join('\n');
const size = (value) => ({
  bytes: Buffer.byteLength(value),
  gzip: gzipSync(value).length,
});
const hero = study.hero.image ? study.media[study.hero.image.media] : undefined;
const budget = {
  slug,
  html: size(html),
  inlineJS: size(js),
  inlineCSS: size(css),
  externalScripts: scripts.filter((m) => /\bsrc=/.test(m[1])).map((m) => m[1]),
  heroAvif: [],
  browser: [],
};
if (hero)
  for (const width of hero.widths)
    budget.heroAvif.push({
      width,
      bytes: (await stat(`public${hero.base}-${width}.avif`)).size,
    });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const [width, height] of [
    [390, 844],
    [1440, 900],
  ]) {
    const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: 'reduce',
      }),
      page = await context.newPage();
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) window.__cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(`http://127.0.0.1:4322/work/${slug}/`, {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    const snapshot = () =>
      page.evaluate(() => ({
        cls: window.__cls,
        fonts: [...document.fonts]
          .filter((f) => f.status === 'loaded')
          .map((f) => f.family),
        resources: performance.getEntriesByType('resource').map((r) => ({
          name: r.name,
          transferSize: r.transferSize,
          encodedBodySize: r.encodedBodySize,
          initiatorType: r.initiatorType,
        })),
        hero: document.querySelector('[data-case-study] > section img')
          ?.currentSrc,
      }));
    const initial = await snapshot();
    for (const img of await page.locator('main img:visible').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((i) => i.decode());
    }
    budget.browser.push({
      width,
      deviceScaleFactor: 1,
      initial,
      scrolled: await snapshot(),
    });
    await context.close();
  }
} finally {
  await browser.close();
}
budget.note =
  'Fresh local Chrome contexts, DPR 1, reduced motion and compressed static hosting. Resource transfer includes response overhead. Closed screenshot viewers are not loaded. Laboratory measurements, not field INP or production guarantees.';
await mkdir(`artifacts/${slug}`, { recursive: true });
await writeFile(
  `artifacts/${slug}/budget.json`,
  `${JSON.stringify(budget, null, 2)}\n`,
);
console.log(
  JSON.stringify({
    ...budget,
    browser: budget.browser.map((b) => ({
      width: b.width,
      initialCLS: b.initial.cls,
      scrolledCLS: b.scrolled.cls,
      hero: b.initial.hero,
      initialTransfer: b.initial.resources.reduce(
        (sum, r) => sum + r.transferSize,
        0,
      ),
      scrolledTransfer: b.scrolled.resources.reduce(
        (sum, r) => sum + r.transferSize,
        0,
      ),
    })),
  }),
);
