import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import {
  footerGroups,
  footerStatement,
  pendingFooterRoutes,
} from '../src/data/footer';
import { site } from '../src/data/site';

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
  [2560, 1440],
] as const;
const routes = [
  '/',
  '/about/',
  '/contact/',
  '/work/',
  '/services/web-development/',
  '/work/qadeer-jewellers/',
  '/insights/',
  '/insights/what-makes-a-website-convert-in-2026/',
] as const;
const footer = (page: Page) => page.getByRole('contentinfo');
const activeMotion = (element: Element) =>
  element
    .getAnimations({ subtree: true })
    .filter(({ playState, pending }) => playState === 'running' || pending)
    .length;

async function enterRegion(page: Page, selector: string) {
  await page.locator(selector).evaluate((element) =>
    scrollTo({
      top: scrollY + element.getBoundingClientRect().top - innerHeight * 0.55,
      behavior: 'instant',
    }),
  );
}

test('shared footer renders accurate brand content, a project CTA and real destinations', async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/contact/#footer');
  const closing = footer(page);
  await expect(closing).toHaveCount(1);
  await expect(closing).toHaveAttribute('id', 'footer');
  await expect(closing.getByRole('heading', { level: 2 })).toHaveText(
    /Let[’']s build something\s+worth remembering\./,
  );
  await expect(
    closing.getByRole('link', { name: /Start a Project/ }),
  ).toHaveCount(1);
  await expect(
    closing.getByRole('link', { name: /Start a Project/ }),
  ).toHaveAttribute('href', '/contact/');
  await expect(
    closing.getByRole('navigation', { name: 'Footer navigation' }),
  ).toHaveCount(1);
  await expect(closing.getByRole('link', { name: 'ElevateX home' })).toHaveText(
    site.name,
  );
  await expect(closing.locator('.site-footer__statement')).toHaveText(
    footerStatement,
  );
  await expect(closing.locator('.site-footer__copyright')).toHaveText(
    new RegExp(`© ${new Date().getFullYear()} ${site.name}\\.`),
  );
  const mark = closing.locator('.site-footer__wordmark');
  expect(
    await mark.evaluate((element) => element.firstChild?.textContent?.trim()),
  ).toBe('ELEVATEX');
  expect(
    await mark.evaluate((element) =>
      Boolean(element.closest('[aria-hidden="true"]')),
    ),
  ).toBe(true);
  await expect(
    closing.locator('h1,img,picture,video,canvas,iframe,form'),
  ).toHaveCount(0);
  for (const group of footerGroups)
    for (const link of group.links)
      await expect(
        closing.getByRole('link', { name: link.label, exact: true }),
      ).toHaveAttribute('href', link.href);
  const whatsapp = closing.locator('a[href="https://wa.me/923356709222"]');
  await expect(whatsapp).toHaveCount(1);
  await expect(whatsapp).toHaveAccessibleName(/WhatsApp/i);
  await expect(whatsapp).toHaveAttribute('target', '_blank');
  await expect(whatsapp).toHaveAttribute('rel', /noopener/);
  for (const href of pendingFooterRoutes)
    await expect(closing.locator(`a[href="${href}"]`)).toHaveCount(0);
  await expect(
    closing.locator(
      'a[href="#"],a[href=""],a[href^="javascript:"],a[href^="mailto:"],a[href^="tel:"]',
    ),
  ).toHaveCount(0);
  const hrefs = await closing
    .locator('a')
    .evaluateAll((links) => [
      ...new Set(links.map((link) => link.getAttribute('href')!)),
    ]);
  for (const href of hrefs) {
    if (href.startsWith('https://wa.me/')) continue;
    const url = new URL(href, 'http://127.0.0.1:4321/contact/');
    const response = await request.get(url.pathname);
    expect(response.status(), href).toBe(200);
    if (url.hash)
      expect(await response.text(), href).toContain(
        `id="${url.hash.slice(1)}"`,
      );
  }
  const html = await (await request.get('/contact/')).text();
  const markup = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] ?? '';
  expect(markup).toContain(footerStatement);
  expect(markup).toContain('ELEVATEX');
  expect(markup).toContain('worth remembering.');
  expect(markup).not.toContain('application/ld+json');
});

test('the same single footer closes all eight page types without changing page landmarks', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  let sharedContent: string | undefined;
  for (const path of routes) {
    const response = await page.goto(`${path}#footer`);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main footer')).toHaveCount(0);
    await expect(footer(page)).toHaveCount(1);
    await expect(page.locator('main + footer')).toHaveAttribute('id', 'footer');
    await expect(footer(page).locator('[data-footer-cta]')).toBeVisible();
    const content = await footer(page).textContent();
    sharedContent ??= content ?? '';
    expect(content, path).toBe(sharedContent);
  }
  expect(errors).toEqual([]);
});

