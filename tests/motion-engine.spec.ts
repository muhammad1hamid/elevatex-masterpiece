import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function activate(page: Page) {
  await page.mouse.move(200, 200);
  await expect(page.locator('html')).toHaveAttribute(
    'data-smooth-scroll',
    'lenis',
  );
  await page.mouse.move(205, 205);
}

/** A progress assertion can pass during native PageUp interpolation. Let the
 * browser finish that command before issuing a different navigation key. */
async function waitForNativeScroll(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let quiet: ReturnType<typeof setTimeout>;
        const finish = () => {
          clearTimeout(quiet);
          window.removeEventListener('scroll', schedule);
          window.removeEventListener('scrollend', finish);
          resolve();
        };
        const schedule = () => {
          clearTimeout(quiet);
          quiet = setTimeout(finish, 120);
        };
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('scrollend', finish, { once: true });
        schedule();
      }),
  );
}

test('cursor contexts, stable magnetic hit area, selection, keyboard and live reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/contact/');
  await activate(page);
  await expect(page.locator('[data-motion-cursor]')).toBeVisible();
  const button = page.locator('.global-header__call');
  const before = await button.boundingBox();
  await button.hover({ position: { x: 15, y: 15 } });
  await expect(page.locator('[data-motion-cursor]')).toHaveAttribute(
    'data-state',
    'link',
  );
  expect(await button.boundingBox()).toEqual(before);
  await page.locator('#inquiry-name').hover();
  await expect(page.locator('[data-motion-cursor]')).toBeHidden();
  await expect(page.locator('html')).not.toHaveAttribute('data-cursor-ready');
  await page.locator('#inquiry-name').fill('Test visitor');
  await page.locator('h1').evaluate((node) => {
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  });
  await page.mouse.move(50, 200);
  await expect(page.locator('[data-motion-cursor]')).toBeHidden();
  await page.evaluate(() => getSelection()?.removeAllRanges());
  await page.mouse.move(60, 200);
  await expect(page.locator('[data-motion-cursor]')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-motion-cursor]')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveAttribute('data-smooth-scroll');
  await page.mouse.move(300, 200);
  await expect(page.locator('[data-motion-cursor]')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await activate(page);
  expect(await page.locator('[data-motion-cursor]').count()).toBe(1);
});

test('wheel, anchors, keyboard, nested scroll and history stay native-compatible', async ({
  page,
}) => {
  await page.goto('/work/');
  await activate(page);
  await page.mouse.wheel(0, 550);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(350);
  await page.keyboard.press('Home');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5);
  await page.locator('a[href="#featured-work"]').click();
  await expect(page).toHaveURL(/#featured-work$/);
  await expect
    .poll(() =>
      page
        .locator('#featured-work')
        .evaluate((el) => el.getBoundingClientRect().top),
    )
    .toBeLessThan(100);
  await page.evaluate(() => scrollTo(0, 1800));
  await page.waitForTimeout(300);
  const saved = await page.evaluate(() => scrollY);
  await page.goto('/about/');
  await page.goBack();
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(saved - 100);
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(saved - 100);
  await activate(page);
  await page.evaluate(() => {
    const box = document.createElement('div');
    box.id = 'nested-motion-test';
    box.style.cssText =
      'position:fixed;top:150px;left:100px;width:240px;height:150px;overflow:auto;z-index:100;background:#222';
    box.innerHTML = '<div style="height:1200px">Nested native scrolling</div>';
    document.body.append(box);
  });
  const outer = await page.evaluate(() => scrollY);
  await page.locator('#nested-motion-test').hover();
  await page.mouse.wheel(0, 250);
  await expect
    .poll(() =>
      page.locator('#nested-motion-test').evaluate((el) => el.scrollTop),
    )
    .toBeGreaterThan(50);
  expect(Math.abs((await page.evaluate(() => scrollY)) - outer)).toBeLessThan(
    5,
  );
});

