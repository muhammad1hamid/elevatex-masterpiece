# Case-study engine and Apex Detailing Studio

Implemented locally on 15 October 2026 for Master Prompt #19.

**Verdict: READY WITH MINOR ISSUES for local review.** The reusable engine, both migrations and Apex are implemented. No GitHub publication or production cutover was performed. Cross-browser/device launch checks and the wider site's existing publication gates remain.

## 1. Files created

- `src/lib/case-study/{schema,context,media}.ts`.
- `src/components/case-studies/CaseStudyLayout.astro`, `StudySectionRenderer.astro`, `StudyHero.astro`, `StudyHeading.astro`, `StudyMedia.astro`, `StudyViewer.astro`, `StudyOverview.astro`, `StudyWebsiteShowcase.astro`, `StudyDesignStory.astro`, `StudyResponsiveShowcase.astro`, `StudyBehindBuild.astro`, `StudyEditorialGallery.astro`, `StudyFinalShowcase.astro`, `StudyNextProject.astro`, `StudyCTA.astro`.
- `src/styles/case-study-{campaign,editorial,precision,themes}.css` and `src/scripts/animations/case-study.ts`.
- Generic preparation/capture helpers: `scripts/prepare-case-study-media.mjs`, `capture-project-source.mjs`, `capture-case-study.mjs`, `capture-study-baselines.mjs`, `create-case-study-social.mjs`, `audit-case-study-budget.mjs`.
- One-time migration and automotive helpers: `scripts/migrate-case-study-content.mjs`, `prepare-apex-assets.mjs`, `capture-apex-interactions.mjs`.
- `tests/apex-study.spec.ts`, `tests/case-study-engine.spec.ts`, `tests/fixtures/cinematic-study.json`.
- Six retained originals, source/derived manifests in `source-assets/apex/`; 102 AVIF/WebP outputs in `public/images/work/apex/`; social preview `public/images/social/apex-detailing-studio.png`.
- `docs/CASE_STUDY_GUIDE.md` and this report. Raw screenshots, comparisons, test results and Lighthouse output are local evidence under `artifacts/`.

## 2. Files modified or retired

Updated `AGENTS.md` current scope, `src/content.config.ts`, `src/pages/work/[id].astro`, `src/pages/sitemap.xml.ts`, `src/utils/content.ts`, `src/utils/structured-data.ts`, the Qadeer/Infinity/Apex collection entries, publication integration checks, Qadeer/Infinity tests and related capture/budget selectors, and `docs/content-authoring.md`. Declared already-installed/locked YAML 2.9.1 explicitly in `package.json` and lockfile for the authoring tools; no additional runtime framework was added.

Retired the two project-specific page components, their two animation files, old stylesheets and `CaseMedia.astro` after migration. Original components and content were retained locally in `artifacts/case-study-engine/retained-source/`. Older media preparation data/helpers remain historical tooling; runtime pages use collection media dictionaries. This task did not rewrite the homepage, Work composition, service-page components or shared header/footer.

## 3. Reusable components

One master layout handles shared metadata, schema, theme, reviewed CSS family, context, navigation and section rendering. The renderer dispatches nine typed chapter types. Hero, headings, responsive media, native screenshot viewers and CTA actions are shared. There is no project-name switch, per-project Astro page, React island, CMS or page-builder dependency.

## 4. Section variants

Three reviewed composition families support different visual stories:

| Chapter         | Campaign          | Editorial         | Precision           |
| --------------- | ----------------- | ----------------- | ------------------- |
| Hero            | Immersive photo   | Portrait arch     | Immersive photo     |
| Overview        | Panorama          | Interior split    | Wide studio         |
| Website         | Contained browser | Immersive browser | Wide editorial      |
| Design          | Image left        | Offset editorial  | Precision detail    |
| Responsive      | Layered devices   | Aligned devices   | Layered devices     |
| Build           | Interface left    | Notes left        | Precision editorial |
| Gallery         | Asymmetric        | Portrait mosaic   | Cinematic panorama  |
| Final site      | Full bleed        | Contained         | Contained           |
| Related project | Framed preview    | Editorial preview | Wide preview        |

All families support a minimal typographic hero and quiet centered CTA. Chapters can be omitted or reordered through data. Family/variant compatibility is validated rather than exposing unreviewed arbitrary combinations.

## 5. Theme presets

