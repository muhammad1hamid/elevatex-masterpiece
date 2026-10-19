import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const path = '/work/infinity-salon/';
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

test('complete truthful concept study, metadata and schema are server rendered', async ({
  page,
  request,
}) => {
  const response = await request.get(path);
  expect(response.ok()).toBe(true);
  expect(await response.text()).not.toMatch(
    /<astro-island|<iframe|<canvas|<video|<form|aggregateRating|"@type":"Product"|"@type":"Review"/,
  );
  await page.goto(path);
  await expect(page.locator('h1')).toHaveText('Infinity Salon.');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('[data-case-study] > section')).toHaveCount(10);
  await expect(page).toHaveTitle(
    'Infinity Salon — Beauty Website Design Showcase | ElevateX',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://elevatexlab.org/work/infinity-salon/',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await expect(page.locator('.editorial-facts')).toContainText(
    'Concept project',
  );
  const artworks = page.locator('[data-media-provenance="editorialArtwork"]');
  await expect(artworks).toHaveCount(6);
  for (const media of await artworks.all()) {
    await expect(media.locator('figcaption')).toContainText(
      /Illustrative Art Direction|Illustrative Beauty Editorial/,
    );
    await expect(media.locator('img')).toHaveAttribute('alt', '');
    await expect(media.locator('.case-frame')).toHaveCount(0);
  }
  for (const chrome of await page.locator('.case-frame__bar span').all())
    await expect(chrome).toHaveText('infinity-salon-swart.vercel.app');
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) =>
      els.flatMap((el) => JSON.parse(el.textContent ?? '[]')),
    );
  expect(schemas.map((s) => s['@type']).sort()).toEqual(
    [
      'Organization',
      'WebSite',
      'WebPage',
      'BreadcrumbList',
      'CreativeWork',
    ].sort(),
  );
  const story = schemas.find((s) => s['@type'] === 'CreativeWork');
  expect(story.genre).toBe('Website concept project study');
  expect(story.about.url).toBe('https://infinity-salon-swart.vercel.app/');
  expect(story.datePublished).toBe('2026-10-15T00:00:00.000Z');
  expect(
    schemas
      .find((s) => s['@type'] === 'BreadcrumbList')
      .itemListElement.map((item: { name: string }) => item.name),
  ).toEqual(['Home', 'Work', 'Infinity Salon']);
  const image = await request.get('/images/social/infinity-salon.png');
  expect(image.ok()).toBe(true);
  const buffer = await image.body();
  expect(buffer.readUInt32BE(16)).toBe(1200);
  expect(buffer.readUInt32BE(20)).toBe(630);
});

for (const [width, height] of sizes)
  test(`responsive composition and image requests at ${width} × ${height}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
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
        await img.evaluate(async (el) => {
          const image = el as HTMLImageElement;
          await image.decode();
          return image.naturalWidth;
        }),
      ).toBeGreaterThan(0);
      expect(Number(await img.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(await img.getAttribute('height'))).toBeGreaterThan(0);
    }
    const portrait = page.locator('.editorial-hero__portrait img');
    const dimensions = await portrait.boundingBox();
    expect(dimensions!.width / dimensions!.height).toBeCloseTo(1122 / 1402, 2);
    const intro = page.locator('.editorial-intro').first();
    expect(await intro.evaluate((e) => getComputedStyle(e).textAlign)).toBe(
      'center',
    );
    if (width < 768) {
      const [desktop, tablet, mobile] = await Promise.all(
        ['desktop', 'tablet', 'mobile'].map((name) =>
          page.locator(`.editorial-device--${name}`).boundingBox(),
        ),
      );
      expect(tablet!.y).toBeGreaterThan(desktop!.y + desktop!.height);
      expect(mobile!.y).toBeGreaterThan(tablet!.y + tablet!.height);
    }
    expect(errors).toEqual([]);
  });

test('native screenshot viewers work by keyboard', async ({ page }) => {
  await page.goto(path);
  const viewer = page.locator('.editorial-fullpage');
  await viewer.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(viewer).toHaveAttribute('open', '');
  const region = viewer.getByRole('region');
  await region
    .locator('img')
    .evaluate((img) => (img as HTMLImageElement).decode());
  await region.focus();
  const before = await page.evaluate(() => scrollY);
  await page.keyboard.press('PageDown');
  await expect
    .poll(() => region.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(before);
  const menu = page.locator('.editorial-menu-detail');
  await menu.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(menu.locator('img')).toBeVisible();
  await expect(menu.locator('img')).toHaveAttribute(
    'alt',
    /Actual Infinity Salon mobile menu/,
  );
});

for (const width of [390, 1440])
  test(`accessibility, reduced motion and useful HTML without JS at ${width}px`, async ({
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
    await expect(plain.locator('#infinity-cta')).toBeVisible();
    await expect(plain.locator('[data-case-study] > section')).toHaveCount(10);
    await plain.locator('.editorial-fullpage summary').click();
    await expect(plain.locator('.editorial-fullpage__viewport')).toBeVisible();
    await plain.locator('.editorial-menu-detail summary').click();
    await expect(plain.locator('.editorial-menu-detail img')).toBeVisible();
    await context.close();
  });

test('finite desktop motion cancels on preference changes and stays off on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(path);
  await page.waitForTimeout(1600);
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === 'running')
          .length,
    ),
  ).toBe(0);
  await page.locator('#responsive-experience').scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === 'running')
            .length,
      ),
    )
    .toBe(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

for (const width of [320, 390, 768, 1024])
  test(`200% text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    await page.addStyleTag({ content: 'html{font-size:200%}' });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    for (const element of await page
      .locator(
        'h1,h2,.editorial-actions a,.editorial-facts dd,.editorial-cta a',
      )
      .all()) {
      const box = await element.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    }
  });

test('Work discovery, local links, anchors, external link attributes and final CTA', async ({
  page,
  request,
}) => {
  await page.goto('/work/');
  await expect(page.locator(`a[href="${path}"]`)).toHaveCount(2);
  await page.locator(`a[href="${path}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(page.locator('#next-project h2')).toHaveText(
    'Classic Detailers',
  );
  await expect(page.locator('#next-project a').first()).toHaveAttribute(
    'href',
    '/work/apex-detailing-studio/',
  );
  const hrefs = await page
    .locator('a[href^="/"],a[href^="#"]')
    .evaluateAll((els) => [
      ...new Set(els.map((e) => e.getAttribute('href')!)),
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
    .locator('.editorial-study a[target="_blank"]')
    .all()) {
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute(
      'href',
      'https://infinity-salon-swart.vercel.app/',
    );
  }
  await expect(page.locator('#infinity-cta a').first()).toHaveAttribute(
    'href',
    '/contact/',
  );
  // Contact now has a review-only frontend; live sending remains deferred.
  const contact = await request.get('/contact/');
  expect(await contact.text()).toContain('Inquiry preview');
  expect((await request.get('/work/apex-detailing-studio/')).status()).toBe(
    200,
  );
});
