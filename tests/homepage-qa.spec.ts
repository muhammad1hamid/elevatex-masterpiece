import { expect, test } from '@playwright/test';

test('enlarged text preserves the full homepage and usable mobile navigation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    // Check the enlarged layout after font swaps have settled on every platform.
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      outside: [...document.querySelectorAll('body *')]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return (
            box.width > 0 && (box.right > innerWidth + 0.1 || box.left < -0.1)
          );
        })
        .slice(0, 35)
        .map((element) => ({
          tag: element.tagName,
          class: element.getAttribute('class'),
          right: element.getBoundingClientRect().right,
          left: element.getBoundingClientRect().left,
          position: getComputedStyle(element).position,
          parent: element.parentElement?.className,
          parentOverflow:
            element.parentElement &&
            getComputedStyle(element.parentElement).overflowX,
        })),
    }));
    if (layout.width > width) {
      const isolation = await page.evaluate(() => {
        const probes = [
          'body', 'body > :not(main)', 'main',
          ...[...document.querySelectorAll('main > *')].map((_element, index) => `main > :nth-child(${index + 1})`),
          '.global-header', '.hero', '.hero__rim', '.hero__stage',
          '.hero__smoke-position', '.site-footer', '.site-footer__arc',
          '.global-header__mobile-navigation', 'svg',
        ];
        const measured = probes.map((selector) => {
          const elements = [...document.querySelectorAll<HTMLElement>(selector)];
          const saved = elements.map((element) => element.getAttribute('style'));
          elements.forEach((element) => element.style.setProperty('display', 'none', 'important'));
          const documentWidth = document.documentElement.scrollWidth;
          elements.forEach((element, index) => {
            const original = saved[index];
            if (original === null || original === undefined) element.removeAttribute('style');
            else element.setAttribute('style', original);
          });
          return { selector, documentWidth };
        });
        const css = [
          '*::before, *::after { content: none !important }',
          'body > :not(main) { display: none !important }',
          'main > * { display: none !important }',
          'html { min-width: 0 !important; width: 100% !important }',
          '.skip-link { display: none !important }',
          '.sr-only { display: none !important }',
          '.hero { overflow: hidden !important }',
          '.hero { contain: paint !important }',
          '.hero__stage { overflow: hidden !important }',
          '.site-footer { overflow: hidden !important }',
          '.global-header__mobile:not([open]) > nav { display: none !important }',
        ].map((rule) => {
          const style = document.createElement('style');
          style.textContent = rule;
          document.head.append(style);
          const documentWidth = document.documentElement.scrollWidth;
          style.remove();
          return { rule, documentWidth };
        });
        const target = document.querySelector<HTMLElement>('main > :nth-child(17)');
        const sources: unknown[] = [];
        const isolate = (parent: HTMLElement, depth: number) => {
          if (depth > 8) return;
          for (const child of parent.children) {
            const element = child as HTMLElement;
            if (!element.style) continue;
            const saved = element.getAttribute('style');
            element.style.setProperty('display', 'none', 'important');
            const fits = document.documentElement.scrollWidth <= innerWidth;
            if (saved === null) element.removeAttribute('style');
            else element.setAttribute('style', saved);
            if (fits) {
              sources.push({tag: element.tagName, id: element.id, class: element.className, depth, text: element.textContent?.trim().slice(0,80), rect: element.getBoundingClientRect().toJSON()});
              isolate(element, depth + 1);
            }
          }
        };
        if(target) isolate(target, 0);
        return { measured, css, target: target?.outerHTML.slice(0,150), sources, viewport: {innerWidth, outerWidth, dpr: devicePixelRatio, client: document.documentElement.clientWidth, body: document.body.getBoundingClientRect().toJSON()} };
      });
      console.log('LAYOUT_ISOLATION', JSON.stringify(isolation));
    }
    expect(layout.width, JSON.stringify(layout)).toBeLessThanOrEqual(width);
    await expect(page.locator('main > section')).toHaveCount(10);
    await page.locator('#faq').scrollIntoViewIfNeeded();
    const question = page.locator('.faq-item summary').last();
    await question.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.faq-item details').last()).toHaveAttribute(
      'open',
      '',
    );
    await expect(
      page
        .locator('.faq-item details')
        .last()
        .getByRole('link', { name: 'Start a Project' }),
    ).toBeVisible();
  }
});

test('visible navigation targets reserve at least 44px in both dimensions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    if (width < 1024) {
      await page.locator('[data-menu-toggle]').focus();
      await page.keyboard.press('Enter');
    }
    const targets = page.locator(
      '.global-header a:visible, [data-menu-toggle]:visible, .site-footer a',
    );
    const bounds = await targets.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          name: element.textContent?.trim(),
          width: rect.width,
          height: rect.height,
        };
      }),
    );
    for (const target of bounds) {
      expect(target.width, target.name).toBeGreaterThanOrEqual(44);
      expect(target.height, target.name).toBeGreaterThanOrEqual(44);
    }
    if (width < 1024) {
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-menu-toggle]')).toBeFocused();
      await expect(page.locator('[data-mobile-menu]')).not.toHaveAttribute(
        'open',
      );
    }
  }
});
