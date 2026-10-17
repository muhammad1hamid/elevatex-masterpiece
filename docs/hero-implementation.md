# Primary hero implementation

Implemented against the locked Image A and Hero Master Prompt received on 2026-10-07. This stage covers the primary hero and its navigation. The existing four-service foundation section remains below it; the rest of the new website is not implemented or deployed.

## Current mobile and controls revision — 2026-10-08

At the user's request, Replay entrance and Pause/Enable motion controls have been removed entirely. Mobile/tablet viewports up to 1023 px and devices with a coarse pointer and no hover render a static hero immediately: no intro cover, no GSAP download, no continuous effects or UI transitions. Resizing an active desktop entrance into this range cancels it and restores the complete scene. Reduced-motion preferences continue to receive the static version on desktop. Desktop retains the intro and ambient effects, with halo glow reduced from a peak opacity of 1 to 0.65 and the rim peak reduced to 0.82. The static halo glow is 0.38.

Chrome regression suite: **61/61 passed**, including five mobile widths, absence of motion-library downloads, removed controls and cancellation on resize. All changes remain local; nothing was committed or pushed to GitHub. Earlier revision notes below record superseded behavior and measurements.

Latest isolated Lighthouse mobile run: performance **95**, accessibility **100**, best practices **100**; LCP **2.1 s**, total blocking time **10 ms**, CLS **0**. This is a local simulated mobile measurement, not production or field data; LCP remains slightly above the 2.0 s target. Reports: `artifacts/hero-lighthouse/mobile-static.report.json` and `.html`. Astro build, TypeScript, lint and formatting passed; six responsive captures completed without page/resource errors. The latest 61-test run used Chrome; Edge was not rerun for this revision.

## Files and architecture

| File                                                                                       | Responsibility                                                                      |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `src/components/hero/Hero.astro`                                                           | Semantic section and progressive enhancement entry                                  |
| `HeroBoot.astro`, `HeroIntro.astro`, `src/data/hero-motion.ts`                             | First-paint guard, full-viewport logo intro and shared session version              |
| `HeroContent.astro`                                                                        | Exact live HTML headline, proposition, service pill and two real CTA links          |
| `HeroScene.astro`                                                                          | Independent laptop, pedestal, floor, smoke, reflection and rim layers               |
| `HeroHalo.astro`                                                                           | Lightweight SVG arc and static diffusion filter                                     |
| `src/styles/hero.css`                                                                      | Composition, breakpoints, lighting, CSS ambient motion and reduced-motion state     |
| `src/scripts/animations/hero-intro.ts`                                                     | Lazy GSAP entrance, session behavior, cleanup and failure recovery                  |
| `src/components/global/Header.astro`, `src/styles/header.css`, `src/scripts/navigation.ts` | Desktop navigation and native mobile disclosure with keyboard support               |
| `src/styles/fonts.css`, `public/fonts/`                                                    | Self-hosted Bodoni Moda normal/italic and Instrument Sans, with OFL licenses        |
| `src/pages/index.astro`, `src/layouts/BaseLayout.astro`                                    | Hero assembly, critical font preloads, existing SEO helpers and SVG favicon         |
| `src/pages/[destination].astro`, `scripts/write-hosting-headers.mjs`                       | Temporary preview navigation; see the separate navigation document                  |
| `scripts/optimize-hero-assets.mjs`, `docs/hero-assets/`                                    | Selected generated source artwork, exact prompts, reproducible exports and manifest |
| `tests/hero.spec.ts`, `scripts/capture-hero.mjs`                                           | Interaction/failure checks and six reproducible visual captures                     |

No React island, canvas, WebGL, autoplay video or external font/image service is used. The reference screenshot is not served. Primary content is selectable HTML; decorative images have empty alternative text inside an aria-hidden scene. The laptop screen is decorative concept artwork, not a client case study or embedded interaction. The secondary CTA uses an arrow, because it opens work rather than playing a video.

## Entrance timing

