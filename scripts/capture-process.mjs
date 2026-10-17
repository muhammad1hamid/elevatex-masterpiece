import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const directory = 'artifacts/process-review';
const previewUrl =
  process.env['PROCESS_PREVIEW_URL'] ?? 'http://127.0.0.1:4321';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const [width, height] of [
    [320, 568],
    [360, 800],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1440, 900],
    [1536, 864],
    [1920, 1080],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    await page.goto(`${previewUrl}/`);
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#process');
    await section.scrollIntoViewIfNeeded();
    if (width >= 1024) {
      await page
        .locator('.process-visual img')
        .evaluateAll((images) =>
          Promise.all(images.map((image) => image.decode())),
        );
    }
    const sectionHeight = await section.evaluate((element) =>
      Math.ceil(element.getBoundingClientRect().height),
    );
    await page.setViewportSize({
      width,
      height: Math.max(height, sectionHeight + 2),
    });
    await section.screenshot({ path: `${directory}/process-${width}.png` });
    await page.setViewportSize({ width, height });
    results.push(
      await page.evaluate(() => ({
        width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        height: document.querySelector('#process').getBoundingClientRect()
          .height,
      })),
    );
    await page.close();
    console.log(`Captured ${width}px`);
  }
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', '1'),
  );
  await page.goto(`${previewUrl}/`);
  await page.locator('#process-heading').scrollIntoViewIfNeeded();
  await page.waitForSelector('[data-process-enhanced]');
  for (let index = 0; index < 5; index++) {
    await page
      .locator('[data-process-node]')
      .nth(index)
      .evaluate((node) => {
        const box = node.getBoundingClientRect();
        window.scrollTo(
          0,
          scrollY + box.top + box.height / 2 - innerHeight * 0.46 + 8,
        );
      });
    await page.waitForTimeout(750);
    await page.screenshot({ path: `${directory}/active-${index + 1}.png` });
  }
  await page.close();
} finally {
  await browser.close();
  await writeFile(
    `${directory}/measurements.json`,
    JSON.stringify(results, null, 2),
  );
}
