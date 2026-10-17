# Homepage section 04 — Featured AI System / Inside the Build

> Historical implementation record. The presentation below was replaced by [The Handoff and global typography refinement](typography-handoff-refinement.md) on 2026-10-10. Refer to that report for current components, copy and behavior.

Implemented locally on 2026-10-09 from Master Prompt #4. The section follows Core Services. Hero, Proof and Services presentation and behavior are preserved. Section 05 is outside this change. No commit, push, GitHub write or production deployment.

## Evidence and classification

Inspected AGENTS.md, existing section components, typed site/service data, fonts, design tokens, shared reveal utility, current routes, project content, public assets and documentation. No restaurant product source, screenshots, deployment records or backend evidence was found in this repository.

The showcase is explicitly **Featured Product Demo**, **Illustrative product UI** and **Demo mode**. Its customer messages and SAMPLE-01 order are fictional. Conversation handling, request interpretation, order drafting and restaurant review are all classified `illustrative` in the data model. Verified and prototype capability lists are empty: this repository cannot establish either category for the underlying restaurant product.

No integration, order submission, payment, availability check, restaurant adoption, revenue or business outcome is claimed. No product screenshot was required; the approved fallback is a handcrafted HTML/CSS/SVG illustration.

## Files

| File                                                         | Responsibility                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `src/components/sections/FeaturedSystemSection.astro`        | Section landmark, H2, introduction, project identification and CTA                      |
| `src/components/featured-system/SystemStory.astro`           | Challenge / Approach / Solution editorial stepper                                       |
| `src/components/featured-system/SystemPreview.astro`         | Unified application frame, disclosure, accessible summary and optional playback control |
| `src/components/featured-system/AIConversation.astro`        | Four readable customer/assistant messages                                               |
| `src/components/featured-system/RestaurantDashboard.astro`   | Interpretation, order table and restaurant review state                                 |
| `src/components/featured-system/WorkflowVisualization.astro` | Four connected workflow steps                                                           |
| `src/data/featured-system.ts`                                | Typed project content, evidence classifications and centralized sample data             |
| `src/styles/featured-system.css`                             | Editorial layout, product materials, responsive arrangement and subtle depth            |
| `src/scripts/animations/featured-system.ts`                  | Finite, user-controlled workflow and cancellation handling                              |
| `src/pages/index.astro`                                      | Inserts the new section after Services                                                  |
| `tests/featured-system.spec.ts`                              | Content, responsive, interaction, accessibility and fallback coverage                   |
| `tests/services.spec.ts`                                     | Updates the total homepage section count from three to four                             |
| `scripts/capture-featured-system.mjs`                        | Reproducible viewport and interaction screenshots                                       |
| `docs/featured-system-implementation.md`                     | Implementation decisions, evidence and QA record                                        |

## Content and visual composition

Approved heading: **Not just beautiful. Built with purpose.** The second line uses the existing Bodoni Moda italic and restrained champagne. Supporting copy and the three approved Challenge / Approach / Solution descriptions are rendered as ordinary HTML. The project is named **Restaurant AI Ordering & Operations System**.

The desktop composition splits approximately 42/58 within the existing 1280 px content container. The left side is editorial; the right side presents one graphite application frame. A foreground conversation sits beside interpretation and an order draft. A compact workflow strip connects Message → Interpret → Draft → Dashboard. The sample request for a chicken burger and fries matches the two items in the draft table. Its final state is **Awaiting restaurant review**, not an accepted or paid order.

The dashboard uses the approved Instrument Sans, subtle silver/champagne borders, restrained shadows and a small foreground conversation offset on fine-pointer desktop. A trial two-degree rotation softened the small UI text in standard-density screenshots; it was removed after visual review to keep text crisp. Depth comes from positioning, borders, shadows and material contrast. It adds no fonts, raster imagery, dashboard framework, chart library or hydration island. The calmer background continues from Services without a hard divider.

Below 1200 px the outer layout stacks: introduction/project identity → preview → story → CTA. Below 640 px the preview itself becomes conversation → workflow → order draft; important sample message and order text is at least 13 px. The workflow becomes a compact two-by-two arrangement. Perspective and decorative shadows are reduced or removed, and no panel obscures another.

The existing container is narrower than the brief's suggested 1320–1440 px to preserve site alignment. Tablet/1024 px stacks rather than squeezing the editorial and product columns. The desktop heading is sized to preserve its intended two-line treatment. These are responsive adaptations to the suggested measurements.

## Motion and controls

The complete interface is the server-rendered default. The existing shared reveal utility provides a one-time 18 px / 700 ms entrance with small capped staggers. No content depends on animation completion.

On eligible desktop, **Play Workflow** appears only after its script initializes. A click or keyboard activation runs:

| Time         | Illustration                                                          |
| ------------ | --------------------------------------------------------------------- |
| 0–350 ms     | Highlight the incoming customer message                               |
| 350–800 ms   | Highlight interpretation and move one tiny light along the workflow   |
| 800–1350 ms  | Fade the already-visible draft from 0.65 opacity and lift it 6 px     |
| 1350–1800 ms | Highlight restaurant review and return the control to Replay Workflow |

