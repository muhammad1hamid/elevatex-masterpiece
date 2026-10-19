import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { configureAnalytics, trackEvent } from '../src/scripts/analytics';

test.describe.configure({ mode: 'default' });
let candidate: string;
const origin = 'https://elevatexlab.org';
const consentKey = 'elevatex.analytics-consent';
const bing = '92656A7713620AB21B7AE30FA4E79FBC';
test.beforeAll(async ({ baseURL }, info) => {
  if (!baseURL) throw new Error('A local preview base URL is required.');
  test.setTimeout(120_000);
  candidate = path.resolve(
    `test-results/analytics-candidate-${info.workerIndex}`,
  );
  execFileSync(
    process.execPath,
    ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', candidate],
    {
      env: {
        ...process.env,
        DEPLOYMENT_ENV: 'production',
        PUBLIC_TRACKING_ENABLED: 'true',
        PUBLIC_TRACKING_PRIVACY_APPROVED: 'true',
        PUBLIC_TRACKING_PROVIDER_REVIEWED: 'true',
      },
      stdio: 'pipe',
    },
  );
});

/** Every request is intercepted. No provider property or public site receives traffic. */
async function fixture(
  context: BrowserContext,
  options: { unavailable?: boolean; stored?: boolean } = {},
) {
  const vendors: string[] = [];
  if (options.stored)
    await context.addInitScript(
      ({ key }) => {
        if (!localStorage.getItem(key))
          localStorage.setItem(
            key,
            JSON.stringify({
              version: 'analytics-v1',
              choice: 'granted',
              expires: Date.now() + 60000,
            }),
          );
      },
      { key: consentKey },
    );
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (
      url.hostname === 'www.googletagmanager.com' ||
      url.hostname === 'www.clarity.ms'
    ) {
      vendors.push(url.href);
      if (options.unavailable) return route.abort();
      return route.fulfill({
        contentType: 'application/javascript',
        body: '/* Local inert provider stub. No network collection. */',
      });
    }
    if (
      ![
        origin,
        'https://preview.elevatex.pages.dev',
        'http://localhost:4545',
      ].includes(url.origin)
    )
      return route.abort();
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const file = path.resolve(
      candidate,
      !rel
        ? 'index.html'
        : rel.endsWith('/')
          ? rel + 'index.html'
          : !path.extname(rel)
            ? rel + '/index.html'
            : rel,
    );
    if (!file.startsWith(candidate + path.sep)) return route.abort();
    try {
      const body = await readFile(file);
      const contentType = file.endsWith('.html')
        ? 'text/html'
        : file.endsWith('.js')
          ? 'application/javascript'
          : file.endsWith('.css')
            ? 'text/css'
            : file.endsWith('.svg')
              ? 'image/svg+xml'
              : file.endsWith('.woff2')
                ? 'font/woff2'
                : undefined;
      return route.fulfill({ body, ...(contentType ? { contentType } : {}) });
    } catch {
      return route.fulfill({ status: 404, body: 'Not found' });
    }
  });
  return vendors;
}
async function commands(page: Page): Promise<unknown[][]> {
  return page.evaluate(() =>
    (window.dataLayer ?? []).map((value) =>
      Array.from(value as ArrayLike<unknown>),
    ),
  );
}
async function accept(page: Page) {
  await page.locator('[data-analytics-accept]').click();
  await expect(page.locator('#elevatex-ga4')).toHaveCount(1);
  await expect(page.locator('#elevatex-clarity')).toHaveCount(1);
}

test('the shared boundary blocks unconfirmed leads and isolates provider exceptions', () => {
  const events: string[] = [];
  configureAnalytics((event) => events.push(event));
  trackEvent('generate_lead', { path: '/contact/', source: 'direct' });
  expect(events).toEqual([]);
  configureAnalytics(() => {
    throw new Error('Unavailable provider');
  });
  expect(() =>
    trackEvent('whatsapp_click', { path: '/contact/', source: 'direct' }),
  ).not.toThrow();
  configureAnalytics(undefined);
});

