import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { differentiators } from '../src/data/differentiators';

test('Why ElevateX follows the product demo with six approved, semantic differentiators', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/')).text();
  for (const difference of differentiators) {
    expect(html).toContain(difference.title);
    expect(html).toContain(difference.description);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('main > section')).toHaveCount(10);
  await expect(page.locator('main > section').nth(3)).toHaveAttribute(
    'id',
    'featured-system',
  );
  await expect(page.locator('main > section').nth(4)).toHaveAttribute(
    'id',
    'why-elevatex',
  );
  const section = page.locator('#why-elevatex');
  await expect(section.locator('h2')).toHaveText(
    'More than a deliverable. A smarter way to build.',
  );
  await expect(section.locator('.why-elevatex__eyebrow')).toHaveText(
    'Why Choose ElevateX',
  );
  await expect(section.locator('article')).toHaveCount(6);
  await expect(section.locator('h3')).toHaveText(
    differentiators.map((difference) => difference.title),
  );
  await expect(section.locator('article p')).toHaveText(
    differentiators.map((difference) => difference.description),
  );
  await expect(
    section.locator('.why-elevatex__icon[aria-hidden="true"]'),
  ).toHaveCount(6);
  await expect(section.locator('.why-elevatex__architecture')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(
    section.locator(
      'a, button, [tabindex], [role="button"], form, input, img, canvas, video, iframe, astro-island, script[type="application/ld+json"]',
    ),
  ).toHaveCount(0);
  expect(await section.innerText()).not.toMatch(
    /guarantee|100%|24\/7|award|certified|hundreds|proven track record/i,
  );
});

for (const width of [
  320, 360, 375, 390, 393, 430, 768, 1024, 1100, 1200, 1280, 1366, 1440, 1536,
  1920,
]) {
  test(`Why ElevateX grid, alignment and static state at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({
      reducedMotion: width < 1024 ? 'no-preference' : 'reduce',
    });
    await page.goto('/');
    const section = page.locator('#why-elevatex');
    await section.scrollIntoViewIfNeeded();
    const columns = width < 768 ? 1 : width < 1200 ? 2 : 3;
    const cards = await section.locator('article').evaluateAll((elements) =>
      elements.map((element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        const icon = element
          .querySelector('.why-elevatex__icon')!
          .getBoundingClientRect();
        const title = element.querySelector('h3')!.getBoundingClientRect();
        return { x, y, width, height, iconY: icon.y - y, titleY: title.y - y };
      }),
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    for (const [index, box] of cards.entries()) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(Math.abs(box.width - cards[0]!.width)).toBeLessThan(1);
      expect(box.iconY).toBeCloseTo(cards[0]!.iconY, 1);
      expect(box.titleY).toBeCloseTo(cards[0]!.titleY, 1);
      if (columns > 1) expect(box.height).toBeCloseTo(cards[0]!.height, 1);
      if (index % columns > 0)
        expect(box.y).toBeCloseTo(cards[index - 1]!.y, 1);
      if (index >= columns)
        expect(box.y).toBeGreaterThan(
          cards[index - columns]!.y + cards[index - columns]!.height,
        );
    }
    for (const card of await section.locator('article').all()) {
      await card.scrollIntoViewIfNeeded();
      await expect(card.locator('h3')).toBeVisible();
      await expect(card.locator('p')).toBeVisible();
      expect(
        await card
          .locator('.why-elevatex__card-surface')
          .evaluate((element) => element.scrollWidth - element.clientWidth),
      ).toBeLessThanOrEqual(1);
    }
    const heading = section.locator('h2');
    expect(
      await heading.evaluate(
        (element) =>
          element.getBoundingClientRect().height /
          parseFloat(getComputedStyle(element).lineHeight),
      ),
    ).toBeCloseTo(2, 1);
    const pill = (await section
      .locator('.why-elevatex__eyebrow')
      .boundingBox())!;
    expect(pill.x + pill.width / 2).toBeCloseTo(width / 2, 1);
    expect(
      await section.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    ).toBe(0);
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`Why ElevateX no-JavaScript content at ${width}px`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width, height: 960 },
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4321/');
    await expect(page.locator('#why-elevatex h3')).toHaveText(
      differentiators.map((difference) => difference.title),
    );
    for (const card of await page.locator('.why-elevatex__card').all()) {
      await card.scrollIntoViewIfNeeded();
      await expect(card).toHaveCSS('opacity', '1');
      await expect(card.locator('p')).toBeVisible();
    }
    await context.close();
  });

  test(`Why ElevateX accessibility and decorative semantics at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('#why-elevatex').scrollIntoViewIfNeeded();
    const result = await new AxeBuilder({ page })
      .include('#why-elevatex')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations).toEqual([]);
    expect(
      await page
        .locator('#why-elevatex')
        .evaluate(
          (element) =>
            [...element.querySelectorAll<HTMLElement>('*')].filter(
              (item) => item.tabIndex >= 0,
            ).length,
        ),
    ).toBe(0);
  });
}

test('desktop entrance runs once and hover lift returns without looping', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', '1'),
  );
  await page.goto('/');
  const card = page.locator('.why-elevatex__card').first();
  const surface = card.locator('.why-elevatex__card-surface');
  await card.scrollIntoViewIfNeeded();
  await expect
    .poll(() => card.evaluate((element) => element.getAnimations().length))
    .toBeGreaterThan(0);
  await expect
    .poll(() => card.evaluate((element) => element.getAnimations().length))
    .toBe(0);
  await card.hover();
  await expect(surface).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -3)');
  await expect(card.locator('.why-elevatex__icon')).toHaveCSS(
    'transform',
    'matrix(1, 0, 0, 1, 0, -1)',
  );
  await expect
    .poll(() =>
      card.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    )
    .toBe(0);
  await page.mouse.move(0, 0);
  await expect(surface).toHaveCSS('transform', 'none');
  await page.evaluate(() => window.scrollTo(0, 0));
  await card.scrollIntoViewIfNeeded();
  expect(await card.evaluate((element) => element.getAnimations().length)).toBe(
    0,
  );
  await expect(card).toHaveCSS('opacity', '1');
});

test('mobile and reduced-motion changes cancel entrance and hover movement', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', '1'),
  );
  await page.goto('/');
  const section = page.locator('#why-elevatex');
  await section.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      section.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    )
    .toBeGreaterThan(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      section.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    )
    .toBe(0);
  const surface = page.locator('.why-elevatex__card-surface').first();
  await surface.hover();
  await expect(surface).toHaveCSS('transform', 'none');
  await page.setViewportSize({ width: 1440, height: 960 });
  await surface.hover();
  await expect(surface).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -3)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(surface).toHaveCSS('transform', 'none');
  await expect
    .poll(() =>
      section.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    )
    .toBe(0);
});

test('failed animation APIs leave the entire Why ElevateX section visible', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.addInitScript(() => {
    sessionStorage.setItem('elevatexIntroSeen:v2', '1');
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.closest('#why-elevatex'))
        throw new Error('Simulated animation failure');
      return animate.apply(this, args);
    };
  });
  await page.goto('/');
  for (const element of await page
    .locator(
      '#why-elevatex [data-difference-reveal], #why-elevatex [data-why-intro-reveal]',
    )
    .all()) {
    await element.scrollIntoViewIfNeeded();
    await expect(element).toHaveCSS('opacity', '1');
  }
  expect(errors).toEqual([]);
});
