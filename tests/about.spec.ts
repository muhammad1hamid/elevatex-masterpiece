import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const path = '/about/';
const sections = [
  'about-hero',
  'our-story',
  'our-thinking',
  'founder',
  'our-approach',
  'our-principles',
  'capabilities',
  'about-work',
  'about-cta',
];
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
const running = () =>
  document
    .getAnimations()
    .filter((animation) => animation.playState === 'running').length;

test('complete About story, authentic founder and project evidence, metadata and entity graph arrive in HTML', async ({
  page,
  request,
}) => {
  const response = await request.get(path),
    html = await response.text();
  expect(response.status()).toBe(200);
  expect(html).not.toMatch(
    /http-equiv="refresh"|<astro-island|<canvas|<iframe|<video|<form|aggregateRating|foundingDate|numberOfEmployees|alumniOf/,
  );
  await page.goto(path);
  await expect(page).toHaveTitle(
    'About — Websites, AI & Digital Systems | ElevateX',
  );
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('Built with intention.');
  await expect(page.locator('h1')).toContainText('Driven by what’s possible.');
  expect(
    await page
      .locator('[data-about-page] > section')
      .evaluateAll((elements) => elements.map((element) => element.id)),
  ).toEqual(sections);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://elevatexlab.org/about/',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await expect(
    page.locator('.global-header__navigation a[aria-current="page"]'),
  ).toHaveText('About');
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((elements) =>
      elements.flatMap((element) => JSON.parse(element.textContent ?? '[]')),
    );
  expect(schemas.map((item) => item['@type']).sort()).toEqual(
    ['Organization', 'WebSite', 'AboutPage', 'Person', 'BreadcrumbList'].sort(),
  );
  const person = schemas.find((item) => item['@type'] === 'Person'),
    organization = schemas.find((item) => item['@type'] === 'Organization'),
    about = schemas.find((item) => item['@type'] === 'AboutPage');
  expect(person.name).toBe('Hamid');
  expect(person.jobTitle).toBe('Founder');
  expect(person['@id']).toBe(organization.founder['@id']);
  expect(person.worksFor['@id']).toBe(organization['@id']);
  expect(about.mainEntity['@id']).toBe(organization['@id']);
  await expect(page.locator('.about-founder__portrait img')).toHaveAttribute(
    'src',
    '/images/founder/hamid-founder-840.webp',
  );
  await expect(page.locator('.about-founder__portrait img')).toHaveAttribute(
    'alt',
    'Hamid, founder of ElevateX',
  );
  await expect(
    page.locator('[data-media-category="ILLUSTRATIVE_EDITORIAL_ART"]'),
  ).toHaveCount(3);
  for (const art of await page
    .locator('[data-media-category="ILLUSTRATIVE_EDITORIAL_ART"]')
    .all()) {
    await expect(art.locator('figcaption')).toContainText(
      /Illustrative art direction/,
    );
    await expect(art.locator('img')).toHaveAttribute('alt', '');
  }
  await expect(
    page.locator('.about-project [data-media-provenance="verifiedScreenshot"]'),
  ).toHaveCount(2);
  await expect(page.locator('.about-project__copy')).toContainText([
    'Concept project',
    'Concept project',
  ]);
  await expect(page.locator('.about-project__copy h3')).toHaveText([
    'Qadeer Jewellers',
    'Infinity Salon',
  ]);
  const image = await request.get('/images/social/elevatex-about.png'),
    buffer = await image.body();
  expect(image.status()).toBe(200);
  expect(buffer.readUInt32BE(16)).toBe(1200);
  expect(buffer.readUInt32BE(20)).toBe(630);
  await expect(page.locator('footer')).toHaveCount(1);
});

for (const [width, height] of sizes)
  test(`responsive composition and media at ${width} × ${height}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      expect(
        await image.evaluate(async (element) => {
          const image = element as HTMLImageElement;
          await image.decode();
          return image.naturalWidth;
        }),
      ).toBeGreaterThan(0);
      for (const dimension of ['width', 'height'])
        expect(Number(await image.getAttribute(dimension))).toBeGreaterThan(0);
    }
    expect(
      await page
        .locator('.about-hero img')
        .evaluate((element) => (element as HTMLImageElement).currentSrc),
    ).toContain(width < 768 ? 'hero-mobile-' : '/hero-');
    expect(
      await page
        .locator('.about-philosophy img')
        .evaluate((element) => (element as HTMLImageElement).currentSrc),
    ).toContain(width < 768 ? 'philosophy-mobile-' : '/philosophy-');
    for (const heading of await page.locator('h1,h2').all())
      expect(
        await heading.evaluate(
          (element) => getComputedStyle(element).textAlign,
        ),
      ).toBe('center');
    if (width < 768) {
      const portrait = await page
          .locator('.about-founder__portrait')
          .boundingBox(),
        heading = await page.locator('#founder-title').boundingBox();
      expect(heading!.y).toBeGreaterThan(portrait!.y);
      expect(heading!.y).toBeLessThan(portrait!.y + portrait!.height);
    }
    expect(errors).toEqual([]);
  });

for (const width of [390, 1440])
  test(`accessibility, keyboard, reduced motion and no JS at ${width}px`, async ({
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
    expect(
      (
        await new AxeBuilder({ page })
          .withRules(['label-content-name-mismatch'])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(await page.evaluate(running)).toBe(0);
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    const plain = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width, height: 900 },
      }),
      noJS = await plain.newPage();
    await noJS.goto(`http://127.0.0.1:4321${path}`);
    await expect(noJS.locator('h1')).toBeVisible();
    await expect(noJS.locator('[data-about-page] > section')).toHaveCount(9);
    await noJS.locator('.about-hero a[href="#our-approach"]').click();
    await expect(noJS).toHaveURL(/#our-approach$/);
    await expect(noJS.locator('#our-approach h2')).toBeVisible();
    await expect(noJS.locator('.about-capabilities__rows a')).toHaveCount(4);
    await expect(noJS.locator('#about-cta a[href="/contact/"]')).toBeVisible();
    if (width < 1024) {
      await noJS.locator('[data-menu-toggle]').click();
      await expect(
        noJS.locator('.global-header__mobile-navigation a[href="/about/"]'),
      ).toBeVisible();
    }
    await plain.close();
  });

