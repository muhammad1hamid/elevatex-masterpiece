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