`jewellery`, `beauty`, `automotive`, `neutral` are controlled tokens. Jewellery/beauty retain the approved champagne heading accent; automotive/neutral use silver. Composition families own the reviewed frames, spacing, image treatments and backgrounds. Brand CTA styling remains centralized. No raw project CSS is accepted from frontmatter.

## 6. Dynamic route

`src/pages/work/[id].astro` renders published cinematic entries through the master layout, using `projectStudy.slug ?? entry.id`. It retains the existing documented case-study path and rejects duplicate route segments. Approved Qadeer and Infinity URLs are unchanged. Apex is `/work/apex-detailing-studio/`; `/work/apex-detailing/` is not generated.

## 7. Content schema

Astro/Zod validates versioned study metadata, classification through the existing showcase schema, hero, provenance-aware media dictionary and ordered discriminated chapters. It validates stable unique IDs, date order, references, media roles, safe href protocols, crop coordinates, rendition widths, approved variants, unique device roles and required split-overview copy. Build-time asset checks reject missing AVIF/WebP variants and social images.

The schema has four provenance categories and optional separate mobile art direction. Website/device/build/final/viewer evidence must be authentic captures. Illustration attribution cannot be hidden or replaced by a misleading caption. Unsupported results/testimonial sections are rejected; the legacy documented-case model retains its existing evidence and quote-permission requirements. Human editorial review is still necessary for factual claims and client status.

## 8. Qadeer migration outcome

The approved campaign composition, typography, captions, crops, genuine website evidence, narrative and URL were moved into typed content and shared components. Initial image-fit differences were corrected to retain native presentation behavior. Next-project navigation now derives Infinity from published order. Original source/HTML and before screenshots were retained before retirement of the old renderer.

## 9. Infinity migration outcome

The portrait arch, warm beauty composition, offset detail, aligned devices, imagery, captions, genuine screenshots, narrative and URL were retained. Comparison exposed a mobile hero-caption padding conflict; stronger scoped styling restored the original wrapping. Its next project now opens Apex's real local study, retaining the approved Classic Detailers listing identity.

## 10. Apex case-study result

Ten chapters: cinematic hero, overview, actual website, design direction, responsive evidence, behind the build, automotive gallery, final actual website, next project and CTA. Large mostly centered headings, full front-quarter car composition, silver accents, restrained frames, square paint detail and asymmetric gallery provide the automotive direction.

The owner-confirmed concept classification remains visible. The overview explains that **Apex Detailing Studio is the portfolio title and the live demo currently uses Classic Detailers branding**. Existing listing title and source website identity were preserved. No actual client relationship, studio premises, staff identity, manufacturer endorsement, results or backend integration was inferred from the supplied artwork or public demo.

## 11. Six supplied Apex assets used

| Supplied image | Retained filename                                    | Placement                                         |
| -------------- | ---------------------------------------------------- | ------------------------------------------------- |
| 02:09:07 PM-1  | `midnight_911_in_a_luxury_studio.png`                | Full-car hero                                     |
| 02:09:11 PM-2  | `luxury_black_car_detailing_studio.png`              | Wide overview                                     |
| 02:09:13 PM-3  | `glossy_black_coupe_in_led_studio.png`               | Paint/water macro; reviewed square crop           |
| 02:09:16 PM-4  | `luxury_sports_car_cockpit_in_warm_studio_light.png` | Interior gallery                                  |
| 02:09:19 PM-5  | `polishing_a_glossy_black_sports_car.png`            | Polishing gallery; person not identified as staff |
| 02:09:22 PM-6  | `glossy_black_sports_car_in_a_luxury_garage.png`     | Wide rear-angle closing image                     |

All six are visibly labeled illustrative art direction. Their originals are retained unchanged in `source-assets/apex/`.

## 12. Authentic Apex screenshots captured

Source: `https://apex-detailing-studio-phi.vercel.app/`, inspected 15 October 2026, HTTP 200. Retained capture families: desktop 1440×900, full page 1440×13004, services, contact, quote, large desktop 1920×1080, tablet 768×1024, mobile 390×844, open mobile menu, quote service choices, quote contact-summary step, process grid and PPF-filtered showroom. A fourteenth evidence family is an unmodified crop of the retained desktop capture.

