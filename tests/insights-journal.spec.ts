import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const articles = [
  {
    slug: 'what-makes-a-website-convert-in-2026',
    title: 'What Makes a Website Convert in 2026?',
    category: 'Web Development',
  },
  {
    slug: 'where-ai-automation-saves-businesses-time',
    title: 'Where AI Automation Actually Saves Businesses Time',
    category: 'AI Automation',
  },
  {
    slug: 'ai-chatbots-vs-traditional-customer-support',
    title: 'AI Chatbots vs Traditional Customer Support: Where Each Fits',
    category: 'AI Chatbots',
  },
] as const;
const routes = [
  '/insights/',
  ...articles.map(({ slug }) => `/insights/${slug}/`),
];
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

async function decodeImages(page: Page) {
  await page.locator('[data-journal-page] img').evaluateAll(async (images) => {
    await Promise.all(
      images.map(async (node) => {
        const image = node as HTMLImageElement;
        image.loading = 'eager';
        await image.decode();
        if (image.naturalWidth === 0)
          throw new Error(`Image missing: ${image.src}`);
      }),
    );
  });
}

async function assertPageBounds(page: Page, width: number) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width + 1);
  const escaped = await page.locator('[data-journal-page]').evaluate((root) =>
    [
      ...root.querySelectorAll(
        'h1,h2,h3,.insight-prose > p,.insight-answer,.insight-toc,.article-diagram,.editorial-preview',
      ),
    ]
      .filter((element) => element.getClientRects().length > 0)
      .map((element) => ({
        tag: element.tagName,
        text: element.textContent?.trim().slice(0, 70),
        left: element.getBoundingClientRect().left,
        right: element.getBoundingClientRect().right,
      }))
      .filter((box) => box.left < -1 || box.right > innerWidth + 1),
  );
  expect(escaped).toEqual([]);
}

test('Insights and every article ship crawlable content, unique metadata and truthful organization attribution', async ({
  page,
  request,
}) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const path of routes) {
    const response = await request.get(path);
    const html = await response.text();
    expect(response.status(), path).toBe(200);
    expect(html).not.toMatch(/<astro-island|<iframe|<canvas|<video/);
    expect(html).toContain('<h1');
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://elevatexlab.org${path}`,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, follow',
    );
    titles.add(await page.title());
    descriptions.add(
      (await page.locator('meta[name="description"]').getAttribute('content'))!,
    );
    const schema = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) =>
        scripts.flatMap((script) => {
          const value = JSON.parse(script.textContent ?? 'null');
          return Array.isArray(value) ? value : (value['@graph'] ?? [value]);
        }),
      );
    expect(
      schema.some(
        (item) => item['@type'] === 'Organization' && item.name === 'ElevateX',
      ),
    ).toBe(true);
    expect(schema.some((item) => item['@type'] === 'BreadcrumbList')).toBe(
      true,
    );
    if (path === '/insights/') {
      expect(schema.some((item) => item['@type'] === 'CollectionPage')).toBe(
        true,
      );
      expect(
        schema.find((item) => item['@type'] === 'ItemList')?.numberOfItems,
      ).toBe(4);
      await expect(page.locator('[data-journal-story]')).toHaveCount(4);
    } else {
      const article = articles.find(({ slug }) => path.includes(slug))!;
      const articleSchema = schema.find((item) => item['@type'] === 'Article');
      expect(articleSchema?.headline).toBe(article.title);
      expect(articleSchema?.author).toMatchObject({
        '@type': 'Organization',
        name: 'ElevateX',
      });
      expect(articleSchema?.author['@id']).toBe(
        'https://elevatexlab.org/#organization',
      );
      expect(articleSchema?.url).toBe(`https://elevatexlab.org${path}`);
      await expect(page.locator('h1')).toHaveText(article.title);
      await expect(page.locator('.insight-meta')).toContainText('By ElevateX');
      await expect(page.locator('.insight-cover figcaption')).toContainText(
        'Editorial illustration',
      );
      await expect(page.locator('.insight-answer')).toBeVisible();
      await expect(page.locator('.insight-takeaways li')).toHaveCount(4);
      expect(
        await page.locator('.insight-prose h2').count(),
      ).toBeGreaterThanOrEqual(5);
      expect(
        await page.locator('.insight-sources a').count(),
      ).toBeGreaterThanOrEqual(3);
      for (const source of await page.locator('.insight-sources a').all())
        expect(await source.getAttribute('href')).toMatch(/^https:\/\//);
      await expect(page.locator('.article-diagram')).toHaveCount(1);
      await expect(page.locator('.article-diagram figcaption')).toContainText(
        /Illustrative/,
      );
      await expect(
        page.locator('.article-diagram button,.article-diagram input'),
      ).toHaveCount(0);
      expect(articleSchema?.datePublished).toBe(
        await page
          .locator('meta[property="article:published_time"]')
          .getAttribute('content'),
      );
      expect(html).toMatch(/Sources (?:&amp;|&) references/);
      expect(html).toContain('The short answer');
    }
    for (const image of await page.locator('[data-journal-page] img').all()) {
      expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
      expect(await image.getAttribute('alt')).toBeTruthy();
    }
  }
  expect(titles.size).toBe(4);
  expect(descriptions.size).toBe(4);
});

