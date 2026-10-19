import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { workMetadata } from '../src/data/work';

test('server content, authentic media, metadata and project classification', async ({
  page,
  request,
}) => {
  const response = await request.get('/work/');
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).not.toMatch(
    /http-equiv="refresh"|<astro-island|<canvas|<video|<form/,
  );
  await page.goto('/work/');
  await expect(page).toHaveTitle(`${workMetadata.title} | ElevateX`);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://elevatexlab.org/work/',
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    workMetadata.description,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await expect(page.locator('.work-feature')).toHaveCount(4);
  await expect(page.locator('.work-tile')).toHaveCount(6);
  for (const item of await page.locator('.work-feature,.work-tile').all()) {
    await expect(item).toContainText('Concept project');
    await expect(
      item.locator('[data-media-provenance="verifiedScreenshot"]'),
    ).toHaveCount(1);
  }
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) =>
      els.flatMap((el) => JSON.parse(el.textContent ?? '[]')),
    );
  expect(schemas.map((s) => s['@type']).sort()).toEqual(
    [
      'Organization',
      'WebSite',
      'CollectionPage',
      'BreadcrumbList',
      'ItemList',
    ].sort(),
  );
  expect(schemas.find((s) => s['@type'] === 'ItemList').numberOfItems).toBe(6);
  const social = await request.get(workMetadata.image.src);
  expect(social.ok()).toBe(true);
  const png = await social.body();
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});

for (const width of [
  320, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1920, 2560,
])
  test(`layout, visible images and runtime at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/work/');
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
    expect(errors).toEqual([]);
    if (width < 768)
      await expect(page.locator('.work-showroom__preview:visible')).toHaveCount(
        1,
      );
  });

test('filters work by keyboard, announce results and restore all projects', async ({
  page,
}) => {
  await page.goto('/work/');
  const buttons = page.locator('.work-filters button');
  for (const button of await buttons.all()) {
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.locator('.work-filters [aria-pressed="true"]'),
    ).toHaveCount(1);
    const selected = await button.getAttribute('data-work-filter');
    const expected =
      selected === 'all' ? 6 : selected === 'Weddings & events' ? 2 : 1;
    await expect(page.locator('.work-tile:visible')).toHaveCount(expected);
    await expect(page.getByRole('status')).toContainText(
      `${expected} website concept`,
    );
  }
  await buttons.first().click();
  await expect(page.locator('.work-tile:visible')).toHaveCount(6);
});

test('desktop entrance finishes; mobile motion stays off and intros are centered', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/work/');
  await page.waitForTimeout(1600);
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === 'running').length,
    ),
  ).toBe(0);
  for (const label of await page
    .locator(
      '.work-hero__copy > .work-kicker,.work-intro > .work-kicker,.work-cta > .work-kicker',
    )
    .all()) {
    expect(
      await label.evaluate((el) =>
        Math.abs(
          el.getBoundingClientRect().left +
            el.getBoundingClientRect().width / 2 -
            innerWidth / 2,
        ),
      ),
    ).toBeLessThan(2);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

for (const width of [390, 1440])
  test(`accessible, reduced motion and no JavaScript at ${width}px`, async ({
    browser,
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/work/');
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
    await plain.goto('http://127.0.0.1:4321/work/');
    await expect(plain.locator('h1')).toBeVisible();
    await expect(plain.locator('.work-filters')).toBeHidden();
    await expect(plain.locator('.work-tile:visible')).toHaveCount(6);
    await expect(plain.locator('#work-cta')).toBeVisible();
    await context.close();
  });

for (const width of [320, 390, 768, 1024])
  test(`200 percent text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/work/');
    await page.addStyleTag({ content: 'html{font-size:200%}' });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    for (const link of await page.locator('#work-cta a').all())
      await expect(link).toBeVisible();
  });

test('local links and anchors resolve; external links retain safe targets', async ({
  page,
  request,
}) => {
  await page.goto('/work/');
  const hrefs = await page
    .locator('a[href^="/"],a[href^="#"]')
    .evaluateAll((els) => [
      ...new Set(els.map((el) => el.getAttribute('href')!)),
    ]);
  for (const href of hrefs) {
    const url = new URL(href, 'http://127.0.0.1:4321/work/');
    const response = await request.get(url.pathname);
    expect(response.status(), href).toBe(200);
    if (url.hash)
      expect(await response.text(), href).toContain(
        `id="${url.hash.slice(1)}"`,
      );
  }
  for (const link of await page.locator('.work-page a[target="_blank"]').all())
    await expect(link).toHaveAttribute('rel', /noopener/);
  await page.getByRole('link', { name: 'Explore Projects ↓' }).click();
  await expect(page).toHaveURL(/#featured-work$/);
});
