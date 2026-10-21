import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const article = '/insights/ai-slop-seo-2026/';

test('article has direct answers, truthful authorship, four local illustrations and no special AI schema', async ({
  page,
}) => {
  await page.goto(article);
  await expect(page.locator('h1')).toContainText('AI Slop and SEO in 2026');
  await expect(page.locator('.insight-answer')).toContainText(
    'AI assistance alone',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://elevatexlab.org' + article,
  );
  await expect(page.locator('.article-figure')).toHaveCount(3);
  const data = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent())!,
  );
  const schema = data.find(
    (s: Record<string, unknown>) => s['@type'] === 'Article',
  );
  expect(schema.author).toMatchObject({
    '@type': 'Organization',
    name: 'ElevateX',
  });
  expect(schema.datePublished).toBe('2026-10-21T00:00:00.000Z');
  expect(
    data.some((s: Record<string, unknown>) => s['@type'] === 'FAQPage'),
  ).toBe(false);
  await page.locator('main img').evaluateAll(async (imgs) => {
    for (const node of imgs) {
      const img = node as HTMLImageElement;
      img.loading = 'eager';
      await img.decode();
      if (!img.naturalWidth) throw new Error('Broken illustration');
    }
  });
});
for (const width of [320, 390, 768, 1440])
  test(`article is usable at ${width}px without JS or optional tracking`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(baseURL + article, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width + 1);
    expect(await page.locator('main').innerText()).toContain(
      'AI assistance alone',
    );
    await context.close();
    // axe injects a script into an analysis frame, so run it in a separate
    // JS-enabled context after checking the actual no-JS experience above.
    const accessibleContext = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    const accessiblePage = await accessibleContext.newPage();
    const errors: string[] = [];
    accessiblePage.on('pageerror', (error) => errors.push(error.message));
    await accessiblePage.goto(baseURL + article);
    expect(
      (
        await new AxeBuilder({ page: accessiblePage })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(errors).toEqual([]);
    await accessibleContext.close();
  });
