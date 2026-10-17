# Homepage section 05 — Why Choose ElevateX

Implemented locally on 2026-10-09 from Master Prompt #5 and the supplied Image A. The section follows Featured AI System. Existing Hero, Proof, Services and Featured AI System design, copy and motion are preserved. No Section 06, new route, dependency, commit, push or deployment was added.

## Inspection and reference

Read AGENTS.md and inspected the homepage, previous section components, design/typography tokens, animation policy, shared section reveal utility, navigation implementation and existing browser checks. Image A was initially missing, requested, then supplied and visually inspected before implementation.

Reference: `codex-clipboard-e8e65637-199f-4710-bc79-2dd07a1b0c1c.png`, retained locally in `artifacts/why-elevatex-review/reference-image-a.png`. The reference's outer blue presentation background, navbar, brand and claims are outside the section design and were not reproduced.

## Files and architecture

| File                                                      | Responsibility                                                                               |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/components/sections/WhyElevateXSection.astro`        | Section landmark, pill, centered H2, decorative architecture, grid and shared entrance setup |
| `src/components/why-elevatex/DifferenceCard.astro`        | One reusable semantic article with a local SVG icon, H3 and description                      |
| `src/data/differentiators.ts`                             | Six ordered, typed differentiators and approved descriptions                                 |
| `src/styles/why-elevatex.css`                             | Section composition, cards, responsive typography, background and finite desktop hover       |
| `src/pages/index.astro`                                   | Imports and places Section 05 immediately after Featured AI System                           |
| `tests/why-elevatex.spec.ts`                              | Section content, layout, accessibility, fallback and motion checks                           |
| `tests/services.spec.ts`, `tests/featured-system.spec.ts` | Updates only the total homepage section count from four to five                              |
| `scripts/capture-why-elevatex.mjs`                        | Reproducible responsive screenshots and browser error/overflow measurements                  |
| `docs/why-elevatex-implementation.md`                     | Design comparison, decisions, verification and limitations                                   |

The data array owns all six descriptions. The reusable card contains a small typed SVG path map; there is no separate component per icon, external sprite, icon package or animation runtime. The already-approved Instrument Sans font is used throughout this section to follow the reference's modern typography. Existing fonts and font preloads remain unchanged.

## Approved content

Eyebrow: **WHY CHOOSE ELEVATEX**.

H2: **More than a deliverable. A smarter way to build.**

Six cards, in order:

1. Business-First Thinking
2. Tailored Solutions
3. Design Meets Engineering
4. Clear Communication
5. Practical AI Integration
6. Built to Evolve

All six supplied descriptions are retained verbatim as statements of intended working approach. They do not introduce guarantees, statistics, awards, client evidence or support commitments. The optional supporting paragraph and optional closing CTA are omitted to retain Image A's compact hierarchy. The cards explain the approach and are not links or fake buttons.

## Visual comparison with Image A

Desktop and mobile screenshots were inspected against the supplied reference. This is a composition and brand adaptation, not a claim of pixel identity.

| Reference characteristic            | Implemented treatment                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| Centered small white pill           | Off-white 10 px label, 7/13 px padding and full radius; centered above the heading                  |
| Modern two-line heading             | Existing Instrument Sans at medium 450 weight; 22 px desktop gap below pill; two real HTML lines    |
| Generous space before cards         | Fluid 48–64 px gap; reduced to 40 px on small screens                                               |
| Six cards arranged symmetrically    | 1240 px maximum grid within the established site container; three columns and two rows from 1200 px |
| Closely grouped cards               | 14 px desktop gap, equal grid row sizing and approximately 244 px desktop card height               |
| Minimal rounded panels              | 18 px corner radius, near-black token-based surface and silver border at 7% opacity                 |
| Aligned rounded-square icons        | 48 px outlined containers with 14 px radius; 24 px custom silver line icons                         |
| Consistent content alignment        | Identical top padding, icon dimensions, title spacing and centered descriptions                     |
| Restrained architectural background | Static paired vertical grooves built with small SVG shapes at 4.5% opacity and soft masks           |
| Quiet dark atmosphere               | Existing black, graphite, pearl and silver tokens; champagne appears lightly on hover               |

Remaining deliberate differences: the supplied ElevateX headline and descriptions replace reference copy; Instrument Sans replaces the reference's font; six purpose-specific custom icons replace its unrelated symbols; neutral silver/champagne replaces blue icon accents. The grid aligns with the site's existing container. Background grooves fade into the preceding section instead of starting at a hard edge. The reference's navbar and external blue background are excluded as instructed.

## Responsive behavior

- **1200 px and above:** 3 columns × 2 rows, constrained to 1240 px.
- **768–1199 px:** 2 columns × 3 rows, maximum 896 px grid width.
- **Below 768 px:** one column with all six cards visible; 12 px gaps, 24 px padding and content-driven card height. No fixed-height clipping or horizontal scrolling.
- The heading remains two readable lines from 320 px through desktop. Its minimum small-screen size is 26 px. Card titles are 19 px on mobile and descriptions 14.5 px.
- Small mobile screens omit the background architecture entirely. Cards keep their outlined styling and 46 px icon containers.

The initial 320 px heading wrapped to four lines; screenshot review led to fluid mobile sizing that preserves the two-line composition. The decorative background was also softened at its top edge after reviewing the transition from Section 04.

## Motion and accessibility

The existing shared reveal utility is reused without changing previous sections: a one-time 14 px entrance, 700 ms for the intro and 650 ms for cards, with the shared 90 ms stagger capped at 270 ms. Visible server HTML is the default. Animation failure leaves every heading and paragraph readable.

Fine-pointer desktop hover uses a 3 px card lift, 1 px icon lift and restrained border/lighting changes over 300 ms. An inner surface handles hover independently from the outer article's entrance. There are no loops, transforms driven by cursor tracking, animated layout or permanent `will-change`.

At widths up to 1023 px, on coarse touch-only devices and with reduced motion, entrance movement and hover motion are disabled. Preference/viewport changes cancel active entrance animations. All content also works without JavaScript.

One labelled section, one H2, six labelled articles/H3s and ordinary paragraphs provide the complete meaning. SVGs and decorative icon containers are hidden from assistive technology. Informational cards do not receive `tabindex`, button roles or pointer cursors. Nothing essential is hover-only; no new controls alter keyboard navigation.

## SEO, AEO and GEO

The heading, differentiators and complete descriptions are present in server-rendered HTML. The six topics explain business discovery, tailored development, design/engineering, communication, practical AI and maintainability without keyword stuffing or invented proof. No hidden keyword text, duplicate Organization data, ratings or additional schema was added. Existing canonical, title, metadata, preview noindex, sitemap/robots and navigation are unchanged. This section makes no search ranking or AI citation promises.

## Verification

- Astro build passed; the existing preview continues at `http://127.0.0.1:4321/#why-elevatex`.
- Astro/TypeScript diagnostics across 81 files: **0 errors, 0 warnings, 0 hints**. The build's content loader still reports the existing empty insights directory.
- ESLint and Prettier checks passed.
- The targeted section run passed **23/23 Chrome Playwright checks** with no failures.
- Coverage includes approved server content, section order, semantic headings, no fabricated claims, equal card dimensions/alignment, centered pill, two-line heading, no overflow, static mobile/reduced-motion views, no-JavaScript fallbacks, axe checks at 390 and 1440 px, no fake focus targets, one-time entrance, finite hover/reset, responsive cancellation and failed animation APIs.
- Screenshots and layout checks cover **320, 360, 375, 390, 393, 430, 768, 1024, 1100, 1200, 1280, 1366, 1440, 1536 and 1920 px**. This includes the requested widths and extra checks around the grid breakpoint. All captures reported zero page/console/resource errors and no horizontal overflow.
- Artifacts: `artifacts/why-elevatex-review/`; transition screenshots show continuity from Section 04.
- Full homepage regression: **146/146 Chrome Playwright checks passed** (123 existing plus 23 new section checks). No failed tests remain. Hero, Proof, Services, Featured AI System, metadata/schema, preview crawling, no-JavaScript behavior, internal links, resource loading and existing publishing-helper checks passed. The separate fixture publication build was not rerun because no content collection or routing logic changed.

The new compiled section entry adds **150 bytes gzip of JavaScript**, reusing the existing reveal utility. Total emitted homepage JavaScript is **31,701 bytes gzip**, including the existing desktop-only GSAP chunk. No new raster image, font, remote request, framework or package was introduced.

### Mobile Lighthouse

An isolated run after all browser tests completed measured **96 performance, 100 accessibility and 100 best practices**. FCP: **1.3 s**; LCP: **2.6 s**; total blocking time: **0 ms**; CLS: **0**. Lighthouse reported no run warnings. Reports are `artifacts/why-elevatex-review/mobile-lighthouse.report.json` and `.html`.

These are local simulated mobile measurements, not field Core Web Vitals. The performance-score target is met; LCP remains above the 2.0 s launch target. TBT does not establish INP. SEO scoring was excluded for the intentionally noindex preview; metadata, semantic HTML, schema and links were checked in the regression suite.

### Limits

This revision is checked in installed Chrome. Safari, Firefox, Edge, physical devices and manual screen-reader review have not been rerun for Section 05. These local checks do not establish production readiness. The site's existing content, integrations, migration and launch requirements remain separate stages.
