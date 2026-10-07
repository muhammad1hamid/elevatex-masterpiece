import { mkdir, writeFile } from 'node:fs/promises';
import { closeSync, openSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from '@playwright/test';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const outputDirectory = path.join(projectRoot, 'artifacts', 'hero-review');
const previewUrl = 'http://127.0.0.1:4321/';
const viewports = [
  { name: 'desktop-1536x864', width: 1536, height: 864 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-320x568', width: 320, height: 568 },
];

async function previewIsAvailable() {
  try {
    const response = await fetch(previewUrl, {
      signal: AbortSignal.timeout(1500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

await mkdir(outputDirectory, { recursive: true });
let startedPreview = false;
if (!(await previewIsAvailable())) {
  const previewLog = openSync(path.join(outputDirectory, 'preview.log'), 'a');
  const preview = spawn(
    process.execPath,
    [
      path.join(projectRoot, 'node_modules', 'astro', 'bin', 'astro.mjs'),
      'preview',
      '--host',
      '127.0.0.1',
      '--port',
      '4321',
    ],
    {
      cwd: projectRoot,
      detached: true,
      windowsHide: true,
      stdio: ['ignore', previewLog, previewLog],
    },
  );
  closeSync(previewLog);
  preview.unref();
  startedPreview = true;
  const deadline = Date.now() + 15000;
  while (!(await previewIsAvailable())) {
    if (Date.now() >= deadline) {
      throw new Error(
        `Preview did not become available; inspect ${outputDirectory}/preview.log`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const captures = [];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'reduce',
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(previewUrl, { waitUntil: 'load' });
    await page.locator('[data-hero-root]').waitFor({ state: 'visible' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.querySelectorAll('.hero img')].map(async (image) => {
          if (image.getClientRects().length === 0) return;
          try {
            await image.decode();
          } catch {
            /* Record failed images below. */
          }
        }),
      );
    });
    const measurements = await page.evaluate(() => {
      const selectors = {
        hero: '[data-hero-root]',
        header: '[data-site-header]',
        title: '#hero-title',
        description: '.hero__subtitle',
        actions: '.hero__actions',
        primary: '.hero__cta--primary',
        secondary: '.hero__cta--secondary',
        laptop: '.hero__laptop',
        pedestal: '.hero__pedestal',
        halo: '.hero__halo-position',
      };
      const boxes = Object.fromEntries(
        Object.entries(selectors).map(([name, selector]) => {
          const element = document.querySelector(selector);
          if (!element) return [name, null];
          const { x, y, width, height } = element.getBoundingClientRect();
          return [name, { x, y, width, height }];
        }),
      );
      return {
        boxes,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        motion: document
          .querySelector('[data-hero-root]')
          ?.getAttribute('data-motion'),
        fonts: document.fonts.status,
        images: [...document.querySelectorAll('.hero img')].map((image) => ({
          url: image.currentSrc,
          loaded: image.complete && image.naturalWidth > 0,
        })),
      };
    });
    const heroPath = path.join(outputDirectory, `${viewport.name}-hero.png`);
    const viewportPath = path.join(
      outputDirectory,
      `${viewport.name}-viewport.png`,
    );
    await page
      .locator('[data-hero-root]')
      .screenshot({ path: heroPath, animations: 'disabled' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: viewportPath, animations: 'disabled' });
    const capture = {
      viewport,
      heroPath,
      viewportPath,
      ...measurements,
      errors,
    };
    captures.push(capture);
    console.log(
      JSON.stringify({
        viewport: viewport.name,
        heroPath,
        boxes: measurements.boxes,
        errors,
      }),
    );
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(
  path.join(outputDirectory, 'measurements.json'),
  JSON.stringify(
    {
      previewUrl,
      startedPreview,
      capturedAt: new Date().toISOString(),
      captures,
    },
    null,
    2,
  ) + '\n',
);
