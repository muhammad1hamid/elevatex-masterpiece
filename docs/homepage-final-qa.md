# Homepage final QA and production polish

Audit date: 2026-10-11. Scope: the existing homepage, local implementation only.
No new inner pages, section reordering, deployment, or GitHub changes.

## Initial audit, before source changes

The homepage contains Hero, Proof & Selected Work, Core Services, Inside the
Build, Why ElevateX, Process, Founder, Insights, FAQ, Final CTA, and Footer in
the approved order. One H1 and a logical H2/H3 hierarchy are server rendered.

| Priority                | Finding                                                                                                                            | Action                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Critical launch blocker | Work/About/Contact/Services route handoffs are preview-only. Primary conversion would have no destination in the production build. | Preserve honest preview handoffs; require real routes and contact delivery before cutover. No inner pages in this task. |
| High                    | Hero cover can run on direct section links and restored scroll positions. Scroll intent does not dismiss it.                       | Skip the cover away from the top and let scroll intent reveal content immediately. Preserve approved entrance timing.   |
| High                    | Homepage title describes the slogan without naming the commercial offering; OG/Twitter image is absent.                            | Centralize a commercial title/description and a lightweight branded social image.                                       |
| Medium                  | Mobile logo is only 28–30px high; short navigation/footer labels have narrow hit areas.                                            | Reserve at least 44×44px for interactive targets.                                                                       |
| Medium                  | FAQ capabilities overflow at 200% text on a 390px viewport.                                                                        | Let capability columns respond to text size.                                                                            |
| Medium                  | Launch process image changes frame aspect ratio, shifting the sticky caption.                                                      | Keep one stable frame and contain the wide launch image.                                                                |
| Medium                  | Insights expands to 90rem while most content uses 80rem; repeated spacing/radius/border/timing values drift.                       | Align outer containers and centralize reusable tokens while retaining deliberate heading and composition differences.   |
| Medium                  | Missing animation APIs or interrupted setup can leave observer/trigger cleanup incomplete.                                         | Add fail-open guards and lifecycle cleanup.                                                                             |
| Medium                  | Mobile Lighthouse baseline performance is 88 with LCP 3.16s; the local server does not compress text.                              | Optimize measured assets, then measure a completed build with compression documented.                                   |
| Low                     | An unused Bodoni normal font remains in shipped public assets; process images have one size/format.                                | Remove confirmed unused delivery assets and add responsive process formats, preserving source art.                      |

Baseline browser inspection covered 320–2560px, including short desktop and
tablet screens. Normal text has no page overflow. Closed native mobile-menu
children have misleading bounding rectangles, but are correctly hidden and the
opened menu fits; these are not real overflow findings. Chrome reported zero
WCAG-tagged axe violations and no failed resources or page errors in checked
flows. Firefox and WebKit executables are not installed.

Motion uses CSS, the native Web Animations API, and deferred GSAP/ScrollTrigger;
there are no hydrated SPA islands, scroll hijacking, or forced snapping. Mobile
and reduced motion are deliberately static. The staged hero, explicit workflow
demo, and Golden Thread remain the strongest motion moments.

SEO canonical is consistently `https://www.elevatexlab.com/`, matching the
documented migration decision. Preview meta/headers are noindex and its sitemap
is empty by design. Schema is centralized and escaped; Organization, WebSite,
WebPage and the verified Hamid founder relationship do not contain invented
ratings, addresses, prices, awards, or contacts.

Hero/services answer what ElevateX does, Process explains the approach, and
FAQ answers audience, scope, AI integrations and next steps. The main AEO gap is
the incomplete contact destination. GEO foundations include crawlable copy,
consistent entities, demo classifications and useful internal anchors; stronger
first-party evidence and published authored insights still need real content.

The three portfolio examples are explicitly concepts. The restaurant workflow
is an illustrative product demo with fictional data, not a live backend. The
three insight cards are in development, without invented dates, reading times,
or public article routes. No numerical business outcome is represented as fact.

Four dedicated service pages, Privacy and Terms are absent. Work/About/Contact
are preview handoffs. Insights is a real archive with no published articles.
Migration mapping and production hostname/crawler choices remain cutover work.
Analytics is disabled, and no third-party tracking or functioning form is added.

