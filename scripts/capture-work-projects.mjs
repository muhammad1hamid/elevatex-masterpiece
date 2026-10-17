import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const projects = [
  ['qadeer-jewellers', 'https://qadeerjewellers.vercel.app/'],
  ['infinity-salon', 'https://infinity-salon-swart.vercel.app/'],
  ['apex-detailing', 'https://apex-detailing-studio-phi.vercel.app/'],
  ['fortress-vision', 'https://fortress-vision.vercel.app/'],
  ['bridal-house', 'https://bridal-house-canvas-main.vercel.app/'],
  ['defence-marquee', 'https://defence-marquee.vercel.app/'],
];
const directory = 'artifacts/work/project-sources';
await mkdir(directory, { recursive: true });
await mkdir('public/images/work', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const manifest = [];
try {
  for (const [id, url] of projects) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1080 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const record = {
      id,
      url,
      capturedAt: new Date().toISOString(),
      outputs: [],
    };
    try {
      const response = await page.goto(url, {
        waitUntil: 'load',
        timeout: 60000,
      });
      record.status = response?.status();
      if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(6000);
      Object.assign(record, {
        finalUrl: page.url(),
        title: await page.title(),
        headings: await page.locator('h1,h2').allTextContents(),
        text: (await page.locator('body').innerText()).slice(0, 14000),
      });
      await page.screenshot({
        path: `${directory}/${id}.png`,
        animations: 'disabled',
      });
      // Retain approved homepage previews. Only new projects receive new desktop assets.
      if (
        !['qadeer-jewellers', 'infinity-salon', 'apex-detailing'].includes(id)
      ) {
        for (const width of [480, 800, 1200])
          for (const format of ['avif', 'webp']) {
            const file = `public/images/work/${id}-${width}.${format}`;
            const result = await sharp(`${directory}/${id}.png`)
              .resize({ width })
              .toFormat(format, { quality: format === 'avif' ? 55 : 82 })
              .toFile(file);
            record.outputs.push({ file, bytes: result.size });
          }
      }
      if (id === 'infinity-salon') {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: `${directory}/${id}-mobile.png`,
          animations: 'disabled',
        });
        for (const format of ['avif', 'webp'])
          await sharp(`${directory}/${id}-mobile.png`)
            .toFormat(format, { quality: 75 })
            .toFile(`public/images/work/${id}-mobile.${format}`);
      }
      console.log(
        JSON.stringify({
          id,
          status: record.status,
          title: record.title,
          headings: record.headings,
        }),
      );
    } catch (error) {
      record.error = String(error);
      console.log(JSON.stringify({ id, error: record.error }));
    }
    manifest.push(record);
    await writeFile(
      `${directory}/manifest.json`,
      JSON.stringify(manifest, null, 2),
    );
    await context.close();
  }
} finally {
  await browser.close();
}
