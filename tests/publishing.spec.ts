import { expect, test } from '@playwright/test';
import { isPublished, contentPath } from '../src/utils/publication';
import { canonicalUrl } from '../src/utils/seo';
import { serializeJsonLd } from '../src/utils/structured-data';

test('drafts and scheduled entries cannot be published early', () => {
  const now = new Date('2026-10-06T00:00:00Z');
  expect(
    isPublished({ draft: true, publishedDate: new Date('2026-01-01') }, now),
  ).toBe(false);
  expect(
    isPublished({ draft: false, publishedDate: new Date('2027-01-01') }, now),
  ).toBe(false);
  expect(isPublished({ draft: false, publishedDate: now }, now)).toBe(true);
});

test('canonical and content paths reject offsite URLs and malformed slugs', () => {
  expect(canonicalUrl('/services/web-development')).toMatch(
    /\/services\/web-development\/$/,
  );
  for (const path of [
    'https://example.com',
    '//example.com/',
    '/test?utm=x',
    '/test#fragment',
    '/\\example.com',
  ])
    expect(() => canonicalUrl(path)).toThrow();
  for (const id of ['../private', 'hello/world', 'UPPER', 'bad slug'])
    expect(() => contentPath('insights', id)).toThrow();
  expect(contentPath('caseStudies', 'real-project')).toBe(
    '/work/real-project/',
  );
});

test('JSON-LD content cannot terminate its script element', () => {
  const value = { description: '</script><script>alert(1)</script>\u2028' };
  const serialized = serializeJsonLd(value);
  expect(serialized).not.toContain('</script>');
  expect(JSON.parse(serialized)).toEqual(value);
});