## Final implementation and validation

Final review date: **2026-10-12**. Verdict: **NOT READY for production cutover**.
The homepage polish is complete for local review. Production destinations,
contact delivery, migration decisions and launch approval remain outstanding.

### 1. Files changed in this QA stage

The workspace also contains the preceding homepage implementation. This list
describes this QA stage, rather than attributing every uncommitted file to it.
Paths below are relative to `D:\ElevateX`.

| Area                        | Files                                                                                                                                                                                                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project scope               | `AGENTS.md`                                                                                                                                                                                                                                                                       |
| Design and responsive CSS   | `src/styles/tokens.css`, `typography.css`, `global.css`, `header.css`, `hero.css`, `proof.css`, `services.css`, `featured-system.css`, `why-elevatex.css`, `process-section.css`, `founder-section.css`, `insights-section.css`, `faq-section.css`, `final-cta.css`, `footer.css` |
| Motion and lifecycle        | `src/components/hero/HeroBoot.astro`, `src/scripts/animations/hero-intro.ts`, `process-scroll.ts`, `section-reveal.ts`; removed the confirmed unused `motion.ts`                                                                                                                  |
| Responsive artwork delivery | `src/components/hero/HeroScene.astro`, `src/components/process/ProcessVisual.astro`, `public/images/hero/smoke-medium.webp`, the fifteen process AVIF/WebP derivatives under `public/images/process/`                                                                             |
| Search/social metadata      | `src/data/site.ts`, `src/utils/seo.ts`, `src/pages/index.astro`, `public/images/social/elevatex-homepage.png`                                                                                                                                                                     |
| Disabled analytics boundary | `src/scripts/analytics.ts`                                                                                                                                                                                                                                                        |
| Regression checks           | `tests/foundation.spec.ts`, `hero-motion.spec.ts`, `process.spec.ts`, `faq.spec.ts`, `insights.spec.ts`, new `homepage-qa.spec.ts`                                                                                                                                                |
| Asset documentation/tools   | `scripts/optimize-homepage-assets.mjs`, `docs/homepage-asset-manifest.json`, `hero-assets.md`, `process-implementation.md`; archived the unused normal Bodoni font in `docs/font-assets/` with a README                                                                           |
| Final report                | `docs/homepage-final-qa.md`                                                                                                                                                                                                                                                       |

Local capture, measurement and compressed-preview helpers are ignored artifacts
under `artifacts/homepage-qa/`. They are not production hosting configuration.

### 2. Design system

- Centralized reusable section spacing, radii, quiet/default/accent borders,
  eyebrow sizes, action heights and motion durations. Deliberate heading scale
  and section composition differences remain.
- Aligned the Insights and Inside the Build outer containers with the shared
  80rem content boundary.
- Kept Outfit headings, Instrument Sans body text and the Bodoni italic hero
  accent. No new runtime font or animation library was introduced.
- Removed unused legacy foundation/navigation CSS and the unreferenced motion
  module. Approved artwork and the eleven-part sequence remain intact.

### 3. Responsive fixes

- Header uses its available width relative to text size to choose its menu
  composition. Hero top clearance also accounts for larger root text.
- FAQ capabilities retain four columns on normal desktop and two on narrow
  mobile, then reflow when text needs more room. A regression assertion protects
  the desktop row at 1101, 1280, 1366, 1440, 1536 and 1920px.
- Narrow-screen CTA labels can wrap inside their available width. FAQ contact
  padding/gaps and final CTA width no longer force enlarged-text overflow.
- Mobile process indentation is capped by viewport width; thread nodes retain
  their alignment. Long words wrap rather than extending the page.
- The fifth process image uses the same square frame as the other stages;
  its wide composition is contained, avoiding a sticky caption jump.

### 4. Motion fixes

- Direct section links and restored scroll positions bypass the hero cover.
  Scroll input, keyboard intent and Skip can recover the page even if modules
  fail. Approved entrance duration and the 6.5s recovery watchdog are unchanged.
