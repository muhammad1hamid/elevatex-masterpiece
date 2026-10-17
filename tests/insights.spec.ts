import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
const insightPreviews = readdirSync('src/content/insights')
  .filter((file) => /\.mdx?$/.test(file))
  .map((file) => {
    const source = readFileSync(`src/content/insights/${file}`, 'utf8');
    const data = parse(source.match(/^---\r?\n([\s\S]*?)\r?\n---/)![1]!) as {
      title: string;
      description: string;
      featured: boolean;
    };
    return { ...data, id: file.replace(/\.mdx?$/, '') };
  })
  .sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) || a.id.localeCompare(b.id),
  );

test('homepage insights follows the founder and uses the published collection', async ({
  page,
  request,
}) => {
  const response = await request.get('/');
  const html = await response.text();
  for (const insight of insightPreviews) {
    expect(html).toContain(insight.title);
    expect(html).toContain(insight.description);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('main > section')).toHaveCount(10);
  await expect(page.locator('main > section').nth(6)).toHaveAttribute(
    'id',
    'founder',
  );
  const section = page.locator('#insights');
  await expect(page.locator('main > section').nth(7)).toHaveAttribute(
    'id',
    'insights',
  );
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    'Ideas worth building on.',
  );
  await expect(section.getByRole('heading', { level: 3 })).toHaveText(
    insightPreviews.map(({ title }) => title),
  );
  await expect(section.getByText('Article in development')).toHaveCount(0);
  await expect(section.getByRole('link', { name: /Read Insight/ })).toHaveCount(
    3,
  );
  await expect(
    section.getByRole('link', { name: 'View All Insights' }),
  ).toHaveAttribute('href', '/insights/');
  await expect(
    section.getByText(/3\.4x|200\+|98%|124 hrs|\+37%|Nov 28, 2025/i),
  ).toHaveCount(0);
  const result = await new AxeBuilder({ page })
    .include('#insights')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  test(`insights layout stays readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto('/');
    const section = page.locator('#insights');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(section.getByRole('heading', { level: 3 })).toHaveCount(3);
    await expect(section.locator('.insight-card__media img')).toHaveCount(3);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    for (const image of await section
      .locator('.insight-card__media img')
      .all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((element) => (element as HTMLImageElement).decode());
      const metrics = await image.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const frame = element
          .closest('.insight-card__media')!
          .getBoundingClientRect();
        return {
          width: box.width,
          height: box.height,
          frameWidth: frame.width,
          frameHeight: frame.height,
          naturalWidth: (element as HTMLImageElement).naturalWidth,
        };
      });
      expect(metrics.width).toBeGreaterThan(0);
      expect(metrics.height).toBeGreaterThan(0);
      expect(metrics.naturalWidth).toBeGreaterThan(0);
      expect(Math.abs(metrics.width - metrics.frameWidth)).toBeLessThan(1);
      expect(Math.abs(metrics.height - metrics.frameHeight)).toBeLessThan(1);
    }
    expect(errors).toEqual([]);
  });
}

test('insights and archive remain useful without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator('#insights h2')).toBeVisible();
  await expect(page.locator('#insights h3')).toHaveCount(3);
  await page.getByRole('link', { name: 'View All Insights' }).click();
  await expect(page).toHaveURL(/\/insights\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Ideas worth building on.',
  );
  await expect(page.locator('[data-journal-story]')).toHaveCount(3);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await context.close();
});
