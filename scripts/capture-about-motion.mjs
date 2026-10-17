import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const directory = 'artifacts/about/motion';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' }),
  report = { samples: [], errors: [] };
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => report.errors.push(error.message));
  await page.goto('http://127.0.0.1:4321/about/', {
    waitUntil: 'domcontentloaded',
  });
  const sample = async (name) => {
    await page.screenshot({ path: `${directory}/${name}.png` });
    report.samples.push({
      name,
      ...(await page.evaluate(() => ({
        time: performance.now(),
        scrollY,
        hero:
          document.querySelector('[data-about-page]').dataset.aboutHero ??
          'not-replayed',
        active: document.getAnimations().map((animation) => ({
          state: animation.playState,
          duration: animation.effect?.getTiming().duration,
          target:
            animation.effect instanceof KeyframeEffect
              ? animation.effect.target?.tagName
              : undefined,
        })),
      }))),
    });
  };
  await sample('hero-entry');
  await page.waitForTimeout(320);
  await sample('hero-middle');
  await page.waitForTimeout(1400);
  await sample('hero-final');
  for (const [name, selector] of [
    ['philosophy', '.about-philosophy__stage'],
    ['founder', '.about-founder__composition'],
    ['workspace', '.about-approach__stage'],
    ['workflow', '.about-workflow'],
  ]) {
    const target = page.locator(selector),
      bounds = await target.boundingBox();
    const top = (await page.evaluate(() => scrollY)) + bounds.y;
    // Natural, short increments exercise scroll progress without pinning.
    while ((await page.evaluate(() => scrollY)) < top - 80) {
      await page.evaluate(() => scrollBy(0, 180));
      await page.waitForTimeout(55);
    }
    await sample(`${name}-entry`);
    await page.waitForTimeout(1750);
    await sample(`${name}-final`);
  }
  await page.locator('.about-philosophy__stage').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await sample('reverse-scroll');
  await context.close();
} finally {
  await browser.close();
}
await writeFile(`${directory}/audit.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
