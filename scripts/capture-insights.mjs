import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const directory = 'artifacts/insights/screenshots';
const baseURL = 'http://127.0.0.1:4321';
const pages = [
  ['listing', '/insights/'],
  ['website', '/insights/what-makes-a-website-convert-in-2026/'],
  ['automation', '/insights/where-ai-automation-saves-businesses-time/'],
  ['support', '/insights/ai-chatbots-vs-traditional-customer-support/'],
];
const viewports = [
  [390, 844],
  [768, 1024],
  [1440, 900],
  [1920, 1080],
];
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const audit = [],
  errors = [];
try {
  for (const [width, height] of viewports) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    for (const [name, path] of pages) {
      const response = await page.goto(`${baseURL}${path}`, {
        waitUntil: 'networkidle',
      });
      if (!response?.ok()) throw new Error(`${path}: ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({
        content: '.skip-link:not(:focus) { visibility: hidden !important; }',
      });
      await page.screenshot({ path: `${directory}/${name}-${width}-fold.png` });
      await page
        .locator('[data-journal-page] img')
        .evaluateAll(async (nodes) => {
          await Promise.all(
            nodes.map(async (image) => {
              image.loading = 'eager';
              await image.decode();
            }),
          );
        });
      const pageHeight = await page.evaluate(
        () => document.documentElement.scrollHeight,
      );
      const maximumCaptureHeight = 30000;
      if (pageHeight <= maximumCaptureHeight) {
        await page.screenshot({
          path: `${directory}/${name}-${width}-page.png`,
          fullPage: true,
        });
      } else {
        await page.screenshot({
          path: `${directory}/${name}-${width}-page-start.png`,
          clip: { x: 0, y: 0, width, height: maximumCaptureHeight },
        });
      }
      const sections =
        name === 'listing'
          ? [
              ['featured', '#featured-insight'],
              ['latest', '.journal-latest'],
              ['cta', '.journal-cta'],
            ]
          : [
              ['cover', '.insight-cover'],
              ['toc', '.insight-toc'],
              ['diagram', '.article-diagram'],
              ['related', '.insight-related'],
              ['cta', '.insight-service-cta'],
              ...(name === 'support' ? [['comparison', '.article-table']] : []),
            ];
      for (const [part, selector] of sections) {
        const target = page.locator(selector).first();
        if (!(await target.count())) continue;
        await target.scrollIntoViewIfNeeded();
        await target.screenshot({
          path: `${directory}/${name}-${width}-${part}.png`,
        });
      }
      audit.push(
        await page.evaluate(
          ({ name, path, pageHeight, maximumCaptureHeight }) => ({
            name,
            path,
            width: innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            pageHeight,
            fullPageCaptured: pageHeight <= maximumCaptureHeight,
            images: [
              ...document.querySelectorAll('[data-journal-page] img'),
            ].map((image) => ({
              src: image.currentSrc,
              complete: image.complete,
              width: image.naturalWidth,
            })),
          }),
          { name, path, pageHeight, maximumCaptureHeight },
        ),
      );
      console.log(`Captured ${name} at ${width}px`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
await writeFile(
  'artifacts/insights/visual-audit.json',
  JSON.stringify({ audit, errors }, null, 2) + '\n',
);
console.log(JSON.stringify({ pagesCaptured: audit.length, errors }));