- Missing IntersectionObserver support leaves the complete hero visible.
  Process setup failures remove partial observers/triggers and restore its
  static state. ResizeObserver has a fallback.
- Shared section reveals clean up before navigation and resume unseen content
  after a persisted page return. Desktop process state remains synchronized in
  both scroll directions, after fast jumps and during resize.
- Smoke movement and restrained continuous glow were verified. Mobile,
  touch-only and reduced-motion presentations remain static; replay/pause
  controls were not reintroduced. No scroll hijacking was added.

### 5. Accessibility

Navigation logo, menu and footer links reserve at least 44×44px. Native menu and
FAQ keyboard behavior, Escape focus recovery, skip navigation, visible focus and
server-rendered answers were checked. The root-text enlargement test now passes
at 320, 390, 768 and 1024px without page overflow.

That test changes the root font size to 200%; hero px/vw type does not double.
It is a reflow regression check, not a physical browser text-zoom test or a
blanket WCAG certification. Final WCAG-tagged axe scans reported zero violations
in the checked page/section states. Manual screen-reader QA remains outstanding.

### 6. Performance optimizations

| Asset                                        | Before                        | After                      | Meaning                                                              |
| -------------------------------------------- | ----------------------------- | -------------------------- | -------------------------------------------------------------------- |
| Mobile-selected smoke                        | 47,330 B                      | 29,336 B                   | 38.0% smaller candidate with the same approved image                 |
| Five process images, smaller candidates      | 327,442 B original full WebPs | 95,556 B total 620px AVIFs | 70.8% smaller set when these candidates are selected                 |
| Five process images, full candidates         | 327,442 B original WebPs      | 248,856 B full AVIFs       | 24.0% smaller set for high-density selection                         |
| Unused Bodoni normal font in public delivery | 46,260 B                      | 0 B                        | Archived outside public assets; it was not requested by the homepage |

Native responsive sources retain explicit dimensions, lazy loading and WebP
fallbacks. Mobile omits decorative process visuals. The metadata-only social PNG
is 1200×630 and 153,648 B; it is not rendered as a homepage image.

Final emitted JavaScript totals **51,671 B gzip** across all chunks, including
deferred GSAP/ScrollTrigger. Excluding those two deferred libraries it is
**7,063 B gzip**. These are compressed file-size estimates, below the project's
120KB homepage budget, not production transfer measurements. No SPA hydration,
WebGL, video, tracker or extra runtime dependency was added.

HTML grew from 159,574 to 163,892 B (gzip estimate 32,613 to 33,273 B), primarily
because native responsive picture markup and recovery behavior were added.
This tradeoff is recorded rather than claiming every byte became smaller.

### 7. SEO implementation

- One visible H1: **Premium Digital Systems For Serious Growth.**
- Title: **ElevateX — Web Development, AI Automation & Chatbots**.
- Description: **ElevateX builds premium websites, landing pages, AI automation
  systems, and chatbots that help businesses communicate clearly and simplify
  everyday workflows.**
- Canonical: **https://www.elevatexlab.com/**, retaining the documented host
  decision pending cutover reconciliation.
- Absolute OG/Twitter image URLs, alt text and dimensions; WebPage metadata
  matches the HTML. Social PNG status, type and real dimensions were tested.
- Preview remains noindex. Its empty sitemap is deliberate. The production
  homepage indexing gate remains closed until launch approval.
- Existing escaped Organization/WebSite/WebPage schema describes visible facts.
  Drafts, scheduled articles, templates and concept showcases cannot create
  public article/case-study routes or sitemap entries.

### 8–9. AEO and GEO/entity review

Hero and service definitions identify the offering; process stages explain the
approach; ten direct FAQ answers address fit, scope, platforms, timing/cost
factors and handoff. Responsive/keyboard fixes keep these real HTML answers
usable. No speculative answer block or keyword stuffing was added.

ElevateX and Hamid's verified founder relationship agree across visible content
and schema. Concepts, fictional workflow data and planned editorial content
remain explicitly classified. No invented authority, citation promise, rating,
client result or location was introduced. Real contact delivery, authored
articles and first-party evidence remain the meaningful next improvements.

### 10. Links and routes

