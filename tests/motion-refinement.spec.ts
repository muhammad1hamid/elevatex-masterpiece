import { expect, test } from '@playwright/test';

for (const [route, selector] of [
  ['/', '.hero__cta--primary'],
  ['/', '.final-cta__primary'],
  ['/contact/', '.inquiry-form__review'],
  ['/', '.site-footer__group a'],
] as const)
  test(`reduced motion keeps the hover boundary still: ${selector}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    const target = page.locator(selector).first();
    await target.scrollIntoViewIfNeeded();
    const box = (await target.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height - 0.5);
    const result = await target.evaluate(async (el) => {
      const rows = [],
        start = performance.now();
      while (performance.now() - start < 350) {
        rows.push({
          y: el.getBoundingClientRect().y,
          hover: el.matches(':hover'),
        });
        await new Promise(requestAnimationFrame);
      }
      return rows;
    });
    expect(
      Math.max(...result.map((r) => r.y)) - Math.min(...result.map((r) => r.y)),
    ).toBeLessThan(0.1);
    expect(result.every((r) => r.hover === result[0]!.hover)).toBe(true);
    await expect(page.locator('[data-motion-cursor]')).toBeHidden();
  });

for (const [route, selector] of [
  ['/', '.hero__cta--primary'],
  ['/', '.final-cta__primary'],
  ['/contact/', '.inquiry-form__review'],
  ['/', '.site-footer__group a'],
] as const)
  test(`hover keeps the target boundary still: ${selector}`, async ({
    page,
  }) => {
    await page.goto(route);
    await page.keyboard.press('Escape');
    const target = page.locator(selector).first();
    await target.scrollIntoViewIfNeeded();
    await page.mouse.move(10, 350);
    // Allow intersection callbacks to register their finite entrances before
    // checking their final state; the hover sample excludes that entrance.
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    await expect
      .poll(() =>
        target.evaluate((el) => {
          const ancestors: Element[] = [];
          for (let node: Element | null = el; node; node = node.parentElement)
            ancestors.push(node);
          return ancestors
            .flatMap((node) => node.getAnimations())
            .filter((animation) => animation.playState === 'running').length;
        }),
      )
      .toBe(0);
    const box = (await target.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height - 0.5);
    const points = await target.evaluate(async (el) => {
      const points = [],
        start = performance.now();
      while (performance.now() - start < 400) {
        const box = el.getBoundingClientRect();
        points.push({ x: box.x, y: box.y });
        await new Promise(requestAnimationFrame);
      }
      return points;
    });
    expect(
      Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y)),
    ).toBeLessThan(0.1);
    expect(
      Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x)),
    ).toBeLessThan(0.1);
  });

for (const route of [
  '/',
  '/services/web-development/',
  '/services/ai-automation/',
  '/services/ai-chatbots/',
  '/services/landing-pages/',
])
  for (const width of [390, 1440])
    test(`native disclosure opens, closes and reverses smoothly: ${route} ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const selector =
        route === '/' ? '.faq-item details' : '.service-faq details';
      await page.locator(selector).nth(1).scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(async (selector) => {
        const items = [
          ...document.querySelectorAll<HTMLDetailsElement>(selector),
        ];
        const item = items[1]!;
        const summary = item.querySelector('summary')!;
        const sample = async () => {
          const start = performance.now(),
            heights = [];
          while (performance.now() - start < 520) {
            heights.push(item.getBoundingClientRect().height);
            await new Promise(requestAnimationFrame);
          }
          return heights;
        };
        const closed = item.getBoundingClientRect().height;
        summary.click();
        const opening = await sample();
        const expanded = item.getBoundingClientRect().height;
        summary.click();
        const closing = await sample();
        summary.click();
        await new Promise((resolve) => setTimeout(resolve, 80));
        summary.click();
        await new Promise((resolve) => setTimeout(resolve, 80));
        summary.click();
        await sample();
        return {
          closed,
          expanded,
          opening,
          closing,
          height: item.getBoundingClientRect().height,
          openCount: items.filter((entry) => entry.open).length,
          open: item.open,
          inlineHeight: item.style.height,
        };
      }, selector);
      expect(result.expanded).toBeGreaterThan(result.closed + 30);
      for (const samples of [result.opening, result.closing])
        expect(
          samples.some(
            (height) =>
              height > result.closed + 1 && height < result.expanded - 1,
          ),
        ).toBe(true);
      expect(result.openCount).toBe(1);
      expect(result.open).toBe(true);
      expect(result.height).toBeCloseTo(result.expanded, 0);
      expect(result.inlineHeight).toBe('');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.locator(selector).nth(2).locator('summary').focus();
      await page.keyboard.press('Enter');
      expect(
        await page
          .locator(selector)
          .nth(2)
          .evaluate(
            (element) =>
              getComputedStyle(element, '::details-content').transitionDuration,
          ),
      ).toBe('0s');
      await expect(page.locator(`${selector}[open]`)).toHaveCount(1);
    });

test('cursor changes shape without moving the founder portrait or its hit area', async ({
  page,
}) => {
  await page.goto('/');
  const portrait = page.locator('.founder__portrait');
  await portrait.scrollIntoViewIfNeeded();
  await page.mouse.move(40, 300);
  await expect(page.locator('html')).toHaveAttribute(
    'data-smooth-scroll',
    'lenis',
  );
  await page.mouse.move(50, 300);
  const box = (await portrait.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 80);
  const cursor = page.locator('[data-motion-cursor]');
  await expect(cursor).toHaveAttribute('data-state', 'label');
  await expect(cursor.locator('[data-cursor-label]')).toHaveText('Hamid');
  const transitions = await cursor
    .locator('[data-cursor-ring] i')
    .evaluate((el) => getComputedStyle(el).transitionProperty);
  expect(transitions).toContain('width');
  expect(transitions).toContain('height');
  const after = (await portrait.boundingBox())!;
  expect(after.x).toBeCloseTo(box.x, 0);
  expect(after.width).toBeCloseTo(box.width, 0);
});
