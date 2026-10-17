# AI Chatbots — implementation and QA

Master Prompt #14, implemented locally on 2026-10-13. Preview:
`http://127.0.0.1:4321/services/ai-chatbots/`.

## 1. Files created

- `src/pages/services/ai-chatbots.astro`
- `src/data/services/ai-chatbots.ts`
- `src/components/services/chatbots/ChatbotIntro.astro`
- `src/components/services/chatbots/ConversationExperience.astro`
- `src/styles/ai-chatbots.css`
- `src/scripts/animations/ai-chatbots.ts`
- `public/images/social/ai-chatbots.png`
- `scripts/create-ai-chatbots-social.mjs`
- `scripts/capture-ai-chatbots.mjs`
- `tests/ai-chatbots.spec.ts`
- This report. Screenshots, logs and measurement output are ignored local files
  under `artifacts/ai-chatbots/`.

## 2. Files modified

- `AGENTS.md`: current stage now records the authorized Chatbots page.
- `src/data/site.ts`: registers the page for production indexing/sitemap output.
- `src/scripts/analytics.ts`: four typed chatbot event names.
- `scripts/check-publication-build.mjs`: validates the new production route,
  title, canonical, schema, social image dimensions and sitemap entry.

The existing footer data already derives service destinations from the route
registry, so its AI Chatbots link now resolves to this page. Shared component
defaults, homepage content and the other two service-page sources were preserved.
The workspace contains earlier uncommitted work; that work is not attributed to
this implementation. Nothing was committed, pushed or deployed.

## 3. Final sections

1. Centered hero with a conversation preview.
2. Four chatbot principles.
3. Limited conversation versus a designed conversation.
4. Six-branch capability map.
5. Flagship salon inquiry with structured understanding.
6. Website chatbot experience.
7. Conditional WhatsApp workflow and restaurant order draft.
8. Conversation-to-action sequence.
9. Human handoff paths and context brief.
10. Knowledge sources, context and boundaries.
11. Categorized integrations.
12. Define, Map, Ground, Connect, Test, Launch & Improve process.
13. Six layers of project deliverables.
14. Twelve native FAQ disclosures.
15. Final CTA, followed by the existing global footer.

## 4. Center-aligned content

Every main H1/H2, section eyebrow, short introduction, hero actions and final CTA
is centered. Principles, comparison headings, capability origin, action sequence,
knowledge flow and integration origin also use centered composition. Browser
checks verify major heading alignment and actual eyebrow positions at 13 sizes.

## 5. Intentional alignment exceptions

Breadcrumbs, message transcripts, structured context, detailed capabilities,
order draft, handoff brief, deliverable descriptions and FAQ answers are
left-aligned. The process becomes a readable vertical sequence on mobile.

## 6. Flagship conversation

The salon scenario contains four messages in natural DOM order: request, focused
clarification, customer context, and a summary offering a human follow-up.
Four native radio controls select matching context without JavaScript. The
panels describe intent, business type, requirement, important details and the
recommended next step. The full transcript stays visible in every state.

On eligible desktops, ordinary scrolling highlights the current message and
updates the context panel. Keyboard focus or manual selection stops automatic
selection for that visit. There is no pinning or scroll hijacking. Mobile and
reduced-motion users get the final state immediately and may select another
state manually.

The separate hero sequence uses a finite CSS entrance of approximately 2.45s:
customer message, brief processing indicator, interpretation, assistant response,
and a next-action label. Its text is available before scripts execute, and the
entrance never depends on permanently hidden content. The processing indicator
does not loop. Examples are labelled illustrative; no live AI request or data
capture is presented as functional.

## 7. Website chatbot section

A designed browser surface combines service-page context with an explicit
customer/assistant exchange. It shows page guidance as part of the website
experience and links to the implemented Web Development service page. Copy
explains qualification, contact collection and support routing as possible
scoped capabilities, using only supplied information and permissions.

## 8. WhatsApp section

The restaurant example is labelled **Product Demo / Illustrative**. A request for
two burgers and a drink becomes an **order draft awaiting review**, with menu
availability, drink choice and fulfillment details still to confirm. It places
no order and collects no payment. The existing restaurant demo is linked from
the homepage. There is no claim of a verified restaurant deployment.

Platform eligibility, API access, business account setup and a supported
integration method are explicit conditions. Personal-account integration,
unrestricted features and universal tool compatibility are not promised.

## 9. Human handoff

