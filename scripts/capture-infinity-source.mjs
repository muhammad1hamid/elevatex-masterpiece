import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const dir = 'artifacts/infinity/source';
const outputDir = 'public/images/work/infinity';
await mkdir(dir, { recursive: true });
await mkdir(outputDir, { recursive: true });
const manifest = {
  url: 'https://infinity-salon-swart.vercel.app/',
  capturedAt: new Date().toISOString(),
  captures: [],
  errors: [],
};
const browser = await chromium.launch({ channel: 'chrome' });
const optimize = async (name, widths) => {
  const source = `${dir}/${name}.png`;
  const meta = await sharp(source).metadata();
  const outputs = [];
  for (const width of widths)
    for (const format of ['avif', 'webp']) {
      const file = `${outputDir}/${name}-${width}.${format}`;
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
    width: meta.width,
    height: meta.height,
    provenance: 'verifiedScreenshot',
    outputs,
  });
};
const ready = async (page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2200);
  await page
    .locator('img')
    .evaluateAll(async (imgs) =>
      Promise.all(
        imgs
          .filter((i) => i.getBoundingClientRect().top < innerHeight)
          .map((i) => i.decode().catch(() => {})),
      ),
    );
};
const captureSection = async (page, id, name) => {
  const section = page.locator(id).first();
  if (!(await section.count())) return;
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await section
    .locator('img')
    .evaluateAll(async (imgs) =>
      Promise.all(imgs.map((i) => i.decode().catch(() => {}))),
    );
  const box = await section.boundingBox();
  await page.setViewportSize({
    width: 1440,
    height: Math.max(900, Math.ceil(box.height)),
  });
  await section.screenshot({
    path: `${dir}/${name}.png`,
    animations: 'disabled',
  });
  await optimize(name, [640, 1000, 1440]);
  await page.setViewportSize({ width: 1440, height: 900 });
};
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  page.on('pageerror', (e) => manifest.errors.push(e.message));
  const response = await page.goto(manifest.url, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
  await ready(page);
  Object.assign(manifest, {
    status: response.status(),
    finalUrl: page.url(),
    title: await page.title(),
    headings: await page.locator('h1,h2,h3').allTextContents(),
    text: (await page.locator('body').innerText()).slice(0, 22000),
    links: await page.locator('a').evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent?.trim(),
        href: el.getAttribute('href'),
      })),
    ),
    buttons: await page.locator('button').evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent?.trim(),
        label: el.getAttribute('aria-label'),
      })),
    ),
    forms: await page.locator('form').evaluateAll((els) =>
      els.map((el) => ({
        action: el.getAttribute('action'),
        fields: [...el.querySelectorAll('input,select,textarea')].map((i) => ({
          name: i.name,
          type: i.type,
          placeholder: i.getAttribute('placeholder'),
        })),
      })),
    ),
    sections: await page.locator('section').evaluateAll((els) =>
      els.map((el) => ({
        id: el.id,
        heading: el.querySelector('h2,h3')?.textContent,
      })),
    ),
    visualSamples: await page.locator('h1,h2,nav,body').evaluateAll((els) =>
      els.slice(0, 10).map((el) => {
        const c = getComputedStyle(el);
        return {
          element: el.tagName,
          text: el.textContent?.trim().slice(0, 80),
          font: c.fontFamily,
          color: c.color,
          background: c.backgroundColor,
        };
      }),
    ),
  });
  await page.screenshot({ path: `${dir}/desktop.png`, animations: 'disabled' });
  await optimize('desktop', [640, 1000, 1440]);
  await page
    .locator('header')
    .first()
    .screenshot({ path: `${dir}/navigation.png` });
  await optimize('navigation', [640, 1440]);
  for (const section of await page.locator('section').all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await section
      .locator('img')
      .evaluateAll(async (imgs) =>
        Promise.all(imgs.map((i) => i.decode().catch(() => {}))),
      );
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `${dir}/full-page.png`,
    fullPage: true,
    animations: 'disabled',
  });
  const fullMeta = await sharp(`${dir}/full-page.png`).metadata();
  await optimize('full-page', [
    Math.min(800, Math.floor((16000 * 1440) / fullMeta.height)),
  ]);
  await captureSection(page, '#services', 'services');
  await captureSection(page, '#about', 'about');
  await captureSection(page, '#booking', 'enquiry');
  await captureSection(page, '#contact', 'contact');
  // Inspect a real service filter, if present. Never submit forms or contact anyone.
  const hair = page.getByRole('button', { name: /^hair$/i }).first();
  if (await hair.count()) {
    await hair.click();
    await page.waitForTimeout(500);
    manifest.serviceInteraction = {
      text: await page.locator('#services').innerText(),
      url: page.url(),
    };
    await captureSection(page, '#services', 'hair-services');
  }
  for (const [name, width, height] of [
    ['large-desktop', 1920, 1080],
    ['tablet', 768, 1024],
    ['mobile', 390, 844],
  ]) {
    const responsive = await browser.newPage({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    await responsive.goto(manifest.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await ready(responsive);
    await responsive.screenshot({
      path: `${dir}/${name}.png`,
      animations: 'disabled',
    });
    await optimize(name, name === 'large-desktop' ? [1200, 1920] : [width]);
    if (name === 'mobile') {
      manifest.mobile = await responsive.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        buttons: [...document.querySelectorAll('button')].map((el) => ({
          text: el.textContent?.trim(),
          label: el.getAttribute('aria-label'),
        })),
      }));
      const menu = responsive.getByRole('button', { name: /menu/i }).first();
      if (await menu.count()) {
        await menu.click();
        await responsive.waitForTimeout(400);
        manifest.mobileMenu = await responsive.locator('body').innerText();
        await responsive.screenshot({
          path: `${dir}/mobile-menu.png`,
          animations: 'disabled',
        });
        await optimize('mobile-menu', [390]);
      }
    }
    await responsive.close();
  }
  console.log(
    JSON.stringify({
      status: manifest.status,
      title: manifest.title,
      sections: manifest.sections,
      buttons: manifest.buttons,
      forms: manifest.forms,
      mobile: manifest.mobile,
      captures: manifest.captures.map(({ name, width, height }) => ({
        name,
        width,
        height,
      })),
    }),
  );
} finally {
  await browser.close();
  await writeFile(
    `${dir}/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}
