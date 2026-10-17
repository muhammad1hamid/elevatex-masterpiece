import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 390, 430, 768, 1023]) {
  test(`mobile is static immediately and never downloads GSAP at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const scripts: string[] = [];
    page.on('request', (request) => {
      if (request.resourceType() === 'script') scripts.push(request.url());
    });
    await page.goto('/');
    await expect(page.locator('[data-hero-root]')).toHaveAttribute(
      'data-motion',
      'static',
    );
    await expect(page.locator('html')).not.toHaveAttribute('data-hero-boot');
    await expect(page.locator('#hero-title')).toBeVisible();
    await expect(page.locator('[data-hero-intro]')).toBeHidden();
    await expect(
      page.locator('[data-motion-replay], [data-motion-toggle]'),
    ).toHaveCount(0);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    expect(scripts.some((url) => /gsap\./.test(url))).toBe(false);
    expect(
      await page.evaluate(() => sessionStorage.getItem('elevatexIntroSeen:v2')),
    ).toBeNull();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });
}

test('resizing from desktop into mobile cancels the intro and keeps the final scene visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install({ time: new Date('2026-10-08T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-08T00:00:01Z'));
  await page.goto('/');
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    'entering',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    'static',
  );
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('[data-hero-laptop]')).toHaveCSS('opacity', '1');
  await page.clock.runFor(5000);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('desktop hero has no replay, pause, or enable-motion controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(
    page.locator('[data-motion-replay], [data-motion-toggle]'),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', {
      name: /Replay entrance|Pause motion|Enable motion/,
    }),
  ).toHaveCount(0);
});

test('logo cover precedes the website and a slower staged reveal follows', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install({ time: new Date('2026-10-08T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-08T00:00:01Z'));
  await page.goto('/');
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    'entering',
  );
  await expect(page.locator('[data-hero-intro]')).toBeVisible();
  await expect(page.locator('[data-site-header]')).toBeHidden();
  await expect(page.locator('#hero-title')).toBeHidden();
  const cover = await page.locator('[data-hero-intro]').boundingBox();
  expect(cover?.height).toBe(await page.evaluate(() => innerHeight));
  await page.clock.runFor(1400);
  await expect(page.locator('#hero-title')).toBeHidden();
  await expect(page.locator('[data-intro-elevate]')).toHaveCSS('opacity', '1');
  await page.clock.runFor(1000);
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('[data-hero-intro]')).toBeHidden();
  await expect(page.locator('[data-hero-laptop]')).toHaveCSS('opacity', '0');
  await page.clock.runFor(1900);
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    'ambient',
  );
});

test('cover is present while modules load, and skip recovers without the modules', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() === 'script') await route.abort();
    else await route.continue();
  });
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeHidden();
  await expect(page.locator('[data-site-header]')).toBeHidden();
  const skip = page.getByRole('button', { name: 'Skip intro', exact: true });
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('[data-hero-intro]')).toBeHidden();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test('direct section links bypass the entrance without covering their content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const fragment of ['faq', 'footer']) {
    await page.goto(`/#${fragment}`);
    await expect(page.locator('html')).not.toHaveAttribute('data-hero-boot');
    await expect(page.locator('[data-hero-intro]')).toBeHidden();
    await expect(page.locator('[data-hero-root]')).toHaveAttribute(
      'data-intro',
      'skipped',
    );
    await expect(page.locator(`#${fragment}`)).toBeVisible();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    expect(
      await page.evaluate(() => sessionStorage.getItem('elevatexIntroSeen:v2')),
    ).not.toBe('true');
  }
});

test('scroll input reveals the page even when every animation module fails', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() === 'script') await route.abort();
    else await route.continue();
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-hero-boot',
    'pending',
  );
  await page.mouse.wheel(0, 400);
  await expect(page.locator('html')).not.toHaveAttribute('data-hero-boot');
  await expect(page.locator('[data-hero-intro]')).toBeHidden();
  await expect(page.locator('#hero-title')).toBeVisible();
});

test('a restored scroll position interrupts a pending entrance and remains usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    document.addEventListener(
      'DOMContentLoaded',
      () => window.scrollTo(0, 600),
      { once: true },
    );
  });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-hero-boot');
  await expect(page.locator('[data-hero-intro]')).toBeHidden();
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    'ambient',
  );
  await expect(page.locator('[data-hero-laptop]')).toHaveCSS('opacity', '1');
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test('missing intersection support leaves a complete scene with no runtime errors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() =>
    Reflect.deleteProperty(window, 'IntersectionObserver'),
  );
  await page.goto('/');
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-intro',
    'skipped',
  );
  await expect(page.locator('[data-hero-intro]')).toBeHidden();
  await expect(page.locator('html')).not.toHaveAttribute('data-hero-boot');
  await expect(page.locator('[data-hero-laptop]')).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});

test('smoke visibly drifts and the glow pulses continuously without moving the gold core', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', 'true'),
  );
  await page.goto('/');
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    'ambient',
  );
  const sample = () =>
    page.evaluate(() => {
      const smoke = document.querySelector('.hero__smoke--left')!;
      const aura = document.querySelector('.hero__halo-aura')!;
      return {
        x: new DOMMatrix(getComputedStyle(smoke).transform).m41,
        glow: Number(getComputedStyle(aura).opacity),
        core: getComputedStyle(document.querySelector('.hero__halo-breath')!)
          .opacity,
      };
    });
  const before = await sample();
  await page.waitForTimeout(2500);
  const after = await sample();
  expect(Math.abs(after.x - before.x)).toBeGreaterThan(4);
  expect(Math.abs(after.glow - before.glow)).toBeGreaterThan(0.15);
  expect(after.core).toBe(before.core);
  const loops = await page.locator('[data-hero-root]').evaluate((hero) =>
    hero.getAnimations({ subtree: true }).map((animation) => ({
      iterations: animation.effect?.getTiming().iterations,
      playState: animation.playState,
    })),
  );
  expect(loops).toHaveLength(5);
  for (const loop of loops) {
    expect(loop.iterations).toBe(Infinity);
    expect(loop.playState).toBe('running');
  }
});
