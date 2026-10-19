import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import {
  aiChatbots,
  chatbotFAQs,
  conversation,
} from '../src/data/services/ai-chatbots';
const path = aiChatbots.path;
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

test('complete content, conversation provenance and metadata are server rendered', async ({
  page,
  request,
}) => {
  const response = await request.get(path);
  expect(response.status()).toBe(200);
  const html = await response.text();
  for (const faq of chatbotFAQs) expect(html).toContain(faq.question);
  for (const message of conversation) expect(html).toContain(message.text);
  expect(html).not.toMatch(
    /<astro-island\b|<canvas\b|<video\b|<form\b|react-dom|three\.js/,
  );
  await page.goto(path);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText(aiChatbots.heading);
  await expect(page.locator('[data-ai-chatbots] > section')).toHaveCount(11);
  await expect(page.locator('#chatbot-faq details')).toHaveCount(12);
  await expect(page.locator('#chatbot-whatsapp')).toContainText('Product Demo');
  await expect(page.locator('#chatbot-whatsapp')).toContainText(
    'No order is placed or payment collected',
  );
  await expect(page.locator('#chatbot-whatsapp')).toContainText(
    'personal WhatsApp account',
  );
  await expect(page.locator('#chatbot-knowledge')).toContainText(
    'incorrect or incomplete',
  );
  await expect(page).toHaveTitle(`${aiChatbots.title} | ElevateX`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    aiChatbots.description,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://elevatexlab.org${path}`,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  );
  const schema = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((elements) =>
      elements.flatMap((el) => JSON.parse(el.textContent ?? '[]')),
    );
  expect(schema.map((item) => item['@type']).sort()).toEqual(
    ['Organization', 'WebSite', 'WebPage', 'Service', 'BreadcrumbList'].sort(),
  );
  const service = schema.find((item) => item['@type'] === 'Service');
  expect(service.name).toBe('AI Chatbot Development');
  for (const key of [
    'aggregateRating',
    'review',
    'offers',
    'award',
    'areaServed',
  ])
    expect(service[key]).toBeUndefined();
  const og = await request.get(aiChatbots.image.src);
  expect(og.ok()).toBe(true);
  const buffer = await og.body();
  expect(buffer.readUInt32BE(16)).toBe(1200);
  expect(buffer.readUInt32BE(20)).toBe(630);
});

test('actions and contextual links have actual local destinations', async ({
  page,
  request,
}) => {
  await page.goto(path);
  for (const id of ['chatbot-hero', 'chatbot-cta'])
    await expect(
      page.locator(`#${id}`).getByRole('link', { name: 'Discuss a Chatbot' }),
    ).toHaveAttribute('href', '/contact/?service=ai-chatbots');
  await page.getByRole('link', { name: 'See the Conversation' }).click();
  await expect(page).toHaveURL(/#chatbot-conversation$/);
  const hrefs = await page
    .locator('a[href]')
    .evaluateAll((links) => [
      ...new Set(links.map((link) => link.getAttribute('href') ?? '')),
    ]);
  for (const href of hrefs) {
    expect(href).not.toBe('#');
    const url = new URL(href, `http://127.0.0.1:4321${path}`);
    if (url.origin !== 'http://127.0.0.1:4321') continue;
    const response = await request.get(url.pathname);
    expect(response.ok(), href).toBe(true);
    if (url.hash)
      expect(await response.text(), href).toContain(
        `id="${url.hash.slice(1)}"`,
      );
  }
  await expect(
    page.locator('main a[href="/services/ai-automation/"]').first(),
  ).toBeVisible();
  await expect(
    page.locator('main a[href="/services/web-development/"]').first(),
  ).toBeVisible();
  await expect(page.locator('a[href="/services/landing-pages/"]')).toHaveCount(
    1,
  );
});

for (const [width, height] of sizes)
  test(`centered readable layout at ${width} by ${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(r.url());
    });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    expect(
      await page
        .locator('main h1,main h2')
        .evaluateAll((headings) =>
          headings.every((h) => getComputedStyle(h).textAlign === 'center'),
        ),
    ).toBe(true);
    const centers = await page
      .locator('.chat-eyebrow')
      .evaluateAll((elements) =>
        elements.map((el) => {
          const r = el.getBoundingClientRect();
          return Math.abs(r.left + r.width / 2 - innerWidth / 2);
        }),
      );
    expect(Math.max(...centers)).toBeLessThanOrEqual(1);
    await page.locator('#chatbot-faq summary').last().click();
    await expect(page.locator('#chatbot-faq details').last()).toHaveAttribute(
      'open',
      '',
    );
    expect(errors).toEqual([]);
  });

for (const width of [390, 1440]) {
  test(`native transcript selection and FAQ without JavaScript at ${width}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL: baseURL ?? 'http://127.0.0.1:4321',
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(path);
    await expect(page.locator('.conversation__transcript li')).toHaveCount(4);
    for (const message of conversation)
      await expect(page.getByText(message.text, { exact: true })).toBeVisible();
    await expect(page.locator('[data-conversation-state="3"]')).toBeVisible();
    await page.locator('#conversation-stage-0').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('[data-conversation-state="0"]')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#conversation-stage-1')).toBeChecked();
    await expect(page.locator('[data-conversation-state="1"]')).toBeVisible();
    await page.locator('#chatbot-faq summary').last().click();
    await expect(page.locator('#chatbot-faq details').last()).toHaveAttribute(
      'open',
      '',
    );
    await context.close();
  });
  test(`keyboard and axe at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', { name: 'Skip to content' }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

test('desktop entrance is finite and conversation scrolling yields to keyboard control', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(path);
  await page.locator('.chat-preview').scrollIntoViewIfNeeded();
  await expect(page.locator('.chat-preview')).toHaveClass(/is-entered/);
  expect(
    await page
      .locator('.chat-preview')
      .evaluate((el) =>
        el
          .getAnimations({ subtree: true })
          .every((a) => a.effect?.getTiming().iterations === 1),
      ),
  ).toBe(true);
  await expect
    .poll(() =>
      page
        .locator('.chat-preview')
        .evaluate(
          (el) =>
            el
              .getAnimations({ subtree: true })
              .filter((a) => a.playState === 'running').length,
        ),
    )
    .toBe(0);
  await page
    .locator('[data-conversation-message="2"]')
    .evaluate((el) =>
      window.scrollTo(
        0,
        scrollY + el.getBoundingClientRect().top - innerHeight * 0.55 + 10,
      ),
    );
  await expect(page.locator('#conversation-stage-2')).toBeChecked();
  await page.locator('#conversation-stage-0').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect(page.locator('#conversation-stage-1')).toBeChecked();
});

test('mobile and reduced motion have final static state and no external requests', async ({
  page,
}) => {
  const urls: string[] = [];
  page.on('request', (r) => urls.push(r.url()));
  for (const [width, reducedMotion] of [
    [390, 'no-preference'],
    [1440, 'reduce'],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.goto(path);
    await page.locator('[data-conversation]').scrollIntoViewIfNeeded();
    await expect(page.locator('#conversation-stage-3')).toBeChecked();
    expect(
      await page.evaluate(
        () =>
          document.getAnimations().filter((a) => a.playState === 'running')
            .length,
      ),
    ).toBe(0);
  }
  expect(
    urls.filter((url) => !url.startsWith('http://127.0.0.1:4321/')),
  ).toEqual([]);
  expect(
    urls.filter((url) =>
      /gsap|ScrollTrigger|three|react-dom|hero-intro/i.test(url),
    ),
  ).toEqual([]);
});

test('200 percent text retains readable controls and no horizontal overflow', async ({
  page,
}) => {
  for (const width of [320, 390, 820, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `${width}px`,
    ).toBeLessThanOrEqual(width);
    await page.locator('#conversation-stage-0').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('[data-conversation-state="0"]')).toBeVisible();
    await page.locator('#chatbot-faq summary').last().click();
    await expect(page.locator('#chatbot-faq details').last()).toHaveAttribute(
      'open',
      '',
    );
  }
});
