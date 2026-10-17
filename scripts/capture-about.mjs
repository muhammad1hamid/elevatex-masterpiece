import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const directory = 'artifacts/about/screenshots';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' }),
  audit = [],
  errors = [];
try {
  for (const [width, height] of [
    [390, 844],
    [768, 1024],
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
    const response = await page.goto('http://127.0.0.1:4321/about/', {
      waitUntil: 'networkidle',
    });
    if (!response?.ok()) throw new Error(`About status ${response?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${directory}/${width}-fold.png` });
    await page
      .locator('main img')
      .evaluateAll((images) => images.forEach((i) => (i.loading = 'eager')));
    for (const image of await page.locator('main img').all())
      await image.evaluate((i) => i.decode());
    await page.screenshot({
      path: `${directory}/${width}-page.png`,
      fullPage: true,
    });
    for (const section of await page
      .locator('[data-about-page] > section')
      .all()) {
      const id = await section.getAttribute('id'),
        bounds = await section.boundingBox();
      await page.setViewportSize({
        width,
        height: Math.max(height, Math.ceil(bounds.height) + 96),
      });
      await section.scrollIntoViewIfNeeded();
      await section.screenshot({ path: `${directory}/${width}-${id}.png` });
      await page.setViewportSize({ width, height });
    }
    audit.push(
      await page.evaluate(() => ({
        width: innerWidth,
        document: document.documentElement.scrollWidth,
        sections: document.querySelectorAll('[data-about-page] > section')
          .length,
      })),
    );
    await page.close();
    console.log(`Captured About ${width}px`);
  }
} finally {
  await browser.close();
}
await writeFile(
  'artifacts/about/visual-audit.json',
  JSON.stringify({ audit, errors }, null, 2),
);
console.log(JSON.stringify({ audit, errors }));