The source uses Cinzel headings and Plus Jakarta Sans supporting copy; the ElevateX study uses the approved Outfit/Instrument system. Selecting Sedan revealed services; Ceramic Coating reached the contact-details step. Process grid and PPF filter were exercised. No enquiry, personal details, WhatsApp message or inspection request was submitted. Backend delivery, CRM, demo reviews and business claims remain unverified.

Raw source material and audit records: `artifacts/apex/source/`. Preparation manifest records actual input paths, output dimensions/bytes and categories.

## 13. Media provenance

Six illustrative and fourteen authentic evidence families generated 102 responsive files. Authentic screenshot source/capture information is stored in typed content and the local manifest. Visible browser labels identify the real demo hostname. Editorial art uses visible captions and decorative empty alt; authentic interfaces have descriptive alt. All images reserve dimensions. AVIF is preferred with WebP fallback, and only hero media has eager/high fetch priority in the actual page.

## 14. Work listing integration

The existing collection remains the source of truth. Publishing Apex's study adds its case-study links without creating a duplicate project or replacing the real live-demo link, listing screenshot or established Classic Detailers copy. Existing filters, ordering, featured layouts and homepage selections remain intact. Work regression checks passed.

## 15. Next-project navigation

Published study order produces Qadeer → Infinity → Apex → Qadeer. A valid published `nextProjectSlug` can override this. Draft, scheduled, nonexistent or self targets cannot produce an explicit dead next-project link. With no alternate published study, the component falls back to Work.

## 16. SEO implementation

One H1, unique title/description, existing www canonical, breadcrumbs, accurate 1200×630 social image and real HTML internal links. Organization, WebSite, WebPage, BreadcrumbList and CreativeWork JSON-LD are safely serialized and match the visible concept status. Actual editorial dates drive publication/schema/sitemap; optional real study updates now populate `dateModified`. Preview remains noindex. The isolated production check verified indexable case metadata and one sitemap entry per approved route without exposing the draft fixture.

## 17. AEO implementation

The overview directly defines what the concept is, what the website presents and the evidence boundary. Section introductions describe the interface, responsive behavior and observed enquiry path in ordinary HTML. Useful headings and contextual service/work links make the story understandable without scripts. No fabricated FAQ, result or testimonial was added.

## 18. GEO implementation

Clear project/agency/source-site identities, explicit concept status, inspectable genuine captures, source records, truthful CreativeWork entity relationships and useful internal links. Generated art is separated visibly from website evidence. No AI visibility, ranking or conversion guarantee is made.

## 19. Responsive results

The targeted regression run passed **196/196 checks across Chrome and Edge**, with zero unexpected, flaky or skipped tests. The three studies cover 320, 360, 375, 390, 430, 768, 820, 1024, 1280, 1366, 1440, 1536 and 1920 px widths. Work additionally covers 2560 px. Text enlargement covers 320, 390, 768 and 1024 px.

Apex visual records include five widths (390, 768, 1366, 1440, 1920), fold/full page and all ten chapters: **60 PNGs**, no overflow or browser/response errors. Mobile uses stacked CTAs, the complete car image and separate device captures. Desktop devices overlap deliberately; small screens do not inherit that overlap. Hero, responsive, design, gallery, build, final-site and social-preview compositions were inspected visually.

## 20. Accessibility results

Chrome/Edge checks passed native viewer keyboard opening/scrolling, no-JS rendering, reduced motion, finite desktop motion, mobile animation exclusion, visible links and 200% text bounds. Axe WCAG 2/2.1/2.2 A/AA checks reported zero violations for each study at 390 and 1440 px. Work and homepage regression coverage also passed. After final refinements, an additional targeted smoke run passed **36/36** metadata, schema, accessibility, motion, links and engine-validation checks. Evidence: `artifacts/case-study-engine/tests-final.json` and `tests-final-smoke.json`.

These checks do not constitute manual screen-reader, physical-device or all-browser certification.

## 21. Lighthouse and resource values

Mobile Lighthouse, local compressed static preview, 15 October 2026:

| Category / metric   | Observed                                                                |
| ------------------- | ----------------------------------------------------------------------- |
| Performance         | **100**                                                                 |
| Accessibility       | **100**                                                                 |
| Best practices      | **100**                                                                 |
| SEO                 | **69**: preview intentionally noindex; the failed audit is crawlability |
| FCP / LCP           | 0.9 s / **1.9 s**                                                       |
| Total blocking time | 0 ms                                                                    |
| CLS                 | **0**                                                                   |
| Warnings            | None                                                                    |

