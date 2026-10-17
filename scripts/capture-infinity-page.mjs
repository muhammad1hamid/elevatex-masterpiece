import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const directory = 'artifacts/infinity/screenshots';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const audit = [],
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
    await page.goto('http://127.0.0.1:4321/work/infinity-salon/', {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${directory}/${width}-fold.png` });
    for (const img of await page.locator('main img:visible').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((i) => i.decode());
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `${directory}/${width}-page.png`,
      fullPage: true,
    });
    for (const section of await page
      .locator('[data-case-study] > section')
      .all()) {
      const id = await section.getAttribute('id'),
        bounds = await section.boundingBox();
      await page.setViewportSize({
        width,
        // Leave room for the document's scroll padding so Chrome paints the
        // section's final caption before taking an element screenshot.
        height: Math.max(height, Math.ceil(bounds.height) + 96),
      });
      await section.scrollIntoViewIfNeeded();
      for (const img of await section.locator('img:visible').all())
        await img.evaluate((i) => i.decode());
      await section.screenshot({ path: `${directory}/${width}-${id}.png` });
      await page.setViewportSize({ width, height });
    }
    audit.push(
      await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      })),
    );
    await page.close();
    console.log(`Captured ${width}px`);
  }
} finally {
  await browser.close();
}
await writeFile(
  'artifacts/infinity/visual-audit.json',
  `${JSON.stringify({ audit, errors }, null, 2)}\n`,
);
console.log(JSON.stringify({ audit, errors }));
