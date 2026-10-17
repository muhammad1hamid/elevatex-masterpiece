# Homepage section 03 — Core Services / Our Expertise

Implemented locally on 2026-10-09 from the supplied Section 03 brief. Replaces the former four-name foundation list immediately after Proof & Selected Work. No new homepage section follows it. Hero and Proof composition, copy, imagery and motion settings remain as approved. All changes are local; no commit, push or deployment.

## Inspection and architecture

Reviewed AGENTS.md, homepage/BaseLayout, Hero, ProofSection/ProjectShowcase, site data, design tokens, fonts, animation conventions, current routes and migration notes. The section reuses Bodoni Moda and Instrument Sans, the existing black/graphite/silver/champagne tokens and 1280 px container. No font, package, image generation, CMS or paid dependency was added.

| File                                                     | Responsibility                                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/components/sections/ServicesSection.astro`          | Intro, single H2, four-panel grid and restrained contact footer                       |
| `src/components/services/ServicePanel.astro`             | Shared semantic article, category/number, H3, approved description and CTA            |
| `WebDevelopmentVisual.astro`                             | Editorial browser preview, metallic architectural forms and mobile composition        |
| `AutomationVisual.astro`                                 | Staggered enquiry → AI qualification → CRM workflow using HTML nodes and SVG paths    |
| `ChatbotVisual.astro`                                    | Short illustrative customer/assistant appointment exchange                            |
| `LandingPageVisual.astro`                                | One campaign offer beside a decorative enquiry form and single CTA                    |
| `src/data/services.ts`                                   | Typed overview metadata derived from the existing canonical service names/slugs       |
| `src/styles/services.css`                                | Section layout, miniature interfaces, responsive composition and finite hover effects |
| `src/scripts/animations/section-reveal.ts`               | Existing Proof observer extracted into a shared, configurable utility                 |
| `src/scripts/animations/proof-reveal.ts`                 | Small compatibility wrapper retaining the same approved Proof behavior                |
| `src/pages/index.astro`                                  | Replaces the old service list with ServicesSection                                    |
| `tests/services.spec.ts`, `scripts/capture-services.mjs` | Automated coverage and reproducible responsive screenshots                            |

## Approved content

Eyebrow: **OUR EXPERTISE / 03**.

Headline: **Digital experiences. Intelligent systems. Real possibilities.** Only the second line uses champagne italic emphasis. The three lines are real HTML with explicit separating spaces.

The approved supporting paragraph and all four service descriptions are preserved. Categories and order:

1. Web Development — Digital experiences. Multi-page business websites and a responsive digital presence.
2. AI Automation — Intelligent workflows. Connected tools, repetitive operations and business processes.
3. AI Chatbots — Customer conversations. Website/WhatsApp enquiries, lead capture and support.
4. Landing Pages — Conversion experiences. A campaign-specific offer and clear next step.

Miniature visuals are visibly labelled website/campaign/conversation concepts or an illustrative workflow. All are decorative and `aria-hidden`; their apparent buttons, messages and form fields are non-interactive spans. No live chatbot, API call, form delivery, invented metric or performance outcome is implied.

## Service destination limitation

The four intended service detail routes do not exist:

- `/services/web-development/`
- `/services/ai-automation/`
- `/services/ai-chatbots/`
- `/services/landing-pages/`

The user was offered contact links or inline details; after the continuation request, implementation proceeded with the stated contact fallback. Current CTAs read **Discuss [service]** and link to the existing `/contact/` preview handoff. The planned paths remain in typed metadata, not in public links. No empty service pages, dead detail links or migration redirects were created.

The footer says “Not sure where to start?” and links “Let's Talk” to the same existing contact destination. Its preview handoff is documented in `hero-navigation.md`. Once approved service pages exist, replace href/ctaLabel with each planned route and “Explore [service]”; validate those destinations in the service-page phase.

## Responsive behavior and motion

Desktop is a two-column, two-row grid. Below 901 px, panels stack in one column, with content-driven height. Main text precedes the visual and CTA. The mobile layout keeps all descriptions and avoids hover-dependent information. Small labels inside the decorative miniature UI do not replace readable service text.

The shared observer animates only intersecting content: 16 px lift, 700 ms and a small stagger. Default HTML/CSS stays visible; JavaScript or animation failure cannot hide content. Proof continues using its original 20 px / 780 ms defaults. Animation affecting keyboard focus is cancelled.

Hover-capable desktop with normal motion gets a 4 px panel lift, 3 px CTA arrow movement and restrained internal depth. Workflow connectors make one 1-second pass; the assistant response has one 400 ms entrance; the landing preview CTA highlights. No continuous loops, cursor tracking, pinned scrolling, WebGL, video or permanent will-change.

At widths up to 1023 px, on coarse touch-only devices, and with reduced motion, all entrance/hover movement is disabled. The complete final design is visible immediately. Resizing to mobile cancels an active reveal.

## Semantics, SEO and performance

- Real server-rendered section, one H2 and four H3s; the homepage retains one H1.
- Service names, definitions and business benefits remain outside decorative visuals. CTAs use service-specific text and visible focus styles.
- No duplicated Organization data or invented schema. Existing metadata, canonical, robots and noindex preview behavior remain centralized and unchanged.
- No new raster assets, remote resources or hydration framework. CSS/SVG/HTML render without JavaScript.
- Built shared reveal utility: 747 bytes gzip; Proof wrapper: 107 bytes; Services wrapper: 122 bytes. Together they replace the previous 737-byte Proof module, adding **239 bytes gzip of JavaScript**. Total emitted JavaScript, including the existing desktop-only GSAP chunk, is **30,612 bytes gzip**.

## Verification

Responsive screenshots cover 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1536 and 1920 px. Every capture had no horizontal overflow or page/resource/console errors. Desktop and mobile compositions were visually inspected. Artifacts: `artifacts/services-review/`.

### Completed checks

- Astro static build passed; local preview is running on `http://127.0.0.1:4321/`.
- Astro/TypeScript diagnostics across 66 files: **0 errors, 0 warnings, 0 hints**. ESLint, Prettier and Git whitespace checks passed.
- **96/96 Chrome Playwright checks passed**: the previous 79 checks plus 17 new services checks. Existing Hero and Proof behavior passed regression coverage after extracting their shared reveal utility.
- All four services, approved descriptions, order, headings, decorative semantics and working contact destinations verified in server HTML/browser checks.
- All eleven specified screen widths passed grid, overflow, visual-boundary, content visibility and minimum 44 px CTA-height checks.
- Axe WCAG 2.2 AA checks passed at 390 and 1440 px, along with keyboard focus order and visible outlines.
- No-JavaScript, failed animation APIs, reduced motion, finite workflow motion and cancellation when resizing to mobile passed.

This revision was tested in Chrome; Edge, Firefox, Safari, physical devices and manual screen-reader review were not rerun. The dedicated service detail pages and production launch matrix remain future work. These checks do not establish production readiness.

### Mobile Lighthouse

Isolated local run after browser checks: **performance 92**, **accessibility 100**, **best practices 100**. FCP **1.9 s**, LCP **2.5 s**, total blocking time **120 ms**, CLS **0**. This meets the mobile performance-score target; LCP is still above the 2.0 s launch target. These are simulated local results, not field data. Reports: `artifacts/services-review/mobile-lighthouse.report.json` and `.html`. The preview remains intentionally noindex.