Times are relative to healthy animation initialization. The default document contains the complete final scene. Following the user's 2026-10-08 request, eligible first-session JavaScript visits use an opaque cover before the first paint, then reveal the site after the logo sequence. No-JavaScript, reduced-motion and blocked-storage visits render the final page directly.

| Layer                               |  Start | Duration / action                                                                     |
| ----------------------------------- | -----: | ------------------------------------------------------------------------------------- |
| Elevate intro word                  | 0.12 s | 0.70 s fade and 12 px rise                                                            |
| X                                   | 0.55 s | 0.70 s fade and 8 px horizontal settle                                                |
| Gold signature line                 | 0.55 s | 0.95 s expansion beneath the wordmark                                                 |
| X highlight                         | 0.95 s | 0.70 s warm light sweep                                                               |
| Intro overlay and header logo       | 1.65 s | 0.65 s crossfade; website becomes visible, cover removed at 2.30 s                    |
| Pill, heading, description, actions | 1.75 s | 0.65 s each, 0.10 s stagger, 8 px settle                                              |
| Pedestal                            | 1.85 s | 1.25 s rise; desktop 100 px, mobile 70 px; scaleY 0.95 to 1                           |
| Halo                                | 2.30 s | 1.20 s restrained opacity and SVG arc reveal                                          |
| Rim and reflection                  | 2.60 s | 0.80 s fade                                                                           |
| Laptop                              | 2.95 s | 1.10 s reveal; desktop 44 px, mobile 32 px; scale 0.96 and rotateX 4 degrees to final |

Desktop completes in **4.05 seconds**. Mobile/tablet and touch-only devices skip the entire sequence and render the final scene immediately. The pedestal is substantially settled before the desktop laptop reveal. Power easing is used without bounce or perpetual device movement. The desktop first-visit cover delays visual access to the page; this is a tradeoff explicitly requested by the user, not a performance improvement.

The versioned `elevatexIntroSeen:v2=true` marker suppresses the full logo intro after refresh. Returning visits receive a **0.85-second** scene entrance. Denied storage reads or writes skip the entrance. A 1.8-second runtime-loading watchdog reveals the page if GSAP is delayed; an independent 6.5-second inline guard reveals it even if every module fails. Background loads defer the entrance until visible; the session is marked seen only when the full sequence starts. A failed GSAP download preserves continuous CSS ambience. Recovery timers restore the final state after 4.6 seconds on desktop, 4.1 seconds on mobile, or 1.4 seconds for a returning visit. Skip intro, Tab, Escape or pointer interaction can bypass the sequence.

Replay and Pause/Enable controls are removed from all builds. Ordinary desktop refresh uses the short entrance; mobile refresh remains static. Pending starts are cancelled when superseded, interrupted or resized into a static layout. Skip intro remains available during the desktop cover.

Tab navigation or pointer interaction during the entrance finishes it immediately. No scroll locking, scroll hijacking or input delay is imposed. GSAP changes are reverted at completion; listeners and observers are cleaned up on page swaps. Back-forward cache restoration initializes the appropriate session state.

## Ambient and reduced motion

- Desktop halo: constant gold core plus an independent glow SVG. Only the glow container's opacity animates, 0.18 to 0.65 over a 3.8-second alternating half-cycle, with a 1.2-second phase offset. Diffusion radius stays fixed.
- Desktop rim opacity: 0.55 to 0.82 over a 4.8-second alternating half-cycle, offset by 1.6 seconds.
- Smoke: 12, 16 and 19-second alternating half-cycles with different offsets; desktop drift is ±24 px horizontally, 10 px vertically, with 5.5% scale variation. Mobile uses ±12 px and 6 px. Texture opacity is stronger but remains below 0.5; foreground smoke remains quiet and is hidden on mobile.
- Offscreen or hidden-tab desktop animation pauses automatically. Mobile/tablet has no active animation.
- Reduced motion receives the final static composition immediately, without downloading GSAP. There is no manual motion override. Desktop repeat visits use GSAP for the short entrance; mobile/tablet visits do not request it or consume the intro session marker.