Five paths distinguish normal questions, unclear requests, high-value inquiries,
sensitive issues and failed understanding. A sample brief carries the salon
intent, important details, relevant prior messages and the next step. Customer
name is explicitly not provided. Permission, retention rules, team availability
and the agreed channel govern the handoff; there is no instant-response promise.

## 10. Knowledge and context

Approved information flows through a conversation engine with instructions,
boundaries, workflow rules and human handoff controls. Sources include website
content, services, FAQs, menus, product information, approved documents and
scoped structured data. Visible copy acknowledges incorrect or incomplete AI
responses and project-specific context retention. No unrestricted database access,
unlimited memory or hallucination-free guarantee is implied.

## 11. Integrations

Three categories replace a logo wall: where people talk, where context lives,
and where work continues. They cover websites, supported WhatsApp setups, email,
forms, CRM, Google Sheets, scoped database access, APIs, webhooks and internal
dashboards. These are conditional project capabilities, not installed connections
or vendor partnership claims.

## 12. SEO title

AI Chatbot Development Services for Businesses | ElevateX

## 13. Meta description

ElevateX builds AI chatbots for websites and supported messaging channels to answer questions, qualify inquiries, connect workflows, and support human handoff.

159 characters. Open Graph uses the same service identity and a dedicated
1200 × 630 PNG created from code and the licensed local font.

## 14. Canonical

`https://www.elevatexlab.com/services/ai-chatbots/`

This follows the centralized provisional www policy and the updated project
constitution. The prompt's bare-domain example has not introduced a second
canonical host. `docs/migration/` was reviewed: `/ai-chatbots` has a proposed
redirect to this route. Activation awaits production cutover and target
validation; no redirect or duplicate indexable alias was created here.

## 15. Schema

Organization, WebSite, WebPage, Service and BreadcrumbList use the centralized
helpers and safe JSON-LD serialization. Service name is **AI Chatbot Development**
and provider references the existing organization. No prices, reviews, ratings,
awards or accuracy claims are invented. FAQPage is omitted consistently with
the current strategy.

Breadcrumbs are Home → AI Chatbots, matching the two implemented service pages;
the unbuilt Services hub is not represented as a completed intermediate page.
Preview remains noindex. The isolated production build includes this approved
canonical once in the sitemap and excludes unapproved routes/drafts.

## 16. Internal links

Hero primary and FAQ/final CTAs use `/contact/`; hero secondary jumps to the
conversation. Final secondary uses `/work/`. Contextual links point to
`/services/ai-automation/`, `/services/web-development/`, and `/#featured-system`.
Footer service navigation now includes the new page automatically.

Contact and Work currently have local preview handoffs; they are not complete
production destinations. No nonexistent Landing Pages route, invented article
or unverified client case study was linked.

## 17. AEO

A direct service definition and twelve supplied FAQ answers are server-rendered.
They answer capabilities, sources, WhatsApp, lead capture, integrations,
uncertainty, human takeover, memory, cost, timing, maintenance and getting started.
Semantic headings and readable examples support interpretation without hidden
content, keyword blocks or text baked into imagery.

## 18. GEO

Consistent brand/service entities, clearly scoped capabilities, example
provenance, source boundaries, contextual links and human-handoff explanations
make the page understandable. No invented customer proof, identities, citations
or AI-discovery promises were added. Real deployment evidence remains future work.

## 19. Responsive implementation

Hero order is headline, copy, primary CTA, secondary CTA, then conversation.
Transcript messages occupy up to 90% of their mobile column. Context stacks
below the transcript at tablet widths. Capability, website, order, handoff,
knowledge and integration layouts simplify without horizontal scrolling.
The six-stage process becomes a vertical waveform sequence on mobile.

All 13 requested widths are tested: 320, 360, 375, 390, 430, 768, 820, 1024,
1280, 1366, 1440, 1536 and 1920px. Root-font enlargement to 200% is checked at
320, 390, 820 and 1024px. This is not a physical-device or browser-zoom claim.

## 20. Accessibility

Native landmarks, a skip link, visible focus, fieldset/legend/radios and native
details/summary controls work with keyboards and without JS. Conversation DOM
order matches its visual reading order. Decorative symbols are hidden from
assistive technology; there are no fake human avatars, live-region transcript
announcements or inaccessible chat inputs. Reduced motion and mobile have no
running animation or automatic scroll progression.

Axe runs target WCAG 2/2.1/2.2 A/AA at mobile and desktop sizes. Automated tests
do not replace manual screen-reader review or establish complete conformance.

## 21. Tests run

