import { readFile, stat, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { chromium } from '@playwright/test';
const html = await readFile('dist/work/infinity-salon/index.html', 'utf8');
const scripts = [
  ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g),
].filter((m) => !m[1].includes('application/ld+json'));
const js = scripts.map((m) => m[2]).join('\n');
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
  .map((m) => m[1])
  .join('\n');
const bytes = async (file) => (await stat(file)).size;
const budget = {
  html: { bytes: Buffer.byteLength(html), gzip: gzipSync(html).length },
  inlineJS: { bytes: Buffer.byteLength(js), gzip: gzipSync(js).length },
  inlineCSS: { bytes: Buffer.byteLength(css), gzip: gzipSync(css).length },
  externalScripts: scripts.filter((m) => /\bsrc=/.test(m[1])).map((m) => m[1]),
  heroAvif: {
    width480: await bytes('public/images/work/infinity/art/hero-480.avif'),
    width800: await bytes('public/images/work/infinity/art/hero-800.avif'),
    width1122: await bytes('public/images/work/infinity/art/hero-1122.avif'),
  },
  browser: [],
};
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
    await page.goto('http://127.0.0.1:4322/work/infinity-salon/', {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);
    const initial = await page.evaluate(() => ({
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
      hero: document.querySelector('.editorial-hero__portrait img').currentSrc,
    }));
    for (const img of await page.locator('main img:visible').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((i) => i.decode());
    }
    const scrolled = await page.evaluate(() => ({
      cls: window.__cls,
      resources: performance.getEntriesByType('resource').map((r) => ({
        name: r.name,
        transferSize: r.transferSize,
        encodedBodySize: r.encodedBodySize,
        initiatorType: r.initiatorType,
      })),
    }));
    budget.browser.push({ width, deviceScaleFactor: 1, initial, scrolled });
    await context.close();
  }
} finally {
  await browser.close();
}
budget.note =
  'Local Chrome DPR 1 with a fresh context per viewport. Resource transferSize includes response overhead. Scrolled resources exclude closed screenshot viewers. These are laboratory observations, not field INP or production transfer guarantees.';
await writeFile(
  'artifacts/infinity/budget.json',
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