test('topic controls are keyboard accessible, show only represented categories and never strand the featured anchor', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/insights/');
  const filters = page.locator('[data-journal-filters]');
  await expect(filters).toBeVisible();
  await expect(filters.getByRole('button')).toHaveCount(5);
  const all = filters.locator('[data-journal-filter="all"]');
  await expect(all).toHaveAttribute('aria-pressed', 'true');
  for (const { category } of articles) {
    const filter = filters.locator(`[data-journal-filter="${category}"]`);
    await filter.focus();
    await page.keyboard.press('Enter');
    await expect(filter).toBeFocused();
    await expect(filter).toHaveAttribute('aria-pressed', 'true');
    await expect(filters.locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('[data-journal-story]:visible')).toHaveCount(1);
    await expect(page.locator('[data-journal-story]:visible')).toHaveAttribute(
      'data-category',
      category,
    );
    await expect(page.locator('[data-journal-count]')).toHaveText(
      `1 article in ${category}.`,
    );
    expect(
      await filter.evaluate(
        (element) => getComputedStyle(element).outlineStyle,
      ),
    ).not.toBe('none');
  }
  await page
    .getByRole('link', { name: 'Explore Insights', exact: true })
    .click();
  await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-journal-story]:visible')).toHaveCount(4);
  await expect(page.locator('#featured-insight')).toBeInViewport();
});

test('all articles, sources and contents links remain usable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:4321/insights/');
    await expect(page.locator('[data-journal-filters]')).toBeHidden();
    await expect(page.locator('[data-journal-story]')).toHaveCount(4);
    for (const { slug } of articles) {
      const path = `/insights/${slug}/`;
      await expect(
        page.locator(`[data-journal-story] h3 a[href="${path}"]`),
      ).toHaveCount(1);
    }
    for (const { slug, title } of articles) {
      await page.goto(`http://127.0.0.1:4321/insights/${slug}/`);
      await expect(page.locator('h1')).toHaveText(title);
      await expect(page.locator('.insight-prose')).toBeVisible();
      await decodeImages(page);
      await expect(page.locator('[data-reading-progress]')).toBeHidden();
      const link = page.locator('.insight-toc a').first();
      const hash = await link.getAttribute('href');
      expect(hash).toMatch(/^#/);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${hash}$`));
      await expect(page.locator(hash!)).toBeInViewport();
      await expect(page.locator('.insight-sources a').first()).toHaveAttribute(
        'href',
        /^https:\/\//,
      );
      await expect(
        page.locator('.insight-service-cta a[href^="/services/"]'),
      ).toHaveCount(1);
    }
  } finally {
    await context.close();
  }
});

