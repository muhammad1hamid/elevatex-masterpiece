# AI Automation service page — implementation and QA

Implemented locally on 2026-10-12 for Master Prompt #13. Route:
`/services/ai-automation/`. No GitHub publication or production deployment.

## 1. Files created

- `src/pages/services/ai-automation.astro`
- `src/data/services/ai-automation.ts` and `src/data/services/types.ts`
- `src/components/services/automation/AutomationHero.astro`
- `src/components/services/automation/AutomationIntro.astro`
- `src/components/services/automation/InquiryWorkflow.astro`
- `src/styles/ai-automation.css`
- `src/scripts/animations/ai-automation.ts`
- `public/images/social/ai-automation.png`
- `scripts/create-ai-automation-social.mjs`
- `scripts/capture-ai-automation.mjs`
- `tests/ai-automation.spec.ts`
- This report. Local screenshots and audit output are ignored under
  `artifacts/ai-automation/`.

## 2. Files modified

- `AGENTS.md`: records the authorized service-page stage.
- `src/components/services/ServiceActions.astro`: optional secondary label and
  destination; existing defaults retained.
- `src/components/services/ServiceCTA.astro`: optional labels and centered eyebrow.
- `src/components/services/ServiceFAQ.astro`: optional centered layout and shared type.
- `src/data/services/web-development.ts`: imports the common FAQ type.
- `src/data/site.ts`: registers the AI Automation route as eligible for production indexing.
- `src/data/footer.ts`: links built service pages to their actual routes.
- `src/scripts/analytics.ts`: four typed automation event names.
- `scripts/check-publication-build.mjs`: production metadata, schema and sitemap assertions.
- `tests/footer.spec.ts`: expects the newly implemented AI Automation destination.

The workspace also contains earlier homepage and Web Development work. Those
existing changes are not attributed to this task.

## 3. Final sections

1. Hero and illustrative input-to-outcome signal.
2. Four operating principles.
3. Repetitive-work bottlenecks.
4. Automation definition and capabilities.
5. Eight-stage interactive inquiry workflow.
6. Three clearly classified use cases.
7. Human control and approval boundaries.
8. Integration categories and access conditions.
9. Map, Simplify, Connect, Test, Monitor process.
10. Reliability and fallback paths.
11. Project deliverables and related Web Development link.
12. Ten native disclosure FAQs.
13. Final conversion CTA, followed by the shared footer.

## 4. Center alignment

The H1, every major H2, section introductions, eyebrows, hero actions, use-case
headings, build-stage headings and final CTA are centered. Browser assertions
check all major heading alignments and actual eyebrow bounding-box centers.

## 5. Intentional left alignment

Breadcrumbs, workflow stage descriptions and example data, capability descriptions,
integration lists, use-case details, reliability paths, deliverable rows and FAQ
questions/answers use left alignment for scanning and reading. These exceptions
do not alter the centered section hierarchy.

## 6. Workflow implementation

The hero uses semantic HTML, a CSS connector grid and a decorative SVG stroke.
On eligible desktops the stroke travels once in approximately two seconds;
subtle node entrances complete in a finite sequence. Content is never hidden
while waiting for JavaScript.

The main inquiry example uses eight native radio controls in a fieldset. CSS
selects the matching illustrative data panel, so selection works without JS.
Desktop layout follows two connected rows in reading order. A small page-specific
script progresses the selection during ordinary scrolling while the section is
nearby. Keyboard focus or manual selection takes control permanently for that
page visit. No pinning, scroll hijacking, autoplay video, WebGL or animation
library is loaded by this page.

## 7. Use cases

Restaurant operations links to the existing homepage Product Demo and labels its
sequence illustrative. Lead qualification and customer-support routing are also
explicitly illustrative. Each describes trigger, automation, output and human
role. No example is presented as a verified client deployment or measured result.

## 8. Integrations

Capture: website forms, email and messaging channels. Coordinate: CRM systems,
Google Sheets and internal dashboards. Connect: APIs, webhooks and databases.
WhatsApp is conditional on suitable platform access, account setup and integration
method. These are scoped capabilities, not live connections or partnership claims.

## 9. Human control