for (const [width, height] of sizes)
  test(`footer keeps complete lettering, readable navigation and touch targets at ${width}×${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/contact/#footer');
    await page.evaluate(() => document.fonts.ready);
    const geometry = await footer(page).evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(
        element.querySelector('.site-footer__wordmark')!.firstChild!,
      );
      const lettering = range.getBoundingClientRect();
      const textOverflow = [...element.querySelectorAll('a,p,h2,h3')].flatMap(
        (node) => {
          range.selectNodeContents(node);
          return [...range.getClientRects()]
            .filter(
              (rect) =>
                rect.width > 0 &&
                (rect.left < -1 || rect.right > innerWidth + 1),
            )
            .map(() => node.textContent?.trim());
        },
      );
      return {
        width: bounds.width,
        sceneWidth: element
          .querySelector('[data-footer-scene]')!
          .getBoundingClientRect().width,
        documentWidth: document.documentElement.scrollWidth,
        markWidth: lettering.width,
        markHeight: lettering.height,
        markFits:
          lettering.left >= bounds.left - 1 &&
          lettering.right <= bounds.right + 1,
        textOverflow,
        targets: [...element.querySelectorAll('a')].map((link) => ({
          text: link.textContent?.trim(),
          height: link.getBoundingClientRect().height,
          width: link.getBoundingClientRect().width,
        })),
      };
    });
    expect(geometry.width).toBe(width);
    expect(geometry.documentWidth).toBeLessThanOrEqual(width);
    expect(geometry.markFits).toBe(true);
    expect(geometry.markWidth).toBeGreaterThan(geometry.sceneWidth * 0.55);
    expect(geometry.markHeight).toBeGreaterThan(32);
    expect(geometry.textOverflow).toEqual([]);
    expect(
      geometry.targets.filter(({ height, width }) => height < 44 || width < 44),
    ).toEqual([]);
  });

for (const width of [390, 1440])
  test(`footer offers visible keyboard focus and passes scoped axe at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/contact/#footer');
    const links = footer(page).getByRole('link');
    const count = await links.count();
    await links.first().focus();
    for (let index = 0; index < count; index += 1) {
      await expect(links.nth(index)).toBeFocused();
      expect(
        await links.nth(index).evaluate((element) => {
          const style = getComputedStyle(element);
          return (
            style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 1
          );
        }),
      ).toBe(true);
      if (index < count - 1) await page.keyboard.press('Tab');
    }
    const results = await new AxeBuilder({ page })
      .include('#footer')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    await footer(page)
      .getByRole('link', { name: /Back to Top/i })
      .click();
    await expect(page).toHaveURL(/#page-top$/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  });

test('native project and navigation links work without JavaScript', async ({
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
    await page.goto('/insights/#footer');
    await expect(footer(page).getByRole('heading', { level: 2 })).toBeVisible();
    await expect(footer(page).locator('.site-footer__wordmark')).toBeVisible();
    await expect(footer(page).locator('.site-footer__statement')).toHaveCSS(
      'opacity',
      '1',
    );
    await footer(page)
      .getByRole('link', { name: 'AI Automation', exact: true })
      .click();
    await expect(page).toHaveURL(/\/services\/ai-automation\/$/);
    await expect(page.locator('h1')).toBeVisible();
    await footer(page)
      .getByRole('link', { name: /Start a Project/ })
      .click();
    await expect(page).toHaveURL(/\/contact\/$/);
    await footer(page)
      .getByRole('link', { name: /Back to Top/i })
      .click();
    await expect(page).toHaveURL(/\/contact\/#page-top$/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  } finally {
    await context.close();
  }
});

test('200% text retains complete footer copy and working navigation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/contact/#footer');
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    await page.evaluate(() => document.fonts.ready);
    const overflow = await footer(page).evaluate((element) => {
      const range = document.createRange();
      return [
        ...element.querySelectorAll('h2,h3,p,a,.site-footer__wordmark'),
      ].flatMap((node) => {
        range.selectNodeContents(
          node.matches('.site-footer__wordmark') ? node.firstChild! : node,
        );
        return [...range.getClientRects()]
          .filter(
            (rect) =>
              rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1),
          )
          .map(() => node.textContent?.trim());
      });
    });
    expect(overflow, `${width}px text reflow`).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await expect(
      footer(page).getByRole('link', { name: 'Contact', exact: true }),
    ).toBeVisible();
  }
});

