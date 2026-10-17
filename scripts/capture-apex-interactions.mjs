import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const dir = 'artifacts/apex/source',
  manifest = JSON.parse(await readFile(`${dir}/manifest.json`, 'utf8'));
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: 'reduce',
  });
  await page.goto(manifest.url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  const quote = page.locator('#quote');
  await quote.scrollIntoViewIfNeeded();
  await quote.getByRole('button', { name: 'Sedan', exact: true }).click();
  await quote
    .getByText('Select Your Service', { exact: true })
    .waitFor({ state: 'visible' });
  manifest.quoteStep2 = await quote.innerText();
  await quote.screenshot({
    path: `${dir}/quote-service.png`,
    animations: 'disabled',
  });
  manifest.captures.push({ name: 'quote-service' });
  const service = quote
    .getByRole('button', { name: /ceramic coating/i })
    .first();
  if (await service.count()) {
    await service.click();
    await page.waitForFunction(
      () =>
        !document
          .querySelector('#quote')
          ?.innerText.includes('Select Your Service'),
    );
    await page.waitForTimeout(700);
    manifest.quoteStep3 = await quote.innerText();
    manifest.quoteLinks = await quote
      .locator('a')
      .evaluateAll((els) =>
        els.map((a) => ({ text: a.textContent, href: a.href })),
      );
    await quote.screenshot({
      path: `${dir}/quote-summary.png`,
      animations: 'disabled',
    });
    manifest.captures.push({ name: 'quote-summary' });
  }
  const process = page.locator('#process');
  await process.scrollIntoViewIfNeeded();
  await process.getByRole('button', { name: 'Switch to grid layout' }).click();
  await page.waitForTimeout(400);
  const box = await process.boundingBox();
  await page.setViewportSize({
    width: 1440,
    height: Math.max(1100, Math.ceil(box.height) + 150),
  });
  await process.screenshot({
    path: `${dir}/process-grid.png`,
    animations: 'disabled',
  });
  manifest.processGrid = await process.innerText();
  manifest.captures.push({ name: 'process-grid' });
  const showroom = page.locator('#showroom');
  await showroom.scrollIntoViewIfNeeded();
  await showroom.getByRole('button', { name: 'PPF', exact: true }).click();
  await page.waitForTimeout(1200);
  manifest.filteredGallery = await showroom.innerText();
  const galleryBox = await showroom.boundingBox();
  await page.setViewportSize({
    width: 1440,
    height: Math.max(1100, Math.ceil(galleryBox.height) + 150),
  });
  await showroom.screenshot({
    path: `${dir}/showroom-filter.png`,
    animations: 'disabled',
  });
  manifest.captures.push({ name: 'showroom-filter' });
  console.log(
    JSON.stringify({
      step2: manifest.quoteStep2,
      step3: manifest.quoteStep3,
      quoteLinks: manifest.quoteLinks,
      filteredGallery: manifest.filteredGallery,
    }),
  );
} finally {
  await browser.close();
  await writeFile(
    `${dir}/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}
