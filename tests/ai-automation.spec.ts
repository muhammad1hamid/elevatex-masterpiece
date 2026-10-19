import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import {
  aiAutomation,
  automationFAQs,
  inquirySteps,
} from '../src/data/services/ai-automation';

const path = '/services/ai-automation/';
const widths = [
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

test('automation content and its boundaries are delivered as readable HTML', async ({
  page,
  request,
}) => {
  const response = await request.get(path);
  expect(response.status()).toBe(200);
  const html = await response.text();
  for (const question of automationFAQs)
    expect(html).toContain(question.question);
  expect(html).not.toMatch(
    /<astro-island\b|<canvas\b|<video\b|spline-viewer|react-dom|three\.js/,
  );
  await page.goto(path);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText(aiAutomation.heading);
  const root = page.locator('[data-ai-automation]');
  expect(
    await root
      .locator(':scope > section')
      .evaluateAll((elements) => elements.map((element) => element.id)),
  ).toEqual([
    'automation-hero',
    'automation-principles',
    'automation-problems',
    'automation-capabilities',
    'automation-workflow',
    'automation-use-cases',
    'automation-integrations',
    'automation-build',
    'automation-deliverables',
    'automation-faq',
    'automation-cta',
  ]);
  await expect(root.locator('form,img,canvas,video')).toHaveCount(0);
  await expect(
    root.getByText('Product Demo · Illustrative', { exact: true }),
  ).toBeVisible();
  await expect(
    root.getByText('Illustrative workflow', { exact: true }),
  ).toHaveCount(2);
  await expect(
    root.getByRole('link', { name: /Explore the Product Demo/ }),
  ).toHaveAttribute('href', '/#featured-system');
  await expect(
    root
      .getByText(/required platform access and integration setup are available/)
      .first(),
  ).toBeVisible();
  const headings = await root
    .locator('h1,h2,h3,h4')
    .evaluateAll((elements) =>
      elements.map((element) => Number(element.tagName.slice(1))),
    );
  for (let i = 1; i < headings.length; i++)
    expect(headings[i]! - headings[i - 1]!).toBeLessThanOrEqual(1);
});

test('metadata, social asset and schema describe this service without unsupported claims', async ({
  page,
  request,
}) => {
  await page.goto(path);
  await expect(page).toHaveTitle(
    'AI Automation Services for Businesses | ElevateX',
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    aiAutomation.description,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  const canonical = `https://elevatexlab.org${path}`;
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    canonical,
  );
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((elements) =>
      elements.flatMap(
        (element) =>
          JSON.parse(element.textContent ?? '[]') as Record<string, unknown>[],
      ),
    );
  for (const type of [
    'Organization',
    'WebSite',
    'WebPage',
    'Service',
    'BreadcrumbList',
  ])
    expect(schemas.filter((schema) => schema['@type'] === type)).toHaveLength(
      1,
    );
  const service = schemas.find((schema) => schema['@type'] === 'Service')!;
  expect(service['name']).toBe('AI Automation');
  expect(service['url']).toBe(canonical);
  expect(service['provider']).toEqual({
    '@id': 'https://elevatexlab.org/#organization',
  });
  for (const key of [
    'aggregateRating',
    'review',
    'offers',
    'priceRange',
    'award',
    'areaServed',
  ])
    expect(service).not.toHaveProperty(key);
  const image = await request.get(aiAutomation.image.src);
  expect(image.status()).toBe(200);
  const buffer = await image.body();
  expect(buffer.readUInt32BE(16)).toBe(1200);
  expect(buffer.readUInt32BE(20)).toBe(630);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    `https://elevatexlab.org${aiAutomation.image.src}`,
  );
});

test('primary actions, workflow jump, related service, and demo links have actual local destinations', async ({
  page,
  request,
}) => {
  await page.goto(path);
  for (const link of await page.locator('[data-ai-automation] a').all()) {
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    const target = new URL(href!, `http://127.0.0.1:4321${path}`);
    const response = await request.get(target.pathname);
    expect(response.status()).toBe(200);
    if (target.hash)
      expect(await response.text()).toContain(`id="${target.hash.slice(1)}"`);
  }
  await expect(
    page
      .locator('#automation-hero')
      .getByRole('link', { name: 'Discuss an Automation' }),
  ).toHaveAttribute('href', '/contact/?service=ai-automation');
  await page
    .locator('#automation-hero')
    .getByRole('link', { name: 'See How It Works' })
    .click();
  await expect(page).toHaveURL(/#automation-workflow$/);
  await expect(page.locator('#automation-workflow-heading')).toBeInViewport();
  const contact = await (await request.get('/contact/')).text();
  expect(contact).toContain('Inquiry preview');
});

for (const [width, height] of widths)
  test(`centered layout fits ${width} by ${height} without resource failures`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    page.on('requestfailed', (request) => {
      if (request.failure()?.errorText !== 'net::ERR_ABORTED')
        errors.push(request.url());
    });
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const alignments = await page
      .locator('[data-ai-automation] h1,[data-ai-automation] h2')
      .evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).textAlign),
      );
    expect(alignments.every((value) => value === 'center')).toBe(true);
    const eyebrowOffsets = await page
      .locator(
        '[data-ai-automation] .automation-eyebrow, [data-ai-automation] .service-faq__eyebrow, [data-ai-automation] .service-cta__eyebrow',
      )
      .evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          return Math.abs((box.left + box.right) / 2 - innerWidth / 2);
        }),
      );
    for (const offset of eyebrowOffsets) expect(offset).toBeLessThanOrEqual(1);
    await expect(page.locator('.inquiry-step')).toHaveCount(
      inquirySteps.length,
    );
    const overflow = await page
      .locator(
        '[data-ai-automation] h1,[data-ai-automation] h2,.inquiry-step,.automation-story,.automation-deliverables__layers li',
      )
      .evaluateAll((elements) =>
        elements
          .filter((element) => {
            const box = element.getBoundingClientRect();
            return box.left < -1 || box.right > innerWidth + 1;
          })
          .map((element) => element.className),
      );
    expect(overflow).toEqual([]);
    expect(errors).toEqual([]);
  });