| Destination                      | Verified local behavior                            | Production implication                                                              |
| -------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `/`                              | 200, complete homepage                             | Still gated from indexing                                                           |
| `/services/`                     | 200 preview handoff to `/#services`                | Real service hub not built                                                          |
| `/work/`, `/about/`, `/contact/` | 200 preview handoff documents to live-site anchors | These routes are omitted from production output; must be implemented before cutover |
| `/insights/`                     | 200, honest empty archive                          | No published articles yet                                                           |
| Four service detail routes       | 404; footer uses working homepage service anchors  | Future implementation                                                               |
| `/privacy/`, `/terms/`           | 404 and omitted from footer                        | Real legal content needed before launch                                             |
| Deliberately missing URL         | Actual 404 with branded error page                 | Correct status behavior                                                             |
| All three external concept demos | HTTP 200 when checked                              | External availability is a point-in-time check                                      |

Service anchors resolve to actual heading IDs. Primary conversion links use the
approved `/contact/` destination. A successful preview handoff is not treated as
a completed production conversion path.

### 11. Claims and integrations

No unsupported HTML/schema claim required removal in this pass. The three
selected projects remain concepts; the ordering system remains a fictional
product demonstration; Insights cards remain articles in development without
fabricated dates, read times or article URLs. Generated illustration/interface
pixels are illustrative, not verified business evidence.

Analytics remains disabled. The typed event boundary was extended for the
suggested journeys, without wiring tracking or sending personal data. No real
form, newsletter, booking integration, contact detail or social profile was
invented.

### 12–13. Tests and actual results

| Check                                | Result                                                                                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro static build                   | Pass, seven preview pages; existing empty Insights collection loader notice                                                                                                                          |
| Astro/TypeScript                     | 0 errors, 0 warnings, 0 hints across 117 files                                                                                                                                                       |
| ESLint / Prettier / diff whitespace  | Pass                                                                                                                                                                                                 |
| Publication integration build        | Pass; production/preview route gates, draft/scheduled exclusions, genuine case-study publication, sitemap dates and crawler policy verified in isolated build output                                 |
| Full Chrome + Edge regression        | Initial 460 checks: 455 passed, five failed. Failures were the enlarged-text process overflow in both browsers and two test assumptions (Skip versus watchdog timing, responsive image naturalWidth) |
| Affected hero/process/homepage rerun | **84/84 passed** after the fixes, in 2.5 minutes                                                                                                                                                     |
| Final FAQ + homepage rerun           | **18/18 passed** after the final FAQ adjustment, in 1.1 minutes                                                                                                                                      |
| Final page geometry                  | No horizontal page overflow at all sixteen checked widths from 320 to 2560px                                                                                                                         |
| Final resources/runtime/axe          | Zero failed resources, page errors, console errors or WCAG-tagged axe violations in the final review                                                                                                 |
| Final image checks                   | All visible images loaded/decoded and dimensions reserved at 390, 768, 1366, 1440 and 1920px                                                                                                         |

The affected reruns resolve all five initial failures. This is a full regression
plus focused reruns, not a claim of one final 460-test clean run. One attempted
rerun was stopped when the previous local server was unavailable; it was
restarted before the passing runs above.

Final Insights image-load/frame checks plus homepage reflow: **28/28 passed**
in Chrome and Edge in 47.2 seconds. These strengthened checks wait for decode
and compare each image with its reserved frame. The original approved Insight
styling was retained after a sizing experiment did not change a screenshot-only
paint omission.

Coverage includes no-JS content, reduced motion, mobile/touch static behavior,
keyboard operation, failed animation modules/APIs, hash/restored scroll,
forward/reverse process updates, resizing, metadata/schema, native FAQ,
404/routes, image delays and draft publication.

Final geometry matrix: 320, 360, 375, 390, 393, 430, 768, 820, 1024, 1280, 1366,
1440, 1536, 1728, 1920 and 2560px. Short-desktop and enlarged-text cases are
covered by the section tests. Chrome and Edge were available; Firefox/WebKit
executables were absent, so Firefox and Safari were not run.

