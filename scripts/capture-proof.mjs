import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const directory = 'artifacts/proof-review';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const captures = [];
try {
  for (const width of [
    320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1536, 1920,
  ]) {
    const page = await browser.newPage({
      viewport: { width, height: 960 },
      reducedMotion: 'reduce',
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto('http://127.0.0.1:4321/');
    await page.evaluate(() => document.fonts.ready);
    for (const project of await page.locator('.project').all()) {
      await project.scrollIntoViewIfNeeded();
      await project.locator('img').evaluate((img) => img.decode());
    }
    // Fit the entire section before capturing to avoid Chromium's offscreen
    // fixed-element artifacts when an element is taller than the viewport.
    const sectionHeight = await page
      .locator('#proof')
      .evaluate((section) => Math.ceil(section.getBoundingClientRect().height));
    await page.setViewportSize({
      width,
      height: Math.max(960, sectionHeight + 2),
    });
    await page
      .locator('#proof')
      .screenshot({ path: `${directory}/proof-${width}.png` });
    await page.setViewportSize({ width, height: 960 });
    if (width === 1440 || width === 390) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: `${directory}/full-page-${width}.png`,
        fullPage: true,
      });
      await page
        .locator('#proof')
        .evaluate((section) =>
          window.scrollTo(
            0,
            section.getBoundingClientRect().top + window.scrollY - 240,
          ),
        );
      await page.screenshot({ path: `${directory}/transition-${width}.png` });
    }
    const result = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      sectionHeight: document.querySelector('#proof').getBoundingClientRect()
        .height,
      images: [...document.querySelectorAll('.project img')].map((img) => ({
        src: img.currentSrc,
        loaded: img.complete && img.naturalWidth > 0,
      })),
    }));
    captures.push({ ...result, errors });
    console.log(
      JSON.stringify({ width, errors, overflow: result.scrollWidth > width }),
    );
    await page.close();
  }
} finally {
  await browser.close();
  await writeFile(
    `${directory}/measurements.json`,
    `${JSON.stringify(captures, null, 2)}\n`,
  );
}
