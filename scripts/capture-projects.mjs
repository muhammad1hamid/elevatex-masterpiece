import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

// Capture the supplied public concepts as they render. Never reconstruct a
// project preview from generated art or treat on-page metrics as agency proof.
const projects = [
  ['qadeer-jewellers', 'https://qadeerjewellers.vercel.app/'],
  ['infinity-salon', 'https://infinity-salon-swart.vercel.app/'],
  ['apex-detailing', 'https://apex-detailing-studio-phi.vercel.app/'],
];
const captureDirectory = 'artifacts/project-sources';
const assetDirectory = 'public/images/work';
await mkdir(captureDirectory, { recursive: true });
await mkdir(assetDirectory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const manifest = [];
try {
  for (const [id, url] of projects) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1080 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(url, {
      waitUntil: 'load',
      timeout: 60000,
    });
    if (!response?.ok()) throw new Error(`${url}: HTTP ${response?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    // Allow each site's entrance/preloader to finish before capturing.
    await page.waitForTimeout(8000);
    const record = {
      id,
      url,
      finalUrl: page.url(),
      status: response.status(),
      title: await page.title(),
      headings: await page.locator('h1,h2').allTextContents(),
      text: (await page.locator('body').innerText()).slice(0, 16000),
      errors,
      capturedAt: new Date().toISOString(),
      outputs: [],
    };
    const source = `${captureDirectory}/${id}.png`;
    await page.screenshot({ path: source, animations: 'disabled' });
    for (const width of [480, 800, 1200]) {
      for (const format of ['avif', 'webp']) {
        const filename = `${id}-${width}.${format}`;
        const pipeline = sharp(source).resize({ width });
        const output = await (
          format === 'avif'
            ? pipeline.avif({
                quality: 58,
                effort: 5,
                chromaSubsampling: '4:4:4',
              })
            : pipeline.webp({ quality: 83, effort: 5 })
        ).toFile(`${assetDirectory}/${filename}`);
        record.outputs.push({
          filename,
          width: output.width,
          height: output.height,
          bytes: output.size,
        });
      }
    }
    manifest.push(record);
    console.log(JSON.stringify(record));
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(
    `${captureDirectory}/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}