test('normal preview has one static Bing tag, org metadata and no optional provider', async ({
  page,
  request,
}) => {
  const providers: string[] = [];
  page.on('request', (r) => {
    if (/googletagmanager|clarity\.ms/.test(r.url())) providers.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('head meta[name="msvalidate.01"]')).toHaveCount(1);
  await expect(page.locator('head meta[name="msvalidate.01"]')).toHaveAttribute(
    'content',
    bing,
  );
  await expect(page.locator('[data-analytics-preferences]')).toHaveCount(0);
  const config = JSON.parse(
    await page.locator('#site-tracking-config').innerText(),
  );
  expect(config.enabled).toBe(false);
  expect(config.ga4).toBe('G-D9PL0YNQ33');
  expect(config.clarity).toBe('yzeqphj94p');
  for (const route of [
    '/',
    '/services/web-development/',
    '/work/',
    '/work/qadeer-jewellers/',
    '/insights/',
    '/contact/',
  ]) {
    const html = await (await request.get(route)).text();
    expect((html.match(/name="msvalidate.01"/g) ?? []).length).toBe(1);
    expect(html).toContain('https://elevatexlab.org/');
    expect(html).toContain('noindex');
  }
  expect(providers).toEqual([]);
});

test('unknown and rejected consent send nothing; explicit grant loads each exact provider once', async ({
  page,
  context,
}) => {
  const vendors = await fixture(context);
  await page.goto(origin + '/contact/');
  await expect(page.locator('#analytics-choice')).toBeVisible();
  expect(vendors).toEqual([]);
  await page.locator('[data-analytics-reject]').click();
  expect(vendors).toEqual([]);
  await page.locator('[data-analytics-manage]').click();
  await accept(page);
  await expect.poll(() => vendors.length).toBe(2);
  expect(vendors).toContain(
    'https://www.googletagmanager.com/gtag/js?id=G-D9PL0YNQ33',
  );
  expect(vendors).toContain('https://www.clarity.ms/tag/yzeqphj94p');
  await page.locator('[data-analytics-manage]').click();
  await page.locator('[data-analytics-accept]').click();
  expect(vendors.length).toBe(2);
  const calls = await commands(page);
  expect(calls.filter((c) => c[0] === 'config')).toHaveLength(1);
  expect(
    calls.filter((c) => c[0] === 'event' && c[1] === 'page_view'),
  ).toHaveLength(1);
  expect(
    calls.find((c) => c[0] === 'consent' && c[1] === 'default')?.[2],
  ).toEqual({
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  expect(calls.find((c) => c[0] === 'config')?.[2]).toMatchObject({
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  expect(
    await page.evaluate(() => Array.from(window.clarity?.q?.[0] ?? [])),
  ).toEqual([
    'consentv2',
    { ad_Storage: 'denied', analytics_Storage: 'granted' },
  ]);
});

test('withdrawal persists denial and the next document loads neither provider', async ({
  page,
  context,
}) => {
  const vendors = await fixture(context);
  await page.goto(origin + '/contact/');
  await accept(page);
  await expect.poll(() => vendors.length).toBe(2);
  await page.locator('[data-analytics-manage]').click();
  await Promise.all([
    page.waitForEvent('load'),
    page.locator('[data-analytics-reject]').click(),
  ]);
  await expect(page.locator('#elevatex-ga4, #elevatex-clarity')).toHaveCount(0);
  expect(vendors.length).toBe(2);
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? '{}').choice,
      consentKey,
    ),
  ).toBe('denied');
});

test('pageviews follow full navigation and history, not hash changes', async ({
  page,
  context,
}) => {
  await fixture(context, { stored: true });
  await page.goto(origin + '/contact/');
  await expect(page.locator('#elevatex-ga4')).toHaveCount(1);
  await page.evaluate(() => {
    location.hash = 'inquiry-form';
  });
  expect(
    (await commands(page)).filter(
      (c) => c[0] === 'event' && c[1] === 'page_view',
    ),
  ).toHaveLength(1);
  await page.goto(origin + '/');
  await expect(page.locator('#elevatex-ga4')).toHaveCount(1);
  expect(
    (await commands(page)).filter(
      (c) => c[0] === 'event' && c[1] === 'page_view',
    ),
  ).toHaveLength(1);
  await page.goBack();
  await expect(page.locator('#elevatex-ga4')).toHaveCount(1);
  expect(
    (await commands(page)).filter(
      (c) => c[0] === 'event' && c[1] === 'page_view',
    ),
  ).toHaveLength(1);
  await page.reload();
  await expect(page.locator('#elevatex-ga4')).toHaveCount(1);
  expect(
    (await commands(page)).filter(
      (c) => c[0] === 'event' && c[1] === 'page_view',
    ),
  ).toHaveLength(1);
});

test('form interaction is masked and emits a start, never a lead or personal field values', async ({
  page,
  context,
}) => {
  await fixture(context);
  await page.goto(origin + '/contact/');
  await accept(page);
  await expect(page.locator('[data-inquiry-form]')).toHaveAttribute(
    'data-clarity-mask',
    'true',
  );
  await page.locator('#inquiry-name').fill('Private Sentinel Name');
  await page.locator('#inquiry-email').fill('private-sentinel@example.test');
  await page
    .locator('#inquiry-description')
    .fill('Private sentinel project description');
  await page.locator('[data-inquiry-review]').click();
  await page.evaluate(() =>
    document.addEventListener('click', (event) => event.preventDefault(), {
      once: true,
    }),
  );
  await page.locator('a[href^="https://wa.me/"]').first().click();
  const calls = await commands(page);
  expect(calls.filter((c) => c[1] === 'contact_form_start')).toHaveLength(1);
  expect(calls.filter((c) => c[1] === 'whatsapp_click')).toHaveLength(1);
  expect(calls.some((c) => c[1] === 'generate_lead')).toBe(false);
  expect(JSON.stringify(calls)).not.toMatch(
    /Private|private-sentinel|example\.test|923356709222|description/,
  );
});

test('safe service and project links emit only the authored dimensions', async ({
  page,
  context,
}) => {
  await fixture(context, { stored: true });
  await page.goto(origin + '/services/web-development/');
  await expect(page.locator('#elevatex-ga4')).toHaveCount(1);
  await page.evaluate(() =>
    document.addEventListener('click', (event) => event.preventDefault()),
  );
  await page.locator('main a[href^="/contact/"]').first().click();
  const calls = await commands(page);
  expect(calls.filter((c) => c[1] === 'service_cta_click')).toHaveLength(1);
  expect(calls.find((c) => c[1] === 'service_cta_click')?.[2]).toMatchObject({
    service_slug: 'web-development',
    cta_location: 'page',
    page_type: 'services',
  });
  await page.goto(origin + '/work/');
  await expect(page.locator('#elevatex-ga4')).toHaveCount(1);
  await page.evaluate(() =>
    document.addEventListener('click', (event) => event.preventDefault()),
  );
  await page
    .locator('main a[href^="/work/"]:not([href="/work/"])')
    .first()
    .click();
  expect(
    (await commands(page)).filter((c) => c[1] === 'portfolio_open'),
  ).toHaveLength(1);
});

test('real project and article actions use distinct events without destination payloads', async ({
  page,
  context,
}) => {
  await fixture(context, { stored: true });
  await page.goto(origin + '/work/qadeer-jewellers/');
  await expect(page.locator('#elevatex-ga4')).toHaveCount(1);
  await page.evaluate(() =>
    document.addEventListener('click', (event) => event.preventDefault()),
  );
  await page.locator('main a[target="_blank"]').first().click();
  const projectCalls = (await commands(page)).filter(
    (c) => c[1] === 'live_project_click',
  );
  expect(projectCalls).toHaveLength(1);
  expect(JSON.stringify(projectCalls)).not.toMatch(/github\.io|href|923356/);
  await page.goto(origin + '/insights/what-makes-a-website-convert-in-2026/');
  await expect(page.locator('#elevatex-ga4')).toHaveCount(1);
  await page.evaluate(() =>
    document.addEventListener('click', (event) => event.preventDefault()),
  );
  await page.locator('main a[href^="/services/"]').first().click();
  expect(
    (await commands(page)).filter((c) => c[1] === 'article_cta_click'),
  ).toHaveLength(1);
});

test('queries and malformed fragments block providers even with stored consent', async ({
  page,
  context,
}) => {
  const vendors = await fixture(context, { stored: true });
  for (const suffix of [
    '?email=private@example.test',
    '#%E0%A4%A',
    '#private@example.test',
  ]) {
    await page.goto(origin + '/contact/' + suffix);
    await expect(page.locator('[data-analytics-preferences]')).toBeVisible();
    await expect(page.locator('#elevatex-ga4, #elevatex-clarity')).toHaveCount(
      0,
    );
  }
  expect(vendors).toEqual([]);
});

test('preview and local hostnames cannot activate a production-shaped configuration', async ({
  page,
  context,
}) => {
  const vendors = await fixture(context, { stored: true });
  for (const host of [
    'https://preview.elevatex.pages.dev',
    'http://localhost:4545',
  ]) {
    await page.goto(host + '/contact/');
    await expect(page.locator('[data-analytics-preferences]')).toBeHidden();
    expect(vendors).toEqual([]);
  }
});

test('sensitive referrers block collection and cached restoration rechecks withdrawal', async ({
  page,
  context,
}) => {
  const vendors = await fixture(context, { stored: true });
  await page.goto(origin + '/contact/', {
    referer: origin + '/?email=private@example.test',
  });
  await expect(page.locator('[data-analytics-preferences]')).toBeVisible();
  expect(vendors).toEqual([]);
  await page.goto(origin + '/contact/', { referer: origin + '/' });
  await expect(page.locator('#elevatex-ga4')).toHaveCount(1);
  await page.evaluate(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 'analytics-v1',
          choice: 'denied',
          expires: Date.now() + 60000,
        }),
      ),
    consentKey,
  );
  await Promise.all([
    page.waitForEvent('load'),
    page.evaluate(() =>
      window.dispatchEvent(
        new PageTransitionEvent('pageshow', { persisted: true }),
      ),
    ),
  ]);
  await expect(page.locator('#elevatex-ga4, #elevatex-clarity')).toHaveCount(0);
  expect(vendors).toHaveLength(2);
});

