import { expect, test, type Page } from '@playwright/test';

const heroTitle = 'Premium Digital Systems For Serious Growth.';
const heroDescription =
  'We help ambitious businesses grow with high-converting websites, AI systems, and smart chatbots.';

async function expectFinalScene(page: Page) {
  await expect(page.locator('#hero-title')).toHaveText(heroTitle);
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(
    page
      .locator('.hero')
      .getByRole('link', { name: 'Discuss a Project', exact: true }),
  ).toBeVisible();
  for (const selector of ['.hero__pedestal', '.hero__laptop']) {
    const object = page.locator(selector);
    await expect(object).toBeVisible();
    await expect(object).toHaveCSS('opacity', '1');
  }
}

test('hero copy and calls to action are semantic and exact', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText(heroTitle);
  await expect(page.locator('h1 em')).toHaveText('Growth.');
  await expect(page.getByText(heroDescription, { exact: true })).toBeVisible();
  await expect(
    page
      .locator('.hero')
      .getByRole('link', { name: 'Discuss a Project', exact: true }),
  ).toHaveAttribute('href', '/contact/');
  await expect(
    page.getByRole('link', { name: 'See Our Work', exact: true }),
  ).toHaveAttribute('href', '/work/');
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
  await expect(page.locator('.hero canvas, .hero video[autoplay]')).toHaveCount(
    0,
  );
  expect(
    await page
      .locator('h1')
      .evaluate((heading) => getComputedStyle(heading).fontFamily),
  ).toContain('Outfit');
  expect(
    await page
      .locator('body')
      .evaluate((body) => getComputedStyle(body).fontFamily),
  ).toContain('Instrument Sans');
});

test('scene layers are decorative and reserve image dimensions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const selector of ['.hero__pedestal', '.hero__laptop', '.hero__halo']) {
    await expect(page.locator(selector)).toHaveCount(1);
    expect(
      await page
        .locator(selector)
        .evaluate((layer) => Boolean(layer.closest('[aria-hidden="true"]'))),
    ).toBe(true);
  }
  await expect(page.locator('.hero__halo svg')).toHaveCount(2);
  const images = await page.locator('.hero img').evaluateAll((elements) =>
    elements.map((element) => {
      const image = element as HTMLImageElement;
      return {
        width: Number(image.getAttribute('width')),
        height: Number(image.getAttribute('height')),
        alt: image.getAttribute('alt'),
        decorative: Boolean(image.closest('[aria-hidden="true"]')),
        loaded: image.complete && image.naturalWidth > 0,
      };
    }),
  );
  expect(images.length).toBeGreaterThanOrEqual(2);
  for (const image of images) {
    expect(image.width).toBeGreaterThan(0);
    expect(image.height).toBeGreaterThan(0);
    expect(image.alt).toBe('');
    expect(image.decorative).toBe(true);
    expect(image.loaded).toBe(true);
  }
  await expect(
    page.locator(
      '.hero [aria-hidden="true"] a, .hero [aria-hidden="true"] button',
    ),
  ).toHaveCount(0);
  const schema = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(schema.join('')).not.toMatch(/92%|AggregateRating|Review/);
});

test('reduced motion immediately shows the final scene without active animations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    'static',
  );
  await expectFinalScene(page);
  const running = await page
    .locator('[data-hero-root]')
    .evaluate(
      (hero) =>
        hero
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === 'running').length,
    );
  expect(running).toBe(0);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });

  test('hero is complete and mobile navigation remains operable', async ({
    page,
  }) => {
    await page.goto('/');
    await expectFinalScene(page);
    const toggle = page.locator('[data-menu-toggle]');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('navigation', { name: 'Mobile', exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Mobile', exact: true })
        .getByRole('link', { name: 'Work', exact: true }),
    ).toHaveAttribute('href', '/work/');
  });
});

