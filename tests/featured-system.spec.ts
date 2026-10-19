import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { featuredSystem } from '../src/data/featured-system';

const sectionSelector = '#featured-system';
const previewSelector = '[data-system-preview]';
const playSelector = '[data-workflow-play]';
const viewports = [
  [320, 568],
  [360, 800],
  [375, 812],
  [390, 844],
  [393, 852],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
] as const;

async function preparePlayback(page: Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', '1'),
  );
  await page.goto('/');
  await page.locator(previewSelector).scrollIntoViewIfNeeded();
  await expect(page.locator(playSelector)).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(sectionSelector)
        .evaluate((element) => element.getAnimations({ subtree: true }).length),
    )
    .toBe(0);
}

test('featured system follows Services with honest server-rendered content and a working internal CTA', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain(featuredSystem.description);
  expect(html).toContain(featuredSystem.summary.replace("'", '&#39;'));
  expect(featuredSystem.verifiedCapabilities).toEqual([]);
  expect(featuredSystem.prototypeCapabilities).toEqual([]);
  expect(
    featuredSystem.capabilities.every((item) => item.status === 'illustrative'),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const section = page.locator(sectionSelector);
  await expect(page.locator('main > section')).toHaveCount(10);
  await expect(page.locator('main > section').nth(3)).toHaveAttribute(
    'id',
    'featured-system',
  );
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(section.locator('h2')).toHaveText(
    'From message. To meaningful action.',
  );
  await expect(section.locator('.handoff__classification')).toHaveText(
    featuredSystem.type,
  );
  await expect(section.locator('.message-input__transcript p')).toContainText(
    featuredSystem.message,
  );
  await expect(
    section.locator('.order-draft__items li > span:last-child'),
  ).toHaveText(featuredSystem.order.items.map((item) => item.name));
  await expect(section.locator('.order-draft__heading > span')).toHaveText(
    'Illustrative',
  );
  await expect(
    section.locator('.restaurant-dashboard, .system-conversation'),
  ).toHaveCount(0);
  await expect(section.locator('#system-demo-note')).toHaveText(
    'Fictional sample data. No order is submitted.',
  );
  await expect(
    section.locator(
      'img, canvas, video, iframe, astro-island, form, input, [aria-live], [role="status"]',
    ),
  ).toHaveCount(0);
  await expect(
    section.getByRole('link', { name: 'Explore the Full Build' }),
  ).toHaveCount(0);
  await expect(
    section.locator('script[type="application/ld+json"]'),
  ).toHaveCount(0);
  const link = section.getByRole('link', { name: 'Explore AI Automation' });
  await expect(link).toHaveAttribute('href', '/#ai-automation-heading');
  await link.click();
  await expect(page).toHaveURL(/#ai-automation-heading$/);
  await expect(page.locator('#ai-automation-heading')).toBeInViewport();
});

for (const [width, height] of viewports) {
  test(`featured system layout and static state at ${width}x${height}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.setViewportSize({ width, height });
    await page.emulateMedia({
      reducedMotion: width < 1024 ? 'no-preference' : 'reduce',
    });
    await page.goto('/');
    const section = page.locator(sectionSelector);
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator('h2')).toBeVisible();
    await expect(section.locator(playSelector)).toBeHidden();
    await expect(section.locator(previewSelector)).toHaveAttribute(
      'data-workflow-state',
      'complete',
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    expect(
      await section.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    ).toBe(0);
    const selectors = [
      '.featured-system__intro',
      '.handoff',
      '.featured-system__footer',
    ];
    const boxes = [];
    for (const selector of selectors)
      boxes.push((await section.locator(selector).boundingBox())!);
    for (let index = 1; index < boxes.length; index++)
      expect(boxes[index]!.y).toBeGreaterThanOrEqual(
        boxes[index - 1]!.y + boxes[index - 1]!.height,
      );
    const preview = (await section.locator('.handoff__zones').boundingBox())!;
    const panels = [];
    for (const selector of [
      '.message-input',
      '.system-connection',
      '.order-output',
    ]) {
      const panel = section.locator(selector);
      const box = (await panel.boundingBox())!;
      panels.push(box);
      expect(box.x).toBeGreaterThanOrEqual(preview.x);
      expect(box.x + box.width).toBeLessThanOrEqual(preview.x + preview.width);
      expect(
        await panel.evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
    }
    if (width <= 900) {
      expect(panels[1]!.y).toBeGreaterThanOrEqual(
        panels[0]!.y + panels[0]!.height,
      );
      expect(panels[2]!.y).toBeGreaterThanOrEqual(
        panels[1]!.y + panels[1]!.height,
      );
      expect(
        await section
          .locator('.message-input__transcript p')
          .first()
          .evaluate((element) =>
            parseFloat(getComputedStyle(element).fontSize),
          ),
      ).toBeGreaterThanOrEqual(13);
    }
    expect(
      (await section.locator('.featured-system__service-link').boundingBox())!
        .height,
    ).toBeGreaterThanOrEqual(44);
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`featured system remains complete without JavaScript at ${width}px`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4321/');
    await expect(page.locator(playSelector)).toBeHidden();
    for (const element of await page
      .locator('#featured-system [data-system-reveal]')
      .all())
      await expect(element).toHaveCSS('opacity', '1');
    await expect(page.locator('.order-draft__items li')).toHaveCount(2);
    await expect(page.locator('.order-draft__status')).toContainText(
      'Awaiting confirmation',
    );
    await page.getByRole('link', { name: 'Explore AI Automation' }).click();
    await expect(page.locator('#ai-automation-heading')).toBeInViewport();
    await context.close();
  });

  test(`featured system keyboard focus and axe at ${width}px`, async ({
    page,
  }) => {
    if (width === 1440) await preparePlayback(page);
    else {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
    }
    const link = page.getByRole('link', { name: 'Explore AI Automation' });
    if (width === 1440) {
      const button = page.locator(playSelector);
      await button.focus();
      await expect(button).toHaveCSS('outline-style', 'solid');
      await page.keyboard.press('Enter');
      await expect(button).toBeFocused();
      await expect(button).toHaveAccessibleName('Replay Flow', {
        timeout: 4000,
      });
      await expect(button).toBeFocused();
      await page.keyboard.press('Tab');
    } else await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS('outline-style', 'solid');
    const result = await new AxeBuilder({ page })
      .include(sectionSelector)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}

test('workflow plays its four phases once in 1.75 seconds with no data requests or repeated-click restart', async ({
  page,
}) => {
  await preparePlayback(page);
  const requests: string[] = [];
  page.on('request', (request) => {
    if (['fetch', 'xhr'].includes(request.resourceType()))
      requests.push(request.url());
  });
  const preview = page.locator(previewSelector);
  const button = page.locator(playSelector);
  const originalText = await page.locator('.handoff__zones').innerText();
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await button.click();
  await expect(preview).toHaveAttribute('data-workflow-state', 'message');
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await page.clock.runFor(300);
  await expect(preview).toHaveAttribute('data-workflow-state', 'processing');
  await button.dispatchEvent('click');
  await expect(preview).toHaveAttribute('data-workflow-state', 'processing');
  await page.clock.runFor(550);
  await expect(preview).toHaveAttribute('data-workflow-state', 'draft');
  await page.clock.runFor(550);
  await expect(preview).toHaveAttribute('data-workflow-state', 'complete');
  await page.clock.runFor(350);
  await expect(button).toHaveAccessibleName('Replay Flow');
  await expect(button).not.toHaveAttribute('aria-disabled');
  await expect(button).toBeFocused();
  await page.clock.runFor(10000);
  await expect(preview).toHaveAttribute('data-workflow-state', 'complete');
  // Native CSS transitions use the document timeline, independent of mocked timers.
  await expect
    .poll(() =>
      preview.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    )
    .toBe(0);
  expect(await page.locator('.handoff__zones').innerText()).toBe(originalText);
  expect(requests).toEqual([]);
  await button.click();
  await expect(preview).toHaveAttribute('data-workflow-state', 'message');
  await page.clock.runFor(1750);
  await expect(button).toHaveAccessibleName('Replay Flow');
});

for (const cancellation of [
  'resize',
  'reduce',
  'offscreen',
  'pagehide',
] as const) {
  test(`workflow restores its complete state on ${cancellation}`, async ({
    page,
  }) => {
    await preparePlayback(page);
    await page.locator(playSelector).click();
    await expect(page.locator(playSelector)).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    if (cancellation === 'resize')
      await page.setViewportSize({ width: 390, height: 844 });
    if (cancellation === 'reduce')
      await page.emulateMedia({ reducedMotion: 'reduce' });
    if (cancellation === 'offscreen')
      await page.evaluate(() => window.scrollTo(0, 0));
    if (cancellation === 'pagehide')
      await page.evaluate(() =>
        window.dispatchEvent(new PageTransitionEvent('pagehide')),
      );
    await expect(page.locator(previewSelector)).toHaveAttribute(
      'data-workflow-state',
      'complete',
    );
    await expect(page.locator(playSelector)).not.toHaveAttribute(
      'aria-disabled',
    );
    if (cancellation === 'resize' || cancellation === 'reduce')
      await expect(page.locator(playSelector)).toBeHidden();
    // Leaving the interface can also finish its short border hover transition.
    await expect
      .poll(() =>
        page
          .locator(previewSelector)
          .evaluate(
            (element) => element.getAnimations({ subtree: true }).length,
          ),
      )
      .toBe(0);
  });
}

test('failed scripts leave the complete illustration and hide the optional control', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/_astro/*.js', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator(playSelector)).toBeHidden();
  await expect(page.locator(previewSelector)).toHaveAttribute(
    'data-workflow-state',
    'complete',
  );
  for (const element of await page
    .locator('#featured-system [data-system-reveal]')
    .all())
    await expect(element).toHaveCSS('opacity', '1');
});

test('unsupported animation restores complete content without an uncaught exception', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.closest('#featured-system'))
        throw new Error('Simulated animation failure');
      return animate.apply(this, args);
    };
  });
  await preparePlayback(page);
  await page.locator(playSelector).click();
  await expect(page.locator(playSelector)).toHaveAccessibleName('Replay Flow');
  await expect(page.locator(previewSelector)).toHaveAttribute(
    'data-workflow-state',
    'complete',
  );
  await expect(page.locator('[data-order-draft]')).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});

test('touch-only devices use the complete static interface even at desktop width', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await page.locator(sectionSelector).scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => matchMedia('(hover: none) and (pointer: coarse)').matches,
    ),
  ).toBe(true);
  await expect(page.locator(playSelector)).toBeHidden();
  await expect(page.locator('.order-draft')).toHaveCSS('transform', 'none');
  expect(
    await page
      .locator(sectionSelector)
      .evaluate((element) => element.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await context.close();
});

test('desktop heading entrance runs once and remains visible when revisited', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', '1'),
  );
  await page.goto('/');
  const heading = page.locator('#featured-system-heading');
  await heading.scrollIntoViewIfNeeded();
  await expect
    .poll(() => heading.evaluate((element) => element.getAnimations().length))
    .toBeGreaterThan(0);
  await expect
    .poll(() => heading.evaluate((element) => element.getAnimations().length))
    .toBe(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveCSS('opacity', '1');
  expect(
    await heading.evaluate((element) => element.getAnimations().length),
  ).toBe(0);
});
