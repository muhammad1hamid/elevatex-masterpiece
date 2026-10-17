import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const directory = 'artifacts/ai-automation';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [],
  errors = [];
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
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
    await page.goto('http://127.0.0.1:4321/services/ai-automation/', {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    results.push(
      await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        heading: document.querySelector('h1')?.textContent,
        centered: [
          ...document.querySelectorAll(
            '[data-ai-automation] h1,[data-ai-automation] h2',
          ),
        ].map((element) => ({
          text: element.textContent,
          align: getComputedStyle(element).textAlign,
        })),
      })),
    );
    const style = '.skip-link:not(:focus){visibility:hidden!important}';
    await page.screenshot({ path: `${directory}/fold-${width}.png`, style });
    if (width === 390 || width === 1440) {
      await page.screenshot({
        path: `${directory}/page-${width}.png`,
        fullPage: true,
        style,
      });
      for (const section of await page
        .locator('[data-ai-automation] > section')
        .all()) {
        const id = await section.getAttribute('id');
        await section.screenshot({
          path: `${directory}/section-${width}-${id}.png`,
          style,
        });
      }
      for (const value of ['intent', 'approval', 'followup']) {
        await page.locator(`#inquiry-${value}`).check({ force: true });
        await page.locator('.inquiry-system').screenshot({
          path: `${directory}/workflow-${width}-${value}.png`,
          style,
        });
      }
    }
  }
  await writeFile(
    `${directory}/visual-audit.json`,
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(
    JSON.stringify({
      widths: results.map((row) => [row.width, row.scrollWidth]),
      errors,
    }),
  );
} finally {
  await browser.close();
}
