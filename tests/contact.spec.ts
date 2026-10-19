import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const path = '/contact/';
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
const services = [
  'web-development',
  'ai-automation',
  'ai-chatbots',
  'landing-pages',
];
const review = (page: Page) =>
  page.getByRole('button', { name: 'Review Project Inquiry' });
async function fillRequired(page: Page) {
  await page.locator('#inquiry-name').fill('Example Visitor');
  await page.locator('#inquiry-email').fill('visitor@example.com');
  await page.locator('#inquiry-service').selectOption('web-development');
  await page
    .locator('#inquiry-description')
    .fill('I would like to discuss a new business website.');
}

test('Contact ships semantic static content, accurate metadata and an explicit review-only form', async ({
  page,
  request,
}) => {
  const response = await request.get(path),
    html = await response.text();
  expect(response.status()).toBe(200);
  expect(html).not.toMatch(
    /http-equiv="refresh"|<astro-island|<canvas|<iframe|<video/,
  );
  await page.goto(path);
  await expect(page).toHaveTitle(
    'Contact — Start a Website or AI Project | ElevateX',
  );
  await expect(page.locator('h1')).toHaveCount(1);
  const whatsapp = page.locator('.contact-methods a[href^="https://wa.me/"]');
  await expect(whatsapp).toHaveAccessibleName(
    'Chat on WhatsApp (opens in a new tab)',
  );
  await expect(whatsapp).toHaveAttribute('href', 'https://wa.me/923356709222');
  await expect(page.locator('h1')).toContainText('Great ideas start');
  await expect(page.locator('h1')).toContainText('with a conversation.');
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.locator('[data-contact-page] img')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://elevatexlab.org/contact/',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  expect(html).toContain('"@type":"ContactPage"');
  expect(html).toContain('"@type":"BreadcrumbList"');
  const form = page.locator('[data-inquiry-form]');
  await expect(form.locator('input,select,textarea')).toHaveCount(8);
  await expect(form.locator(':required')).toHaveCount(4);
  await expect(form.locator('[type="submit"]')).toHaveCount(0);
  await expect(page.locator('#inquiry-availability')).toContainText(
    'sending is not available yet',
  );
  await expect(page.locator('#inquiry-service option')).toHaveCount(7);
  await expect(page.locator('#inquiry-budget')).not.toContainText(/\$|PKR/);
  for (const field of await form.locator('input,select,textarea').all()) {
    const id = await field.getAttribute('id');
    await expect(form.locator(`label[for="${id}"]`)).toHaveCount(1);
    expect(await field.getAttribute('aria-describedby')).toContain(
      `${id}-error`,
    );
  }
  for (const link of await page.locator('[data-contact-page] a').all()) {
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    if (href!.startsWith('#')) await expect(page.locator(href!)).toHaveCount(1);
  }
});

test('local validation preserves details, focuses the first error and never sends or saves an inquiry', async ({
  page,
}) => {
  await page.goto(path);
  // Complete the optional first-interaction motion import before watching form
  // traffic. The submission itself must still make zero network requests.
  await page.mouse.move(200, 200);
  await expect(page.locator('html')).toHaveAttribute(
    'data-smooth-scroll',
    'lenis',
  );
  const requests: string[] = [];
  page.on('request', (request) =>
    requests.push(`${request.method()} ${request.url()}`),
  );
  await review(page).click();
  await expect(page.locator('#inquiry-name')).toBeFocused();
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(4);
  await expect(page.locator('[data-inquiry-status]')).toContainText(
    '4 highlighted fields',
  );
  await fillRequired(page);
  await page.locator('#inquiry-email').fill('invalid-address');
  await page.locator('#inquiry-website').fill('javascript:alert(1)');
  await review(page).click();
  await expect(page.locator('#inquiry-email')).toBeFocused();
  await expect(page.locator('#inquiry-email-error')).toContainText(
    'valid email',
  );
  await expect(page.locator('#inquiry-website-error')).toContainText(
    'http:// or https://',
  );
  await expect(page.locator('#inquiry-name')).toHaveValue('Example Visitor');
  await page.locator('#inquiry-email').fill('visitor@example.com');
  await page.locator('#inquiry-website').fill('https://example.com');
  await page.locator('#inquiry-phone').fill('+44 (0) 20 1234 5678');
  await review(page).click();
  await expect(page.locator('[data-inquiry-form]')).toHaveAttribute(
    'data-inquiry-state',
    'reviewed',
  );
  await expect(page.locator('[data-inquiry-status]')).toContainText(
    'Nothing has been sent',
  );
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
  await page.locator('#inquiry-email').press('Enter');
  await expect(page).toHaveURL(/\/contact\/$/);
  await page
    .locator('#inquiry-description')
    .fill('<script>alert("example")</script> A project idea.');
  await expect(page.locator('[data-inquiry-form]')).toHaveAttribute(
    'data-inquiry-state',
    'idle',
  );
  await expect(page.locator('[data-inquiry-status]')).toBeEmpty();
  await review(page).click();
  await expect(page.locator('[data-inquiry-status]')).toContainText(
    'Nothing has been sent',
  );
  expect(requests).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
});