## Responsive composition

Desktop uses a centered two-line display headline, side-by-side CTAs, four restrained studio lights and a stage capped at 1600 px. Hero minimum height is clamped between 760 and 980 px, but content can grow safely. The stage follows the copy in normal flow and has a width-derived height. Laptop contact and halo endpoints share the platform's base and intrinsic height, so changing viewport height cannot separate the objects. The rim's rear half sits behind the stone rather than drawing across its front. The tablet composition uses the native menu below 1024 px.

Below 768 px the headline has four deliberate lines, both CTAs stack with 53 px touch targets, and artwork follows the content. Laptop, halo and pedestal widths are approximately 84, 92 and 96 vw. The stone itself fits inside the viewport; the glow may extend to the edge. Fog and reflections are reduced and foreground smoke is hidden. A short phone viewport can scroll normally to reveal the whole scene.

## Delivery budget

All three critical Latin WOFF2 files total **130,108 bytes**. Their licenses are retained beside them. Font fallback metrics and fixed image dimensions reserve layout space. Critical CSS is inlined by Astro to remove two render-blocking stylesheet round trips in the local audit.

The current hero module plus GSAP totals **29,763 bytes gzip (29.1 KiB)**, plus the small inline first-paint guard and navigation handler. The initial homepage remains below the 120 KB gzip JavaScript budget and hero motion below 60 KB. These are encoded JavaScript sizes, not total page weight. Continuous effects use CSS transform/opacity and fixed SVG diffusion; no runtime image generation, new animation library or permanent GSAP loop was added.

See [hero artwork](hero-assets.md) and its manifest for exact image dimensions, format sizes, prompts and reconstruction limitations. The largest AVIF scene is about **168 KiB**, or **291 KiB** using WebP; the smallest responsive selection is about **60 / 99 KiB**. Device pixel ratio can select larger candidates. All selections fit the approved raster budgets.

## Verification

The initial complete Chrome run passed **40/40** checks, including Playwright and axe across 320, 375, 390, 393, 430, 768, 1024, 1280, 1440, 1920 and 2560 px. It covered semantic copy, heading/schema/metadata, links, console/resource errors, touch targets, keyboard navigation, JavaScript disabled, script-download failure, storage read/write denial, first/repeat session timing, pause/resume, runtime reduced motion and offscreen suspension. Astro/TypeScript, ESLint, Prettier, static build and the production publication fixture also passed.

Final performance and browser results are recorded below after the last visual/performance refinements. Local reports and screenshots live in the ignored `artifacts/` directory. Run `node scripts/capture-hero.mjs` after `npm run build` to regenerate six hero and viewport screenshots; it starts a loopback preview if none exists.

### Final measurements

Final local checks on 2026-10-07: **40/40 Chrome and 40/40 Edge tests passed**, together with the complete type/lint/format/publication/build pipeline. Both browser channels used the same Playwright suite. The six final screenshot captures reported no page or resource errors.

Lighthouse 13.5.0, default simulated mobile profile against the loopback Astro preview:

| Measurement              |                             Result |
| ------------------------ | ---------------------------------: |
| Performance              |                                 93 |
| Accessibility            |                                100 |
| Best practices           |                                100 |
| SEO                      | 66 — intentionally noindex preview |
| First contentful paint   |                              1.2 s |
| Largest contentful paint |                              2.4 s |
| Total blocking time      |                             120 ms |
| Cumulative layout shift  |                                  0 |
| Speed Index              |                              5.1 s |

Reports: `artifacts/hero-lighthouse/mobile-final.report.html` and `.json`. The first audit identified a missing favicon and a stretched pedestal aspect ratio; both were corrected and the final audit passes those checks. The measured LCP remains above the 2.0-second stretch target. Preserve the entrance/design tradeoff in any further tuning and remeasure on the actual host. TBT is a lab measurement, not a measured INP claim.

