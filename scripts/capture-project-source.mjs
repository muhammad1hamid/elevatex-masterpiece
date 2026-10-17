import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const [slug, url] = process.argv.slice(2);
if (
  !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? '') ||
  !url?.startsWith('https://')
)
  throw new Error('Supply a safe project slug and HTTPS URL.');
const dir = `artifacts/${slug}/source`;
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const manifest = {
  url,
  capturedAt: new Date().toISOString(),
  captures: [],
  errors: [],
};
const ready = async (page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
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
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  page.on('pageerror', (e) => manifest.errors.push(e.message));
  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await ready(page);
  Object.assign(manifest, {
    status: response?.status(),
    finalUrl: page.url(),
    title: await page.title(),
    headings: await page.locator('h1,h2,h3').allTextContents(),
    text: (await page.locator('body').innerText()).slice(0, 24000),
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
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 80),
          font: c.fontFamily,
          color: c.color,
          background: c.backgroundColor,
        };
      }),
    ),
  });
  await page.screenshot({ path: `${dir}/desktop.png`, animations: 'disabled' });
  manifest.captures.push({ name: 'desktop', width: 1440, height: 900 });
  for (const section of await page.locator('section').all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
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
  manifest.captures.push({
    name: 'full-page',
    width: 1440,
    height: await page.locator('body').evaluate((el) => el.scrollHeight),
  });
  for (const id of [
    'services',
    'about',
    'gallery',
    'contact',
    'quote',
    'booking',
  ]) {
    const section = page.locator(`#${id}`).first();
    if (!(await section.count())) continue;
    const box = await section.boundingBox();
    await page.setViewportSize({
      width: 1440,
      height: Math.max(900, Math.ceil(box.height) + 200),
    });
    await section.scrollIntoViewIfNeeded();
    await page.evaluate(
      (el) =>
        scrollTo({
          top: scrollY + el.getBoundingClientRect().top - 100,
          behavior: 'instant',
        }),
      await section.elementHandle(),
    );
    await page.waitForTimeout(300);
    await section.screenshot({
      path: `${dir}/${id}.png`,
      animations: 'disabled',
    });
    manifest.captures.push({
      name: id,
      width: Math.round(box.width),
      height: Math.ceil(box.height),
    });
    await page.setViewportSize({ width: 1440, height: 900 });
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
    await responsive.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await ready(responsive);
    await responsive.screenshot({
      path: `${dir}/${name}.png`,
      animations: 'disabled',
    });
    manifest.captures.push({ name, width, height });
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
        await responsive.waitForTimeout(300);
        await responsive.screenshot({
          path: `${dir}/mobile-menu.png`,
          animations: 'disabled',
        });
        manifest.captures.push({ name: 'mobile-menu', width, height });
        manifest.mobileMenu = await responsive.locator('body').innerText();
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
    }),
  );
} finally {
  await browser.close();
  await writeFile(
    `${dir}/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}
