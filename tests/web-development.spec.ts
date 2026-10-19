import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { homepageMetadata, site } from '../src/data/site';
import {
  webDevelopment,
  webDevelopmentFAQs,
  websiteTypes,
} from '../src/data/services/web-development';
import { pageTitle } from '../src/utils/seo';

const servicePath = '/services/web-development/';
const canonical = `${site.origin}${servicePath}`;
const sections = [
  'web-hero',
  'web-quality',
  'web-problems',
  'web-types',
  'web-work',
  'web-build-process',
  'web-technical',
  'web-redesign',
  'web-deliverables',
  'web-technology',
  'web-faq',
  'web-cta',
] as const;
const viewports = [
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
  [2560, 1440],
] as const;

function observeErrors(page: Page): string[] {
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
      errors.push(`${request.failure()?.errorText} ${request.url()}`);
  });
  return errors;
}

test('the complete service, heading hierarchy, and answers are delivered as HTML', async ({
  page,
  request,
}) => {
  const response = await request.get(servicePath);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).not.toMatch(
    /<astro-island\b|<canvas\b|<video\b|spline-viewer|react-dom|three\.js/i,
  );
  expect(html).toContain('data-web-development');
  for (const question of webDevelopmentFAQs)
    expect(html).toContain(question.question);
  for (const stage of [
    'Understand',
    'Structure',
    'Design',
    'Build',
    'Test &amp; Launch',
  ])
    expect(html).toContain(stage);

  await page.goto(servicePath);
  const article = page.locator('[data-web-development]');
  await expect(article).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(article.getByRole('heading', { level: 1 })).toHaveText(
    webDevelopment.heading,
  );
  expect(
    await article
      .locator(':scope > section')
      .evaluateAll((elements) => elements.map((element) => element.id)),
  ).toEqual(sections);
  const levels = await article
    .locator('h1,h2,h3,h4,h5,h6')
    .evaluateAll((headings) =>
      headings.map((heading) => Number(heading.tagName.slice(1))),
    );
  for (let index = 1; index < levels.length; index += 1)
    expect(levels[index]! - levels[index - 1]!).toBeLessThanOrEqual(1);
  const sectionHeadings = [
    ['web-problems-heading', 'A website can look good and still fail its job.'],
    ['web-types-heading', 'Different businesses. Different websites.'],
    ['web-work-heading', 'A closer look at the craft.'],
    ['web-technical-heading', 'Good design is only part of a good website.'],
    ['web-redesign-heading', 'Keep what works. Improve what doesn’t.'],
    [
      'web-deliverables-heading',
      'A complete experience, with a defined scope.',
    ],
    ['web-technology-heading', 'Technology should support the project.'],
    [
      'web-cta-heading',
      'Your website should do more than simply exist. Let’s build one with purpose.',
    ],
  ] as const;
  for (const [id, text] of sectionHeadings)
    await expect(page.locator(`#${id}`)).toHaveText(text);
  await expect(article.locator('form')).toHaveCount(0);
  await expect(page.locator('[data-hero-intro]')).toHaveCount(0);
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  for (const item of websiteTypes)
    await expect(
      page.locator('#web-types').getByText(item.title, { exact: true }),
    ).toBeVisible();
  for (const [index, item] of webDevelopmentFAQs.entries()) {
    await expect(
      page
        .locator('#web-faq details')
        .nth(index)
        .locator('summary > span')
        .nth(1),
    ).toHaveText(item.question);
    await expect(page.locator('#web-faq details').nth(index)).toContainText(
      item.answer,
    );
  }
});

test('service metadata is unique, canonical, and safely gated for preview', async ({
  page,
}) => {
  await page.goto(servicePath);
  await expect(page).toHaveTitle(pageTitle(webDevelopment.title));
  expect(pageTitle(webDevelopment.title)).not.toBe(homepageMetadata.title);
  expect(webDevelopment.description).not.toBe(homepageMetadata.description);
  expect(webDevelopment.description.length).toBeGreaterThanOrEqual(120);
  expect(webDevelopment.description.length).toBeLessThanOrEqual(180);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    canonical,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  for (const [attribute, name, value] of [
    ['name', 'description', webDevelopment.description],
    ['property', 'og:type', 'website'],
    ['property', 'og:title', pageTitle(webDevelopment.title)],
    ['property', 'og:description', webDevelopment.description],
    ['property', 'og:url', canonical],
    ['property', 'og:image', `${site.origin}${webDevelopment.image.src}`],
    ['property', 'og:image:alt', webDevelopment.image.alt],
    ['property', 'og:image:width', '1200'],
    ['property', 'og:image:height', '630'],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', pageTitle(webDevelopment.title)],
    ['name', 'twitter:description', webDevelopment.description],
    ['name', 'twitter:image', `${site.origin}${webDevelopment.image.src}`],
  ] as const)
    await expect(page.locator(`meta[${attribute}="${name}"]`)).toHaveAttribute(
      'content',
      value,
    );
});

