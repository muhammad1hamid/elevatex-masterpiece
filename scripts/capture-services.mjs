import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const directory = 'artifacts/services-review';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
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
    const sectionHeight = await page
      .locator('#services')
      .evaluate((section) => Math.ceil(section.getBoundingClientRect().height));
    await page.setViewportSize({
      width,
      height: Math.max(960, sectionHeight + 2),
    });
    await page
      .locator('#services')
      .screenshot({ path: `${directory}/services-${width}.png` });
    await page.setViewportSize({ width, height: 960 });
    if (width === 1440 || width === 390) {
      await page
        .locator('#services')
        .evaluate((section) =>
          window.scrollTo(
            0,
            section.getBoundingClientRect().top + scrollY - 220,
          ),
        );
      await page.screenshot({ path: `${directory}/transition-${width}.png` });
    }
    const measurement = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      panels: [...document.querySelectorAll('.service-panel')].map((panel) => {
        const { x, y, width, height } = panel.getBoundingClientRect();
        return { x, y, width, height };
      }),
      decorativeImages: document.querySelectorAll('#services img').length,
    }));
    results.push({ ...measurement, errors });
    console.log(
      JSON.stringify({
        width,
        errors,
        overflow: measurement.scrollWidth > width,
      }),
    );
    await page.close();
  }
} finally {
  await browser.close();
  await writeFile(
    `${directory}/measurements.json`,
    `${JSON.stringify(results, null, 2)}\n`,
  );
}
