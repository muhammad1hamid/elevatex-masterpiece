import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const directory = 'artifacts/qadeer/source';
const publicDirectory = 'public/images/work/qadeer';
await mkdir(directory, { recursive: true });
await mkdir(publicDirectory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const manifest = {
  url: 'https://qadeerjewellers.vercel.app/',
  capturedAt: new Date().toISOString(),
  captures: [],
};
const optimize = async (name, widths) => {
  const source = `${directory}/${name}.png`;
  const metadata = await sharp(source).metadata();
  const outputs = [];
  for (const width of widths)
    for (const format of ['avif', 'webp']) {
      const file = `${publicDirectory}/${name}-${width}.${format}`;
      const result = await sharp(source)
        .resize({ width })
        .toFormat(format, { quality: format === 'avif' ? 60 : 85 })
        .toFile(file);
      outputs.push({
        file,
        width: result.width,
        height: result.height,
        bytes: result.size,
      });
    }
  manifest.captures.push({
    name,
    source,
    width: metadata.width,
    height: metadata.height,
    provenance: 'verifiedScreenshot',
    outputs,
  });
};
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const response = await page.goto(manifest.url, {
    waitUntil: 'load',
    timeout: 60000,
  });
  if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(6000);
  Object.assign(manifest, {
    status: response.status(),
    title: await page.title(),
    finalUrl: page.url(),
    headings: await page.locator('h1,h2,h3').allTextContents(),
    text: (await page.locator('body').innerText()).slice(0, 20000),
    links: await page.locator('a').evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent?.trim(),
        href: el.getAttribute('href'),
      })),
    ),
    buttons: await page.getByRole('button').allTextContents(),
    visualSamples: await page.locator('h1,h2,nav,a').evaluateAll((els) =>
      els.slice(0, 20).map((el) => {
        const css = getComputedStyle(el);
        return {
          element: el.tagName,
          text: el.textContent?.trim().slice(0, 80),
          font: css.fontFamily,
          color: css.color,
          background: css.backgroundColor,
        };
      }),
    ),
  });
  await page.screenshot({
    path: `${directory}/desktop.png`,
    animations: 'disabled',
  });
  await optimize('desktop', [640, 1000, 1440]);
  const nav = page.locator('header').first();
  if (await nav.count()) {
    await nav.screenshot({ path: `${directory}/navigation.png` });
    await optimize('navigation', [640, 1200]);
  }
  // Scroll each real section into view so native lazy images and entrances finish.
  for (const section of await page.locator('section').all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    for (const img of await section.locator('img').all())
      await img.evaluate((image) => image.decode().catch(() => {}));
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `${directory}/full-page.png`,
    fullPage: true,
    animations: 'disabled',
  });
  await optimize('full-page', [800]);
  const collections = page
    .locator('section')
    .filter({
      has: page.getByRole('heading', { name: 'Collections', exact: true }),
    })
    .first();
  if (await collections.count()) {
    await collections.scrollIntoViewIfNeeded();
    const bounds = await collections.boundingBox();
    await page.setViewportSize({
      width: 1440,
      height: Math.max(900, Math.ceil(bounds.height)),
    });
    await collections.screenshot({
      path: `${directory}/collections.png`,
      animations: 'disabled',
    });
    await optimize('collections', [640, 1000, 1440]);
  }
  const category = page.getByRole('button', {
    name: 'Explore the Gold collection',
    exact: true,
  });
  if (await category.count()) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await category.click();
    await page.waitForTimeout(1500);
    manifest.categoryInteraction = {
      url: page.url(),
      headings: await page.locator('h1,h2').allTextContents(),
      dialogs: await page.getByRole('dialog').allTextContents(),
    };
    await page.screenshot({
      path: `${directory}/collection-detail.png`,
      animations: 'disabled',
    });
    await optimize('collection-detail', [640, 1000, 1440]);
  }
  for (const [name, width, height] of [
    ['large-desktop', 1920, 1080],
    ['tablet', 768, 1024],
    ['mobile', 390, 844],
  ]) {
    const responsivePage = await browser.newPage({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    await responsivePage.goto(manifest.url, { waitUntil: 'load' });
    await responsivePage.evaluate(() => document.fonts.ready);
    await responsivePage.waitForTimeout(5000);
    await responsivePage.screenshot({
      path: `${directory}/${name}.png`,
      animations: 'disabled',
    });
    await optimize(name, name === 'large-desktop' ? [1200, 1920] : [width]);
    if (name === 'mobile') {
      manifest.mobile = await responsivePage.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        buttons: [...document.querySelectorAll('button')].map((el) => ({
          text: el.textContent,
          label: el.getAttribute('aria-label'),
        })),
      }));
      const menu = responsivePage
        .getByRole('button', { name: /menu/i })
        .first();
      if (await menu.count()) {
        await menu.click();
        await responsivePage.waitForTimeout(500);
        await responsivePage.screenshot({
          path: `${directory}/mobile-menu.png`,
          animations: 'disabled',
        });
        await optimize('mobile-menu', [390]);
      }
    }
    await responsivePage.close();
  }
  manifest.errors = errors;
  console.log(
    JSON.stringify({
      status: manifest.status,
      title: manifest.title,
      headings: manifest.headings,
      mobile: manifest.mobile,
      captures: manifest.captures.map((c) => ({
        name: c.name,
        width: c.width,
        height: c.height,
      })),
    }),
  );
} finally {
  await browser.close();
  await writeFile(
    `${directory}/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}
