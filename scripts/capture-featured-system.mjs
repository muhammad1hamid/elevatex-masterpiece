import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const directory = 'artifacts/typography-handoff-review';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const [width, height] of [
    [320, 568],
    [360, 800],
    [375, 812],
    [390, 844],
    [393, 852],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1366, 768],
    [1440, 900],
    [1536, 864],
    [1920, 1080],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
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
    const section = page.locator('#featured-system');
    const sectionHeight = await section.evaluate((element) =>
      Math.ceil(element.getBoundingClientRect().height),
    );
    await page.setViewportSize({
      width,
      height: Math.max(height, sectionHeight + 2),
    });
    await section.screenshot({
      path: `${directory}/featured-system-${width}.png`,
    });
    await page.setViewportSize({ width, height });
    await section.evaluate((element) =>
      window.scrollTo(0, element.getBoundingClientRect().top + scrollY),
    );
    await page.screenshot({ path: `${directory}/viewport-${width}.png` });
    if (width === 1440 || width === 390) {
      await section.evaluate((element) =>
        window.scrollTo(0, element.getBoundingClientRect().top + scrollY - 220),
      );
      await page.screenshot({ path: `${directory}/transition-${width}.png` });
    }
    const measurement = await page.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      panels: [
        ...document.querySelectorAll(
          '.message-input, .system-connection, .order-output',
        ),
      ].map((panel) => {
        const { x, y, width, height } = panel.getBoundingClientRect();
        return { name: panel.className, x, y, width, height };
      }),
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
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
    reducedMotion: 'no-preference',
    deviceScaleFactor: 1,
  });
  await desktop.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', '1'),
  );
  await desktop.goto('http://127.0.0.1:4321/');
  await desktop.evaluate(() => document.fonts.ready);
  await desktop.locator('#featured-system').scrollIntoViewIfNeeded();
  // Let the observer start and finish its capped entrance before capturing.
  await desktop.waitForTimeout(1100);
  await desktop.waitForFunction(
    () =>
      document
        .querySelector('#featured-system')
        .getAnimations({ subtree: true }).length === 0,
  );
  await desktop
    .locator('#featured-system')
    .screenshot({ path: `${directory}/desktop-interactive.png` });
  await desktop.clock.install();
  await desktop.clock.pauseAt(new Date());
  await desktop.locator('[data-workflow-play]').click();
  for (const [phase, elapsed] of [
    ['message', 0],
    ['processing', 300],
    ['draft', 550],
    ['complete', 900],
  ]) {
    await desktop.clock.runFor(elapsed);
    await desktop
      .locator('[data-system-preview]')
      .screenshot({ path: `${directory}/workflow-${phase}.png` });
  }
  await desktop.close();
} finally {
  await browser.close();
  await writeFile(
    `${directory}/measurements.json`,
    `${JSON.stringify(results, null, 2)}\n`,
  );
}
