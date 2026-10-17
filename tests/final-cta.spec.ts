import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const root = '#start-a-project';
const headline =
  'Have an idea worth building? Let’s turn it into something real.';
const description =
  'Whether you need a premium website, AI automation, or a smarter customer experience, tell us what you’re working on and we’ll help you figure out the right next step.';

test('final CTA is static semantic content after FAQ with two valid navigation links', async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await request.get('/');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('Have an idea worth building?');
  await page.goto('/');
  const section = page.locator(root);
  await expect(page.locator('main > section')).toHaveCount(10);
  await expect(page.locator('#faq + section')).toHaveAttribute(
    'id',
    'start-a-project',
  );
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(headline);
  await expect(section.locator('.final-cta__description')).toHaveText(
    description,
  );
  await expect(section.getByRole('link')).toHaveCount(2);
  for (const [name, href] of [
    ['Start a Project', '/contact/'],
    ['View Our Work', '/work/'],
  ] as const) {
    await expect(section.getByRole('link', { name })).toHaveAttribute(
      'href',
      href,
    );
    expect((await request.get(href)).ok()).toBe(true);
  }
  await expect(
    section.locator(
      'img, picture, video, canvas, iframe, form, button, script[type="application/ld+json"]',
    ),
  ).toHaveCount(0);
  expect(
    await section.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    ),
  ).not.toContain('url(');
});

test('final CTA fits the master prompt viewport matrix and stacks phone actions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [
    [320, 568],
    [360, 800],
    [375, 812],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1366, 768],
    [1440, 900],
    [1536, 864],
    [1920, 1080],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/#start-a-project');
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator(root);
    await expect(section.getByRole('heading')).toBeVisible();
    const geometry = await section.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const links = [...element.querySelectorAll('a')].map((link) =>
        link.getBoundingClientRect().toJSON(),
      );
      const heading = element.querySelector('h2')!.getBoundingClientRect();
      const copy = element
        .querySelector('.final-cta__description')!
        .getBoundingClientRect();
      const textFits = [
        ...element.querySelectorAll('.final-cta__line > span'),
      ].every((span) => {
        const range = document.createRange();
        range.selectNodeContents(span);
        return [...range.getClientRects()].every(
          (rect) => rect.left >= bounds.left && rect.right <= bounds.right,
        );
      });
      return {
        width: bounds.width,
        overflow: document.documentElement.scrollWidth > innerWidth,
        links,
        textFits,
        headingBottom: heading.bottom,
        copyTop: copy.top,
        copyBottom: copy.bottom,
      };
    });
    expect(geometry.width).toBe(width);
    expect(geometry.overflow).toBe(false);
    expect(geometry.textFits).toBe(true);
    expect(geometry.copyTop).toBeGreaterThan(geometry.headingBottom);
    const [primary, secondary] = geometry.links;
    expect(primary.height).toBeGreaterThanOrEqual(56);
    expect(secondary.height).toBeGreaterThanOrEqual(44);
    expect(primary.top).toBeGreaterThan(geometry.copyBottom);
    if (width < 768) {
      expect(secondary.top).toBeGreaterThan(primary.bottom);
      expect(primary.width).toBeLessThanOrEqual(340);
    } else {
      expect(Math.abs(primary.top - secondary.top)).toBeLessThan(2);
    }
  }
});

test('final CTA supports keyboard focus and passes scoped accessibility checks', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/#start-a-project');
  const section = page.locator(root);
  const primary = section.getByRole('link', { name: 'Start a Project' });
  const secondary = section.getByRole('link', { name: 'View Our Work' });
  await primary.focus();
  await expect(primary).toBeFocused();
  await expect(primary).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Tab');
  await expect(secondary).toBeFocused();
  const result = await new AxeBuilder({ page })
    .include(root)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('final CTA remains visible with no JavaScript and enlarged text', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL: baseURL ?? 'http://127.0.0.1:4321',
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/#start-a-project');
  const section = page.locator(root);
  await expect(section.getByRole('heading')).toHaveText(headline);
  await expect(
    section.getByRole('link', { name: 'Start a Project' }),
  ).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expect(
    section.getByRole('link', { name: 'View Our Work' }),
  ).toBeVisible();
  expect(
    await section.evaluate((element) => element.scrollWidth <= innerWidth),
  ).toBe(true);
  const textFits = await section.locator('h2').evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const bounds = element.getBoundingClientRect();
    return [...range.getClientRects()].every(
      (rect) => rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1,
    );
  });
  expect(textFits).toBe(true);
  await context.close();
});

test('final CTA reveal runs once on desktop and finishes without moving layout', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const section = page.locator(root);
  const before = await section.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    top: element.getBoundingClientRect().top + scrollY,
  }));
  await section.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      section.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    )
    .toBeGreaterThan(0);
  const timings = await section.evaluate(async (element) => {
    const animations = element.getAnimations({ subtree: true });
    const timings = animations.map((animation) =>
      animation.effect!.getTiming(),
    );
    await Promise.all(
      animations.map((animation) => animation.finished.catch(() => {})),
    );
    return timings;
  });
  expect(
    timings.every(
      (timing) => Number(timing.duration) + Number(timing.delay) <= 1200,
    ),
  ).toBe(true);
  const after = await section.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    top: element.getBoundingClientRect().top + scrollY,
  }));
  expect(after).toEqual(before);
  await page.evaluate(() => scrollTo(0, 0));
  await section.scrollIntoViewIfNeeded();
  expect(
    await section.evaluate(
      (element) => element.getAnimations({ subtree: true }).length,
    ),
  ).toBe(0);
  for (const target of await section.locator('[data-final-cta-reveal]').all())
    await expect(target).toHaveCSS('opacity', '1');
});

test('final CTA shows its final state immediately on phones and with reduced motion', async ({
  page,
}) => {
  for (const [width, reducedMotion] of [
    [390, 'no-preference'],
    [1440, 'reduce'],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.goto('/#start-a-project');
    const section = page.locator(root);
    await section.scrollIntoViewIfNeeded();
    for (const target of await section.locator('[data-final-cta-reveal]').all())
      await expect(target).toHaveCSS('opacity', '1');
    expect(
      await section.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    ).toBe(0);
  }
});