Visual review captures:
`artifacts/homepage-qa/final-stitched-{390,768,1366,1440,1920}.png`.
These combine eleven individual browser section screenshots at each width;
the original section images are saved as `section-{width}-{section}.png`.
Raw full-page Chromium screenshots occasionally omitted the offscreen featured
Insight raster despite successful loading and decode, so section captures are
the visual evidence. No source artwork or product styling was altered for this
workaround. Aggregate resource, geometry and accessibility evidence:
`artifacts/homepage-qa/final-review.json`; capture provenance:
`artifacts/homepage-qa/section-captures.json`.

### 14. Lighthouse measurements

Lighthouse 13.5.0, installed Chrome, default simulated mobile settings
(412×823, 4× CPU). Each row is a local lab run, not production or field data.

| Build / serving mode              | Performance | Accessibility | Best practices | SEO | FCP   | LCP   | TBT   | CLS | Transfer  |
| --------------------------------- | ----------- | ------------- | -------------- | --- | ----- | ----- | ----- | --- | --------- |
| Baseline, uncompressed 4321       | 88          | 100           | 100            | 69  | 2.37s | 3.16s | 102ms | 0   | 473,676 B |
| Final, uncompressed 4321          | 89          | 100           | 100            | 69  | 2.02s | 3.16s | 29ms  | 0   | 460,632 B |
| Same final build, compressed 4322 | 97          | 100           | 100            | 69  | 1.29s | 2.57s | 0ms   | 0   | 321,763 B |

The final uncompressed mobile image resources fell from 178,607 to 160,613 B,
exactly the smaller smoke candidate's saving. Serving the same final build with
text compression reduces overall transfer by a further 138,869 B (30.15%).
This server-level gain is separate from source asset optimization. The 4322
helper also uses HTML revalidation/asset caching; 4321 remains an uncompressed,
no-store local preview. Neither helper configures production hosting.

SEO's only failed audit is `is-crawlable`, because preview noindex is intentional.
No indexing controls were removed to raise a score. Final runs had no Lighthouse
warnings; baseline had a host CPU warning. Host calibration varied materially
(benchmark about 679 baseline, 1179 final uncompressed and 1716 final compressed),
so TBT/score changes are not attributed entirely to source changes.

**The 2.0s LCP target remains unmet.** The hero laptop is the measured LCP element;
its eager initial-HTML discovery/high fetch priority checks pass. The trace shows
render delay rather than a large laptop download as the dominant component.
The compressed local run exceeds the performance-score target and both final
runs have CLS 0, but this does not establish deployed-host performance or field
INP. TBT is not INP. Recheck representative production delivery and devices at
launch without compromising the approved design merely for a score.

Reports: `artifacts/homepage-qa/mobile-baseline.report.html`,
`mobile-final-uncompressed.report.html`, `mobile-final-compressed.report.html`;
machine-readable JSON files accompany each. Asset-size evidence:
`artifacts/homepage-qa/footprint-final.json`.

### 15–17. Remaining issues, owner input and readiness

**Verdict: NOT READY for production cutover.** Local homepage review can proceed.
The responsive, motion, source-quality and available-browser checks pass; a
production launch needs the following work and decisions:

1. Implement the real service hub, Work, About and Contact destinations in the
   separately authorized inner-page phase. Confirm real contact/booking delivery
   and abuse controls before showing a functioning form.
2. Complete migration mappings using the existing indexed URL/search/backlink
   inventory; reconcile the canonical host and redirects, then explicitly approve
   indexing. No blanket homepage redirects or indexing-gate removal were made.
3. Approve genuine legal content and confirm any analytics identifiers/privacy
   choices and GPTBot access policy. Analytics integration is still disabled.
4. Supply approved authored Insights with actual dates/sources and case-study
   evidence when available. Concepts must remain concepts. Unavailable proof
   should be omitted from launch, rather than fabricated.
5. Complete Firefox/Safari, physical-device, screen-reader and actual browser
   text-zoom QA; measure the deployed production host and representative field
   interactions. Local Lighthouse does not establish field INP or readiness.
   The 2.0s LCP target also remains open.

No GitHub commit, push, deployment or production cutover was performed.
