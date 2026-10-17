import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { founder } from '../src/data/founder';

test('founder section follows Process with visible verified copy and existing routes', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain(founder.introduction);
  expect(html).toContain(founder.statement);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const section = page.locator('#founder');
  await expect(page.locator('main > section')).toHaveCount(10);
  await expect(page.locator('main > section').nth(5)).toHaveAttribute(
    'id',
    'process',
  );
  await expect(page.locator('main > section').nth(6)).toHaveAttribute(
    'id',
    'founder',
  );
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(
    founder.heading.join(' '),
  );
  await expect(section.getByRole('heading', { level: 3 })).toHaveText(
    founder.name,
  );
  await expect(section.locator('.founder__identity p')).toHaveText(
    founder.role,
  );
  await expect(section.locator('.founder__capabilities li')).toHaveText(
    founder.capabilities,
  );
  await expect(section.getByRole('img')).toHaveAttribute(
    'alt',
    founder.image.alt,
  );
  await expect(section.getByRole('img')).toHaveAttribute('width', '840');
  await expect(section.getByRole('img')).toHaveAttribute('height', '980');
  await expect(
    section.getByRole('link', { name: 'View Our Work' }),
  ).toHaveAttribute('href', '/work/');
  await expect(
    section.getByRole('link', { name: 'Let’s Talk' }),
  ).toHaveAttribute('href', '/contact/');
  const result = await new AxeBuilder({ page })
    .include('#founder')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

for (const width of [320, 375, 390, 430, 768, 1024, 1067, 1280, 1440, 1920]) {
  test(`founder layout stays readable and within the viewport at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto('/');
    const section = page.locator('#founder');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(section.getByRole('img')).toBeVisible();
    await expect(section.locator('.founder__details')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const image = await section.getByRole('img').evaluate((element) => {
      const { width: renderedWidth, height: renderedHeight } =
        element.getBoundingClientRect();
      return {
        renderedWidth,
        renderedHeight,
        naturalWidth: (element as HTMLImageElement).naturalWidth,
      };
    });
    expect(image.renderedWidth).toBeGreaterThan(0);
    expect(image.renderedHeight).toBeGreaterThan(0);
    expect(image.naturalWidth).toBeGreaterThan(0);
    for (const link of await section.getByRole('link').all())
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(errors).toEqual([]);
  });
}

test('founder portrait remains inside its grid track around the desktop breakpoint', async ({
  page,
}) => {
  for (const width of [1024, 1040, 1067, 1100, 1150]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const layout = await page.locator('.founder__grid').evaluate((grid) => {
      const portrait = grid
        .querySelector('.founder__portrait')!
        .getBoundingClientRect();
      const intro = grid
        .querySelector('.founder__intro')!
        .getBoundingClientRect();
      const details = grid
        .querySelector('.founder__details')!
        .getBoundingClientRect();
      return {
        portraitRight: portrait.right,
        introLeft: intro.left,
        detailsLeft: details.left,
      };
    });
    expect(layout.portraitRight).toBeLessThanOrEqual(layout.introLeft);
    expect(layout.portraitRight).toBeLessThanOrEqual(layout.detailsLeft);
  }
});

test('founder copy and routes remain usable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  const section = page.locator('#founder');
  await expect(section.getByRole('heading', { level: 2 })).toBeVisible();
  await expect(section.getByRole('img')).toBeVisible();
  await expect(
    section.getByRole('link', { name: 'View Our Work' }),
  ).toHaveAttribute('href', '/work/');
  await expect(
    section.getByRole('link', { name: 'Let’s Talk' }),
  ).toHaveAttribute('href', '/contact/');
  await context.close();
});

test('founder section reveal respects reduced motion and keeps copy visible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const section = page.locator('#founder');
  await section.scrollIntoViewIfNeeded();
  for (const element of await section.locator('[data-founder-reveal]').all()) {
    await expect(element).toHaveCSS('opacity', '1');
    expect(await element.evaluate((node) => node.getAnimations().length)).toBe(
      0,
    );
  }
});
