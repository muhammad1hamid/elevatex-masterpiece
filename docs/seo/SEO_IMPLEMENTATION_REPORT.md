# SEO implementation report

21 October 2026. Changes are deliberately small and reversible. No route rename, visual redesign, new commercial service or live DNS change.

**23 October release update:** the owner authorized pushing the reviewed SEO, authority-resource and image-description changes to `main`. Earlier local-only statements below describe the preparation stage. The current release boundary and validation are recorded in [RELEASE_2026-10-23.md](RELEASE_2026-10-23.md).

## 1. Production eligibility for completed pages

- **Issue/root cause:** Homepage and Contact still used earlier noindex launch holds. Contact also hardcoded its own setting.
- **Files:** `src/data/site.ts`, `src/pages/contact.astro`, `scripts/check-publication-build.mjs`.
- **Implementation:** Make completed public pages eligible through the central registry. Contact reads the same registry. Update production fixture assertions; previews remain globally noindex.
- **Why:** One authority for metadata and sitemap avoids divergent page behavior.
- **Validation:** Production candidate metadata/sitemap audit, publication fixtures, dedicated SEO tests.
- **Limit:** This broader indexability change remains local. Article publication does not authorize a full SEO cutover.

## 2. Real default social image

- **Issue/root cause:** Pages without an explicit image emitted incomplete image-sharing metadata.
- **File:** `src/components/seo/Seo.astro`.
- **Implementation:** Use the existing homepage image metadata as the default. Article-specific images continue to override it.
- **Why:** Reuses a real licensed project asset and the existing metadata component; no duplicate configuration or fabricated asset URL.
- **Validation:** Every ordinary generated page has one OG image and matching Twitter image; referenced local files exist.
- **Limit:** Social platforms may cache previous metadata. Their cache refresh is not verified.

## 3. Discoverable RSS

- **Issue/root cause:** Feed existed, but browsers/readers could not discover it from the page head.
- **File:** `src/layouts/BaseLayout.astro`.
- **Implementation:** Add one alternate RSS link using the central origin.
- **Validation:** Head inspection and the existing collection-based RSS checks. Feed publication rules remain intact.

## 4. Verified organization identity

- **Issue/root cause:** Existing organization schema omitted approved profile links and the Lab spelling used on those profiles.
- **File:** `src/utils/structured-data.ts`.
- **Implementation:** Add `alternateName: ElevateX Lab` and reuse the existing Instagram/LinkedIn URLs as `sameAs`. Keep stable entity IDs and brand name.
- **Validation:** JSON parsing, schema property inspection and no-JS HTML audit.
- **Limit:** This is identity consistency, not proof of third-party recognition or search knowledge-panel eligibility.

## 5. Accessible project links

- **Issue/root cause:** Explicit labeling restricted card names to only part of the visible linked content.
- **File:** `src/components/sections/ProjectShowcase.astro`.
- **Implementation:** Let native linked text determine the accessible name.
- **Validation:** Existing keyboard/Work tests and Lighthouse label/name audit. No layout or animation changed.

## 6. Approved article and actual media

- **Files:** `src/content/insights/ai-slop-seo-2026.mdx`, `src/components/insights/ArticleFigure.astro`, `scripts/prepare-ai-slop-assets.mjs`, `public/images/insights/ai-slop-*`, article/journal tests.
- **Implementation:** Publish the supplied article through the existing collection, with a direct answer, truthful organization byline, actual editorial date, source corrections, three body figures and one cover. Four supplied screenshots enhanced and encoded into responsive AVIF/WebP variants; separate real social image.
- **Why:** Fits the existing editorial architecture and preserves draft/schedule rules. The article has its own informational intent and does not add SEO as a commercial service.
- **Validation:** Source-link checks, production metadata/schema/sitemap/RSS, no-JS accessibility and responsive browser checks. See [article checklist](AI_SLOP_ARTICLE_CHECKLIST.md).
- **Limit:** Illustrative charts are not measured research. Publication does not establish rankings, citations or indexation.

## 7. Repeatable auditing and regression checks

- **Files:** `scripts/audit-seo.mjs`, `tests/seo-phase1.spec.ts`, `tests/ai-slop-article.spec.ts`, existing Insights tests and five reports.
- **Implementation:** Inspect generated HTML for duplicate/missing metadata, canonical/sitemap mismatches, local asset/link/fragment failures, images, JSON-LD and graph reachability. Optional read-only live crawl records status/redirect/header observations without loading analytics or sending forms.
- **Validation:** Run against baseline and candidate. Article tests cover static content and media; SEO tests cover production metadata/indexability. Existing homepage journal test now models the real three-card selection rather than expecting every collection entry on the homepage.
- **Limits:** This is not an external schema validator, full crawler or proof of search-engine processing. External link availability was checked separately. Browser/performance results and any initially failed tests are documented in [validation](SEO_VALIDATION_REPORT.md).

## Release boundaries and rollback

The article has explicit publication authorization. Broader SEO changes are prepared locally and must not be bundled into its production push. Keep their diffs available for review. Reverting the eventual article commit is sufficient to remove that article and its assets; no schema, route or data migration is required. No force push, blanket redirect, tracking replacement, backend write or secret change is part of this work.