for (const width of [390, 1440]) {
  test(`native workflow, FAQs and links work without JavaScript at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL: baseURL ?? 'http://127.0.0.1:4321',
      javaScriptEnabled: false,
      reducedMotion: 'reduce',
      viewport: { width, height: 900 },
    });
    try {
      const page = await context.newPage();
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const radios = page.locator('.inquiry-step__radio');
      await radios.first().focus();
      for (let i = 0; i < inquirySteps.length; i++) {
        if (i) await page.keyboard.press('ArrowRight');
        await expect(radios.nth(i)).toBeChecked();
        const value = await radios.nth(i).getAttribute('value');
        await expect(
          page.locator(
            `[data-inquiry-detail="${value}"]:visible, [data-inquiry-mobile-detail="${value}"]:visible`,
          ),
        ).toBeVisible();
        const id = await radios.nth(i).getAttribute('id');
        await expect(page.locator(`label[for="${id}"]`)).toBeInViewport({
          ratio: 0.5,
        });
      }
      const last = page.locator('#automation-faq summary').last();
      await last.focus();
      await page.keyboard.press('Enter');
      await expect(
        page.locator('#automation-faq details').last(),
      ).toHaveAttribute('open', '');
      await expect(
        page.locator('#automation-faq details').first(),
      ).not.toHaveAttribute('open', '');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    } finally {
      await context.close();
    }
  });
  test(`keyboard focus and WCAG checks pass at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', { name: 'Skip to content' }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
    await page.locator('.inquiry-step__radio').first().focus();
    await expect(page.locator('label[for="inquiry-received"]')).toHaveCSS(
      'outline-style',
      'solid',
    );
    await page.locator('#automation-faq summary').last().click();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

test('desktop scroll progresses through the workflow and hands control to keyboard selection', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(path);
  await page.locator('.automation-signal').scrollIntoViewIfNeeded();
  await expect(page.locator('.automation-signal')).toHaveClass(/is-entered/);
  await page
    .locator('#automation-workflow')
    .evaluate((element) =>
      window.scrollTo(0, element.getBoundingClientRect().top + scrollY + 400),
    );
  await expect
    .poll(() => page.locator('.inquiry-step__radio:checked').inputValue())
    .not.toBe('received');
  await page.locator('#inquiry-received').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#inquiry-intent')).toBeChecked();
  await page.evaluate(() => window.scrollBy(0, 150));
  await expect(page.locator('#inquiry-intent')).toBeChecked();
});

test('mobile and reduced motion stay static, with no external tracking or heavy animation requests', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  for (const [width, reducedMotion] of [
    [390, 'no-preference'],
    [1440, 'reduce'],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.goto(path);
    await page.locator('#automation-workflow').scrollIntoViewIfNeeded();
    await expect(page.locator('#inquiry-received')).toBeChecked();
    expect(
      await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === 'running').length,
      ),
    ).toBe(0);
  }
  expect(
    requests.filter((url) => !url.startsWith('http://127.0.0.1:4321/')),
  ).toEqual([]);
  expect(
    requests.filter((url) =>
      /gsap|ScrollTrigger|hero-intro|three|react-dom/i.test(url),
    ),
  ).toEqual([]);
});

test('enlarged text keeps the page and interactive content within the viewport', async ({
  page,
}) => {
  for (const width of [320, 390, 820, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await page.locator('#inquiry-approval').focus();
    await page.keyboard.press('Space');
    await expect(
      page.locator(
        '[data-inquiry-detail="approval"]:visible, [data-inquiry-mobile-detail="approval"]:visible',
      ),
    ).toBeVisible();
    await page.locator('#automation-faq summary').last().click();
    await expect(
      page.locator('#automation-faq details').last(),
    ).toHaveAttribute('open', '');
  }
});
