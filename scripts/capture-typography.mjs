import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const directory = 'artifacts/typography-handoff-review';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const measurements = [];
try {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: 'reduce',
    });
    await page.goto('http://127.0.0.1:4321/');
    await page.evaluate(() => document.fonts.ready);
    for (const section of await page.locator('main > section').all()) {
      const id = (await section.getAttribute('id')) || 'hero';
      const height = await section.evaluate((element) =>
        Math.ceil(element.getBoundingClientRect().height),
      );
      await page.setViewportSize({ width, height: Math.max(1000, height + 2) });
      await section.screenshot({
        path: `${directory}/typography-${id}-${width}.png`,
      });
      await page.setViewportSize({ width, height: 1000 });
    }
    measurements.push(
      await page.evaluate(() => ({
        width: innerWidth,
        headings: Array.from(document.querySelectorAll('h1,h2,h3')).map(
          (element) => ({
            text: element.textContent,
            font: getComputedStyle(element).fontFamily,
            size: getComputedStyle(element).fontSize,
            weight: getComputedStyle(element).fontWeight,
          }),
        ),
        fontWidths: (() => {
          const context = document.createElement('canvas').getContext('2d');
          return ['Outfit', 'Arial'].map((font) => {
            context.font = `400 100px "${font}"`;
            return {
              font,
              width: context.measureText(
                'Premium Digital Systems More than a deliverable. From message.',
              ).width,
            };
          });
        })(),
      })),
    );
    await page.close();
    console.log(`Captured all headings at ${width}px`);
  }
} finally {
  await browser.close();
  await writeFile(
    `${directory}/typography-measurements.json`,
    JSON.stringify(measurements, null, 2),
  );
}
