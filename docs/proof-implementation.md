# Homepage section 02 — Proof & Selected Work

Implemented locally on 2026-10-08 from the supplied Section 02 brief. The approved hero, its assets, glow and entrance are unchanged by this revision. The existing Core Services foundation remains after this section; its design and the complete work page are outside this scope. No commit, push or deployment was performed.

## Content verification

The owner explicitly confirmed that all three supplied projects are demos/concepts. They are labelled **Concept project**, both in reusable content and in the visible showcase. No paid engagement or business outcome is implied. The proposed 30+ projects and 10+ satisfied clients have no supporting evidence and are omitted. A non-numerical row presents inspectable interfaces, live demos and the approved Web / AI / Automation capabilities.

| Supplied reference                                                               | Inspected title       | Observed purpose                                                               | Verification                 |
| -------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| [Qadeer Jewellers](https://qadeerjewellers.vercel.app/)                          | Qadeer Jewellers      | Jewellery collections, gallery and showroom visit enquiries; no checkout claim | Chrome, HTTP 200, 2026-10-08 |
| [Infinity Salon](https://infinity-salon-swart.vercel.app/)                       | Infinity Salon        | Hair/beauty services, studio imagery and appointment enquiry interface         | Chrome, HTTP 200, 2026-10-08 |
| [Apex Detailing Studio reference](https://apex-detailing-studio-phi.vercel.app/) | **Classic Detailers** | Ceramic coating, paint protection, transformations and guided quote enquiry    | Chrome, HTTP 200, 2026-10-08 |

The Apex deployment currently displays Classic Detailers in its title and wordmark. The card uses that observed name. The reference URL and internal content ID remain unchanged. Business statistics and testimonials visible within the source demos are not reused as agency proof. Forms were inspected visually; no submissions or delivery claims were made.

## Architecture

- `ProofSection.astro`: semantic H2 introduction immediately after Hero, restrained black-to-graphite transition, approved fonts and existing tokens.
- `ProofMetrics.astro`: honest, non-numerical capability row; three columns on desktop, two plus one on phones.
- `SelectedWork.astro`: editorial introduction, three previews and the secondary `/work/` CTA.
- `ProjectShowcase.astro`: semantic linked figure, real screenshot, H3, concept label, industry, service and concise description. All essential text is outside the raster.
- `src/content/case-studies/*.md`: one collection owns summaries and future full case studies. Typed `entryType` distinguishes lightweight showcases from complete evidence-backed studies. No duplicate project data source.
- `src/utils/content.ts`: publication filtering, required metadata/media validation, service mapping and ordering. Showcases are excluded from full case-study routes and sitemaps.

No new routes, schema types, libraries or font families. The Work CTA retains the existing preview handoff documented in `hero-navigation.md`: `/work/` continues to the current live homepage's work section. The future dedicated portfolio page is not built here.

## Images and composition

`scripts/capture-projects.mjs` opens each supplied site at 1440 × 1080, waits for its page content and fonts, and captures the actual rendered viewport. No screenshot content is invented or repainted. Raw captures and observed text/response metadata are retained locally in `artifacts/project-sources/`.

Each screenshot is exported to 480, 800 and 1200 px AVIF/WebP under `public/images/work/`. Three 800 px AVIF previews together total **85,694 bytes** (about 83.7 KiB); the three 1200 px AVIF files total **147,216 bytes** (about 143.8 KiB). Images have responsive sources, explicit dimensions, a reserved 4:3 ratio, lazy loading and async decoding. No preview image is preloaded.

Desktop uses a slightly larger center frame, 42 px vertical offsets on the side frames, minimal neutral browser chrome and 3-degree perspective only on devices that support hover and motion. Captions sit below the frames without bulky card surfaces. Tablet and mobile use a single column with no perspective or motion.

## Motion and resilience

The section uses IntersectionObserver and the browser's native animation API, with no GSAP import or additional library. Only elements entering the viewport animate: 20 px lift, 780 ms, a small stagger. The default HTML/CSS is fully visible. An unavailable observer or failed animation cannot hide content. Keyboard focus cancels any entrance affecting its link. Desktop hover raises a frame 5 px and scales it to 1.015.

The built section module is **737 bytes gzip**. The shared motion policy is another 147 bytes gzip; no additional motion dependency is downloaded. All emitted JavaScript chunks, including the existing desktop GSAP chunk, total 30,373 bytes gzip.

The existing mobile policy is reused: widths up to 1023 px, coarse touch devices without hover, and reduced-motion preferences receive static content. Preference/viewport changes cancel active reveals. Effects run once, without continuous floating, pinning, counters or scroll hijacking.

## Verification

Responsive captures cover 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1536 and 1920 px. All three images loaded at every width with no horizontal overflow or page/resource errors. Artifacts: `artifacts/proof-review/`.

Final checks:

- Astro production-style static build passed. The ordinary preview was rebuilt after the isolated publication-fixture check; no fixtures remain in `src/content/` or `dist/`.
- Astro/TypeScript: 0 errors, 0 warnings, 0 hints. ESLint, Prettier and Git whitespace checks passed.
- **79/79 Chrome Playwright checks passed**, including the existing hero suite and 18 proof checks. Coverage includes all requested widths, image decoding and reserved dimensions, no overlap, no console/resource errors, exact labels and destinations, keyboard order, no JavaScript, unavailable animation APIs, reduced motion and once-only desktop reveals.
- Axe WCAG 2.2 AA checks passed at 390 and 1440 px, both within the section and through existing whole-page checks.
- Publication fixture integration passed: full evidence-backed case studies still generate correctly; showcase-only entries do not create detail routes or enter the sitemap. Draft/scheduling checks passed.
- Raw public references were loaded successfully in Chrome. Project enquiry forms were not submitted. The Work CTA keeps its documented temporary handoff until the full portfolio page is authorized.

This revision was checked in Chrome. Edge, Firefox, Safari, physical devices and manual screen-reader review were not rerun for this section. Automated checks do not establish production readiness.

### Isolated mobile Lighthouse run

Performance **95**, accessibility **100**, best practices **100**. FCP **1.1 s**, LCP **2.4 s**, total blocking time **30 ms**, CLS **0**. Reports: `artifacts/hero-lighthouse/proof-mobile.report.json` and `.html`. These are local simulated mobile measurements, not field data; LCP remains above the 2.0 s launch target. The preview remains intentionally noindex, and the complete launch matrix is still outstanding.
