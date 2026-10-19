import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { buildEvidenceSchema } from '../src/lib/build-evidence/schema';

const routes = [
  ['qadeer-jewellers', 'Qadeer Jewellers', 'qadeer', '2026-10-14'],
  ['infinity-salon', 'Infinity Salon', 'infinity', '2026-10-15'],
  ['apex-detailing-studio', 'Classic Detailers', 'apex', '2026-10-15'],
] as const;

test('the approved dossier keeps its source and rejects publication without permission', () => {
  const input = readFileSync(
    'src/content/build-evidence/inquiry-approval.md',
    'utf8',
  ).split('---')[1]!;
  const record = buildEvidenceSchema.parse(parse(input));
  expect(record.draft).toBe(false);
  expect(record.permission).toBe('confirmed');
  expect(
    buildEvidenceSchema.safeParse({ ...record, permission: 'pending' }).success,
  ).toBe(false);
  expect(
    buildEvidenceSchema.safeParse({
      ...record,
      draft: true,
      permission: 'pending',
    }).success,
  ).toBe(true);
  expect(
    buildEvidenceSchema.parse({
      ...record,
      permission: undefined,
      draft: undefined,
    }),
  ).toMatchObject({
    draft: true,
    permission: 'pending',
  });
  for (const source of record.sourceFiles) {
    const bytes = readFileSync(source.path);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(
      source.sha256,
    );
  }
  expect(readFileSync(record.excerpt.path, 'utf8')).toContain(
    record.excerpt.code,
  );
  expect(record.limitations.join(' ')).toContain(
    'not a live automation deployment',
  );
});

test('only the approved panel and its sources ship; review routes stay private', async ({
  request,
}) => {
  for (const path of ['/work/', '/about/', '/about/?includeDraft=true']) {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    expect(html.match(/\bdata-build-evidence(?=[\s=>])/g)).toHaveLength(1);
    expect(html).toContain('A review boundary you can inspect.');
    expect(html).not.toContain('data-evidence-review="true"');
    expect(html).not.toContain('LOCAL REVIEW — NOT APPROVED');
  }
  const record = await request.get('/evidence/inquiry-approval.json');
  expect(record.ok()).toBe(true);
  expect(record.headers()['content-type']).toContain('application/json');
  expect(await record.json()).toEqual(
    parse(
      readFileSync(
        'src/content/build-evidence/inquiry-approval.md',
        'utf8',
      ).split('---')[1]!,
    ),
  );
  for (const name of [
    'inquiry-approval-desktop-640',
    'inquiry-approval-desktop-1200',
    'inquiry-approval-mobile-316',
  ])
    for (const format of ['avif', 'webp']) {
      const path = `/images/evidence/${name}.${format}`;
      const response = await request.get(path);
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain(`image/${format}`);
      expect(await response.body()).toEqual(readFileSync(`public${path}`));
    }
  for (const path of [
    '/work/inquiry-approval/',
    '/qa-build-evidence-work/',
    '/qa-build-evidence-about/',
  ])
    expect((await request.get(path)).status()).toBe(404);
  expect(await (await request.get('/sitemap.xml')).text()).not.toMatch(
    /inquiry-approval|qa-build-evidence/,
  );
});

