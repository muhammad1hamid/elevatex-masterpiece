import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const slug = process.argv[2];
if (!/^[a-z0-9-]+$/.test(slug ?? ''))
  throw new Error('Supply a safe study slug.');
const dir = `artifacts/${slug}/screenshots`;
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' }),
  audit = [],
  errors = [];
try {
  for (const [width, height] of [
    [390, 844],
    [768, 1024],
    [1366, 768],
    [1440, 900],
    [1920, 1080],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(`http://127.0.0.1:4321/work/${slug}/`, {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${dir}/${width}-fold.png` });
    await page
      .locator('main img:visible')
      .evaluateAll((images) =>
        images.forEach((image) => (image.loading = 'eager')),
      );
    for (const img of await page.locator('main img:visible').all())
      await img.evaluate((i) => i.decode());
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${dir}/${width}-page.png`, fullPage: true });
    for (const section of await page
      .locator('[data-case-study] > section')
      .all()) {
      const id = await section.getAttribute('id'),
        bounds = await section.boundingBox();
      await page.setViewportSize({
        width,
        height: Math.max(height, Math.ceil(bounds.height) + 96),
      });
      await section.scrollIntoViewIfNeeded();
      for (const img of await section.locator('img:visible').all())
        await img.evaluate((i) => i.decode());
      await section.screenshot({ path: `${dir}/${width}-${id}.png` });
      await page.setViewportSize({ width, height });
    }
    audit.push(
      await page.evaluate(() => ({
        width: innerWidth,
        document: document.documentElement.scrollWidth,
      })),
    );
    await page.close();
    console.log(`Captured ${slug} at ${width}px`);
  }
} finally {
  await browser.close();
}
await writeFile(
  `artifacts/${slug}/visual-audit.json`,
  `${JSON.stringify({ audit, errors }, null, 2)}\n`,
);
console.log(JSON.stringify({ audit, errors }));
