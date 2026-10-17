# Section 06 — The Golden Thread

Implemented locally on 2026-10-10 from Master Prompt #6. Follows Why ElevateX. Previous section presentation and hero choreography were not edited. No Section 07, new route, GitHub write, commit, push or deployment.

## Composition and content

- Centered “How we work / 06” introduction and “From an idea. To something real.” H2, using existing Outfit and Instrument Sans tokens.
- Desktop: asymmetric two-column composition, native CSS sticky presentation on the left, five real editorial chapters on the right. No cards, JavaScript pinning, snap scrolling or artificial viewport scenes.
- Discover, Strategize, Design, Develop and Launch & Evolve use the supplied descriptions, supporting considerations and outcome labels. A visible scope note explains that stages adapt to the project.
- All five stages use the supplied Discover, Strategize, Design, Develop and Launch & Evolve images, optimized as WebP files with their source aspect ratios preserved.
- One thin champagne thread connects chapter nodes. The moving pearl point and drawn stroke follow native scroll position. Decorative numbers and visuals are hidden from assistive technology.
- Bottom CTA: “Have something in mind?” / “Let’s Build It” points to the existing `/contact/` preview handoff. No contact form or new delivery integration was introduced.

## Files

| File                                                                                    | Responsibility                                                   |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/components/sections/ProcessSection.astro`                                          | Section, introduction, ordered chapters and CTA                  |
| `src/components/process/ProcessChapter.astro`                                           | Semantic chapter content and node                                |
| `src/components/process/ProcessVisual.astro`                                            | Sticky editorial number and five decorative images               |
| `src/components/process/ProcessThread.astro`                                            | Base route, progress strokes and light point                     |
| `src/data/processSteps.ts`                                                              | Typed, centralized five-stage content                            |
| `src/styles/process-section.css`                                                        | Desktop, mobile, static and forced-colour presentation           |
| `src/scripts/animations/process-scroll.ts`                                              | Lazy enhancement, one scroll controller, transitions and cleanup |
| `src/pages/index.astro`                                                                 | Insert section after Why ElevateX                                |
| `tests/process.spec.ts`                                                                 | Focused content, image, layout, scroll and accessibility checks  |
| `tests/featured-system.spec.ts`, `tests/services.spec.ts`, `tests/why-elevatex.spec.ts` | Update the expected homepage section count from five to six      |
| `scripts/capture-process.mjs`                                                           | Responsive captures and five active desktop states               |

## Motion and synchronization

Reuses the installed GSAP package and its ScrollTrigger plugin; no dependency installation or lockfile change. [Official ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) informed registration, standalone callbacks and cleanup.

The small process controller initializes with static HTML. On eligible desktop devices it imports GSAP/ScrollTrigger only when the section is within 600px of the viewport. One section-level ScrollTrigger tracks from the first chapter node to the last at a 46% viewport reading line.

Node coordinates and path dimensions are measured during initialization/refresh, not on every scroll callback. The callback only updates SVG dash offset, the point transform and discrete state when needed. A four-pixel dead band keeps a chapter boundary from flickering. Forward and reverse travel use the same coordinates. ResizeObserver refreshes meaningful journey-size changes; ScrollTrigger also handles viewport refresh.

Numbers move 16px and fade for 0.4–0.48 seconds. Images settle 6px and crossfade within 0.6 seconds. All transitions stop. Rapid stage changes cancel the prior timeline and synchronize the current visual.

No wheel/touch interception, automatic focus changes, live-region progress announcements, continuous particles, animated large blurs, WebGL or permanent `will-change` layers. All five supplied images are optimized to WebP and total **327,442 bytes**; they are lazy-loaded in the desktop visual, which is hidden below 1024px.

## Static modes and lifecycle

- At widths up to 1023px the decorative sticky stage is removed and the content becomes a compact vertical timeline. Mobile motion remains off under the user's standing preference.
- Reduced-motion and coarse touch-only devices use the static illustration and timeline, with no sticky visual movement or deferred animation-library download.
- Without JavaScript, all five chapters, the route and contact link are present and usable. A failed animation import keeps that same fallback.
- Preference/breakpoint changes kill the local trigger and timeline, clear animation styles and restore the static state. Resuming desktop enhancement recalculates geometry.
- Pagehide suspends the controller; persisted pageshow reinitializes it. An Astro before-swap cleanup is registered defensively. This project currently uses regular navigation rather than Astro client view transitions.
- Hidden documents settle the finite transition immediately. Only local tweens/triggers are killed; the hero's animation is not controlled by this section.

## Search and accessibility

One section H2, five H3s and a real ordered list are server-rendered. Primary content never depends on animation. The process describes an intended approach, with no fixed timelines, unlimited support, guaranteed outcomes or fabricated client evidence. Existing page metadata, canonical, preview noindex, schema and routes remain unchanged. No new structured data was added.

All chapters retain readable text in inactive states. Active colour is supplementary to stage numbers and titles. Decorative graphics are excluded from the accessibility tree. The CTA retains the global visible focus outline and at least 44px target height.

## Performance budget

The 2026-10-11 homepage polish adds responsive process artwork through native
`picture` elements. The five 620px AVIF variants total **95,556 bytes**, compared
with **327,442 bytes** for the previous full-size WebPs. The full-size AVIF
variants total **248,856 bytes**. High density screens can select the full-size
source; WebP remains the fallback. All original artwork remains available, with
the original image dimensions, composition, lazy loading and animation selectors
preserved. Mobile continues to omit these decorative visuals.

`scripts/optimize-homepage-assets.mjs` reproduces the derivatives and writes
`docs/homepage-asset-manifest.json` with encoded dimensions and byte sizes.

Final emitted script sizes (separately gzipped files): process controller **1,814 bytes**, deferred ScrollTrigger **17,419 bytes**. All homepage JavaScript including GSAP and deferred code totals **51,230 bytes gzip**, below the 120KB project budget. These are build file sizes, not a claim about production transfer headers. Existing fonts are reused and no media requests were added.

## QA record

- Final Astro build, TypeScript/Astro check (**0 errors, 0 warnings, 0 hints**), ESLint and Prettier checks passed. The existing empty Insights collection still emits a content-loader notice during build.
- Final complete Chrome regression suite: **178 passed in 5.6 minutes**, no failures. Aggregate saved in `artifacts/process-review/browser-summary.json`.
- Final local mobile Lighthouse run: **Performance 92, Accessibility 100, Best Practices 100**; FCP 1.7s, LCP 2.6s, TBT 180ms, CLS 0. The host CPU calibration warning was present. The 2.0s LCP project target remains unmet; these lab results do not establish field INP. Report: `artifacts/process-review/mobile-lighthouse.report.html`. SEO scoring was not run on the intentionally noindex preview.
- Process suite after the supplied image replacement and loaded-image assertions: **24 passed** in local Chrome against the static build, including axe checks at 390px and 1440px.
- Captures after the supplied image replacement: 320, 360, 390, 430, 768, 1024, 1280, 1440, 1536 and 1920px, plus the five active desktop states. All captured widths had zero horizontal overflow.
- Visual review included desktop/mobile composition and the Discover, Strategize, Design, Develop and Launch states. The initial grid was softened after inspection to keep the thread visually primary; each image is checked at its matching scroll stage.
- Tests cover all copy in HTML, six-section order, existing typography, static mobile/tablet/reduced-motion modes, no-JS content, failed ScrollTrigger download, keyboard focus, scroll forward/reverse, fast jumps, mid-stage stability, resize alignment, pagehide/resume and coarse touch devices.

Artifacts: `artifacts/process-review/`. Physical devices, manual screen-reader operation, Safari, Firefox and Edge are not covered by the Chrome checks. Local measurements are not production field results or a launch-readiness declaration.