The example distinguishes a prepared draft from a sent message. Reviewers may
approve, edit or decline sensitive actions; expired approval stops the action.
Missing information triggers a request or review. Follow-up is cancelled after
a reply, opt-out or closed inquiry. The page demonstrates these states locally;
it does not execute business actions or transmit visitor input.

## 10. Reliability content

Four visible paths explain successful validation, missing information, integration
failure and sensitive actions. Supporting content covers bounded retries,
fallbacks, duplicate-action prevention, rate limits, scoped permissions, data
handling and logging where required. Support and monitoring depend on agreed
scope. There is no promise of infallibility, compliance certification or guaranteed ROI.

## 11. SEO title

AI Automation Services for Businesses | ElevateX

## 12. Meta description

ElevateX builds practical AI automation systems that connect tools, reduce repetitive work, organize information, and help business workflows move efficiently.

159 characters. The description is also reused consistently in page metadata.

## 13. Canonical

`https://www.elevatexlab.com/services/ai-automation/`

Uses the centralized provisional www origin. The existing migration documentation
was reviewed. No active redirect or production hostname change was introduced.

## 14. Schema and indexing

Five safely serialized entities: Organization, WebSite, WebPage, Service and
BreadcrumbList. The visible breadcrumb is Home → AI Automation; the unbuilt
Services hub is not represented as an implemented intermediate page. Service
provider references the same organization. No fabricated ratings, reviews,
pricing or client relationships are included. FAQ rich results are not assumed.

Local previews remain noindex. A separate production fixture build verifies
indexability, canonical, social image dimensions and one canonical sitemap entry.
Draft/scheduled content remains excluded. Production eligibility does not mean
the site has been deployed or all launch dependencies are complete.

## 15. AEO implementation

The service definition and FAQs give direct, self-contained answers in server
HTML. Capability, cost, timing, error handling, approval and maintenance answers
include practical limits. Main content is real text with a single H1 and logical
heading hierarchy, not text embedded in artwork.

## 16. GEO implementation

Consistent agency/service identity, semantic HTML, descriptive contextual links
and explicit example provenance support discovery and interpretation. No invented
author, customer proof, result statistics or AI-visibility promises were added.
Related links lead to the implemented Web Development page and the existing
homepage demo. Unapproved insight articles were not invented.

## 17. Accessibility

Native landmarks, skip link, visible focus, fieldset/legend/radios, real links and
native FAQ disclosures support keyboard use and useful HTML without JS.
Decorative SVGs and symbols are hidden from assistive technology. Mobile and
reduced-motion layouts are static. Automated axe checks cover WCAG 2/2.1/2.2 A/AA
tags at 390px and 1440px in Chrome and Edge. Automated coverage does not establish
complete WCAG conformance or replace manual assistive-technology review.

## 18. Mobile implementation

The hero stacks headline, copy, primary and secondary actions, then its visual.
Workflows become vertical; selecting a stage reveals its data beside that stage.
Integration, reliability and deliverable layouts become single-column where
needed. Enlarged-text testing found excess icon-column spacing; the icon column
now reserves a bounded decorative width and allows labels to wrap.

Layout checks cover 320, 360, 375, 390, 430, 768, 820, 1024, 1280, 1366, 1440,
1536 and 1920px. Root-font enlargement to 200% is checked at 320, 390, 820 and
1024px. This is a text-reflow simulation, not a claim of testing browser zoom
or physical devices. The page has no hero raster download. Its social-only PNG
is 1200 × 630 and 167,016 bytes; it is not requested as page imagery.

## 19. Tests run

- Astro preview build and isolated production publication fixture build.
- Astro/TypeScript diagnostics, ESLint and repository formatting checks.
- Playwright in installed Chrome and Edge: AI Automation, footer and Web
  Development suites. Final AI Automation rerun after the page-only reflow fix.
- Axe, keyboard selection, skip navigation, native FAQ disclosures, no-JS use,
  reduced motion, mobile motion suppression, 13 viewport sizes, 200% root-font
  reflow, metadata/schema, local destinations and resource/console errors.
