import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const closes = [
  {
    path: '/',
    selector: '.final-cta__description',
    scope: '#start-a-project',
    inputs: ['who it needs to serve', 'visitors or your team'],
  },
  {
    path: '/services/web-development/',
    selector: '#web-cta .service-cta__lead',
    scope: '#web-cta',
    inputs: ['the audience', 'content, features or deadlines'],
  },
  {
    path: '/services/ai-automation/',
    selector: '#automation-cta .service-cta__lead',
    scope: '#automation-cta',
    inputs: [
      'one repeated task',
      'tools it passes through',
      'review or approve',
    ],
  },
  {
    path: '/services/ai-chatbots/',
    selector: '#chatbot-cta .service-cta__lead',
    scope: '#chatbot-cta',
    inputs: [
      'customer questions',
      'information a chatbot can use',
      'your team should take over',
    ],
  },
  {
    path: '/services/landing-pages/',
    selector: '#landing-cta .service-cta__lead',
    scope: '#landing-cta',
    inputs: [
      'the offer',
      'where visitors will come from',
      'action you want them to take',
    ],
  },
  {
    path: '/about/',
    selector: '#about-cta .about-lead',
    scope: '#about-cta',
    inputs: ['what is already in place', 'design, development or AI support'],
  },
  {
    path: '/insights/',
    selector: '.journal-cta .journal-lead',
    scope: '.journal-cta',
    inputs: ['which idea you want to apply', 'what should happen differently'],
  },
] as const;

for (const item of closes) {
  test(`closing copy gives concrete inputs without changing the contact journey: ${item.path}`, async ({
    page,
    browser,
    baseURL,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(item.path);
    const lead = page.locator(item.selector);
    for (const input of item.inputs) await expect(lead).toContainText(input);
    for (const width of [320, 390, 430, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await lead.scrollIntoViewIfNeeded();
      await expect(lead).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      const bounds = await lead.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    }
    const closing = page.locator(item.scope);
    const contact = closing.locator('a[href^="/contact/"]');
    await expect(contact).toHaveCount(1);
    await expect(contact).toHaveAttribute(
      'href',
      /\/contact\/(?:\?service=[a-z-]+)?$/,
    );
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.locator('footer h2')).toHaveText(
      'Let’s build something worth remembering.',
    );
    await expect(page.locator('footer .site-footer__lead')).toContainText(
      'WhatsApp from the contact page',
    );
    await expect(
      page.locator('footer a[href="https://wa.me/923356709222"]'),
    ).toHaveCount(1);
    await page.setViewportSize({ width: 390, height: 844 });
    const accessibility = await new AxeBuilder({ page })
      .include(item.scope)
      .include('footer')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: 'reduce',
      viewport: { width: 390, height: 844 },
    });
    try {
      const staticPage = await context.newPage();
      await staticPage.goto(`${baseURL}${item.path}`);
      for (const input of item.inputs)
        await expect(staticPage.locator(item.selector)).toContainText(input);
      await expect(
        staticPage.locator(`${item.scope} a[href^="/contact/"]`),
      ).toHaveAttribute('href', /\/contact\//);
    } finally {
      await context.close();
    }
  });
}

test('Classic Detailers identity remains consistent across project entry points', async ({
  request,
}) => {
  for (const path of [
    '/',
    '/work/',
    '/services/web-development/',
    '/work/infinity-salon/',
  ]) {
    const html = await (await request.get(path)).text();
    expect(html).toContain('Classic Detailers');
    // Home/service previews intentionally open the real concept site. Work and
    // the related-study entry retain the established internal study URL.
    if (path === '/work/' || path === '/work/infinity-salon/') {
      expect(html).toContain('/work/apex-detailing-studio/');
    } else {
      expect(html).toContain('https://apex-detailing-studio-phi.vercel.app/');
    }
    expect(html).not.toMatch(/<h[123][^>]*>\s*Apex Detailing Studio/);
  }
});
