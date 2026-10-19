import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const titles = ['Qadeer Jewellers', 'Infinity Salon', 'Classic Detailers'];
const links = [
  'https://qadeerjewellers.vercel.app/',
  'https://infinity-salon-swart.vercel.app/',
  'https://apex-detailing-studio-phi.vercel.app/',
];

test('proof follows the hero in server HTML with accurate concepts and no invented metrics', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('id="proof-heading"');
  titles.forEach((title) => expect(html).toContain(title));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  // Astro emits module script nodes between components; compare sections.
  await expect(page.locator('main > section').nth(0)).toHaveClass(/hero/);
  await expect(page.locator('main > section').nth(1)).toHaveAttribute(
    'id',
    'proof',
  );
  await expect(page.locator('main > section').nth(2)).toHaveAttribute(
    'id',
    'services',
  );
  await expect(page.locator('#proof h2')).toHaveText(
    'Built for real businesses. Designed to perform.',
  );
  await expect(page.locator('#proof h3')).toHaveText(titles);
  await expect(page.locator('.project__type')).toHaveText([
    'Concept project',
    'Concept project',
    'Concept project',
  ]);
  expect(await page.locator('#proof').innerText()).not.toMatch(
    /30\+|10\+|satisfied clients|client project/i,
  );
  for (const [index, link] of links.entries()) {
    await expect(page.locator('.project__link').nth(index)).toHaveAttribute(
      'href',
      link,
    );
    await expect(
      page.locator('.project__link').nth(index),
    ).toHaveAccessibleName(`${titles[index]} View Project`);
  }
  await expect(
    page.getByRole('link', { name: 'Explore Selected Work' }),
  ).toHaveAttribute('href', '/work/');
});

for (const width of [
  320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1536, 1920,
]) {
  test(`proof layout, images and motion at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({
      reducedMotion: width < 1024 ? 'no-preference' : 'reduce',
    });
    await page.goto('/');
    const projects = page.locator('.project');
    for (const project of await projects.all()) {
      await project.scrollIntoViewIfNeeded();
      await project
        .locator('img')
        .evaluate((img: HTMLImageElement) => img.decode());
      await expect(project).toBeVisible();
      await expect(project.locator('h3')).toBeVisible();
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const boxes = await projects.evaluateAll((items) =>
      items.map((item) => {
        const { x, y, width, height } = item.getBoundingClientRect();
        return { x, y, width, height };
      }),
    );
    boxes.forEach((box) => {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    });
    if (width < 1024) {
      expect(boxes[1]!.y).toBeGreaterThanOrEqual(
        boxes[0]!.y + boxes[0]!.height,
      );
      expect(boxes[2]!.y).toBeGreaterThanOrEqual(
        boxes[1]!.y + boxes[1]!.height,
      );
    } else {
      expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.x + boxes[0]!.width);
      expect(boxes[2]!.x).toBeGreaterThan(boxes[1]!.x + boxes[1]!.width);
    }
    // The approved shared engine has a finite, quiet mobile reveal. Verify
    // that it settles instead of assuming it is absent immediately on entry.
    await expect
      .poll(() =>
        page
          .locator('#proof')
          .evaluate(
            (section) => section.getAnimations({ subtree: true }).length,
          ),
      )
      .toBe(0);
    for (const img of await page.locator('.project img').all()) {
      await expect(img).toHaveAttribute('loading', 'lazy');
      await expect(img).toHaveAttribute('decoding', 'async');
      await expect(img).toHaveAttribute('width', '1200');
      await expect(img).toHaveAttribute('height', '900');
      expect(await img.getAttribute('alt')).toBeTruthy();
      expect(
        await img.evaluate((image: HTMLImageElement) => image.currentSrc),
      ).toMatch(/\.avif$/);
    }
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`proof is accessible with keyboard at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const first = page.locator('.project__link').first();
    await first.focus();
    await expect(first).toBeFocused();
    await expect(first).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Tab');
    await expect(page.locator('.project__link').nth(1)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.project__link').nth(2)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.selected-work__cta')).toBeFocused();
    const result = await new AxeBuilder({ page })
      .include('#proof')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}

test('proof content and links work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('#proof-heading')).toBeVisible();
  await expect(page.locator('.project__link')).toHaveCount(3);
  for (const project of await page.locator('.project').all()) {
    await project.scrollIntoViewIfNeeded();
    await project
      .locator('img')
      .evaluate((img: HTMLImageElement) => img.decode());
    await expect(project).toHaveCSS('opacity', '1');
  }
  await context.close();
});

test('desktop reveals once and reduced motion cancels an active reveal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', '1'),
  );
  await page.goto('/');
  await expect(page.locator('[data-hero-root]')).not.toHaveAttribute(
    'data-motion',
    'entering',
  );
  await page.locator('#proof-heading').scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator('#proof')
        .evaluate((section) => section.getAnimations({ subtree: true }).length),
    )
    .toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() =>
      page
        .locator('#proof')
        .evaluate((section) => section.getAnimations({ subtree: true }).length),
    )
    .toBe(0);
  await expect(page.locator('#proof-heading')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('#hero-title').scrollIntoViewIfNeeded();
  await page.locator('#proof-heading').scrollIntoViewIfNeeded();
  expect(
    await page
      .locator('#proof-heading')
      .evaluate((heading) => heading.getAnimations().length),
  ).toBe(0);
});

test('missing animation APIs never hide proof content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    sessionStorage.setItem('elevatexIntroSeen:v2', '1');
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.closest('#proof'))
        throw new Error('Simulated animation failure');
      return animate.apply(this, args);
    };
  });
  await page.goto('/');
  for (const target of await page.locator('#proof [data-proof-reveal]').all()) {
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveCSS('opacity', '1');
  }
});

test('project image dimensions prevent shifts while images arrive', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let release: () => void = () => {};
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/images/work/**', async (route) => {
    await ready;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.project').first().scrollIntoViewIfNeeded();
  const before = await page.locator('.project').first().boundingBox();
  release();
  await page
    .locator('.project img')
    .first()
    .evaluate((img: HTMLImageElement) => img.decode());
  const after = await page.locator('.project').first().boundingBox();
  expect(after?.height).toBe(before?.height);
  expect(after?.y).toBe(before?.y);
});
