import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { faqs } from '../src/data/faqs';

test('FAQ renders all approved questions, direct answers, and the contact route', async ({
  page,
  request,
}) => {
  const response = await request.get('/');
  const html = await response.text();
  for (const faq of faqs) {
    expect(html).toContain(faq.question);
    expect(html).toContain(faq.answer);
  }

  await page.goto('/');
  const section = page.locator('#faq');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    'Clear answers. Less uncertainty.',
  );
  await expect(section.locator('details')).toHaveCount(10);
  await expect(section.locator('details[open]')).toHaveCount(1);
  await expect(section.locator('details').first()).toHaveAttribute(
    'name',
    'elevatex-faq',
  );
  await expect(
    section.getByRole('link', { name: 'Contact Us' }),
  ).toHaveAttribute('href', '/contact/');
  await expect(section.locator('.faq-section__photo img')).toHaveAttribute(
    'loading',
    'lazy',
  );

  const result = await new AxeBuilder({ page })
    .include('#faq')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

test('FAQ accordion supports keyboard interaction and keeps one answer open', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const questions = page.locator('#faq summary');
  const first = page.locator('#faq details').nth(0);
  const second = page.locator('#faq details').nth(1);

  await questions.nth(1).focus();
  await expect(questions.nth(1)).toBeFocused();
  await page.keyboard.press('Space');
  await expect(second).toHaveAttribute('open', '');
  await expect(first).not.toHaveAttribute('open', '');
  await page.keyboard.press('Enter');
  await expect(second).not.toHaveAttribute('open', '');
});

test('FAQ remains readable and within the viewport across mobile, tablet, and desktop', async ({
  page,
}) => {
  for (const [width, height] of [
    [320, 568],
    [360, 800],
    [375, 812],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [1100, 768],
    [1101, 768],
    [1280, 720],
    [1366, 768],
    [1440, 900],
    [1536, 864],
    [1920, 1080],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const section = page.locator('#faq');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(section.locator('details')).toHaveCount(10);
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(
      dimensions.viewportWidth,
    );
    const labelsFit = await section
      .locator('.faq-section__capabilities li')
      .evaluateAll((items) =>
        items.every((item) => {
          const label = item.querySelector('span')?.getBoundingClientRect();
          const bounds = item.getBoundingClientRect();
          return (
            label && label.x >= bounds.x && label.right <= bounds.right + 1
          );
        }),
      );
    expect(labelsFit).toBe(true);

    const layout = await section.evaluate((element) => {
      const rect = (selector: string) => {
        const node = element.querySelector(selector);
        if (!node) throw new Error(`Missing FAQ element: ${selector}`);
        const { x, y, right, bottom, width, height } =
          node.getBoundingClientRect();
        return { x, y, right, bottom, width, height };
      };
      return {
        intro: rect('.faq-section__intro'),
        photo: rect('.faq-section__photo'),
        capabilities: rect('.faq-section__capabilities'),
        questions: rect('.faq-section__content'),
        contact: rect('.faq-section__contact'),
      };
    });

    expect(layout.capabilities.y).toBeGreaterThanOrEqual(layout.intro.bottom);
    expect(layout.contact.y).toBeGreaterThan(layout.capabilities.bottom);
    if (width > 1100) {
      const capabilityRows = await section
        .locator('.faq-section__capabilities li')
        .evaluateAll((items) =>
          items.map((item) => item.getBoundingClientRect().top),
        );
      expect(
        Math.max(...capabilityRows) - Math.min(...capabilityRows),
      ).toBeLessThan(2);
      expect(layout.intro.right).toBeLessThan(layout.questions.x);
      expect(layout.contact.right).toBeLessThan(layout.questions.x);
      expect(Math.abs(layout.intro.y - layout.questions.y)).toBeLessThan(2);
      expect(layout.contact.bottom).toBeLessThanOrEqual(
        layout.questions.bottom + 1,
      );
    } else {
      expect(layout.photo.y).toBeGreaterThanOrEqual(layout.intro.bottom);
      expect(layout.capabilities.y).toBeGreaterThanOrEqual(layout.photo.bottom);
      expect(layout.questions.y).toBeGreaterThan(layout.capabilities.bottom);
      expect(layout.contact.y).toBeGreaterThan(layout.questions.bottom);
    }
  }
});

test('every FAQ is reachable by Tab and supports opening in reverse order', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const questions = page.locator('#faq summary');
  const items = page.locator('#faq details');
  await questions.first().focus();
  await page.keyboard.press('Enter');
  for (let index = 0; index < 10; index += 1) {
    await expect(questions.nth(index)).toBeFocused();
    await page.keyboard.press('Space');
    await expect(items.nth(index)).toHaveAttribute('open', '');
    await page.keyboard.press('Enter');
    await expect(items.nth(index)).not.toHaveAttribute('open', '');
    await page.keyboard.press('Tab');
  }
  await expect(
    page.locator('#faq').getByRole('link', { name: 'Contact Us' }),
  ).toBeFocused();
  for (let index = 9; index >= 0; index -= 1) {
    await questions.nth(index).click();
    await expect(items.nth(index)).toHaveAttribute('open', '');
    await expect(page.locator('#faq details[open]')).toHaveCount(1);
  }
});

test('FAQ stays usable on short desktops and with enlarged text', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  const section = page.locator('#faq');
  await section.locator('summary').last().click();
  await expect(
    section.getByRole('link', { name: 'Start a Project' }),
  ).toBeVisible();
  await expect(section.getByRole('link', { name: 'Contact Us' })).toBeVisible();
  expect(
    await section.evaluate(
      (element) => element.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const result = await new AxeBuilder({ page }).include('#faq').analyze();
  expect(result.violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('FAQ supports touch with no motion on mobile', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL: baseURL ?? 'http://127.0.0.1:4321',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('/');
  const questions = page.locator('#faq summary');
  await questions.nth(5).tap();
  await expect(page.locator('#faq details[open]')).toHaveCount(1);
  await expect(page.locator('#faq details').nth(5)).toHaveAttribute('open', '');
  const transition = await questions
    .nth(5)
    .locator('.faq-item__indicator')
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(transition).toBe('0s');
  await context.close();
});

test('FAQ questions and answers work with JavaScript disabled', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    ...(baseURL ? { baseURL } : { baseURL: 'http://127.0.0.1:4321' }),
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto('/');
  const section = page.locator('#faq');
  await expect(section.locator('details')).toHaveCount(10);
  const firstFaq = faqs[0];
  if (!firstFaq) throw new Error('FAQ data is missing the first entry.');
  await expect(section.getByText(firstFaq.answer)).toBeVisible();
  await section.locator('summary').nth(1).click();
  await expect(section.locator('details').nth(1)).toHaveAttribute('open', '');
  await expect(
    section.getByRole('link', { name: 'Contact Us' }),
  ).toHaveAttribute('href', '/contact/');
  await context.close();
});
