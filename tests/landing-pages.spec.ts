import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { landingPages, landingFAQs } from '../src/data/services/landing-pages';
const path = landingPages.path;

test('project screenshots decode and hero actions fit short desktop screens', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [
    [1280, 720],
    [1366, 768],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    for (const link of await page
      .locator('#landing-hero .service-actions a')
      .all()) {
      expect(
        await link.evaluate((el) => el.getBoundingClientRect().bottom),
      ).toBeLessThanOrEqual(height!);
    }
    for (const img of await page.locator('.lp-project img').all()) {
      await img.scrollIntoViewIfNeeded();
      expect(
        await img.evaluate(async (image) => {
          if (!(image instanceof HTMLImageElement))
            throw new Error('Expected an image');
          await image.decode();
          return image.naturalWidth;
        }),
      ).toBeGreaterThan(0);
    }
  }
});
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
  [2560, 1440],
] as const;

test('server-rendered content, metadata, schema and truthful work classification', async ({
  page,
  request,
}) => {
  const response = await request.get(path);
  expect(response.ok()).toBe(true);
  const html = await response.text();
  for (const faq of landingFAQs) expect(html).toContain(faq.question);
  expect(html).not.toMatch(
    /<astro-island\b|<canvas\b|<video\b|<form\b|react-dom|three\.js/,
  );
  await page.goto(path);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText(landingPages.heading);
  await expect(page.locator('[data-landing-page] > section')).toHaveCount(15);
  await expect(page.locator('#landing-faq details')).toHaveCount(12);
  await expect(page.locator('.lp-project')).toHaveCount(2);
  for (const project of await page.locator('.lp-project').all())
    await expect(project).toContainText('Concept');
  await expect(page.locator('#landing-work')).toContainText(
    'not paid-campaign case studies',
  );
  await expect(page).toHaveTitle(`${landingPages.title} | ElevateX`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    landingPages.description,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://www.elevatexlab.com${path}`,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  );
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((elements) =>
      elements.flatMap((el) => JSON.parse(el.textContent ?? '[]')),
    );
  expect(schemas.map((s) => s['@type']).sort()).toEqual(
    ['Organization', 'WebSite', 'WebPage', 'Service', 'BreadcrumbList'].sort(),
  );
  const service = schemas.find((s) => s['@type'] === 'Service');
  expect(service.name).toBe('Landing Page Design & Development');
  for (const key of [
    'aggregateRating',
    'review',
    'offers',
    'award',
    'areaServed',
  ])
    expect(service[key]).toBeUndefined();
  const og = await request.get(landingPages.image.src);
  expect(og.ok()).toBe(true);
  const buffer = await og.body();
  expect(buffer.readUInt32BE(16)).toBe(1200);
  expect(buffer.readUInt32BE(20)).toBe(630);
});

test('CTA and local contextual destinations resolve', async ({
  page,
  request,
}) => {
  await page.goto(path);
  for (const id of ['landing-hero', 'landing-cta'])
    await expect(
      page
        .locator(`#${id}`)
        .getByRole('link', { name: 'Start a Landing Page' }),
    ).toHaveAttribute('href', '/contact/?service=landing-pages');
  await page.getByRole('link', { name: 'See How We Structure It' }).click();
  await expect(page).toHaveURL(/#landing-anatomy$/);
  for (const href of await page
    .locator('a[href]')
    .evaluateAll((links) => [
      ...new Set(links.map((a) => a.getAttribute('href') ?? '')),
    ])) {
    expect(href).not.toBe('#');
    const url = new URL(href, `http://127.0.0.1:4321${path}`);
    if (url.origin !== 'http://127.0.0.1:4321') continue;
    const response = await request.get(url.pathname);
    expect(response.ok(), href).toBe(true);
    if (url.hash)
      expect(await response.text(), href).toContain(
        `id="${url.hash.slice(1)}"`,
      );
  }
  for (const service of ['web-development', 'ai-automation', 'ai-chatbots'])
    await expect(
      page.locator(`main a[href="/services/${service}/"]`),
    ).toBeVisible();
});

for (const [width, height] of sizes)
  test(`responsive composition at ${width}x${height}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(r.url());
    });
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const centered = await page
      .locator('main h1,main h2:not(.sr-only)')
      .evaluateAll(
        (headings) =>
          headings.filter((h) => getComputedStyle(h).textAlign === 'center')
            .length / headings.length,
      );
    expect(centered).toBeGreaterThanOrEqual(0.7);
    for (const image of await page.locator('main img').all()) {
      expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
    }
    await page.locator('#landing-faq summary').last().click();
    await expect(page.locator('#landing-faq details').last()).toHaveAttribute(
      'open',
      '',
    );
    expect(errors).toEqual([]);
  });

for (const width of [390, 1440]) {
  test(`native content and controls without JS at ${width}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL: baseURL ?? 'http://127.0.0.1:4321',
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    try {
      const page = await context.newPage();
      await page.goto(path);
      for (const row of await page
        .locator('.lp-anatomy__annotation,.lp-journey__detail')
        .all())
        await expect(row).toBeVisible();
      await page.locator('#landing-stage-0').focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#landing-stage-1')).toBeChecked();
      await page.locator('#landing-faq summary').last().click();
      await expect(page.locator('#landing-faq details').last()).toHaveAttribute(
        'open',
        '',
      );
    } finally {
      await context.close();
    }
  });
  test(`keyboard and WCAG axe at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', { name: 'Skip to content' }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
    await page.locator('#landing-stage-0').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#landing-stage-1')).toBeChecked();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

test('finite entrance, anatomy progression and manual journey override', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(path);
  await page.locator('.lp-canvas').scrollIntoViewIfNeeded();
  await expect(page.locator('.lp-canvas')).toHaveClass(/is-entered/);
  expect(
    await page
      .locator('.lp-canvas')
      .evaluate((el) =>
        el
          .getAnimations({ subtree: true })
          .every((a) => a.effect?.getTiming().iterations === 1),
      ),
  ).toBe(true);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === 'running')
            .length,
      ),
    )
    .toBe(0);
  await page
    .locator('[data-anatomy-row]')
    .nth(3)
    .evaluate((el) =>
      window.scrollTo(
        0,
        scrollY + el.getBoundingClientRect().top - innerHeight * 0.55 + 10,
      ),
    );
  await expect(page.locator('[data-anatomy-row]').nth(3)).toHaveClass(
    /is-current/,
  );
  await page
    .locator('[data-journey-row]')
    .nth(3)
    .evaluate((el) =>
      window.scrollTo(
        0,
        scrollY + el.getBoundingClientRect().top - innerHeight * 0.55 + 10,
      ),
    );
  await expect(page.locator('#landing-stage-3')).toBeChecked();
  await page.locator('#landing-stage-0').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  await page.evaluate(() => window.scrollBy(0, 400));
  await expect(page.locator('#landing-stage-1')).toBeChecked();
});

test('mobile and reduced motion stay static with no external requests', async ({
  page,
}) => {
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  for (const [width, reducedMotion] of [
    [390, 'no-preference'],
    [1440, 'reduce'],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.goto(path);
    await page.locator('[data-journey-row]').last().scrollIntoViewIfNeeded();
    await expect(page.locator('#landing-stage-0')).toBeChecked();
    await expect(page.locator('.lp-anatomy__row.is-current')).toHaveCount(0);
    expect(
      await page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === 'running')
            .length,
      ),
    ).toBe(0);
  }
  expect(
    urls.filter((url) => !url.startsWith('http://127.0.0.1:4321/')),
  ).toEqual([]);
  expect(
    urls.filter((url) => /gsap|ScrollTrigger|react-dom|hero-intro/i.test(url)),
  ).toEqual([]);
});

test('200 percent text remains readable and in bounds', async ({ page }) => {
  for (const width of [320, 390, 820, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.evaluate(
      () => (document.documentElement.style.fontSize = '200%'),
    );
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `${width}px`,
    ).toBeLessThanOrEqual(width);
    await page.locator('#landing-faq summary').last().click();
    await expect(page.locator('#landing-faq details').last()).toHaveAttribute(
      'open',
      '',
    );
  }
});