Local Firefox/WebKit installation was attempted but the browser CDNs timed out across all retries, so those engines were not verified locally. The GitHub quality workflow now installs and runs Chromium, Firefox and WebKit; inspect the workflow run for its independent result. Playwright WebKit does not replace testing real Safari. Production caching, real network/device behavior, manual screen-reader review and field Core Web Vitals remain unverified.

The initial GitHub run passed Chromium and both additional engines, but one WebKit entrance-sampling check needed a retry. That sequence check now advances Playwright's controlled clock while preserving the platform-before-laptop assertions. CI also fails on flaky tests, so a retry can no longer turn an intermittent check into a successful quality gate. Real-time fallback, pause and reduced-motion checks remain separate.

## Remaining differences and launch work

### Slower introduction and continuous effects — 2026-10-08

The user requested stronger visible smoke movement, continuous gold glow, and a slower logo sequence before the website appears. The current timing and control behavior above implement that revision. The gold core stays stable while a separate glow layer pulses. Smoke travels visibly over a few seconds. Reduced motion remains static by default, with an explicit Enable motion option; a previously broad global reduced-motion rule was scoped so that this deliberate opt-in can work without changing the rest of the page's preference behavior.

Current local Lighthouse 13.5 mobile audit, with simultaneous browser tests stopped: **performance 91, accessibility 100, best practices 100, LCP 2.4 s, TBT 220 ms, CLS 0**. Report: `artifacts/hero-lighthouse/motion-v2-final.report.html`. An earlier run during competing browser checks scored 80 and is retained as `motion-v2.report.html`; the isolated run reduces that source of measurement noise. LCP still exceeds the 2.0 s internal target. TBT is not measured INP, and these are local lab results rather than field data. The intentionally longer first-visit cover is a visual-delay tradeoff.

The expanded checks cover first-paint concealment, website reveal order, continuous computed smoke movement and glow change, runtime failure recovery, Skip intro, reduced-motion opt-in, pause/resume, responsive alignment and no-JavaScript rendering. **57/57 Chrome and 57/57 Edge checks passed**, along with TypeScript, lint, formatting, build and the publication fixture. Firefox, WebKit and physical devices were not rerun for this revision. This revision remains local and unpublished.

### Local animation and alignment revision — 2026-10-08

The previous implementation skipped all entrance motion on repeat visits, measured its initialization deadline from navigation start, and marked an unseen background visit as seen. Those paths now preserve the first entrance and provide the intended short returning-visit animation. Preview replay makes the full sequence reviewable without clearing storage.

Geometry checks now cover laptop/platform contact and content separation at ten viewport sizes from 320 to 2560 px, including a 1366×600 window. Current screenshots and sampled entrance frames are in `artifacts/hero-review/`. The Lighthouse numbers above belong to the 2026-10-07 build and have not been remeasured for this revision. Changes in this revision are local only, as requested; no GitHub updates or deployment were made.

Local verification: 53/53 Chrome and 53/53 Edge checks passed, including the new repeat entrance, replay, delayed document response, background visibility and shared scene geometry checks. TypeScript, lint, formatting, static build and the publication fixture passed. Six screenshot sizes and five sampled entrance frames were visually reviewed. The production fixture confirms the replay button is absent from production HTML. Firefox, WebKit, physical devices and Lighthouse were not rerun for this local revision.

The laptop and stone are reconstructed artwork. Camera notch, screen artwork, mineral veins, smoke and floor reflections differ from Image A; Bodoni Moda has its own letterforms. Lighting is composed from CSS/SVG, so photographic diffusion is an approximation. Original separated artwork or original 3D camera/material files would be needed for pixel-identical reconstruction. No unverified result statistic from the reference is included.

The full destination pages, verified proof, booking/form delivery, analytics/privacy decisions, migration mappings and production launch QA remain separate stages. About temporarily opens the current agency overview. Preview is deliberately noindex and has an empty sitemap. No live hostname, DNS, existing website content or permanent production redirects were changed.

Physical devices, real Safari and manual screen-reader review remain required before launch. Local lab scores are not field Core Web Vitals, and a passing build does not establish production readiness.
