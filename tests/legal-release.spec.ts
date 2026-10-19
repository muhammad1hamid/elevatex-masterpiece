import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import {
  legalPublished,
  legalApproval,
  isLegalApproved,
} from '../src/data/legal';
import { legalPolicies } from '../src/lib/legal/policies';

for (const policy of legalPolicies) {
  test(`${policy.slug}: approved policy, native contents, no JS and no vendor requests`, async ({
    page,
    browser,
    baseURL,
  }) => {
    const vendors: string[] = [],
      errors: string[] = [];
    page.on('request', (request) => {
      if (/googletagmanager|clarity\.ms/.test(request.url()))
        vendors.push(request.url());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${policy.slug}/`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(`${policy.title} | ElevateX Lab`);
    await expect(page.locator('h1')).toContainText(policy.heading[0]);
    await expect(page.locator('.legal-review')).toHaveCount(0);
    await expect(page.locator('time')).toHaveAttribute(
      'datetime',
      '2026-10-19',
    );
    await expect(
      page.locator('footer nav[aria-label="Legal and privacy"] a'),
    ).toHaveCount(4);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://elevatexlab.org/${policy.slug}/`,
    );
    await expect(
      page.locator('head meta[name="msvalidate.01"]'),
    ).toHaveAttribute('content', '92656A7713620AB21B7AE30FA4E79FBC');
    for (const section of policy.sections) {
      await expect(page.locator(`#${section.id}-title`)).toBeVisible();
      await expect(
        page.locator(`.legal-toc a[href="#${section.id}"]`),
      ).toHaveCount(1);
    }
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
      ...(baseURL ? { baseURL } : {}),
    });
    const native = await context.newPage();
    await native.goto(`/${policy.slug}/`);
    await expect(native.locator('.legal-content')).toBeVisible();
    await native.locator('.legal-toc a').last().click();
    await expect(
      native.locator(`#${policy.sections.at(-1)!.id}`),
    ).toBeInViewport();
    await expect(native.locator('noscript p')).toBeVisible();
    expect(await native.locator('noscript p').textContent()).toContain(
      'do not load',
    );
    await context.close();
    expect(vendors).toEqual([]);
    expect(errors).toEqual([]);
  });
  for (const width of [320, 360, 390, 430, 768, 1024, 1440, 1920]) {
    test(`${policy.slug}: legal layout at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${policy.slug}/`);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(page.locator('.legal-content section')).toHaveCount(
        policy.sections.length,
      );
    });
  }
  test(`${policy.slug}: mobile axe AA and functional disabled preferences`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${policy.slug}/`);
    await page.locator('[data-cookie-preferences]').first().click();
    await expect(page.locator('#analytics-choice')).toBeVisible();
    await expect(page.locator('[data-analytics-accept]')).toBeDisabled();
    await expect(page.locator('[data-analytics-disabled]')).toContainText(
      'disabled',
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(page.locator('#analytics-choice')).toBeHidden();
    await expect(
      page.locator('[data-cookie-preferences]').first(),
    ).toBeFocused();
  });
}

test('approval gate rejects drafts, missing facts and mismatched revisions', () => {
  expect(legalPublished).toBe(true);
  expect(legalApproval.approvedAt).toBe('2026-10-19');
  for (const record of [
    { ...legalApproval, status: 'draft' as const },
    { ...legalApproval, approvedAt: '' },
    { ...legalApproval, operatorConfirmed: false },
    { ...legalApproval, retentionConfirmed: false },
    { ...legalApproval, revision: 'new-unapproved-revision' },
  ])
    expect(isLegalApproved(record)).toBe(false);
});

test('approved production requires visitor consent and never inlines provider tags', async () => {
  test.setTimeout(120_000);
  const output = 'test-results/legal-release-gate';
  execFileSync(
    process.execPath,
    ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', output],
    {
      env: {
        ...process.env,
        DEPLOYMENT_ENV: 'production',
        LEGAL_REVIEW: 'true',
        PUBLIC_TRACKING_ENABLED: 'true',
        PUBLIC_TRACKING_PRIVACY_APPROVED: 'true',
        PUBLIC_TRACKING_PROVIDER_REVIEWED: 'true',
      },
      stdio: 'pipe',
    },
  );
  for (const slug of ['privacy', 'terms', 'cookies']) {
    const html = await readFile(`${output}/${slug}/index.html`, 'utf8');
    expect(html).toContain('Last updated:');
    expect(html).toContain('2026-10-19');
    expect(html).toContain('"enabled":true');
    expect(html).not.toContain('unapproved policy draft');
    await expect(
      access(`${output}/review/legal/${slug}/index.html`),
    ).rejects.toThrow();
  }
  const html = await readFile(`${output}/index.html`, 'utf8');
  expect(html).toContain('"enabled":true');
  expect(html).toContain('href="/privacy/"');
  expect(html).not.toContain('src="https://www.googletagmanager.com/');
  expect(html).not.toContain('src="https://www.clarity.ms/');
  expect(await readFile(`${output}/sitemap.xml`, 'utf8')).not.toMatch(
    /\/privacy\/|\/terms\/|\/cookies\/|\/review\//,
  );
  execFileSync(
    process.execPath,
    ['scripts/write-hosting-headers.mjs', output],
    { stdio: 'pipe' },
  );
  const text = await readFile(`${output}/_redirects`, 'utf8');
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'));
  expect(lines).toEqual([
    '/services /#services 302',
    '/services/ /#services 302',
  ]);
  expect(text).toContain('https://elevatexlab.org');
  expect(text).not.toMatch(
    /elevatexlab\.com|\/work\s|\/about\s|\/contact\s|^\/\*/m,
  );
});

test('Workers main activation, preview override and explicit shutdown are deterministic', () => {
  const result = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import { buildEnvironment } from './scripts/build-environment.mjs';
    console.log(JSON.stringify([
      buildEnvironment({}),
      buildEnvironment({WORKERS_CI:'1',WORKERS_CI_BRANCH:'main',DEPLOYMENT_ENV:'preview'}),
      buildEnvironment({WORKERS_CI:'1',WORKERS_CI_BRANCH:'codex/test',DEPLOYMENT_ENV:'production',PUBLIC_TRACKING_ENABLED:'true'}),
      buildEnvironment({WORKERS_CI:'1',WORKERS_CI_BRANCH:'main',PUBLIC_TRACKING_ENABLED:'false'})
    ]));`,
    ],
    { encoding: 'utf8' },
  );
  const [local, main, preview, shutdown] = JSON.parse(result);
  expect(local.DEPLOYMENT_ENV).toBe('preview');
  expect(local.PUBLIC_TRACKING_ENABLED).toBe('false');
  expect(main.DEPLOYMENT_ENV).toBe('production');
  expect(main.PUBLIC_TRACKING_ENABLED).toBe('true');
  expect(preview.DEPLOYMENT_ENV).toBe('preview');
  expect(preview.PUBLIC_TRACKING_ENABLED).toBe('false');
  expect(shutdown.PUBLIC_TRACKING_ENABLED).toBe('false');
});

test('disabled preview lets an earlier visitor withdraw their saved grant', async ({
  page,
  context,
}) => {
  await context.addInitScript(() =>
    localStorage.setItem(
      'elevatex.analytics-consent',
      JSON.stringify({
        choice: 'granted',
        version: 'analytics-v1',
        expires: Date.now() + 86400000,
      }),
    ),
  );
  await page.goto('/privacy/');
  await context.addCookies([
    {
      name: '_ga',
      value: 'synthetic-test-cookie',
      url: 'http://127.0.0.1:4321',
      secure: false,
    },
  ]);
  await page.locator('footer [data-cookie-preferences]').click();
  await expect(page.locator('[data-analytics-accept]')).toBeDisabled();
  await page.locator('[data-analytics-reject]').click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('elevatex.analytics-consent')!).choice,
    ),
  ).toBe('denied');
  expect(
    (await context.cookies()).some((cookie) => cookie.name === '_ga'),
  ).toBe(false);
  await expect(page.locator('#elevatex-ga4,#elevatex-clarity')).toHaveCount(0);
});
