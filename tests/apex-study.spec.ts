import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const path = '/work/apex-detailing-studio/';
const sizes = [
  [320, 568],
  [360, 800],
  [375, 812],
  [390, 844],
  [430, 932],
  [768, 1024],
  [820, 1180],
  [1024, 768],
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
] as const;

test('complete concept story, truthful artwork, metadata and schema arrive in HTML', async ({
  page,
  request,
}) => {
  const response = await request.get(path);
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).not.toMatch(
    /<astro-island|<iframe|<canvas|<video|<form|aggregateRating|"@type":"Product"|"@type":"Review"/,
  );
  await page.goto(path);
  await expect(page.locator('h1')).toHaveText('Apex Detailing Studio.');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('[data-case-study] > section')).toHaveCount(10);
  await expect(page).toHaveTitle(
    'Apex Detailing Studio — Website Design Showcase | ElevateX',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://elevatexlab.org/work/apex-detailing-studio/',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await expect(page.locator('.precision-facts')).toContainText(
    'Concept project',
  );
  for (const artwork of await page
    .locator('.case-media[data-media-provenance="editorialArtwork"]')
    .all()) {
    await expect(artwork.locator('figcaption')).toContainText(
      /Illustrative Art Direction|Editorial Visual Study/,
    );
    await expect(artwork.locator('img')).toHaveAttribute('alt', '');
    await expect(artwork.locator('.case-frame')).toHaveCount(0);
  }
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) =>
      els.flatMap((el) => JSON.parse(el.textContent ?? '[]')),
    );
  expect(schemas.map((schema) => schema['@type']).sort()).toEqual(
    [
      'Organization',
      'WebSite',
      'WebPage',
      'BreadcrumbList',
      'CreativeWork',
    ].sort(),
  );
  const story = schemas.find((schema) => schema['@type'] === 'CreativeWork');
  expect(story.genre).toBe('Website concept project study');
  expect(story.about.url).toBe('https://apex-detailing-studio-phi.vercel.app/');
  expect(story.datePublished).toBe('2026-10-15T00:00:00.000Z');
  expect(
    schemas
      .find((schema) => schema['@type'] === 'BreadcrumbList')
      .itemListElement.map((item: { name: string }) => item.name),
  ).toEqual(['Home', 'Work', 'Apex Detailing Studio']);
  const image = await request.get('/images/social/apex-detailing-studio.png');
  const buffer = await image.body();
  expect(image.ok()).toBe(true);
  expect(buffer.readUInt32BE(16)).toBe(1200);
  expect(buffer.readUInt32BE(20)).toBe(630);
});

for (const [width, height] of sizes)
  test(`responsive layout and all visible media at ${width} × ${height}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    for (const img of await page.locator('main img:visible').all()) {
      await img.scrollIntoViewIfNeeded();
      expect(
        await img.evaluate(async (element) => {
          const image = element as HTMLImageElement;
          await image.decode();
          return image.naturalWidth;
        }),
      ).toBeGreaterThan(0);
      expect(Number(await img.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(await img.getAttribute('height'))).toBeGreaterThan(0);
    }
    expect(errors).toEqual([]);
    const expected = '/images/work/apex/hero-';
    expect(
      await page
        .locator('#apex-hero img')
        .evaluate((image) => (image as HTMLImageElement).currentSrc),
    ).toContain(expected);
  });

test('native full-page viewer opens by keyboard and can scroll without moving the document', async ({
  page,
}) => {
  await page.goto(path);
  const viewer = page.locator('.precision-fullpage');
  await viewer.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(viewer).toHaveAttribute('open', '');
  const region = viewer.getByRole('region');
  await region
    .locator('img')
    .evaluate((image) => (image as HTMLImageElement).decode());
  await region.focus();
  const before = await page.evaluate(() => scrollY);
  await page.keyboard.press('PageDown');
  await expect
    .poll(() => region.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(before);
});

for (const width of [390, 1440])
  test(`accessible static story without JavaScript at ${width}px`, async ({
    page,
    browser,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    const plain = await context.newPage();
    await plain.goto(`http://127.0.0.1:4321${path}`);
    await expect(plain.locator('h1')).toBeVisible();
    await expect(plain.locator('#apex-cta')).toBeVisible();
    await expect(plain.locator('[data-case-study] > section')).toHaveCount(10);
    await plain.locator('.precision-fullpage summary').click();
    await expect(plain.locator('.precision-fullpage__viewport')).toBeVisible();
    await context.close();
  });

test('desktop motion finishes and mobile disables it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(path);
  await page.waitForTimeout(1600);
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === 'running').length,
    ),
  ).toBe(0);
  await page.locator('#responsive-experience').scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === 'running').length,
      ),
    )
    .toBe(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

for (const width of [320, 390, 768, 1024])
  test(`200% text remains in bounds at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    await page.addStyleTag({ content: 'html{font-size:200%}' });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    for (const element of await page
      .locator(
        'h1,h2,.precision-actions a,.precision-facts dd,.precision-cta a',
      )
      .all()) {
      const bounds = await element.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    }
  });

test('case links resolve from Work; next-project and contextual links have valid destinations', async ({
  page,
  request,
}) => {
  await page.goto('/work/');
  await expect(page.locator(`a[href="${path}"]`)).toHaveCount(2);
  await page.locator(`a[href="${path}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(page.locator('#next-project a').first()).toHaveAttribute(
    'href',
    '/work/qadeer-jewellers/',
  );
  const hrefs = await page
    .locator('a[href^="/"],a[href^="#"]')
    .evaluateAll((els) => [
      ...new Set(els.map((element) => element.getAttribute('href')!)),
    ]);
  for (const href of hrefs) {
    const url = new URL(href, `http://127.0.0.1:4321${path}`);
    const response = await request.get(url.pathname);
    expect(response.status(), href).toBe(200);
    if (url.hash)
      expect(await response.text(), href).toContain(
        `id="${url.hash.slice(1)}"`,
      );
  }
  for (const link of await page
    .locator('.precision-study a[target="_blank"]')
    .all()) {
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute(
      'href',
      'https://apex-detailing-studio-phi.vercel.app/',
    );
  }
  expect((await request.get('/work/infinity-salon/')).status()).toBe(200);
});