test('the schema connects one verified service to the central brand and valid breadcrumbs', async ({
  page,
}) => {
  await page.goto(servicePath);
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.flatMap((script) => {
        const parsed = JSON.parse(script.textContent ?? '') as
          Record<string, unknown> | Record<string, unknown>[];
        return Array.isArray(parsed) ? parsed : [parsed];
      }),
    );
  const byType = (type: string) =>
    schemas.filter((schema) => schema['@type'] === type);
  for (const type of [
    'Organization',
    'WebSite',
    'WebPage',
    'Service',
    'BreadcrumbList',
  ])
    expect(byType(type), type).toHaveLength(1);
  expect(byType('Organization')[0]).toMatchObject({
    '@id': `${site.origin}/#organization`,
    name: site.name,
  });
  expect(byType('WebSite')[0]).toMatchObject({
    '@id': `${site.origin}/#website`,
    publisher: { '@id': `${site.origin}/#organization` },
  });
  expect(byType('WebPage')[0]).toMatchObject({
    '@id': `${canonical}#webpage`,
    url: canonical,
    description: webDevelopment.description,
    isPartOf: { '@id': `${site.origin}/#website` },
  });
  const service = byType('Service')[0];
  expect(service).toMatchObject({
    name: 'Web Development',
    url: canonical,
    description: webDevelopment.description,
    provider: { '@id': `${site.origin}/#organization` },
  });
  for (const property of [
    'aggregateRating',
    'review',
    'offers',
    'priceRange',
    'award',
    'areaServed',
  ])
    expect(service).not.toHaveProperty(property);
  expect(byType('BreadcrumbList')[0]?.['itemListElement']).toEqual([
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.origin}/` },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Web Development',
      item: canonical,
    },
  ]);
  const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
  await expect(
    breadcrumb.getByRole('link', { name: 'Home', exact: true }),
  ).toHaveAttribute('href', '/');
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(
    'Web Development',
  );
  await expect(breadcrumb.locator('a[href="/services/"]')).toHaveCount(0);
});

test('the service social preview is a real 1200 by 630 PNG', async ({
  request,
}) => {
  const response = await request.get(webDevelopment.image.src);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
  const png = await response.body();
  expect(png.subarray(0, 8)).toEqual(
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );
  expect(png.toString('ascii', 12, 16)).toBe('IHDR');
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});

test('selected work uses the verified concept identities and responsive local images', async ({
  page,
}) => {
  await page.goto(servicePath);
  const work = page.locator('#web-work');
  const projects = work.locator('article');
  await expect(projects).toHaveCount(3);
  for (const [index, name] of [
    'Qadeer Jewellers',
    'Infinity Salon',
    'Classic Detailers',
  ].entries()) {
    const project = projects.nth(index);
    await expect(
      project.getByRole('heading', { name, exact: true }),
    ).toBeVisible();
    await expect(project).toContainText('Concept project');
    await expect(
      project.locator('picture source[type="image/avif"]'),
    ).toHaveAttribute('srcset', /480\.avif.+800\.avif.+1200\.avif/);
    await expect(project.locator('img')).toHaveAttribute('width', '1200');
    await expect(project.locator('img')).toHaveAttribute('height', '900');
    await expect(project.locator('img')).toHaveAttribute('loading', 'lazy');
    const image = project.locator('img');
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (element) =>
            element instanceof HTMLImageElement &&
            element.complete &&
            element.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await expect(
    work.getByRole('heading', { name: 'Apex Detailing Studio', exact: true }),
  ).toHaveCount(0);
  expect(await work.textContent()).not.toMatch(
    /client project|award-winning|trusted by (?:hundreds|\d+)|(?:conversion|revenue|traffic)\s+(?:increase|growth)/i,
  );
  for (const link of await work.locator('a[target="_blank"]').all())
    await expect(link).toHaveAttribute('rel', /noopener/);
});

test('CTAs reach the contact preview and the completed Work page', async ({
  page,
  request,
}) => {
  await page.goto(servicePath);
  const article = page.locator('[data-web-development]');
  for (const id of ['web-hero', 'web-cta']) {
    await expect(
      page
        .locator(`#${id}`)
        .getByRole('link', { name: /Start a Website Project/ }),
    ).toHaveAttribute('href', '/contact/?service=web-development');
    await expect(
      page.locator(`#${id}`).getByRole('link', { name: /View Our Work/ }),
    ).toHaveAttribute('href', '/work/');
  }
  await expect(
    page
      .locator('#web-redesign')
      .getByRole('link', { name: /Discuss a Redesign/ }),
  ).toHaveAttribute('href', '/contact/?service=web-development');
  for (const href of [
    '/services/ai-automation/',
    '/services/ai-chatbots/',
    '/services/landing-pages/',
  ])
    await expect(article.locator(`a[href="${href}"]`)).toHaveCount(0);
  await expect(
    article.getByRole('heading', { name: /e-commerce/i }),
  ).toHaveCount(0);
  for (const destination of ['contact']) {
    const response = await request.get(`/${destination}/`, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('noindex, follow');
    expect(html).toContain('Inquiry preview');
    expect(html).toContain(`https://elevatexlab.org/${destination}/`);
  }
  const workHtml = await (await request.get('/work/')).text();
  expect(workHtml).toContain('Work that speaks');
  expect(workHtml).not.toContain('http-equiv="refresh"');
  const localLinks = await page
    .locator('a[href^="/"]')
    .evaluateAll((links) => [
      ...new Set(links.map((link) => link.getAttribute('href') ?? '/')),
    ]);
  for (const href of localLinks) {
    const url = new URL(href, 'http://127.0.0.1:4321');
    const response = await request.get(url.pathname, { maxRedirects: 0 });
    expect(response.status(), href).toBeGreaterThanOrEqual(200);
    expect(response.status(), href).toBeLessThan(400);
    if (url.hash)
      expect(await response.text(), href).toContain(
        `id="${url.hash.slice(1)}"`,
      );
  }
});

