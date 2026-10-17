import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { serviceOverview } from '../src/data/services';

test('services are server-rendered in order with honest, working contact destinations', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/')).text();
  for (const service of serviceOverview) {
    expect(html).toContain(service.description);
    expect(html).not.toContain(`href="${service.plannedHref}"`);
    expect((await request.get(service.href)).status()).toBe(200);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('main > section')).toHaveCount(10);
  await expect(page.locator('main > section').nth(1)).toHaveAttribute(
    'id',
    'proof',
  );
  await expect(page.locator('main > section').nth(2)).toHaveAttribute(
    'id',
    'services',
  );
  await expect(page.locator('#services h2')).toHaveCount(1);
  await expect(page.locator('#services h2')).toHaveText(
    'Digital experiences. Intelligent systems. Real possibilities.',
  );
  await expect(page.locator('#services h3')).toHaveText(
    serviceOverview.map((service) => service.title),
  );
  await expect(page.locator('.service-panel__link')).toHaveText(
    serviceOverview.map((service) => `${service.ctaLabel} →`),
  );
  await expect(
    page.locator(
      '#services img, #services canvas, #services video, #services iframe, #services astro-island',
    ),
  ).toHaveCount(0);
  await expect(
    page.locator(
      '#services input, #services button, #services form, .service-visual a',
    ),
  ).toHaveCount(0);
  await expect(page.locator('.service-visual[aria-hidden="true"]')).toHaveCount(
    4,
  );
  await expect(
    page.locator('#services [role="status"], #services [aria-live]'),
  ).toHaveCount(0);
});

for (const width of [
  320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1536, 1920,
]) {
  test(`services layout and static final state at ${width}px`, async ({
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
    for (const panel of await page.locator('.service-panel').all()) {
      await panel.scrollIntoViewIfNeeded();
      await expect(panel).toBeVisible();
      await expect(panel.locator('h3')).toBeVisible();
      await expect(panel.locator('.service-panel__description')).toBeVisible();
      await expect(panel.locator('a')).toBeVisible();
      const bounds = await panel.boundingBox();
      const visual = await panel.locator('.service-visual').boundingBox();
      expect(visual!.x).toBeGreaterThanOrEqual(bounds!.x);
      expect(visual!.x + visual!.width).toBeLessThanOrEqual(
        bounds!.x + bounds!.width + 1,
      );
      expect(
        await panel
          .locator('.service-panel__surface')
          .evaluate((element) => element.scrollWidth - element.clientWidth),
      ).toBeLessThanOrEqual(1);
      expect(
        (await panel.locator('a').boundingBox())!.height,
      ).toBeGreaterThanOrEqual(44);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const boxes = await page.locator('.service-panel').evaluateAll((panels) =>
      panels.map((panel) => {
        const { x, y, width, height } = panel.getBoundingClientRect();
        return { x, y, width, height };
      }),
    );
    if (width <= 900) {
      for (let index = 1; index < boxes.length; index++)
        expect(boxes[index]!.y).toBeGreaterThan(
          boxes[index - 1]!.y + boxes[index - 1]!.height,
        );
    } else {
      expect(boxes[0]!.y).toBe(boxes[1]!.y);
      expect(boxes[2]!.y).toBe(boxes[3]!.y);
      expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.x + boxes[0]!.width);
      expect(boxes[2]!.y).toBeGreaterThan(boxes[0]!.y + boxes[0]!.height);
    }
    expect(
      await page
        .locator('#services')
        .evaluate((section) => section.getAnimations({ subtree: true }).length),
    ).toBe(0);
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`services keyboard access and axe at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const links = page.locator('.service-panel__link');
    await links.first().focus();
    for (let index = 0; index < 4; index++) {
      await expect(links.nth(index)).toBeFocused();
      await expect(links.nth(index)).toHaveCSS('outline-style', 'solid');
      await page.keyboard.press('Tab');
    }
    await expect(page.locator('.expertise__footer a')).toBeFocused();
    const result = await new AxeBuilder({ page })
      .include('#services')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}

test('services remain usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('#services h3')).toHaveText(
    serviceOverview.map((service) => service.title),
  );
  for (const link of await page.locator('.service-panel__link').all()) {
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/contact/');
  }
  await context.close();
});

test('desktop effects are finite and mobile resize cancels entrance and hover motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', '1'),
  );
  await page.goto('/');
  await page.locator('#services-heading').scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator('#services')
        .evaluate((section) => section.getAnimations({ subtree: true }).length),
    )
    .toBeGreaterThan(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page
        .locator('#services')
        .evaluate((section) => section.getAnimations({ subtree: true }).length),
    )
    .toBe(0);
  await expect(page.locator('#services-heading')).toHaveCSS('opacity', '1');
  await page.setViewportSize({ width: 1440, height: 960 });
  const panel = page.locator('.service-panel--workflow');
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveCSS('opacity', '1');
  await panel.hover();
  await expect(panel.locator('.automation-visual__pulse')).toHaveCSS(
    'animation-iteration-count',
    '1',
  );
  await expect(panel.locator('.automation-visual__pulse')).toHaveCSS(
    'animation-name',
    'workflow-pass',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(panel.locator('.automation-visual__pulse')).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(panel.locator('.service-panel__surface')).toHaveCSS(
    'transform',
    'none',
  );
});

test('failed reveal APIs leave service content visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.addInitScript(() => {
    sessionStorage.setItem('elevatexIntroSeen:v2', '1');
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.closest('#services'))
        throw new Error('Simulated unsupported animation');
      return animate.apply(this, args);
    };
  });
  await page.goto('/');
  for (const element of await page
    .locator('#services [data-service-reveal]')
    .all()) {
    await element.scrollIntoViewIfNeeded();
    await expect(element).toHaveCSS('opacity', '1');
  }
});
