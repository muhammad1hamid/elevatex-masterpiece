import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
const dir = 'artifacts/infinity/source';
const manifest = JSON.parse(await readFile(`${dir}/manifest.json`, 'utf8'));
const browser = await chromium.launch({ channel: 'chrome' });
const save = async (name, locator, widths) => {
  await locator.screenshot({
    path: `${dir}/${name}.png`,
    animations: 'disabled',
  });
  const meta = await sharp(`${dir}/${name}.png`).metadata();
  const outputs = [];
  for (const width of widths)
    for (const format of ['avif', 'webp']) {
      const file = `public/images/work/infinity/${name}-${width}.${format}`;
      const result = await sharp(`${dir}/${name}.png`)
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
  manifest.captures = manifest.captures.filter((c) => c.name !== name);
  manifest.captures.push({
    name,
    source: `${dir}/${name}.png`,
    width: meta.width,
    height: meta.height,
    provenance: 'verifiedScreenshot',
    outputs,
  });
};
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  await page.goto(manifest.url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  const appointment = page.locator('#appointment');
  await appointment.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const bounds = await appointment.boundingBox();
  await page.setViewportSize({
    width: 1440,
    height: Math.max(1000, Math.ceil(bounds.height)),
  });
  await save('appointment', appointment, [640, 1000, 1440]);
  await page.setViewportSize({ width: 1440, height: 900 });
  const gallery = page
    .getByRole('button', {
      name: 'Infinity Salon Precision Hair Cutting',
      exact: false,
    })
    .first();
  await gallery.click();
  await page.waitForTimeout(700);
  manifest.galleryInteraction = await page.evaluate(() => ({
    buttons: [...document.querySelectorAll('button')]
      .filter((b) => b.getBoundingClientRect().width)
      .map((b) => ({
        text: b.textContent?.trim(),
        label: b.getAttribute('aria-label'),
      })),
    dialogs: [...document.querySelectorAll('[role=dialog]')].map(
      (d) => d.textContent,
    ),
    images: [...document.images]
      .filter((i) => i.getBoundingClientRect().width)
      .slice(-4)
      .map((i) => ({ alt: i.alt, src: i.currentSrc })),
  }));
  await save('gallery-open', page, [640, 1000, 1440]);
  await page.keyboard.press('Escape');
  console.log(
    JSON.stringify({ appointment: true, gallery: manifest.galleryInteraction }),
  );
} finally {
  await browser.close();
  await writeFile(
    `${dir}/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}
