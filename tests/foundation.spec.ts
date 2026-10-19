import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { homepageMetadata, site } from '../src/data/site';

test('primary content and metadata are delivered in static HTML', async ({
  request,
}) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('Premium Digital Systems');
  expect(html).toContain('AI Automation');
  expect(html).toContain(`href="${site.origin}/"`);
  expect(html).toContain('noindex, follow');
  expect(html).not.toMatch(
    /<astro-island\b|<canvas\b|spline-viewer|react-dom|three\.js/i,
  );
});

test('preview crawling and hosting headers remain non-indexable', async ({
  request,
}) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('# Deployment: preview');
  expect(robots).toContain('User-agent: GPTBot\nDisallow: /');
  expect(robots).not.toContain('Sitemap:');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<urlset');
  expect(sitemap).not.toContain('<loc>');
  expect(await readFile('dist/_headers', 'utf8')).toContain(
    'X-Robots-Tag: noindex, follow',
  );
});

test('metadata, JSON-LD and heading hierarchy are valid', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('title')).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveCount(1);
  await expect(page).toHaveTitle(homepageMetadata.title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    homepageMetadata.description,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `${site.origin}/`,
  );
  for (const property of ['og:title', 'twitter:title']) {
    await expect(
      page.locator(`meta[property="${property}"], meta[name="${property}"]`),
    ).toHaveAttribute('content', homepageMetadata.title);
  }
  for (const property of ['og:image', 'twitter:image']) {
    await expect(
      page.locator(`meta[property="${property}"], meta[name="${property}"]`),
    ).toHaveAttribute(
      'content',
      new URL(homepageMetadata.image.src, site.origin).href,
    );
  }
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  const socialImage = await request.get(homepageMetadata.image.src);
  expect(socialImage.status()).toBe(200);
  expect(socialImage.headers()['content-type']).toContain('image/png');
  const imageBytes = await socialImage.body();
  expect(imageBytes.readUInt32BE(16)).toBe(homepageMetadata.image.width);
  expect(imageBytes.readUInt32BE(20)).toBe(homepageMetadata.image.height);
  const schema = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ??
      'null',
  ) as { '@type': string }[];
  expect(schema.map((item) => item['@type'])).toEqual([
    'Organization',
    'WebSite',
    'WebPage',
  ]);
  expect(schema.find((item) => item['@type'] === 'WebPage')).toMatchObject({
    name: homepageMetadata.title,
    description: homepageMetadata.description,
    url: `${site.origin}/`,
  });
});

test('keyboard skip link moves focus to content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('page works with JavaScript disabled and reduced motion', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  if (!baseURL) throw new Error('A local preview base URL is required.');
  await page.goto(baseURL);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'See Our Work', exact: true }),
  ).toHaveAttribute('href', '/work/');
  await context.close();
});

test('no console errors, missing resources, or broken internal links', async ({
  page,
  request,
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
  await page.goto('/');
  for (const href of await page
    .locator('a[href^="/"]')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute('href') ?? '/'),
    )) {
    const [path, fragment] = href.split('#');
    const linkedPage = await request.get(path || '/', { maxRedirects: 0 });
    expect(linkedPage.status()).toBeGreaterThanOrEqual(200);
    expect(linkedPage.status()).toBeLessThan(400);
    if (fragment)
      await expect(page.locator(`[id="${fragment}"]`)).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

for (const width of [
  320, 375, 390, 393, 430, 768, 1024, 1280, 1440, 1920, 2560,
]) {
  test(`layout remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (width === 390 || width === 1440) {
      await page.screenshot({
        path: `test-results/${test.info().project.name}-foundation-${width}.png`,
        fullPage: true,
      });
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  });
}

test('404 has useful navigation and is noindex', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Page not found.',
  );
  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute(
    'href',
    '/',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
});

for (const width of [390, 1440]) {
  test(`Services navigation uses the real section and native focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/services/web-development/');
    const navigation = page.getByRole('navigation', {
      name: width < 1024 ? 'Mobile' : 'Primary',
      exact: true,
    });
    if (width < 1024) await page.locator('[data-menu-toggle]').click();
    const services = navigation.getByRole('link', {
      name: 'Services',
      exact: true,
    });
    await expect(services).toHaveAttribute('href', '/#services');
    await expect(services).toHaveAttribute('aria-current', 'page');
    await services.click();
    await expect(page).toHaveURL(/\/#services$/);
    await expect(page.locator('#services')).toBeInViewport();
    await expect(page.locator('#services')).toBeFocused();
    await expect(page.locator('[data-mobile-menu]')).not.toHaveAttribute(
      'open',
    );
    if (width < 1024) {
      await page.locator('[data-menu-toggle]').click();
      await page
        .getByRole('navigation', { name: 'Mobile', exact: true })
        .getByRole('link', { name: 'Home', exact: true })
        .click();
      await page.locator('[data-menu-toggle]').click();
      await page
        .getByRole('navigation', { name: 'Mobile', exact: true })
        .getByRole('link', { name: 'Services', exact: true })
        .click();
      await expect(page.locator('[data-mobile-menu]')).not.toHaveAttribute(
        'open',
      );
      await expect(page.locator('#services')).toBeFocused();
    }
  });
}

test('Services compatibility remains noindex and leaves implemented pages on this host', async ({
  page,
  request,
}) => {
  const response = await request.get('/services/');
  const html = await response.text();
  expect(response.status()).toBe(200);
  expect(html).toContain('content="noindex, follow"');
  expect(html).toContain('content="0;url=/#services"');
  await page.goto('/services/');
  await expect(page).toHaveURL(/\/#services$/);
  for (const path of [
    '/work/',
    '/about/',
    '/contact/',
    '/services/web-development/',
    '/services/ai-automation/',
    '/services/ai-chatbots/',
    '/services/landing-pages/',
  ]) {
    const route = await request.get(path, { maxRedirects: 0 });
    expect(route.status()).toBe(200);
    expect(await route.text()).not.toContain('http-equiv="refresh"');
  }
});
