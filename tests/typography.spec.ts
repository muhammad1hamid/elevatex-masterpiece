import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768, 1024, 1440, 1920, 2560]) {
  test(`shared headings and safe wrapping at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const headings = await page
      .locator('h1,h2,h3,h4,h5,h6')
      .evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element);
          const bounds = element.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(element);
          return {
            text: element.textContent,
            family: style.fontFamily,
            weight: style.fontWeight,
            left: bounds.left,
            right: bounds.right,
            overflow: element.scrollWidth - element.clientWidth,
            textRight: Math.max(
              ...Array.from(range.getClientRects()).map((rect) => rect.right),
            ),
          };
        }),
      );
    for (const heading of headings) {
      expect(heading.family, heading.text ?? '').toContain('Outfit');
      expect(heading.overflow, heading.text ?? '').toBeLessThanOrEqual(1);
      expect(heading.left).toBeGreaterThanOrEqual(0);
      expect(heading.right).toBeLessThanOrEqual(width + 1);
      expect(heading.textRight, heading.text ?? '').toBeLessThanOrEqual(
        width + 1,
      );
    }
    await expect(page.locator('h1')).toHaveCSS('font-weight', '400');
    await expect(page.locator('h1 em')).toHaveCSS('font-family', /Bodoni Moda/);
    await expect(page.locator('h1 em')).toHaveCSS('font-style', 'italic');
    await expect(page.locator('body')).toHaveCSS(
      'font-family',
      /Instrument Sans/,
    );
    const requestedFonts = await page.evaluate(() =>
      performance
        .getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((name) => /woff2/.test(name)),
    );
    expect(
      requestedFonts.some((name) =>
        name.endsWith('/fonts/outfit-latin-wght-normal.woff2'),
      ),
    ).toBe(true);
    expect(
      requestedFonts.every((name) =>
        name.startsWith(new URL(page.url()).origin),
      ),
    ).toBe(true);
    expect(
      requestedFonts.some(
        (name) => name.includes('bodoni') && !name.includes('italic'),
      ),
    ).toBe(false);
  });
}

test('error page shares the heading family', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('h1')).toHaveCSS('font-family', /Outfit/);
});