test('failed JavaScript downloads retain useful content and a final scene', async ({
  page,
}) => {
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() === 'script')
      await route.abort('failed');
    else await route.continue();
  });
  await page.goto('/');
  await expect(page.locator('.hero__intro')).toBeHidden({ timeout: 8000 });
  await expectFinalScene(page);
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    'static',
  );
  await expect(
    page
      .locator('.hero')
      .getByRole('link', { name: 'Discuss a Project', exact: true }),
  ).toHaveAttribute('href', '/contact/');
});

test('unavailable session storage does not strand the entrance', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get() {
        throw new DOMException('Storage is unavailable', 'SecurityError');
      },
    });
  });
  await page.goto('/');
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    /^(ambient|static)$/,
    { timeout: 5000 },
  );
  await expectFinalScene(page);
  expect(errors).toEqual([]);
});

for (const width of [320, 375, 390, 393, 430]) {
  test(`mobile hero maintains content order and touch targets at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const headline = await page.locator('#hero-title').boundingBox();
    const description = await page
      .getByText(heroDescription, { exact: true })
      .boundingBox();
    const primary = await page
      .locator('.hero')
      .getByRole('link', { name: 'Discuss a Project', exact: true })
      .boundingBox();
    const secondary = await page
      .getByRole('link', { name: 'See Our Work', exact: true })
      .boundingBox();
    const laptop = await page.locator('.hero__laptop').boundingBox();
    const menu = await page.locator('[data-menu-toggle]').boundingBox();
    expect(headline).not.toBeNull();
    expect(description).not.toBeNull();
    expect(primary).not.toBeNull();
    expect(secondary).not.toBeNull();
    expect(laptop).not.toBeNull();
    expect(menu).not.toBeNull();
    if (!headline || !description || !primary || !secondary || !laptop || !menu)
      return;
    expect(description.y).toBeGreaterThanOrEqual(
      headline.y + headline.height - 1,
    );
    expect(primary.y).toBeGreaterThanOrEqual(
      description.y + description.height - 1,
    );
    expect(secondary.y).toBeGreaterThanOrEqual(primary.y + primary.height - 1);
    expect(laptop.y).toBeGreaterThanOrEqual(secondary.y + secondary.height - 1);
    for (const control of [primary, secondary, menu]) {
      expect(control.width).toBeGreaterThanOrEqual(44);
      expect(control.height).toBeGreaterThanOrEqual(44);
      expect(control.x).toBeGreaterThanOrEqual(0);
      expect(control.x + control.width).toBeLessThanOrEqual(width + 1);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });
}

test('mobile menu supports keyboard activation and Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const toggle = page.locator('[data-menu-toggle]');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const navigation = page.getByRole('navigation', {
    name: 'Mobile',
    exact: true,
  });
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(
    navigation.getByRole('link', { name: 'Home', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await expect(navigation).toBeHidden();
});

test('non-hero pages omit the hero runtime and defer desktop animation downloads', async ({
  page,
}) => {
  const downloadedScripts: Promise<string>[] = [];
  const downloadedScriptUrls: string[] = [];
  page.on('response', (response) => {
    if (response.request().resourceType() === 'script') {
      downloadedScriptUrls.push(response.url());
      downloadedScripts.push(response.text());
    }
  });
  await page.goto('/404.html');
  await expect(page.locator('[data-hero-root]')).toHaveCount(0);
  const scriptSources = await Promise.all(downloadedScripts);
  expect(scriptSources.join('\n')).not.toMatch(
    /elevatexIntroSeen:v2|WebGLRenderer|__REACT_DEVTOOLS_GLOBAL_HOOK__/i,
  );
  // Shared motion loaders mention lazy chunk filenames. Their text is not
  // evidence that GSAP or ScrollTrigger has actually been downloaded.
  expect(downloadedScriptUrls).not.toContainEqual(
    expect.stringMatching(/\/(?:gsap|ScrollTrigger)[.-]/i),
  );
});

test('first session presents the platform before the laptop and refresh uses a short entrance', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Drive the entrance clock explicitly: shared CI runners can skip animation
  // frames or reach the fail-open watchdog before an intermediate sample.
  await page.clock.install({ time: new Date('2026-10-07T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-10-07T00:00:01Z'));
  await page.addInitScript(() => {
    const frames: { pedestalY: number; laptopOpacity: number }[] = [];
    Object.defineProperty(window, '__heroFrames', { value: frames });
    let remainingFrames = 360;
    const sample = () => {
      const hero = document.querySelector<HTMLElement>('[data-hero-root]');
      const pedestal = hero?.querySelector<HTMLElement>('.hero__pedestal');
      const laptop = hero?.querySelector<HTMLElement>('.hero__laptop');
      if (hero?.dataset['motion'] === 'entering' && pedestal && laptop) {
        frames.push({
          pedestalY: new DOMMatrix(getComputedStyle(pedestal).transform).m42,
          laptopOpacity: Number(getComputedStyle(laptop).opacity),
        });
      }
      if (--remainingFrames > 0) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.goto('/');
  const hero = page.locator('[data-hero-root]');
  await expect(hero).toHaveAttribute('data-intro', 'first');
  await expect(hero).toHaveAttribute('data-motion', 'entering');
  await page.clock.runFor(4500);
  await expect(hero).toHaveAttribute('data-motion', 'ambient', {
    timeout: 5000,
  });
  await expectFinalScene(page);
  expect(
    await page.evaluate(() => sessionStorage.getItem('elevatexIntroSeen:v2')),
  ).toBe('true');
  const frames = await page.evaluate(
    () =>
      (
        window as unknown as Window & {
          __heroFrames: { pedestalY: number; laptopOpacity: number }[];
        }
      ).__heroFrames,
  );
  expect(frames.length).toBeGreaterThan(0);
  const initialPedestalY = Math.max(...frames.map((frame) => frame.pedestalY));
  expect(initialPedestalY).toBeGreaterThan(20);
  expect(
    frames.some(
      (frame) =>
        frame.pedestalY > initialPedestalY * 0.65 && frame.laptopOpacity < 0.01,
    ),
  ).toBe(true);
  const laptopReveal = frames.find((frame) => frame.laptopOpacity > 0.02);
  expect(laptopReveal).toBeDefined();
  expect(laptopReveal?.pedestalY).toBeLessThan(initialPedestalY * 0.35);
  await page.reload();
  await expect(hero).toHaveAttribute('data-intro', 'repeat');
  await expect(hero).toHaveAttribute('data-motion', 'entering');
  await expect(page.locator('.hero__intro')).toBeHidden();
  await page.clock.runFor(1000);
  await expect(hero).toHaveAttribute('data-motion', 'ambient', {
    timeout: 3000,
  });
  await expectFinalScene(page);
});

test('a slow document response does not consume the animation loading budget', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/', async (route) => {
    if (route.request().isNavigationRequest())
      await new Promise((resolve) => setTimeout(resolve, 2100));
    await route.continue();
  });
  await page.goto('/');
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    'entering',
  );
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-intro',
    'first',
  );
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    'ambient',
  );
  await expectFinalScene(page);
});

test('a background load preserves the first entrance until the page becomes visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.addInitScript(() =>
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    }),
  );
  await page.goto('/');
  expect(
    await page.evaluate(() => sessionStorage.getItem('elevatexIntroSeen:v2')),
  ).toBe('false');
  await expect(page.locator('.hero__intro')).toBeHidden();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('[data-hero-root]')).toHaveAttribute(
    'data-motion',
    'entering',
  );
  await page.clock.runFor(4500);
  await expectFinalScene(page);
});

for (const [width, height] of [
  [320, 568],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1280, 720],
  [1366, 600],
  [1440, 900],
  [1536, 864],
  [1920, 1080],
  [2560, 1440],
]) {
  test(`scene stays centered and laptop sits on the pedestal at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: width!, height: height! });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const laptop = (await page.locator('.hero__laptop').boundingBox())!;
    const pedestal = (await page.locator('.hero__pedestal').boundingBox())!;
    const actions = (await page.locator('.hero__actions').boundingBox())!;
    expect(Math.abs(laptop.x + laptop.width / 2 - width! / 2)).toBeLessThan(1);
    const contact = (laptop.y + laptop.height - pedestal.y) / pedestal.height;
    expect(contact).toBeGreaterThan(0.2);
    expect(contact).toBeLessThan(0.32);
    expect(laptop.y).toBeGreaterThan(actions.y + actions.height + 8);
    expect(pedestal.x).toBeGreaterThanOrEqual(0);
    expect(pedestal.x + pedestal.width).toBeLessThanOrEqual(width!);
  });
}