`artifacts/apex-detailing-studio/mobile-final.report.{json,html}` contains the actual run. No field INP or production performance claim is made. Qadeer/Infinity Lighthouse scores were not remeasured in this engine task.

Resource audit at DPR 1: hero AVIF 20,320 bytes at 480 px, 44,429 at 800 and 99,435 at 1448. HTML 64,773 bytes / 14,394 gzip; inline JS 1,773 / 891 gzip; inline CSS 28,475 / 6,435 gzip; no external scripts. Fresh mobile/desktop browser resource transfer was 107,917 / 163,179 bytes initially and 347,958 / 793,081 after scrolling the visible story, excluding closed viewers and the HTML document. Observed initial/scrolled CLS was zero. These are local observations, including response overhead, not hosting guarantees.

## 22. Build results

Astro check: **227 files, zero errors/warnings/hints**. Configured lint and format checks passed. Ordinary static build passed with **14 pages** and preview hosting headers. Empty-insights collection informational warnings remain expected; no synthetic article was published.

Isolated publication integration passed: production metadata/schema/robots, approved routes, scheduling/draft exclusion, correct study URLs and sitemap entries, genuine evidence classification and the data-only renderer fixture. The first fixture attempt used an underscore-prefixed host, which Astro ignores; it was corrected to an exclusively temporary `qa-engine-preview` host. Temporary source fixtures were removed and the ordinary build restored. No test route appears in ordinary output.

## 23. Visual regression findings

Before migration, approved source/HTML and **96 screenshots** were retained for Qadeer and Infinity: 390, 768, 1440 and 1920 px, ten chapters plus fold/full page. Final before/after dimensions match for all 96 images. **94 comparisons are identical** at the configured per-channel tolerance of 8. The other two differ by 3 pixels (Infinity tablet hero) and 286 pixels (Qadeer tablet full page, approximately 0.00323%). Section review found no remaining layout/crop regression.

Two genuine migration issues were caught and fixed: Qadeer's native image fit and Infinity's caption spacing/wrapping. Chrome also omitted a large already-decoded hero raster in some full-page captures after deep scrolling. Fresh viewport/section captures confirmed the image was painted normally; the helper now loads visible story images for captures without deep scrolling, and the affected tablet full-page view was refreshed after priming its real hero capture. The final comparison retains the tiny remaining pixel differences rather than claiming universal pixel identity. Production lazy loading was not changed for this screenshot workaround.

Evidence: `artifacts/case-study-engine/{before,after}/`, `comparison.json`, retained original HTML and targeted hero confirmation.

## 24. Adding the next case study

Follow `docs/CASE_STUDY_GUIDE.md`: verify facts/classification → retain/capture genuine media → optimize → add one typed Markdown entry → select a reviewed family/theme and ordered chapters → configure factual metadata → validate and visually review → publish only when authorized. No new project-specific component or page is required for the existing families.

The permanent unpublished JSON fixture demonstrates a minimal hero, neutral theme, optional/reordered chapters and existing shared components. Publication checks temporarily render it through the same layout in an isolated build while asserting absence from Work, sitemap and ordinary project routes. The guide documents exact fields, supported family combinations, media attribution, motion, publication flags, preparation commands and real Apex references.

## 25. Remaining issues and scope limits

- Firefox, WebKit/Safari, physical devices and manual screen readers were not exercised in this task. Complete the broader launch matrix before a production cutover.
- New visual combinations beyond the reviewed family matrix need one reusable component/style extension and QA. Gallery configurations and unusually long names still require editorial visual review; typed data does not replace composition judgment.
- The demo's actual business, premises, staff, manufacturer relationships, reviews, delivery and backend integrations were not verified. The page makes no claims that they were.
- Existing contact delivery, production migration/hostname reconciliation, analytics/privacy decisions and global launch approval remain outside this local case-study implementation. No deployment, contact submission, external message or production indexing submission occurred.
- One offline package-lock installation attempt lacked a cached registry response. The already-present YAML version and its existing lockfile integrity were instead declared directly; lint/build/check and the authoring tools use that existing installed package successfully.

The engine and all three local studies are reviewable now. Production readiness requires the separate site launch gates; the successful build and laboratory score alone do not close them.
