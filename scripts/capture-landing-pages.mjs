import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const directory = 'artifacts/landing-pages';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const results = [],
    errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(r.url());
  });
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4321/services/landing-pages/', {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    results.push(
      await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        headings: [...document.querySelectorAll('main h1,main h2')].map(
          (h) => ({
            text: h.textContent?.trim(),
            align: getComputedStyle(h).textAlign,
          }),
        ),
      })),
    );
    await page.addStyleTag({
      content: '.skip-link:not(:focus){visibility:hidden}',
    });
    await page.screenshot({ path: `${directory}/fold-${width}.png` });
    if ([390, 1440].includes(width)) {
      for (const img of await page.locator('main img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(async (image) => {
          await image.decode();
          if (!image.naturalWidth)
            throw new Error('Project image did not load');
        });
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `${directory}/page-${width}.png`,
        fullPage: true,
      });
      for (const section of await page
        .locator('[data-landing-page] > section')
        .all()) {
        const id = await section.getAttribute('id');
        const bounds = await section.boundingBox();
        // Give tall sections a real viewport so offscreen raster layers paint.
        await page.setViewportSize({
          width,
          height: Math.max(height, Math.ceil(bounds?.height ?? height)),
        });
        await section.scrollIntoViewIfNeeded();
        for (const img of await section.locator('img').all())
          await img.evaluate((image) => image.decode());
        await section.screenshot({ path: `${directory}/${width}-${id}.png` });
        await page.setViewportSize({ width, height });
      }
    }
  }
  await writeFile(
    `${directory}/visual-audit.json`,
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(
    JSON.stringify({
      widths: results.map((r) => [r.width, r.scrollWidth]),
      errors,
    }),
  );
} finally {
  await browser.close();
}
