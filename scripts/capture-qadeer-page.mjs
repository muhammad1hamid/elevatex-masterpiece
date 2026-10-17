import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const directory = 'artifacts/qadeer/screenshots';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const audit = [],
  errors = [];
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  for (const [width, height] of [
    [390, 844],
    [768, 1024],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4321/work/qadeer-jewellers/', {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${directory}/${width}-fold.png` });
    for (const img of await page.locator('main img:visible').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((image) => image.decode());
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `${directory}/${width}-page.png`,
      fullPage: true,
    });
    for (const section of await page
      .locator('[data-case-study] > section')
      .all()) {
      const id = await section.getAttribute('id');
      const bounds = await section.boundingBox();
      await page.setViewportSize({
        width,
        height: Math.max(height, Math.ceil(bounds.height)),
      });
      await section.scrollIntoViewIfNeeded();
      for (const img of await section.locator('img:visible').all())
        await img.evaluate((image) => image.decode());
      await section.screenshot({ path: `${directory}/${width}-${id}.png` });
      await page.setViewportSize({ width, height });
    }
    audit.push(
      await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      })),
    );
    console.log(`Captured ${width}px`);
  }
} finally {
  await browser.close();
}
await writeFile(
  'artifacts/qadeer/visual-audit.json',
  JSON.stringify({ audit, errors }, null, 2),
);
console.log(JSON.stringify({ audit, errors }));
