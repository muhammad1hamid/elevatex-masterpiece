import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const directory = 'artifacts/footer-redesign/screenshots';
const baseURL = process.env['CAPTURE_BASE_URL'] ?? 'http://127.0.0.1:4321';
const routes = [
  ['home', '/'],
  ['about', '/about/'],
  ['contact', '/contact/'],
  ['work', '/work/'],
  ['service', '/services/web-development/'],
  ['case-study', '/work/qadeer-jewellers/'],
  ['listing', '/insights/'],
  ['article', '/insights/what-makes-a-website-convert-in-2026/'],
];
const sizes = [
  [390, 844],
  [768, 1024],
  [1440, 900],
  [1920, 1080],
];
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({
  channel: process.env['PLAYWRIGHT_CHANNEL'] ?? 'chrome',
});
const audit = [],
  errors = [];
try {
  for (const [width, height] of sizes) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    page.on('pageerror', (error) =>
      errors.push({ width, message: error.message }),
    );
    page.on('console', (message) => {
      if (message.type() === 'error')
        errors.push({ width, message: message.text() });
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push({
          width,
          message: `${response.status()} ${response.url()}`,
        });
    });
    for (const [name, path] of routes) {
      const response = await page.goto(`${baseURL}${path}`, {
        waitUntil: 'networkidle',
      });
      if (!response?.ok()) throw new Error(`${path}: ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({
        content: '.skip-link:not(:focus) { visibility: hidden !important; }',
      });
      const closing = page.locator('#footer');
      await closing.scrollIntoViewIfNeeded();
      await closing.screenshot({
        path: `${directory}/${name}-${width}-footer.png`,
      });
      const bounds = await closing.boundingBox();
      if (!bounds) throw new Error(`No footer bounds on ${path}`);
      const footerTop = await closing.evaluate(
        (element) => element.getBoundingClientRect().top + scrollY,
      );
      const transition = {
        x: 0,
        y: Math.max(0, footerTop - 420),
        width,
        height: 420 + Math.min(bounds.height, 660),
      };
      await page.screenshot({
        path: `${directory}/${name}-${width}-transition.png`,
        fullPage: true,
        clip: transition,
      });
      if (name === 'home') {
        for (const [part, selector] of [
          ['cta', '[data-footer-cta]'],
          ['navigation', '[data-footer-main]'],
          ['wordmark', '[data-footer-scene]'],
        ]) {
          await closing
            .locator(selector)
            .screenshot({ path: `${directory}/${name}-${width}-${part}.png` });
        }
      }
      audit.push(
        await closing.evaluate(
          (element, { name, path }) => {
            const bounds = element.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(
              element.querySelector('.site-footer__wordmark').firstChild,
            );
            const lettering = range.getBoundingClientRect();
            return {
              name,
              path,
              width: innerWidth,
              footerHeight: bounds.height,
              documentWidth: document.documentElement.scrollWidth,
              wordmarkFits:
                lettering.left >= bounds.left - 1 &&
                lettering.right <= bounds.right + 1,
              footerCount: document.querySelectorAll('footer').length,
              headings: [...element.querySelectorAll('h2,h3')].map((node) =>
                node.textContent.trim(),
              ),
              links: [...element.querySelectorAll('a')].map((link) => ({
                text: link.textContent.trim(),
                href: link.getAttribute('href'),
              })),
            };
          },
          { name, path },
        ),
      );
      console.log(`Captured ${name} footer and transition at ${width}px`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
await writeFile(
  'artifacts/footer-redesign/visual-audit.json',
  JSON.stringify({ audit, errors }, null, 2) + '\n',
);
console.log(JSON.stringify({ pagesCaptured: audit.length, errors }));
if (errors.length) process.exitCode = 1;