test('native FAQ supports keyboard toggling and a single open answer', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(servicePath);
  const items = page.locator('#web-faq details');
  await expect(items).toHaveCount(10);
  await expect(page.locator('#web-faq details[open]')).toHaveCount(1);
  await expect(items.first()).toHaveAttribute('open', '');
  for (const item of await items.all())
    await expect(item).toHaveAttribute('name', 'web-development-faq');
  for (const index of [1, 9, 4, 0]) {
    const summary = items.nth(index).locator('summary');
    await summary.focus();
    await expect(summary).toBeFocused();
    await expect(summary).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Space');
    await expect(items.nth(index)).toHaveAttribute('open', '');
    await expect(page.locator('#web-faq details[open]')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(items.nth(index)).not.toHaveAttribute('open', '');
  }
});

test('the web process uses a native keyboard controlled radio group', async ({
  page,
}) => {
  await page.goto(servicePath);
  const process = page.locator('#web-build-process');
  await expect(process.locator('fieldset')).toHaveCount(1);
  const radios = process.getByRole('radio');
  await expect(radios).toHaveCount(5);
  await expect(radios.first()).toBeChecked();
  await radios.first().focus();
  await expect(radios.first()).toBeFocused();
  for (let index = 1; index < 5; index += 1) {
    await page.keyboard.press('ArrowRight');
    await expect(radios.nth(index)).toBeFocused();
    await expect(radios.nth(index)).toBeChecked();
    await expect(process.locator('input[type="radio"]:checked')).toHaveCount(1);
  }
  await page.keyboard.press('ArrowRight');
  await expect(radios.first()).toBeChecked();
  await page.keyboard.press('ArrowLeft');
  await expect(radios.last()).toBeChecked();
});