for (const width of [320, 390, 768, 1024])
  test(`200% text stays readable and in bounds at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.addStyleTag({ content: 'html{font-size:200%}' });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const overflow = await page
      .locator(
        'main h1,main h2,main h3,main p,.about-philosophy__labels li,.about-page .service-actions a',
      )
      .evaluateAll((elements) =>
        elements.flatMap((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return [...range.getClientRects()]
            .filter(
              (rect) =>
                rect.width > 0 &&
                (rect.left < -1 || rect.right > innerWidth + 1),
            )
            .map((rect) => ({
              text: element.textContent?.trim(),
              left: rect.left,
              right: rect.right,
            }));
        }),
      );
    expect(overflow).toEqual([]);
  });

test('all local links, section jumps and project routes have real targets', async ({
  page,
  request,
}) => {
  await page.goto(path);
  const hrefs = await page
    .locator('a[href^="/"],a[href^="#"]')
    .evaluateAll((elements) => [
      ...new Set(elements.map((element) => element.getAttribute('href')!)),
    ]);
  for (const href of hrefs) {
    const url = new URL(href, 'http://127.0.0.1:4321/about/'),
      response = await request.get(url.pathname);
    expect(response.status(), href).toBe(200);
    if (url.hash)
      expect(await response.text()).toContain(`id="${url.hash.slice(1)}"`);
  }
  for (const link of await page.locator('.about-project__link').all())
    await expect(link).toHaveAttribute('href', /\/work\//);
  for (const link of await page.locator('.about-capabilities__rows a').all())
    await expect(link).toHaveAttribute('href', /\/services\//);
  await page.locator('.about-hero a[href="#our-approach"]').click();
  await expect(page).toHaveURL(/#our-approach$/);
});

test('cinematic scenes finish, stop on reduced motion and do not replay on reverse or rapid scroll', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(path);
  await expect(page.locator('[data-about-page]')).toHaveAttribute(
    'data-about-motion',
    'cinematic',
  );
  expect(
    await page.evaluate(() => {
      const current = document.getAnimations();
      document.dispatchEvent(new Event('astro:page-load'));
      document.dispatchEvent(new Event('astro:page-load'));
      return current.every((animation) =>
        document.getAnimations().includes(animation),
      );
    }),
  ).toBe(true);
  await page.waitForTimeout(1900);
  expect(await page.evaluate(running)).toBe(0);
  await page.locator('.about-philosophy__stage').scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(running)).toBeGreaterThan(0);
  const position = await page.evaluate(() => scrollY);
  await page.waitForTimeout(1900);
  expect(await page.evaluate(running)).toBe(0);
  expect(await page.evaluate(() => scrollY)).toBe(position);
  for (const id of [
    'our-approach',
    'founder',
    'about-work',
    'our-story',
    'about-cta',
  ]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(70);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(running)).toBe(0);
  expect(
    await page
      .locator('[data-about-parallax]')
      .evaluateAll((elements) =>
        elements.every(
          (element) => (element as HTMLElement).style.transform === '',
        ),
      ),
  ).toBe(true);
  for (const heading of await page.locator('h1,h2').all())
    expect(
      await heading.evaluate((element) => getComputedStyle(element).opacity),
    ).toBe('1');
  expect(errors).toEqual([]);
});

test('mobile uses only short fades and navigation history restores useful content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(path);
  await expect(page.locator('[data-about-page]')).toHaveAttribute(
    'data-about-motion',
    'quiet',
  );
  await page.locator('#our-thinking').scrollIntoViewIfNeeded();
  const frames = await page.evaluate(() =>
    document
      .getAnimations()
      .flatMap((animation) =>
        animation.effect instanceof KeyframeEffect
          ? animation.effect.getKeyframes()
          : [],
      ),
  );
  expect(
    frames.every((frame) => !frame['transform'] && !frame['clipPath']),
  ).toBe(true);
  await page.waitForTimeout(700);
  expect(await page.evaluate(running)).toBe(0);
  await page.goto('/work/');
  await page.goBack();
  await expect(page).toHaveURL(/\/about\//);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#about-cta a[href="/contact/"]')).toBeVisible();
});