test('VIEW is confined to real links; lifecycle cleanup restores native controls', async ({
  page,
}) => {
  await page.goto('/work/');
  await activate(page);
  await page.locator('.work-tile [data-cursor="view"]').first().hover();
  await expect(page.locator('[data-motion-cursor]')).toHaveAttribute(
    'data-state',
    'view',
  );
  await page.evaluate(() =>
    window.dispatchEvent(
      new PageTransitionEvent('pagehide', { persisted: true }),
    ),
  );
  await expect(page.locator('html')).not.toHaveAttribute('data-smooth-scroll');
  await expect(page.locator('html')).not.toHaveAttribute('data-cursor-ready');
  await page.evaluate(() =>
    window.dispatchEvent(
      new PageTransitionEvent('pageshow', { persisted: true }),
    ),
  );
  await activate(page);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      document.dispatchEvent(new Event('astro:before-swap'));
      document.dispatchEvent(new Event('astro:page-load'));
    });
    await activate(page);
    await expect(page.locator('[data-motion-cursor]')).toHaveCount(1);
  }
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('html')).not.toHaveAttribute('data-cursor-ready');
});

test('failed advanced module leaves native input and visible content', async ({
  page,
}) => {
  await page.route('**/*advanced*.js', (route) => route.abort());
  await page.goto('/contact/');
  await page.mouse.move(200, 200);
  await page.waitForTimeout(250);
  await expect(page.locator('html')).not.toHaveAttribute('data-cursor-ready');
  await expect(page.locator('html')).not.toHaveAttribute('data-smooth-scroll');
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await expect(page.locator('h1')).toBeVisible();
});

const routes = [
  '/',
  '/work/',
  '/work/qadeer-jewellers/',
  '/work/infinity-salon/',
  '/work/apex-detailing-studio/',
  '/about/',
  '/contact/',
  '/services/web-development/',
  '/services/ai-automation/',
  '/services/ai-chatbots/',
  '/services/landing-pages/',
  '/insights/',
  '/insights/what-makes-a-website-convert-in-2026/',
];
test('idle wheel input stays interpolated and keyboard scrolling can interrupt it', async ({
  page,
}, testInfo) => {
  await page.goto('/work/');
  await activate(page);
  await page.waitForTimeout(1200);
  const samples = page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        window.addEventListener(
          'wheel',
          () => {
            const values: number[] = [],
              start = performance.now();
            function frame() {
              values.push(scrollY);
              if (performance.now() - start < 700) requestAnimationFrame(frame);
              else resolve(values);
            }
            requestAnimationFrame(frame);
          },
          { once: true },
        );
      }),
  );
  await page.mouse.wheel(0, 500);
  expect(new Set(await samples).size).toBeGreaterThan(5);
  await page.keyboard.press('End', { delay: 100 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollHeight - innerHeight - scrollY,
      ),
    )
    .toBeLessThan(5);
  await page.keyboard.press('PageUp', { delay: 100 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollHeight - innerHeight - scrollY,
      ),
    )
    .toBeGreaterThan(100);
  await waitForNativeScroll(page);
  await page.keyboard.press('Home', { delay: 100 });
  const nativeStates: unknown[] = [];
  try {
    await expect
      .poll(async () => {
        const state = await page.evaluate(() => ({
          y: scrollY,
          focused: document.hasFocus(),
          active: document.activeElement?.tagName,
          smooth: document.documentElement.dataset['smoothScroll'],
          behavior: getComputedStyle(document.documentElement).scrollBehavior,
        }));
        nativeStates.push(state);
        return state.y;
      })
      .toBeLessThan(5);
  } finally {
    await testInfo.attach('native-keyboard-state', {
      body: JSON.stringify(nativeStates, null, 2),
      contentType: 'application/json',
    });
  }
  await page.keyboard.press('Space', { delay: 100 });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
});

test('sitewide runtime, reduced motion, no JS and accessibility', async ({
  browser,
}) => {
  test.setTimeout(180000);
  for (const mode of ['desktop', 'reduced', 'no-js', 'touch'] as const) {
    const context = await browser.newContext({
      viewport:
        mode === 'touch'
          ? { width: 390, height: 844 }
          : { width: 1440, height: 900 },
      hasTouch: mode === 'touch',
      isMobile: mode === 'touch',
      javaScriptEnabled: mode !== 'no-js',
      reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      if (mode === 'desktop') {
        await activate(page);
      } else {
        await page.mouse.move(200, 200);
        await expect(page.locator('html')).not.toHaveAttribute(
          'data-smooth-scroll',
        );
      }
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      await expect(page.locator('footer')).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
    }
    if (mode !== 'no-js') {
      await page.goto('/contact/');
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    expect(errors).toEqual([]);
    await context.close();
  }
});