test('denied session storage writes skip the intro across refreshes', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'setItem', {
      configurable: true,
      value() {
        throw new DOMException(
          'Storage writes are denied',
          'QuotaExceededError',
        );
      },
    });
  });
  await page.goto('/');
  const hero = page.locator('[data-hero-root]');
  await expect(hero).toHaveAttribute('data-intro', 'skipped');
  await expect(hero).toHaveAttribute('data-motion', 'ambient');
  await expectFinalScene(page);
  expect(
    await page.evaluate(() => sessionStorage.getItem('elevatexIntroSeen:v2')),
  ).toBeNull();
  await page.reload();
  await expect(hero).toHaveAttribute('data-intro', 'skipped');
  await expect(hero).toHaveAttribute('data-motion', 'ambient');
  await expectFinalScene(page);
  expect(errors).toEqual([]);
});

test('failed GSAP download reveals the page and preserves CSS ambience', async ({
  page,
}) => {
  const errors: string[] = [];
  let blockedDownloads = 0;
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Match the module name while allowing its content hash to change between builds.
  await page.route(/\/_astro\/gsap\.[^/]+\.js(?:\?.*)?$/, async (route) => {
    blockedDownloads += 1;
    await route.abort('failed');
  });
  await page.goto('/');
  await expect.poll(() => blockedDownloads).toBeGreaterThan(0);
  const hero = page.locator('[data-hero-root]');
  await expect(hero).toHaveAttribute('data-intro', 'first');
  await expect(hero).toHaveAttribute('data-motion', 'ambient');
  await expect(page.locator('.hero__intro')).toBeHidden();
  await expect(page.locator('[data-motion-toggle]')).toHaveCount(0);
  await expectFinalScene(page);
  expect(errors).toEqual([]);
});