for (const route of ['work', 'about']) {
  for (const width of [320, 390, 1024, 1440]) {
    test(`approved ${route} evidence is responsive and accessible at ${width}px`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${route}/`);
      const panel = page.locator('[data-build-evidence]');
      await expect(panel).toHaveCount(1);
      await expect(
        panel.getByRole('heading', {
          level: route === 'work' ? 2 : 3,
          name: 'A review boundary you can inspect.',
        }),
      ).toBeVisible();
      await expect(panel).not.toHaveAttribute('data-evidence-review');
      await expect(panel).toContainText('not a live automation deployment');
      await expect(panel).toContainText(
        'Backend delivery and external integrations are not exercised.',
      );
      const img = panel.locator('img');
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((el) => (el as HTMLImageElement).decode());
      expect(
        await img.evaluate((el) => (el as HTMLImageElement).currentSrc),
      ).toContain(width < 768 ? 'mobile-316' : 'desktop-');
      await expect(img).toHaveAttribute('width', '1214');
      await expect(img).toHaveAttribute('height', '304');
      await expect(img).toHaveAttribute('loading', 'lazy');
      const summary = panel.locator('summary');
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(panel.locator('details')).toHaveAttribute('open', '');
      await expect(panel.locator('pre')).toContainText('type="radio"');
      await expect(panel.locator('time')).toHaveAttribute(
        'datetime',
        '2026-10-18T11:40:37.889Z',
      );
      await expect(
        panel.getByRole('link', { name: /Open the versioned evidence record/ }),
      ).toHaveAttribute('href', '/evidence/inquiry-approval.json');
      const result = await new AxeBuilder({ page })
        .include('[data-build-evidence]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      expect(errors).toEqual([]);
    });
  }
  for (const width of [390, 1440]) {
    test(`approved ${route} source details work without JavaScript at ${width}px`, async ({
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
        await page.goto(`/${route}/`);
        const panel = page.locator('[data-build-evidence]');
        const summary = panel.locator('summary');
        await summary.focus();
        await page.keyboard.press('Enter');
        await expect(panel.locator('details')).toHaveAttribute('open', '');
        await expect(panel.locator('pre')).toBeVisible();
        await panel
          .getByRole('link', { name: /Open the versioned evidence record/ })
          .focus();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/\/evidence\/inquiry-approval\.json$/);
      } finally {
        await context.close();
      }
    });
  }
}

for (const width of [320, 390, 430, 1024, 1440]) {
  test(`three authentic previews keep their targets and mobile sources at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL: baseURL ?? 'http://127.0.0.1:4321',
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    try {
      for (const [slug, name, folder, date] of routes) {
        const page = await context.newPage();
        await page.goto(`/work/${slug}/`);
        // CSS entrances still run with page scripts disabled. Observe their
        // final state before invoking a Playwright actionability helper.
        await expect
          .poll(() =>
            page.evaluate(() =>
              document
                .getAnimations()
                .every((animation) => animation.playState === 'finished'),
            ),
          )
          .toBe(true);
        const rail = page.locator('[data-study-evidence]');
        await expect(rail).toHaveAccessibleName(
          `${name}: actual website evidence`,
        );
        await expect(rail).toContainText('Concept project / Actual website');
        await expect(rail.locator('time')).toHaveAttribute(
          'datetime',
          new RegExp(`^${date}`),
        );
        const img = rail.locator('img');
        await img.evaluate((el) => el.scrollIntoView({ block: 'center' }));
        await img.evaluate((el) => (el as HTMLImageElement).decode());
        expect(
          await img.evaluate((el) => (el as HTMLImageElement).currentSrc),
        ).toContain(
          `/images/work/${folder}/${width < 768 ? 'mobile-' : 'desktop-'}`,
        );
        await expect(img).toHaveAttribute('loading', 'lazy');
        await expect(rail.locator('[data-media-category]')).toHaveAttribute(
          'data-media-category',
          'AUTHENTIC_SCREENSHOT',
        );
        const box = await img.boundingBox();
        expect(box!.width / box!.height).toBeCloseTo(
          width < 768 ? 390 / 844 : 1440 / 900,
          2,
        );
        await rail
          .getByRole('link', { name: /See the actual website/ })
          .focus();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/#website-showcase$/);
        await expect(page.locator('#website-showcase')).toBeInViewport();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
        expect(
          await page.locator('main [id]').evaluateAll((nodes) => {
            const ids = nodes.map((node) => node.id);
            return new Set(ids).size === ids.length;
          }),
        ).toBe(true);
        await page.close();
      }
    } finally {
      await context.close();
    }
  });
}

test('featured decision notes and the compact six-project index have separate roles', async ({
  page,
}) => {
  await page.goto('/work/');
  await expect(page.locator('.work-feature .work-decisions')).toHaveCount(4);
  for (const story of await page
    .locator('.work-feature .work-decisions')
    .all()) {
    await expect(story.locator('dt')).toHaveText([
      'Design choice',
      'Inspect the interface',
      'What this does not establish',
    ]);
  }
  await expect(page.locator('.work-tile')).toHaveCount(6);
  for (const row of await page.locator('.work-tile').all()) {
    expect(
      (await row.locator('.work-tile__summary > p').innerText()).length,
    ).toBeLessThan(100);
    await expect(
      row.getByRole('link', { name: /View Live Project/ }),
    ).toHaveAttribute('target', '_blank');
  }
  await page
    .getByRole('button', { name: 'Beauty & wellness', exact: true })
    .click();
  await expect(page.locator('.work-tile:visible')).toHaveCount(1);
  const hidden = await page.locator('.work-tile[hidden]').evaluateAll((rows) =>
    rows.every((row) =>
      [...row.querySelectorAll('a')].every((link) => {
        const original = document.activeElement;
        link.focus();
        return document.activeElement === original;
      }),
    ),
  );
  expect(hidden).toBe(true);
});