for (const [width, height] of viewports) {
  test(`service content fits ${width} by ${height} with reduced motion and no resource errors`, async ({
    page,
  }) => {
    const errors = observeErrors(page);
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(servicePath);
    await page.evaluate(() => document.fonts.ready);
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    for (const id of sections) {
      const section = page.locator(`#${id}`);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toHaveCSS('opacity', '1');
      await expect(section).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }
    expect(
      await page
        .locator('[data-web-development]')
        .evaluate(
          (element) =>
            element
              .getAnimations({ subtree: true })
              .filter((animation) => animation.playState === 'running').length,
        ),
    ).toBe(0);
    const images = page.locator('[data-web-development] img');
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (element) =>
              element instanceof HTMLImageElement &&
              element.complete &&
              element.naturalWidth > 0,
          ),
        )
        .toBe(true);
      expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
    }
    expect(errors).toEqual([]);
    if ([390, 820, 1440, 2560].includes(width))
      await page.screenshot({
        path: test.info().outputPath(`web-development-${width}.png`),
        fullPage: true,
      });
  });
}

for (const width of [390, 1440]) {
  test(`native content and interactions work without JavaScript at ${width}px`, async ({
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
      await page.goto(servicePath);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        webDevelopment.heading,
      );
      for (const id of sections) {
        await expect(page.locator(`#${id}`)).toBeVisible();
        await expect(page.locator(`#${id}`)).toHaveCSS('opacity', '1');
      }
      await expect(page.locator('#web-work article')).toHaveCount(3);
      const firstAnswer = webDevelopmentFAQs[0];
      await expect(
        page.locator('#web-faq').getByText(firstAnswer.answer),
      ).toBeVisible();
      const lastQuestion = page.locator('#web-faq summary').last();
      await lastQuestion.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#web-faq details').last()).toHaveAttribute(
        'open',
        '',
      );
      await expect(
        page.locator('#web-faq details').first(),
      ).not.toHaveAttribute('open', '');
      const radios = page.locator('#web-build-process input[type="radio"]');
      await radios.first().focus();
      await page.keyboard.press('ArrowRight');
      await expect(radios.nth(1)).toBeChecked();
      await expect(
        page
          .locator('#web-cta')
          .getByRole('link', { name: /Start a Website Project/ }),
      ).toHaveAttribute('href', '/contact/?service=web-development');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    } finally {
      await context.close();
    }
  });

  test(`service passes scoped WCAG checks and keeps visible keyboard focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(servicePath);
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', { name: 'Skip to content' }),
    ).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
    const primary = page
      .locator('#web-hero')
      .getByRole('link', { name: /Start a Website Project/ });
    await primary.focus();
    await expect(primary).toBeFocused();
    await expect(primary).toHaveCSS('outline-style', 'solid');
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}

test('enlarged text preserves useful content and FAQ access on small screens', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 820, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(servicePath);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const question = page.locator('#web-faq summary').last();
    await question.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#web-faq details').last()).toHaveAttribute(
      'open',
      '',
    );
    await expect(
      page
        .locator('#web-cta')
        .getByRole('link', { name: /Start a Website Project/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});

test('hero actions remain within the first screen on short desktop displays', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [
    [1280, 720],
    [1366, 768],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto(servicePath);
    await page.evaluate(() => document.fonts.ready);
    const bounds = await page
      .locator('#web-hero .service-actions a')
      .evaluateAll((links) =>
        links.map((link) => link.getBoundingClientRect().bottom),
      );
    for (const bottom of bounds)
      expect(bottom).toBeLessThanOrEqual(height! - 16);
  }
});

test('mobile skips animation modules and desktop resize can enable the enhancement', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(servicePath, { waitUntil: 'networkidle' });
  expect(
    requests.some((url) =>
      /section-reveal|hero-motion|gsap|ScrollTrigger/.test(url),
    ),
  ).toBe(false);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect
    .poll(() => requests.some((url) => /section-reveal/.test(url)))
    .toBe(true);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    webDevelopment.heading,
  );
});

test('mobile keyboard focus follows each selected process stage without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL: baseURL ?? 'http://127.0.0.1:4321',
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto(servicePath);
    const radios = page.locator('#web-build-process input[type="radio"]');
    await radios.first().focus();
    for (let index = 0; index < 5; index++) {
      if (index) await page.keyboard.press('ArrowRight');
      await expect(radios.nth(index)).toBeChecked();
      const id = await radios.nth(index).getAttribute('id');
      await expect(page.locator(`label[for="${id}"]`)).toBeInViewport({
        ratio: 0.5,
      });
    }
  } finally {
    await context.close();
  }
});
