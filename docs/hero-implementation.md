# Primary hero implementation

Implemented against the locked Image A and Hero Master Prompt received on 2026-10-07. This stage covers the primary hero and its navigation. The existing four-service foundation section remains below it; the rest of the new website is not implemented or deployed.

## Files and architecture

| File                                                                                       | Responsibility                                                                      |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `src/components/hero/Hero.astro`                                                           | Semantic section, progressive enhancement entry, intro overlay, motion control      |
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

Times are relative to healthy animation initialization. The default document already contains the complete final scene.

| Layer                               |  Start | Duration / action                                                                     |
| ----------------------------------- | -----: | ------------------------------------------------------------------------------------- |
| Elevate intro word                  | 0.05 s | 0.28 s fade                                                                           |
| X                                   | 0.28 s | 0.32 s fade and 5 px settle                                                           |
| X highlight                         | 0.48 s | 0.10 s in, 0.10 s out                                                                 |
| Intro overlay                       | 0.60 s | 0.28 s fade out                                                                       |
| Header logo                         | 0.64 s | 0.28 s fade                                                                           |
| Pill, heading, description, actions | 0.78 s | 0.42 s each, 0.09 s stagger, 8 px settle                                              |
| Pedestal                            | 0.98 s | 1.05 s rise; desktop 100 px, mobile 70 px; scaleY 0.95 to 1                           |
| Halo                                | 1.25 s | 1.12 s restrained opacity and SVG arc reveal                                          |
| Rim                                 | 1.55 s | 0.48 s fade                                                                           |
| Reflection                          | 1.55 s | 0.65 s fade                                                                           |
| Laptop                              | 1.72 s | 0.76 s reveal; desktop 44 px, mobile 32 px; scale 0.96 and rotateX 4 degrees to final |

Desktop completes in **2.48 seconds**. Mobile advances the laptop's timeline start to 1.55 seconds and uses a 1.58 speed multiplier, completing in about **1.50 seconds**. The pedestal is substantially settled before the laptop appears. Power easing is used without bounce or perpetual device movement.

The `elevatexIntroSeen=true` session marker suppresses replay after refresh. Denied storage reads or writes skip the entrance. Slow initialization after 1.8 seconds, a hidden tab, or an offscreen hero skips the entrance. A failed GSAP download leaves the static composition intact. A 2.9-second desktop / 2.3-second mobile recovery timer restores the final state if a timeline stalls.

Tab navigation or pointer interaction during the entrance finishes it immediately. No scroll locking, scroll hijacking or input delay is imposed. GSAP changes are reverted at completion; listeners and observers are cleaned up on page swaps. Back-forward cache restoration initializes the appropriate session state.

## Ambient and reduced motion

- Halo opacity: 5.6-second alternating cycle, 0.88 to 1.
- Rim opacity: 5.2-second alternating cycle, offset by 1.6 seconds.
- Smoke: 24, 29 and 28-second cycles with different offsets, at most 8 px horizontally and 4 px vertically.
- The visible Pause motion control freezes CSS animations at their current position; Resume motion continues them. Offscreen or hidden-tab animation is paused automatically.
- Reduced motion receives the final static composition immediately, with no intro or ambient animation. Preference changes while the page is open are handled. The reduced-motion and repeat-session paths do not request GSAP.

## Responsive composition

Desktop uses a centered two-line display headline, side-by-side CTAs, four restrained studio lights and a stage capped at 1600 px. Hero height is clamped between 760 and 980 px. The tablet composition tightens the gap between content and stage and uses the native menu below 1024 px.

Below 768 px the headline has four deliberate lines, both CTAs stack with 53 px touch targets, and artwork follows the content. Laptop, halo and pedestal widths are approximately 88, 95 and 104 vw. Outer pedestal crop is intentional; horizontal document scrolling is prevented. Fog and reflections are reduced and foreground smoke is hidden. A short phone viewport can scroll normally to reveal the whole scene.

## Delivery budget

All three critical Latin WOFF2 files total **130,108 bytes**. Their licenses are retained beside them. Font fallback metrics and fixed image dimensions reserve layout space. Critical CSS is inlined by Astro to remove two render-blocking stylesheet round trips in the local audit.

The hero module plus GSAP is about **29.2 KB gzip**, with roughly **0.45 KB gzip** of inline navigation code. The initial homepage remains below the 120 KB gzip JavaScript budget and hero motion below 60 KB. These are encoded JavaScript sizes, not total page weight.

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

## Remaining differences and launch work

The laptop and stone are reconstructed artwork. Camera notch, screen artwork, mineral veins, smoke and floor reflections differ from Image A; Bodoni Moda has its own letterforms. Lighting is composed from CSS/SVG, so photographic diffusion is an approximation. Original separated artwork or original 3D camera/material files would be needed for pixel-identical reconstruction. No unverified result statistic from the reference is included.

The full destination pages, verified proof, booking/form delivery, analytics/privacy decisions, migration mappings and production launch QA remain separate stages. About temporarily opens the current agency overview. Preview is deliberately noindex and has an empty sitemap. No live hostname, DNS, existing website content or permanent production redirects were changed.

Physical devices, real Safari and manual screen-reader review remain required before launch. Local lab scores are not field Core Web Vitals, and a passing build does not establish production readiness.
