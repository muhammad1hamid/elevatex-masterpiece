# Global heading typography and Section 04: The Handoff

Implemented locally on 2026-10-10 from the Design Refinement Master Prompt and the supplied heading crop. This supersedes the earlier Section 04 presentation. No commit, push, GitHub write or deployment was performed.

## Typography

- Self-hosted Outfit Latin variable WOFF2, 32,292 bytes, weights 400–600. Major headings use 400; smaller headings generally use 500. The single file is preloaded through BaseLayout and uses `font-display: swap`.
- Source: [official Outfit repository](https://github.com/Outfitio/Outfit-Fonts); [Google Fonts OFL licence](https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/OFL.txt). Licence is included in `public/fonts/Outfit-OFL.txt`. The Latin asset was retrieved from `https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJtEtq.woff2`.
- Outfit is a chosen geometric match for the reference's direction, not an identification of the screenshot's exact font. Screenshot colour fringing is not reproduced.
- H1–H6, section headings, project/service/card titles and existing mockup display styles use the shared heading family. Body, navigation and control typography remain unchanged.
- Hero “Growth.” retains Bodoni Moda italic. Its normal font face and preload were removed. This explicit accent exception to the previous two-family convention comes from the refinement brief.
- The Arial fallback uses ascent 100%, descent 26%, line gap 0%, based on Outfit's 1000-unit em / 1000 ascent / −260 descent. It is a fallback, not an exact glyph-width match.
- Hero title sizes and tracking were adjusted for Outfit's width. Its scene, assets and choreography remain intact. The six-card Why ElevateX structure is preserved. Standalone preview handoff headings also use Outfit.

## Section 04

The previous chat/dashboard composition, story stepper and five components were replaced with a single restrained workbench:

1. Customer request: one fictional message.
2. Thin champagne SVG connection, with a small traveling light on playback.
3. Order docket: one Chicken Burger, one Fries, “Awaiting confirmation”.
4. Integrated three-step process and a visible fictional-data disclosure.

The heading is “From message. To meaningful action.” All meaningful copy is real HTML. No fake customer, restaurant deployment, integration, payment, result or submitted order is implied.

“See the Flow” is optional and desktop-only. Its finite 1.75-second sequence uses input at 0ms, connection at 300ms, draft at 850ms, confirmation state at 1400ms, then stops at 1750ms. It makes no requests and cannot restart during playback. It cancels cleanly on reduced-motion changes, static/mobile breakpoints, hidden page, offscreen exit and pagehide. Animation failure leaves the complete content visible.

Mobile stacks message, connection and docket. Motion and the playback control are disabled at widths up to 1023px, on touch-only coarse-pointer devices, and for reduced motion. Without JavaScript, the complete illustration remains visible and the optional control stays hidden.

The CTA is **Explore AI Automation**, linked to the existing `/#ai-automation-heading`. A full project page and real service detail route are not available; no placeholder project page was created.

## Files changed for this refinement

| Area                       | Files                                                                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Font assets                | `public/fonts/outfit-latin-wght-normal.woff2`, `public/fonts/Outfit-OFL.txt`                                                                               |
| Global type                | `src/styles/fonts.css`, `tokens.css`, `typography.css`, `global.css`; `src/layouts/BaseLayout.astro`                                                       |
| Existing heading styles    | `src/styles/hero.css`, `proof.css`, `services.css`, `why-elevatex.css`; `src/pages/index.astro`, `[destination].astro`                                     |
| Section composition        | `src/components/sections/FeaturedSystemSection.astro`                                                                                                      |
| New components             | `src/components/featured-system/MessageInput.astro`, `OrderDraft.astro`, `SystemConnection.astro`                                                          |
| Removed components         | `AIConversation.astro`, `RestaurantDashboard.astro`, `SystemPreview.astro`, `SystemStory.astro`, `WorkflowVisualization.astro`                             |
| Data, presentation, motion | `src/data/featured-system.ts`, `src/styles/featured-system.css`, `src/scripts/animations/featured-system.ts`                                               |
| Checks and captures        | `tests/hero.spec.ts`, `tests/featured-system.spec.ts`, `tests/typography.spec.ts`, `scripts/capture-featured-system.mjs`, `scripts/capture-typography.mjs` |

Earlier uncommitted work in this repository is preserved. A local text snapshot of the replaced Section 04 source is under the ignored `artifacts/typography-handoff-review/previous-section-04/` folder.

## Accessibility, search and performance

- One H1, semantic section headings, labeled input/output groups, an ordered process list and real CTA remain accessible and server-rendered.
- The decorative connection is hidden from assistive technology. The native playback button retains focus, exposes its busy state and does not announce fictional order activity as a live event.
- Existing metadata, canonical, preview noindex, structured data and routes are unchanged. No unsupported product/review schema or new SEO claims were added.
- No new runtime dependency or raster asset. The Section 04 script is 957 bytes gzip; shared reveal code is 747 bytes gzip. All emitted JavaScript, including deferred GSAP, totals 31,719 bytes gzip (sum of separately compressed files).

## Validation

- Astro production build: passed. Astro/TypeScript: 0 errors, 0 warnings, 0 hints. ESLint and Prettier checks passed. The existing empty Insights collection emits a content-loader notice during the build.
- Full Chrome suite: **154 passed, 0 failed, 0 flaky, 0 skipped**. Saved aggregate: `artifacts/typography-handoff-review/browser-summary.json`.
- After the final heading-weight and SVG cleanup, the focused typography and Section 04 suite was rerun: **35 passed**. The local preview was restarted at `http://127.0.0.1:4321/` after the interrupted session had stopped it.
- Coverage includes viewport layouts from 320px through ultrawide, heading font loading/wrapping, mobile static state, reduced motion, no JavaScript, failed modules, unsupported animation, keyboard focus, axe checks, flow timing, repeat-click handling and cancellation. No unexpected console errors in the asserted browser scenarios.
- Captured all five sections at 320, 390, 768, 1024, 1440 and 1920px. Additional Section 04 captures cover 13 widths from 320 through 1920px. Artifacts are under `artifacts/typography-handoff-review/`.
- Visual inspection covered the hero, service typography, concept-project presentation, Section 04 at desktop/mobile and Why ElevateX. A 4px decorative highlight overflow found in the initial check was corrected.
- Final mobile Lighthouse local run: **Performance 94, Accessibility 100, Best Practices 100**; FCP 1.5s, LCP 2.5s, TBT 20ms, CLS 0. Report: `artifacts/typography-handoff-review/mobile-lighthouse.report.html`. Lighthouse flagged the host CPU as slower than expected; these are lab measurements, not field results. The 2.0s LCP target remains unmet. An earlier attempt failed because the local server was stopped and did not produce usable scores. SEO scoring was not run on this intentionally noindex preview.

These are local Chrome and automated accessibility results. Physical-device, Safari/Firefox/Edge, manual screen-reader and production-network verification remain outstanding. This is not a production readiness declaration.
