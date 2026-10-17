import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const phase = process.argv[2] ?? 'before';
if (!['before', 'after'].includes(phase))
  throw new Error('Use before or after.');
const dir = `artifacts/case-study-engine/${phase}`;
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const report = [];
try {
  for (const slug of ['qadeer-jewellers', 'infinity-salon']) {
    for (const [width, height] of [
      [390, 844],
      [768, 1024],
      [1440, 900],
      [1920, 1080],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: 'reduce',
      });
      const response = await page.goto(`http://127.0.0.1:4321/work/${slug}/`, {
        waitUntil: 'networkidle',
      });
      if (!response?.ok())
        throw new Error(`Baseline ${slug}: ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      // Load the visible story without scrolling the hero far out of view.
      // Chrome may discard large decoded rasters after a deep scroll, leaving
      // them blank in captureBeyondViewport despite correct on-screen painting.
      await page
        .locator('main img:visible')
        .evaluateAll((images) =>
          images.forEach((image) => (image.loading = 'eager')),
        );
      for (const img of await page.locator('main img:visible').all())
        await img.evaluate((i) => i.decode());
      await page.evaluate(() => scrollTo(0, 0));
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      await page.screenshot({
        path: `${dir}/${slug}-${width}-page.png`,
        fullPage: true,
      });
      await page.screenshot({ path: `${dir}/${slug}-${width}-fold.png` });
      const sections = page.locator('main article > section');
      for (const section of await sections.all()) {
        const id = await section.getAttribute('id');
        const bounds = await section.boundingBox();
        await page.setViewportSize({
          width,
          height: Math.max(height, Math.ceil(bounds.height) + 96),
        });
        await section.scrollIntoViewIfNeeded();
        for (const img of await section.locator('img:visible').all())
          await img.evaluate((i) => i.decode());
        await section.screenshot({ path: `${dir}/${slug}-${width}-${id}.png` });
        await page.setViewportSize({ width, height });
      }
      report.push({
        slug,
        width,
        height,
        title: await page.title(),
        sections: await sections.count(),
        html: await page.locator('main article').innerHTML(),
      });
      if (phase === 'before' && width === 1440)
        await writeFile(`${dir}/${slug}.html`, await page.content());
      await page.close();
      console.log(`${phase}: ${slug} ${width}px`);
    }
  }
} finally {
  await browser.close();
}
await writeFile(`${dir}/manifest.json`, JSON.stringify(report, null, 2));
if (phase === 'after') {
  const sharp = (await import('sharp')).default;
  const comparisons = [];
  for (const filename of (
    await readdir('artifacts/case-study-engine/before')
  ).filter((name) => name.endsWith('.png'))) {
    try {
      const before = await sharp(
        await readFile(`artifacts/case-study-engine/before/${filename}`),
      )
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const after = await sharp(await readFile(`${dir}/${filename}`))
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const sameSize =
        JSON.stringify(before.info) === JSON.stringify(after.info);
      let changed = 0,
        maxDelta = 0;
      if (sameSize)
        for (let i = 0; i < before.data.length; i += 4) {
          let different = false;
          for (let c = 0; c < 3; c++) {
            const delta = Math.abs(before.data[i + c] - after.data[i + c]);
            if (delta > 8) different = true;
            maxDelta = Math.max(maxDelta, delta);
          }
          if (different) changed++;
        }
      comparisons.push({
        filename,
        sameSize,
        changedPixels: sameSize ? changed : null,
        changedRatio: sameSize
          ? changed / (before.info.width * before.info.height)
          : null,
        maxDelta,
      });
    } catch (e) {
      comparisons.push({ filename, error: e.message });
    }
  }
  await writeFile(
    'artifacts/case-study-engine/comparison.json',
    JSON.stringify(comparisons, null, 2),
  );
  console.log(
    JSON.stringify(
      comparisons.map(({ filename, sameSize, changedRatio, error }) => ({
        filename,
        sameSize,
        changedRatio,
        error,
      })),
    ),
  );
}