test('footer reveals finish once, survive reverse scrolling and settle on focus or motion changes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const original = Element.prototype.animate;
    const audit = window as typeof window & { footerAnimationCount: number };
    audit.footerAnimationCount = 0;
    Element.prototype.animate = function (keyframes, options) {
      if (this.closest('[data-footer]')) audit.footerAnimationCount += 1;
      return original.call(this, keyframes, options);
    };
  });
  await page.goto('/contact/');
  const closing = footer(page);
  await enterRegion(page, '[data-footer-cta]');
  await expect(closing).toHaveAttribute('data-footer-motion', 'cinematic');
  await expect.poll(() => closing.evaluate(activeMotion)).toBeGreaterThan(0);
  expect(
    await closing.evaluate((element) =>
      element.getAnimations({ subtree: true }).every((animation) => {
        const timing = animation.effect?.getComputedTiming();
        return (
          timing &&
          Number.isFinite(Number(timing.endTime)) &&
          Number(timing.endTime) <= 1600
        );
      }),
    ),
  ).toBe(true);
  expect(
    await closing.evaluate((element) => {
      const animations = element.getAnimations({ subtree: true });
      document.dispatchEvent(new Event('astro:page-load'));
      document.dispatchEvent(new Event('astro:page-load'));
      return animations.every((animation) =>
        element.getAnimations({ subtree: true }).includes(animation),
      );
    }),
  ).toBe(true);
  await expect
    .poll(() => closing.evaluate(activeMotion), { timeout: 2500 })
    .toBe(0);
  await enterRegion(page, '[data-footer-scene]');
  await expect.poll(() => closing.evaluate(activeMotion)).toBeGreaterThan(0);
  await expect
    .poll(() => closing.evaluate(activeMotion), { timeout: 2500 })
    .toBe(0);
  const count = await page.evaluate(
    () =>
      (window as typeof window & { footerAnimationCount: number })
        .footerAnimationCount,
  );
  await page.evaluate(() => scrollTo(0, 0));
  await closing.locator('[data-footer-cta]').scrollIntoViewIfNeeded();
  await closing.locator('[data-footer-scene]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { footerAnimationCount: number })
          .footerAnimationCount,
    ),
  ).toBe(count);
  expect(await closing.evaluate(activeMotion)).toBe(0);
  await page.goto('/contact/?footer-focus');
  await enterRegion(page, '[data-footer-cta]');
  await expect(closing).toHaveAttribute('data-footer-motion', 'cinematic');
  await expect
    .poll(() => closing.locator('[data-footer-cta]').evaluate(activeMotion))
    .toBeGreaterThan(0);
  await closing.getByRole('link', { name: /Start a Project/ }).focus();
  expect(
    await closing.locator('[data-footer-cta]').evaluate(activeMotion),
  ).toBe(0);
  await closing.locator('[data-footer-scene]').scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(closing).toHaveAttribute('data-footer-motion', 'static');
  expect(await closing.evaluate(activeMotion)).toBe(0);
  await expect(closing.getByRole('heading', { level: 2 })).toBeVisible();
  await expect(closing.locator('.site-footer__wordmark')).toBeVisible();
});

test('footer preserves usable content through route history, lifecycle cleanup and mobile motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/about/');
  await enterRegion(page, '[data-footer-cta]');
  await expect(footer(page)).toHaveAttribute('data-footer-motion', 'quiet');
  await expect
    .poll(() => footer(page).evaluate(activeMotion))
    .toBeGreaterThan(0);
  await page.evaluate(() =>
    document.dispatchEvent(new Event('astro:before-swap')),
  );
  expect(await footer(page).evaluate(activeMotion)).toBe(0);
  await page.evaluate(() =>
    document.dispatchEvent(new Event('astro:page-load')),
  );
  await footer(page)
    .getByRole('link', { name: 'Contact', exact: true })
    .click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/about\//);
  await footer(page).locator('[data-footer-scene]').scrollIntoViewIfNeeded();
  await expect
    .poll(() => footer(page).evaluate(activeMotion), { timeout: 2500 })
    .toBe(0);
  await expect(footer(page).locator('.site-footer__wordmark')).toBeVisible();
  await expect(
    footer(page).getByRole('link', { name: /Start a Project/ }),
  ).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/contact\/$/);
  await expect(footer(page)).toHaveCount(1);
  expect(errors).toEqual([]);
});