- Screenshot capture at seven widths, with section and selected-workflow states
  at 390px and 1440px. Visual inspection included hero, workflow, capabilities,
  use cases, control, integrations, build, reliability, deliverables, FAQ, CTA
  and the social image.

## 20. Actual test results

- Preview build: **passed**, nine pages including preview handoffs. The existing
  empty insights collection emits an informational content warning; no articles
  were invented to suppress it.
- Production publication checks: **passed**, including both service routes,
  canonical/indexing/schema/social dimensions, sitemap eligibility, and
  draft/scheduled-content exclusions. Fixture output is isolated from the local preview.
- Final Astro/TypeScript: **146 files, zero errors, warnings or hints**.
- ESLint and formatting: **passed**.
- Final AI Automation browser run: **46/46 passed** in Chrome and Edge.
- Web Development regression: **60/60 passed**; footer: **10/10 passed** in the
  combined run immediately before the final page-specific text-wrapping change.
- Earlier runs exposed outdated footer expectations and narrow-screen enlarged
  text overflow. Both were corrected. A disconnected local preview also caused
  one entire run to fail navigation; it was restarted before the successful runs.
- Final screenshot audit: **zero console/resource errors**, and viewport width
  equals document width at 320, 390, 768, 1024, 1280, 1440 and 1920px.
- Axe found **zero violations in the tested configurations**. This does not
  replace manual accessibility or additional browser/device checks.

One restricted-environment diagnostic run failed in Astro's config loader;
the authorized run outside that environment completed successfully. No dependency
change was needed. Browser evidence is in `artifacts/ai-automation/final-ai-checks.log`
and `final-browser-checks.log`; the latter retains the two subsequently fixed
text-reflow failures rather than rewriting the earlier result.

## 21. Lighthouse and payload

Lighthouse 13.5.0 in installed Chrome 154, mobile simulation with 4× CPU slowdown,
150ms RTT and 1,638.4 Kbps configured throughput. Measured on the compressed local
preview at port 4322 on 2026-10-12, after browser runs completed. No run warnings.

| Metric                   | Local mobile result |
| ------------------------ | ------------------: |
| Performance              |             **100** |
| Accessibility            |             **100** |
| Best practices           |             **100** |
| SEO                      |              **66** |
| First contentful paint   |          **1.24 s** |
| Largest contentful paint |          **1.36 s** |
| Total blocking time      |        **39.22 ms** |
| Cumulative layout shift  |               **0** |
| Total transfer           |    **82,775 bytes** |

The only failed binary audit is indexing: this preview deliberately has noindex.
Production metadata/indexing is tested separately; no production Lighthouse SEO
score is claimed. This single local laboratory run is not a field performance,
INP or deployed-hosting guarantee. TBT is not a measurement of INP.

Evidence: `artifacts/ai-automation/mobile-final.report.html` and
`mobile-final.report.json`.

Built HTML is 95,714 bytes, approximately
20,176 bytes gzip. Included inline modules total 3,237 bytes (1,297 bytes gzip);
inline CSS totals 46,445 bytes (8,955 bytes gzip). These are source compression
measurements, not independently downloaded resources or field performance.

Analytics remains disabled. Typed events use fixed page/source values and do not
send personal data, form content or external requests.

## 22. Remaining issues

Real production Contact and Work destinations are still missing; Services hub
and About navigation also rely on preview handoffs. Contact delivery and abuse
controls are not implemented. No required visual asset is missing for this page.
There are no verified AI client case studies or approved related insight articles
to link beyond the existing demo and related service.

Firefox, Safari/WebKit, physical devices, manual screen-reader use, deployed
caching/network behavior, field INP and final domain redirects were not verified
in this task. Broader migration, privacy and launch checks remain required.

## 23. Claims requiring verification

Before agreeing a real project, confirm integration access, permissions, workflow
rules, data handling, vendor limits, costs, timelines and support scope. Any
future client outcome, testimonial, partnership, certification or quantified
saving requires evidence. This page adds no such unsupported claims.

## 24. Production readiness

**NOT READY for production cutover.** The page is implemented for local review;
real conversion/navigation destinations, contact delivery, migration approval
and remaining launch QA must be completed before publication. AI Chatbots and
Landing Pages remain unbuilt. All changes remain local.