test('article contents target real headings and related stories exclude the current article', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const { slug } of articles) {
    const path = `/insights/${slug}/`;
    await page.goto(path);
    const links = page.locator('.insight-toc a');
    expect(await links.count()).toBeGreaterThanOrEqual(5);
    for (const link of await links.all()) {
      const hash = await link.getAttribute('href');
      await expect(page.locator(hash!)).toHaveCount(1);
      expect(
        await page.locator(hash!).evaluate((element) => element.tagName),
      ).toBe('H2');
    }
    const link = links.nth(1);
    const hash = await link.getAttribute('href');
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${hash}$`));
    await expect(page.locator(hash!)).toBeInViewport();
    await expect(
      page.locator('.insight-toc a[aria-current="location"]'),
    ).toHaveCount(1);
    await expect(
      page.locator(`.insight-related a[href="${path}"]`),
    ).toHaveCount(0);
    await expect(
      page.locator('.insight-related [data-journal-story]'),
    ).toHaveCount(2);
    for (const destination of await page
      .locator('.insight-service-cta a')
      .all()) {
      const href = await destination.getAttribute('href');
      expect((await request.get(href!)).status()).toBe(200);
    }
  }
});

test('reading progress follows the article body, reaches completion before the footer and disables under reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(routes[3]!);
  const progress = page.locator('[data-reading-progress]');
  const amount = () =>
    progress
      .locator('span')
      .evaluate(
        (element) =>
          new DOMMatrixReadOnly(getComputedStyle(element).transform).a,
      );
  await expect(progress).toBeVisible();
  await expect.poll(amount).toBeLessThan(0.01);
  await page
    .locator('[data-reading-region]')
    .evaluate((region) =>
      window.scrollTo(
        0,
        scrollY +
          region.getBoundingClientRect().top +
          region.getBoundingClientRect().height / 2,
      ),
    );
  await expect.poll(amount).toBeGreaterThan(0.3);
  expect(await amount()).toBeLessThan(0.8);
  await page.locator('.insight-related').scrollIntoViewIfNeeded();
  await expect.poll(amount).toBeGreaterThanOrEqual(0.99);
  await page.locator('footer').scrollIntoViewIfNeeded();
  expect(await amount()).toBeGreaterThanOrEqual(0.99);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(progress).toBeHidden();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === 'running').length,
      ),
    )
    .toBe(0);
});

test('the support comparison has meaningful headers and keyboard scrolls inside its named region', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(routes[3]!);
  const region = page.getByRole('region', {
    name: 'Comparison table, scroll horizontally if needed',
  });
  await expect(region).toHaveAttribute('tabindex', '0');
  await expect(page.locator('.article-table')).toHaveCount(1);
  await expect(region.locator('caption')).toContainText(
    'Where each support approach can fit',
  );
  await expect(region.locator('thead th[scope="col"]')).toHaveCount(3);
  expect(
    await region.locator('tbody th[scope="row"]').count(),
  ).toBeGreaterThanOrEqual(4);
  expect(
    await region.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    ),
  ).toBe(true);
  await region.focus();
  expect(
    await region.evaluate((element) => getComputedStyle(element).outlineStyle),
  ).not.toBe('none');
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(() => region.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await assertPageBounds(page, 390);
});

for (const [width, height] of sizes)
  test(`the journal and all three articles fit ${width}x${height} with decoded images and no resource errors`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    for (const path of routes) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await decodeImages(page);
      await expect(page.locator('h1')).toBeVisible();
      await assertPageBounds(page, width);
      if (path === '/insights/') {
        for (const filter of await page.locator('[data-journal-filter]').all())
          expect((await filter.boundingBox())!.height).toBeGreaterThanOrEqual(
            44,
          );
      } else {
        const paragraph = page.locator('.insight-prose > p').first();
        const style = await paragraph.evaluate((element) => ({
          fontSize: parseFloat(getComputedStyle(element).fontSize),
          align: getComputedStyle(element).textAlign,
        }));
        expect(style.fontSize).toBeGreaterThanOrEqual(16);
        expect(['start', 'left']).toContain(style.align);
      }
    }
    expect(errors).toEqual([]);
  });

for (const width of [390, 1440])
  test(`the journal and articles have no axe AA violations at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const path of routes) {
      await page.goto(path);
      await decodeImages(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations, path).toEqual([]);
    }
  });

test('200 percent text preserves journal controls, article reading and contents navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of routes) {
    await page.goto(path);
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await assertPageBounds(page, 1280);
    await expect(page.locator('h1')).toBeVisible();
    if (path === '/insights/') {
      await page.locator('[data-journal-filter="AI Automation"]').click();
      await expect(page.locator('[data-journal-story]:visible')).toHaveCount(1);
      await assertPageBounds(page, 1280);
    } else {
      const summary = page.locator('.insight-toc summary');
      await summary.click();
      await expect(page.locator('.insight-toc nav')).toBeHidden();
      await summary.click();
      await expect(page.locator('.insight-toc nav')).toBeVisible();
      await expect(page.locator('.insight-prose')).toBeVisible();
      await assertPageBounds(page, 1280);
    }
  }
});