- Astro preview build and isolated production publication fixture build.
- Astro/strict TypeScript, ESLint and repository formatting checks.
- Chrome and Edge suites for Chatbots, AI Automation, Web Development and footer.
- Server HTML, metadata, schema, social dimensions, destination links, native
  controls, no-JS, keyboard, finite motion, scroll/manual control, reduced motion,
  mobile static state, absence of external requests, text reflow and axe.
- Screenshots at seven widths, with all section captures at 390px and 1440px.
- Source/story/claim review and visual review of the conversation, capabilities,
  website, WhatsApp, handoff, knowledge, process and social image.

## 22. Actual results

- Preview build: **passed**, ten pages including existing preview handoffs.
- Production publication integration: **passed**, eight pages including two
  synthetic fixtures in isolated test output. Fixtures were removed afterwards.
- Astro/TypeScript: **154 files; zero errors, warnings or hints** after correcting
  an optional test base-URL type.
- ESLint and formatting: **passed**.
- Combined browser run: **160/160 passed** in Chrome and Edge: Chatbots 44,
  AI Automation 46, Web Development 60, footer 10.
- Final Chatbots-only rerun after message-label/next-action polish: **44/44 passed**.
- Screenshot audit: **zero console/resource errors** and no document overflow
  at 320, 390, 768, 1024, 1280, 1440 and 1920px.
- Axe: **zero reported violations in the checked configurations**.

The existing empty insights collection produces a build warning because no
approved articles exist. A stopped preview initially prevented capture; restarting
the local server resolved it. Logs retain actual run results under
`artifacts/ai-chatbots/browser-checks.log` and `final-chatbot-checks.log`.

## 23. Lighthouse and payload

Lighthouse 13.5.0, installed Chrome 155, on the compressed local preview at port
4322, measured on 2026-10-13 after browser QA completed. Mobile simulation uses
4× CPU slowdown, 150ms RTT and 1,638.4 Kbps configured throughput.

| Metric                   | Local mobile result |
| ------------------------ | ------------------: |
| Performance              |             **100** |
| Accessibility            |             **100** |
| Best practices           |             **100** |
| SEO                      |              **66** |
| First contentful paint   |          **1.33 s** |
| Largest contentful paint |          **1.51 s** |
| Total blocking time      |            **0 ms** |
| Cumulative layout shift  |               **0** |
| Total transfer           |    **82,614 bytes** |

The preview intentionally blocks indexing. Production indexing, canonical and
sitemap behavior were checked in the separate publication build; no deployed
Lighthouse SEO score is claimed. Lighthouse warned that the host CPU was slower
than its expected baseline. These are single-run local laboratory measurements,
not field INP or a deployed-performance guarantee. TBT is not INP.

A session refresh stopped the preview servers during the first measurement
attempt. They were restarted, both returned HTTP 200, and the final audit then
completed successfully. Saved reports are
`artifacts/ai-chatbots/mobile-final.report.html` and `mobile-final.report.json`.

Built HTML is 84,013 bytes (18,241 bytes gzip). Inline CSS is 41,712 bytes
(8,420 gzip). Inline JS is 835 bytes (454 gzip), and the page module is 2,511
bytes (1,082 gzip), plus a tiny shared no-op analytics module. Compression sizes
are source measurements, not separate additional downloads for inline content.
The 150,671-byte social PNG is not downloaded as page imagery. There are no
runtime raster illustrations, external fonts, videos, React, WebGL or animation
libraries on this page.

Four analytics events are typed for future use, with fixed page/source values.
Analytics remains disabled and sends no transcript, contact details or other
personal data.

## 24. Remaining issues

Real production Contact, Work, Services hub and About destinations are still
missing. Contact delivery and abuse controls, privacy choices, migration
approvals and wider launch QA remain outstanding. No required visual asset is
missing for this page. Verified chatbot client case studies and approved related
insights were unavailable and were not invented.

Firefox, Safari/WebKit, physical devices, manual screen-reader use, real browser
zoom, deployed hosting/cache behavior, field INP and final hostname redirects
were not tested in this task. Local lab scores do not prove production behavior.

## 25. Claims requiring verification

Real project scoping must confirm platform eligibility, account/API access,
source permissions, retention, integration capabilities, available team handoff,
costs, timeline and support. Any future client deployment, testimonial, quantified
result, partnership or accuracy claim needs evidence. None was fabricated here.

## 26. Production readiness

**NOT READY for production cutover.** The AI Chatbots service page is implemented
and verified locally. The site still needs real conversion/navigation destinations,
contact delivery, approved migration mappings and the remaining launch checks.
Landing Pages remains unbuilt. All changes remain local; no GitHub publication
or production deployment took place.