Then motion stops. Repeated clicks during playback do not restart it. Focus stays on the button, and `aria-disabled` prevents repeated activation without removing the focused element. No live region announces the decorative phases. Playback makes no fetch/XHR requests and does not mutate the sample content.

The short sequence uses native Web Animations and bounded timers; it does not import another animation library or duplicate the hero's GSAP runtime. Mobile/tablet up to 1023 px, touch-only devices and reduced-motion visitors receive the final static interface, with no Play control. Resizing or changing the motion preference cancels active playback. Leaving the viewport, page hiding or document visibility loss also restores the final state. Script failure leaves the complete illustration visible and the control hidden; an animation API exception restores the final state.

## Accessibility, SEO and destinations

- One semantic H2, subordinate H3s, ordered story and message lists, a captioned order table and a labelled figure. All meaningful information is text.
- The workflow has a concise static explanation. Decorative chrome, numbering, SVGs and arrows do not add screen-reader noise. No sound, flashing, form, simulated live backend or hover-only information.
- Native links/button, visible keyboard focus and at least 44 px control height. No focus trap or scripted focus jump.
- Existing global metadata, canonical, preview noindex, robots and schema remain unchanged. The section adds no fabricated CaseStudy, rating or duplicate Organization schema.
- The proposed `/work/restaurant-ai-ordering-system/` detail page does not exist. **Explore the Full Build** is deferred until a meaningful approved page exists; no placeholder route was created.
- AI Automation and AI Chatbots detail routes also do not exist. **Explore AI Automation** links to the existing `/#ai-automation-heading` service panel. It is a real, verified in-page destination.

## Verification record

Responsive screenshots and browser layout checks cover exactly: 320×568, 360×800, 375×812, 390×844, 393×852, 430×932, 768×1024, 1024×768, 1280×720, 1366×768, 1440×900, 1536×864 and 1920×1080. Captures reported no horizontal overflow, console errors, page errors or failed resource responses. Desktop, tablet and mobile screenshots were visually reviewed. Artifacts are under `artifacts/featured-system-review/`.

- Astro static build passed.
- Astro/TypeScript checked 76 files: **0 errors, 0 warnings, 0 hints**. The content loader separately notes the existing empty insights directory.
- ESLint, Prettier and Git whitespace checks passed, including the final capture script.
- Focus/axe checks passed at 390 and 1440 px. No-JavaScript checks passed at both widths.
- The first targeted run passed 23/25 tests. Two assertions were corrected: table cells are separate semantic cells without inserted text spaces, and the offscreen check must allow a short CSS border hover transition to settle. Neither failure required altering product code.
- **123/123 Chrome Playwright checks passed** in the full regression run: 96 existing checks plus 27 new section checks. No tests remain failing. Coverage includes all 13 viewport sizes, in-page CTA navigation, no JavaScript, blocked scripts, animation API failure, four workflow phases, 1.8-second completion, replay, repeated-click guard, unchanged demo data, no fetch/XHR requests, keyboard focus, reduced motion, mobile/touch policy, resize/offscreen/pagehide cancellation and one-time entrance.
- Existing Hero, Proof, Services, metadata/schema, preview crawling, static HTML, links, image dimensions and publishing-helper checks passed. The separate fixture publication build was not rerun because no content collection or routing logic changed.
- After removing the desktop rotation for sharper text, the final build and all **27/27 section checks** passed again. Final responsive and workflow-state screenshots were refreshed.

Built JavaScript added by this section: **939 bytes gzip**, reusing the existing reveal module. Total emitted homepage JavaScript is **31,551 bytes gzip**, including the existing desktop-only GSAP chunk. No new raster transfer, font or dependency was added.

### Mobile Lighthouse

Two isolated local mobile runs both scored **91 performance, 100 accessibility and 100 best practices**. The final build measured FCP **1.7 s**, LCP **2.6 s**, total blocking time **160 ms** and CLS **0**. The earlier run had the same FCP/LCP/CLS and 140 ms total blocking time. This meets the performance-score target; LCP remains above the 2.0 s launch target. TBT is a lab measurement, not a measured INP result.

Both runs warned that the host CPU is slower than Lighthouse expects, which can influence the simulated performance score. These are local lab results, not field measurements. Reports: `artifacts/featured-system-review/mobile-lighthouse-final.report.json` and `.html`; the earlier run is retained as `mobile-lighthouse.report.json` and `.html`. SEO scoring was not requested for the intentionally noindex preview; semantic HTML, metadata, schema and working links were covered by the browser suite.

### Remaining limits

This is an illustrative product presentation, not evidence of a completed restaurant backend or deployment. A full project page and detailed service pages remain future approved content tasks. This revision's browser checks use installed Chrome; Firefox, Safari, Edge, physical devices and manual screen-reader review have not been completed for this section. Local checks are not production readiness or field Core Web Vitals measurements.
