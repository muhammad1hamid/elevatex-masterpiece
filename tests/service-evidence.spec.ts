import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { inquirySteps } from '../src/data/services/ai-automation';
import {
  conversation,
  conversationSource,
} from '../src/data/services/ai-chatbots';

test('the inquiry groups keep review before any permitted write and derive their totals', async ({
  page,
}) => {
  await page.goto('/services/ai-automation/');
  const radios = page.locator('.inquiry-step__radio');
  expect(inquirySteps.map((step) => step.id)).toEqual([
    'received',
    'intent',
    'approval',
    'record',
    'followup',
  ]);
  await expect(radios).toHaveCount(inquirySteps.length);
  for (const [index, step] of inquirySteps.entries()) {
    await radios.nth(index).focus();
    await page.keyboard.press('Space');
    const detail = page.locator(`[data-inquiry-detail="${step.id}"]`);
    await expect(detail).toBeVisible();
    await expect(detail.locator('.inquiry-detail__index span')).toHaveText(
      `/ ${String(inquirySteps.length).padStart(2, '0')}`,
    );
    for (const text of step.details) await expect(detail).toContainText(text);
  }
  await expect(page.locator('#automation-control')).toContainText(
    'Missing data → Review',
  );
  await expect(page.locator('#automation-reliability')).toContainText(
    'Do not announce success or start follow-ups',
  );
  await expect(page.locator('.inquiry-system')).toContainText(
    'No live actions',
  );
});

test('the chatbot cites a visible service answer and keeps draft and escalation boundaries', async ({
  page,
  request,
}) => {
  await page.goto('/services/ai-chatbots/');
  const source = page.locator('#chatbot-knowledge');
  await expect(source.locator('blockquote')).toHaveText(
    conversationSource.text,
  );
  await expect(source.locator('a')).toHaveAttribute(
    'href',
    conversationSource.href,
  );
  const html = await (await request.get('/services/web-development/')).text();
  expect(html).toContain(conversationSource.text);
  for (let index = 0; index < conversation.length; index++) {
    await page.locator(`#conversation-stage-${index}`).focus();
    await page.keyboard.press('Space');
    await expect(
      page.locator(`[data-conversation-state="${index}"]`),
    ).toBeVisible();
  }
  await expect(page.locator('#chatbot-action')).toContainText(
    'Nothing is saved or sent',
  );
  await expect(page.locator('#chatbot-handoff')).toContainText(
    'unknown answers and unsupported actions',
  );
  await expect(page.locator('#chatbot-integrations')).toContainText(
    'access to one does not imply access to the others',
  );
});

test('workflow labels and summaries stay separate with enlarged text', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/services/ai-automation/');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    for (const row of await page.locator('.inquiry-step').all()) {
      const edges = await row.evaluate((el) => ({
        heading: el.querySelector('h3')!.getBoundingClientRect().bottom,
        descriptionTop: el.querySelector(':scope > p')!.getBoundingClientRect()
          .top,
        descriptionBottom: el
          .querySelector(':scope > p')!
          .getBoundingClientRect().bottom,
        tag: el
          .querySelector(':scope > .automation-tag')!
          .getBoundingClientRect().top,
      }));
      expect(edges.descriptionTop).toBeGreaterThanOrEqual(edges.heading - 1);
      expect(edges.tag).toBeGreaterThanOrEqual(edges.descriptionBottom - 1);
    }
  }
});

for (const width of [320, 390, 430, 768, 1440]) {
  test(`real captures, readable annotations and meaningful anchors at ${width}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL: baseURL ?? 'http://127.0.0.1:4321',
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    try {
      for (const [slug, count, mobilePath] of [
        ['web-development', 3, '/qadeer/mobile-390.avif'],
        ['landing-pages', 4, '/infinity/mobile-390.avif'],
      ] as const) {
        const page = await context.newPage();
        await page.goto(`/services/${slug}/`);
        const evidence = page.locator('[data-service-evidence]');
        await evidence.scrollIntoViewIfNeeded();
        await expect(
          evidence.locator('.service-evidence__notes li'),
        ).toHaveCount(count);
        for (const note of await evidence
          .locator('.service-evidence__notes li')
          .all())
          await expect(note).toBeVisible();
        const img = evidence.locator('img').first();
        await expect
          .poll(() =>
            img.evaluate(
              (el) =>
                el instanceof HTMLImageElement &&
                el.complete &&
                el.naturalWidth > 0,
            ),
          )
          .toBe(true);
        const current = await img.evaluate(
          (el) => (el as HTMLImageElement).currentSrc,
        );
        expect(current).toContain(width < 768 ? mobilePath : '/desktop-');
        expect(await img.getAttribute('width')).toBeTruthy();
        expect(await img.getAttribute('height')).toBeTruthy();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
        if (slug === 'landing-pages') {
          await expect(page.locator('#landing-message')).toContainText(
            'Proposed campaign brief',
          );
          await expect(page.locator('#landing-journey')).toContainText(
            'understand the offer',
          );
          await expect(page.locator('#landing-anatomy')).toContainText(
            'not built or measured',
          );
          await expect(page.getByRole('table')).toHaveAccessibleName(
            'Examples of offer, traffic and action alignment',
          );
        } else
          await expect(page.locator('#web-technical')).toContainText(
            'No client results or underlying project stack are inferred',
          );
        await page.close();
      }
    } finally {
      await context.close();
    }
  });
}

test('enlarged static evidence and focused fit table pass scoped accessibility checks', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const slug of ['web-development', 'landing-pages']) {
    await page.goto(`/services/${slug}/`);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
    for (const note of await page.locator('.service-evidence__notes li').all())
      await expect(note).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .include('[data-service-evidence]')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});