test('GPC respects the browser opt-out despite a stored grant', async ({
  page,
  context,
}) => {
  await context.addInitScript(() =>
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: true }),
  );
  const vendors = await fixture(context, { stored: true });
  await page.goto(origin + '/contact/');
  await expect(page.locator('[data-analytics-preferences]')).toBeHidden();
  expect(vendors).toEqual([]);
});

test('unavailable storage defaults off and unavailable providers do not break the page', async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage blocked');
    };
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked');
    };
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const vendors = await fixture(context, { unavailable: true });
  await page.goto(origin + '/contact/');
  await expect(page.locator('#analytics-choice')).toBeVisible();
  expect(vendors).toEqual([]);
  await page.locator('[data-analytics-accept]').click();
  await expect.poll(() => vendors.length).toBe(2);
  await page.locator('[data-analytics-manage]').click();
  await page.locator('[data-analytics-reject]').click();
  await expect(page.locator('[data-analytics-status]')).toContainText(
    'could not save',
  );
  await expect(page.locator('h1')).toBeVisible();
  expect(errors).toEqual([]);
});

test('consent interface remains keyboard usable at 390px without axe AA violations', async ({
  page,
  context,
}) => {
  await fixture(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin + '/contact/');
  await page.locator('[data-analytics-manage]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-analytics-accept]')).toBeFocused();
  const results = await new AxeBuilder({ page })
    .include('[data-analytics-preferences]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-analytics-manage]')).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
