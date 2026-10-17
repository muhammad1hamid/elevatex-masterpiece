import { readFile, stat, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { chromium } from '@playwright/test';
const html = await readFile('dist/about/index.html', 'utf8');
const scripts = [
  ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g),
].filter((match) => !match[1].includes('application/ld+json'));
const size = (value) => ({
  bytes: Buffer.byteLength(value),
  gzip: gzipSync(value).length,
});
const report = {
  html: size(html),
  inlineJS: size(scripts.map((match) => match[2]).join('\n')),
  inlineCSS: size(
    [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
      .map((match) => match[1])
      .join('\n'),
  ),
  externalScripts: scripts
    .filter((match) => /\bsrc=/.test(match[1]))
    .map((match) => match[1]),
  externalJS: [],
  heroAvif: [],
  browser: [],
};
for (const script of scripts) {
  const src = script[1].match(/\bsrc="([^"]+)"/)?.[1];
  if (src)
    report.externalJS.push({
      src,
      ...size(await readFile(`dist${src}`, 'utf8')),
    });
}
report.totalJS = {
  bytes:
    report.inlineJS.bytes +
    report.externalJS.reduce((sum, script) => sum + script.bytes, 0),
  gzipSum:
    report.inlineJS.gzip +
    report.externalJS.reduce((sum, script) => sum + script.gzip, 0),
};
for (const name of [
  'hero-480',
  'hero-800',
  'hero-1448',
  'hero-mobile-480',
  'hero-mobile-864',
])
  report.heroAvif.push({
    name,
    bytes: (await stat(`public/images/about/${name}.avif`)).size,
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
    await page.goto('http://127.0.0.1:4322/about/', {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    const snapshot = () =>
      page.evaluate(() => ({
        cls: window.__cls,
        fonts: [...document.fonts]
          .filter((font) => font.status === 'loaded')
          .map((font) => font.family),
        resources: performance.getEntriesByType('resource').map((resource) => ({
          name: resource.name,
          transferSize: resource.transferSize,
          encodedBodySize: resource.encodedBodySize,
          initiatorType: resource.initiatorType,
        })),
        hero: document.querySelector('.about-hero img').currentSrc,
      }));
    const initial = await snapshot();
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((element) => element.decode());
    }
    report.browser.push({
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
report.note =
  'Fresh local Chrome DPR 1, reduced motion, compressed static hosting. Resources include response overhead, exclude the document. Laboratory observations, not field INP or production guarantees.';
await writeFile('artifacts/about/budget.json', JSON.stringify(report, null, 2));
console.log(
  JSON.stringify({
    ...report,
    browser: report.browser.map((view) => ({
      width: view.width,
      initialCLS: view.initial.cls,
      scrolledCLS: view.scrolled.cls,
      hero: view.initial.hero,
      initialTransfer: view.initial.resources.reduce(
        (sum, resource) => sum + resource.transferSize,
        0,
      ),
      scrolledTransfer: view.scrolled.resources.reduce(
        (sum, resource) => sum + resource.transferSize,
        0,
      ),
    })),
  }),
);
