import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const output = 'artifacts/web-development';
// Resting-state captures exclude an offscreen fixed-link capture artifact.
// The keyboard-focused skip link is verified separately and remains visible.
const restingCaptureStyle =
  '.skip-link:not(:focus) { visibility: hidden !important; }';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [],
  failed = [],
  rows = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('response', (response) => {
  if (response.status() >= 400)
    failed.push([response.status(), response.url()]);
});
for (const [width, height] of [
  [320, 568],
  [390, 844],
  [768, 1024],
  [820, 1180],
  [1024, 768],
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
]) {
  await page.setViewportSize({ width, height });
  await page.goto('http://127.0.0.1:4321/services/web-development/', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => document.fonts.ready);
  const geometry = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    heroCTA: [...document.querySelectorAll('#web-hero .service-actions a')].map(
      (el) => ({
        text: el.textContent.trim(),
        bottom: el.getBoundingClientRect().bottom,
        width: el.getBoundingClientRect().width,
      }),
    ),
    headings: [...document.querySelectorAll('h1,h2')].map((el) => ({
      tag: el.tagName,
      text: el.textContent.trim(),
    })),
  }));
  rows.push(geometry);
  await page.screenshot({
    path: `${output}/fold-${width}.png`,
    style: restingCaptureStyle,
  });
  for (const img of await page.locator('[data-web-development] img').all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate((element) => element.decode());
  }
  for (const section of await page
    .locator('[data-web-development] > section,body > footer')
    .all()) {
    await section.scrollIntoViewIfNeeded();
    if ([390, 1440].includes(width)) {
      const id = await section.getAttribute('id');
      await section.screenshot({
        path: `${output}/section-${width}-${id}.png`,
        style: restingCaptureStyle,
      });
    }
  }
  await page.evaluate(() => scrollTo(0, 0));
  if ([390, 768, 1440, 1920].includes(width))
    await page.screenshot({
      path: `${output}/page-${width}.png`,
      fullPage: true,
      style: restingCaptureStyle,
    });
  if ([390, 1440].includes(width)) {
    for (const id of ['understand', 'structure', 'design', 'build', 'launch']) {
      await page.locator(`label[for="web-build-${id}"]`).click();
      await page
        .locator('.web-build-process__visual')
        .screenshot({ path: `${output}/process-${width}-${id}.png` });
    }
  }
}
await writeFile(
  `${output}/visual-audit.json`,
  JSON.stringify({ rows, errors, failed }, null, 2),
);
console.log(
  JSON.stringify({
    widths: rows.map((row) => ({
      width: row.width,
      scrollWidth: row.scrollWidth,
      heroCTA: row.heroCTA,
    })),
    errors,
    failed,
  }),
);
await browser.close();
