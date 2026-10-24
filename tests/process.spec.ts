import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { processSteps } from '../src/data/processSteps';

type ProcessTestWindow = Window & {
  processObserverAttempts?: number;
  processRevealStarts?: number;
};

async function prepare(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', 'true'),
  );
  await page.goto('/');
  await page.locator('#process-heading').scrollIntoViewIfNeeded();
  await expect(page.locator('#process')).toHaveAttribute(
    'data-process-enhanced',
    '',
  );
}

async function stage(page: Page, index: number) {
  await page
    .locator('[data-process-node]')
    .nth(index)
    .evaluate((node) => {
      const box = node.getBoundingClientRect();
      window.scrollTo(
        0,
        scrollY + box.top + box.height / 2 - innerHeight * 0.46 + 8,
      );
    });
  await expect(page.locator('#process')).toHaveAttribute(
    'data-active-stage',
    processSteps[index]!.id,
  );
}

test('process is sixth with complete server-rendered copy and the approved contact link', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/')).text();
  for (const step of processSteps) {
    expect(html).toContain(step.description);
    expect(html).toContain(step.outcome);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('main > section')).toHaveCount(10);
  await expect(page.locator('main > section').nth(5)).toHaveAttribute(
    'id',
    'process',
  );
  await expect(page.locator('#process h2')).toHaveText(
    'From an idea. To something real.',
  );
  await expect(page.locator('#process h3')).toHaveText(
    processSteps.map((step) => step.title),
  );
  await expect(page.locator('#process h2')).toHaveCSS('font-family', /Outfit/);
  await expect(page.locator('#process a')).toHaveAttribute('href', '/contact/');
  await expect(page.locator('.process-visual')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(page.locator('.process-thread')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(
    page.locator(
      '#process [aria-live], #process button, #process canvas, #process iframe',
    ),
  ).toHaveCount(0);
  await expect(page.locator('#process .process-visual img')).toHaveCount(5);
  await expect(
    page.locator(
      '#process .process-visual img:not([alt]), #process .process-visual img[alt=""]',
    ),
  ).toHaveCount(0);
  await expect(page.locator('.process-visual').getByRole('img')).toHaveCount(0);
  expect(
    await page.locator('#process .process-visual img').evaluateAll((images) =>
      images.map((image) => ({
        width: image.getAttribute('width'),
        height: image.getAttribute('height'),
      })),
    ),
  ).toEqual(
    processSteps.map((step) => ({
      width: String(step.visualWidth),
      height: String(step.visualHeight),
    })),
  );
  await expect(page.locator('img[data-process-visual="launch"]')).toHaveCount(
    1,
  );
});

for (const width of [
  320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1536, 1920, 2560,
]) {
  test(`process readable and aligned at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({
      reducedMotion: width < 1024 ? 'no-preference' : 'reduce',
    });
    const errors: string[] = [];
    const assets: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('request', (request) => assets.push(request.url()));
    await page.goto('/');
    await page.locator('#process').scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('#process')).not.toHaveAttribute(
      'data-process-enhanced',
    );
    if (width < 1024)
      await expect(page.locator('.process-visual')).toBeHidden();
    expect(assets.some((url) => /ScrollTrigger/.test(url))).toBe(false);
    if (width < 1024)
      expect(assets.some((url) => url.includes('/images/process/'))).toBe(
        false,
      );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const boxes = await page
      .locator('[data-process-chapter]')
      .evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            x: rect.x,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            overflow: element.scrollWidth - element.clientWidth,
            opacity: getComputedStyle(element).opacity,
          };
        }),
      );
    boxes.forEach((box, index) => {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(width);
      expect(box.overflow).toBeLessThanOrEqual(1);
      expect(box.opacity).toBe('1');
      if (index)
        expect(box.top).toBeGreaterThanOrEqual(boxes[index - 1]!.bottom - 1);
    });
    expect(
      await page
        .locator('#process')
        .evaluate((element) => element.getAnimations({ subtree: true }).length),
    ).toBe(0);
    expect(
      (await page.locator('#process a').boundingBox())!.height,
    ).toBeGreaterThanOrEqual(44);
    expect(errors).toEqual([]);
  });
}

test('scroll progress, numbers and technical states stay synchronized in both directions', async ({
  page,
}) => {
  await prepare(page);
  let previous = -1;
  let initialFrameHeight = 0;
  for (const index of [0, 1, 2, 3, 4]) {
    await stage(page, index);
    const drawingBounds = await page
      .locator('.process-visual__drawing')
      .evaluate((element) => {
        const { width, height } = element.getBoundingClientRect();
        return { width, height };
      });
    const drawingRatio = drawingBounds.width / drawingBounds.height;
    expect(drawingRatio).toBeCloseTo(1, 1);
    if (index === 0) initialFrameHeight = drawingBounds.height;
    expect(drawingBounds.height).toBeCloseTo(initialFrameHeight, 1);
    const image = page.locator(
      `[data-process-visual="${processSteps[index]!.id}"]`,
    );
    const imageBounds = await image.evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
    expect(imageBounds.width).toBeCloseTo(drawingBounds.width - 2, 0);
    expect(imageBounds.height).toBeCloseTo(drawingBounds.height - 2, 0);
    const progress = Number(
      await page.locator('#process').getAttribute('data-progress'),
    );
    expect(progress).toBeGreaterThan(previous);
    previous = progress;
    await expect(
      page.locator(`[data-process-number="${processSteps[index]!.id}"]`),
    ).toHaveCSS('opacity', '1');
    await expect(
      page.locator(`[data-process-visual="${processSteps[index]!.id}"]`),
    ).toHaveCSS('opacity', '1');
    if (
      await image.evaluate((element) => element instanceof HTMLImageElement)
    ) {
      await expect
        .poll(() =>
          image.evaluate(
            (element) =>
              element instanceof HTMLImageElement &&
              element.complete &&
              element.naturalWidth > 0,
          ),
        )
        .toBe(true);
      const step = processSteps[index]!;
      const base = step.visual.replace(/\.webp$/, '');
      expect([
        step.visual,
        `${base}-620.webp`,
        `${base}-620.avif`,
        `${base}-${step.visualWidth}.avif`,
      ]).toContain(
        await image.evaluate((element) =>
          element instanceof HTMLImageElement
            ? new URL(element.currentSrc).pathname
            : '',
        ),
      );
    }
    await expect(
      page.locator('[data-process-chapter][data-active]'),
    ).toHaveCount(1);
  }
  for (const index of [3, 2, 1, 0]) {
    await stage(page, index);
    expect(
      (await page.locator('.process-visual__drawing').boundingBox())!.height,
    ).toBeCloseTo(initialFrameHeight, 1);
    const progress = Number(
      await page.locator('#process').getAttribute('data-progress'),
    );
    expect(progress).toBeLessThan(previous);
    previous = progress;
  }
  await expect(page.locator('.process-visual__sticky')).toHaveCSS(
    'position',
    'sticky',
  );
  await expect(page.locator('#process .pin-spacer')).toHaveCount(0);
  const y = await page.evaluate(() => scrollY);
  await page.waitForTimeout(700);
  expect(await page.evaluate(() => scrollY)).toBe(y);
});

test('fast jumps, mid-stage stop and resized geometry remain stable', async ({
  page,
}) => {
  await prepare(page);
  await stage(page, 4);
  await stage(page, 0);
  await stage(page, 2);
  await page.setViewportSize({ width: 1280, height: 800 });
  await stage(page, 2);
  await expect
    .poll(async () => {
      const geometry = await page
        .locator('[data-process-journey]')
        .evaluate((element) => {
          const box = element.getBoundingClientRect();
          const marker = element
            .querySelector('[data-thread-light]')!
            .getBoundingClientRect();
          return Math.abs(
            marker.top +
              marker.height / 2 -
              Math.min(box.bottom, innerHeight * 0.46),
          );
        });
      return geometry;
    })
    .toBeLessThan(2);
  await page.waitForTimeout(700);
  const state = await page
    .locator('#process')
    .getAttribute('data-active-stage');
  await page.waitForTimeout(700);
  expect(await page.locator('#process').getAttribute('data-active-stage')).toBe(
    state,
  );
});

for (const mode of ['mobile', 'reduce', 'pagehide'] as const) {
  test(`process enhancement cleans up on ${mode} and can resume`, async ({
    page,
  }) => {
    await prepare(page);
    await stage(page, 2);
    if (mode === 'mobile')
      await page.setViewportSize({ width: 390, height: 844 });
    else if (mode === 'reduce')
      await page.emulateMedia({ reducedMotion: 'reduce' });
    else
      await page.evaluate(() =>
        window.dispatchEvent(new PageTransitionEvent('pagehide')),
      );
    await expect(page.locator('#process')).not.toHaveAttribute(
      'data-process-enhanced',
    );
    await expect(page.locator('[data-thread-light]')).toBeHidden();
    await expect(page.locator('[data-process-chapter]')).toHaveCount(5);
    if (mode === 'mobile')
      await page.setViewportSize({ width: 1440, height: 900 });
    else if (mode === 'reduce')
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    else
      await page.evaluate(() =>
        window.dispatchEvent(
          new PageTransitionEvent('pageshow', { persisted: true }),
        ),
      );
    await page.locator('#process-heading').scrollIntoViewIfNeeded();
    await expect(page.locator('#process')).toHaveAttribute(
      'data-process-enhanced',
      '',
    );
    await stage(page, 3);
  });
}

for (const width of [390, 1440]) {
  test(`process works without JS at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4321/');
    for (const chapter of await page.locator('[data-process-chapter]').all())
      await expect(chapter).toBeVisible();
    await expect(page.locator('#process a')).toBeVisible();
    await expect(page.locator('[data-thread-light]')).toBeHidden();
    await context.close();
  });
  test(`process keyboard and axe checks at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const link = page.locator('#process a');
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('PageUp');
    await expect(link).toBeFocused();
    const results = await new AxeBuilder({ page })
      .include('#process')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test('failed ScrollTrigger download leaves the complete static process', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/*ScrollTrigger*.js', (route) => route.abort());
  await page.goto('/');
  await page.locator('#process').scrollIntoViewIfNeeded();
  await expect(page.locator('#process')).not.toHaveAttribute(
    'data-process-enhanced',
  );
  await expect(page.locator('[data-process-chapter]')).toHaveCount(5);
  for (const chapter of await page.locator('[data-process-chapter]').all())
    await expect(chapter).toHaveCSS('opacity', '1');
});

test('failed observer setup removes the scroll controller and preserves static content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const state = window as ProcessTestWindow;
    state.processObserverAttempts = 0;
    window.ResizeObserver = class {
      constructor() {
        state.processObserverAttempts =
          (state.processObserverAttempts ?? 0) + 1;
        throw new Error('Simulated observer setup failure');
      }
    } as unknown as typeof ResizeObserver;
  });
  await page.goto('/#process');
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as ProcessTestWindow).processObserverAttempts ?? 0,
      ),
    )
    .toBeGreaterThan(0);
  await expect(page.locator('#process')).not.toHaveAttribute(
    'data-process-enhanced',
  );
  await page
    .locator('[data-process-node]')
    .last()
    .evaluate((node) => node.scrollIntoView());
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await expect(page.locator('#process')).not.toHaveAttribute(
    'data-active-stage',
  );
  await expect(page.locator('#process')).not.toHaveAttribute('data-progress');
  for (const chapter of await page.locator('[data-process-chapter]').all())
    await expect(chapter).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});

test('unseen section reveals resume after a persisted page return', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    sessionStorage.setItem('elevatexIntroSeen:v2', 'true');
    const state = window as ProcessTestWindow;
    state.processRevealStarts = 0;
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.matches('#process [data-process-reveal]'))
        state.processRevealStarts = (state.processRevealStarts ?? 0) + 1;
      return animate.apply(this, args);
    };
  });
  await page.goto('/');
  expect(
    await page.evaluate(
      () => (window as ProcessTestWindow).processRevealStarts ?? 0,
    ),
  ).toBe(0);
  await page.evaluate(() => {
    window.dispatchEvent(
      new PageTransitionEvent('pagehide', { persisted: true }),
    );
    window.dispatchEvent(
      new PageTransitionEvent('pageshow', { persisted: true }),
    );
  });
  await page.locator('#process-heading').scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as ProcessTestWindow).processRevealStarts ?? 0,
      ),
    )
    .toBeGreaterThan(0);
  await expect(page.locator('#process-heading')).toBeVisible();
});

test('touch-only desktop uses static presentation', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await page.locator('#process').scrollIntoViewIfNeeded();
  await expect(page.locator('#process')).not.toHaveAttribute(
    'data-process-enhanced',
  );
  await expect(page.locator('.process-visual__sticky')).toHaveCSS(
    'position',
    'static',
  );
  await context.close();
});