test('known service CTAs preselect the corresponding service; unknown input is ignored', async ({
  page,
  request,
}) => {
  for (const service of services) {
    const html = await (await request.get(`/services/${service}/`)).text();
    expect(html).toContain(`/contact/?service=${service}`);
    await page.goto(`${path}?service=${service}`);
    await expect(page.locator('#inquiry-service')).toHaveValue(service);
    await page.locator('#inquiry-service').selectOption('not-sure');
    await expect(page.locator('#inquiry-service')).toHaveValue('not-sure');
  }
  await page.goto(`${path}?service=%3Cscript%3Ealert(1)%3C/script%3E`);
  await expect(page.locator('#inquiry-service')).toHaveValue('');
});

test('without JavaScript the content, labels and anchor work while review and submission remain unavailable', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4321${path}`);
  await expect(page.locator('h1')).toBeVisible();
  await expect(review(page)).toBeDisabled();
  await expect(page.locator('.inquiry-form__noscript')).toContainText(
    'Inquiry sending is not available yet',
  );
  await page.locator('.contact-hero a').click();
  await expect(page).toHaveURL(/#project-inquiry$/);
  await expect(page.locator('#inquiry-title')).toBeInViewport();
  await fillRequired(page);
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.locator('#inquiry-email').press('Enter');
  await expect(page).toHaveURL(/#project-inquiry$/);
  await expect(page.locator('#inquiry-name')).toHaveValue('Example Visitor');
  expect(requests).toEqual([]);
  await context.close();
});

test('keyboard order, visible focus and reduced motion are usable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
  await page.locator('.contact-hero a').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#project-inquiry')).toBeFocused();
  const ids = [
    'name',
    'email',
    'service',
    'budget',
    'phone',
    'timeline',
    'website',
    'description',
  ];
  for (const id of ids) {
    await page.keyboard.press('Tab');
    await expect(page.locator(`#inquiry-${id}`)).toBeFocused();
    expect(
      await page
        .locator(`#inquiry-${id}`)
        .evaluate((el) => getComputedStyle(el).outlineStyle),
    ).not.toBe('none');
  }
  await page.keyboard.press('Tab');
  await expect(review(page)).toBeFocused();
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === 'running')
          .length,
    ),
  ).toBe(0);
});

for (const [width, height] of sizes)
  test(`Contact fits ${width}x${height} without clipped fields or resource errors`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        failures.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width + 1);
    for (const field of await page
      .locator(
        '[data-inquiry-form] input, [data-inquiry-form] select, [data-inquiry-form] textarea',
      )
      .all()) {
      const box = await field.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(
        await field.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ).toBeGreaterThanOrEqual(16);
    }
    const columns = await page
      .locator('.inquiry-form__grid')
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
      );
    expect(columns).toBe(width < 768 ? 1 : 2);
    await review(page).click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width + 1);
    expect(failures).toEqual([]);
  });

for (const width of [390, 1440])
  test(`Contact has no axe AA violations at ${width}px including errors`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const scan = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
    expect((await scan()).violations).toEqual([]);
    await review(page).click();
    expect((await scan()).violations).toEqual([]);
  });

test('200 percent text and finite entrance motion keep the form usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(path);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === 'running')
            .length,
      ),
    )
    .toBe(0);
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  await page.locator('#project-inquiry').scrollIntoViewIfNeeded();
  await page.locator('#inquiry-name').fill('Example Visitor');
  await expect(page.locator('#inquiry-name')).toBeVisible();
  await review(page).click();
  await expect(page.locator('#inquiry-email')).toBeFocused();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(1281);
});