test('changing reduced-motion preference stops and restores ambient motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', 'true'),
  );
  await page.goto('/');
  const hero = page.locator('[data-hero-root]');
  const hasRunningAnimation = () =>
    hero.evaluate((element) =>
      element
        .getAnimations({ subtree: true })
        .some((animation) => animation.playState === 'running'),
    );
  await expect(hero).toHaveAttribute('data-motion', 'ambient');
  await expect.poll(hasRunningAnimation).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(hero).toHaveAttribute('data-motion', 'static');
  await expect(
    page.getByRole('button', { name: 'Enable motion', exact: true }),
  ).toHaveCount(0);
  await expect.poll(hasRunningAnimation).toBe(false);
  await expectFinalScene(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(hero).toHaveAttribute('data-motion', 'ambient');
  await expect(
    page.getByRole('button', { name: 'Pause motion', exact: true }),
  ).toHaveCount(0);
  await expect.poll(hasRunningAnimation).toBe(true);
});

test('ambient motion pauses when the hero leaves the viewport and resumes on return', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() =>
    sessionStorage.setItem('elevatexIntroSeen:v2', 'true'),
  );
  await page.goto('/');
  const hero = page.locator('[data-hero-root]');
  const hasRunningAnimation = () =>
    hero.evaluate((element) =>
      element
        .getAnimations({ subtree: true })
        .some((animation) => animation.playState === 'running'),
    );
  await expect(hero).toHaveAttribute('data-motion', 'ambient');
  await expect(hero).toHaveAttribute('data-paused', 'false');
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'instant',
    }),
  );
  await expect(hero).not.toBeInViewport();
  await expect(hero).toHaveAttribute('data-paused', 'true');
  await expect.poll(hasRunningAnimation).toBe(false);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(hero).toBeInViewport();
  await expect(hero).toHaveAttribute('data-paused', 'false');
  await expect.poll(hasRunningAnimation).toBe(true);
});
