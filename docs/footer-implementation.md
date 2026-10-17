# Section 11: Editorial footer

Historical record: the current footer is documented in
[Footer redesign implementation](footer-redesign-implementation.md), which
supersedes this Master Prompt #11 implementation under Master Prompt #23.

Implemented locally from Footer Master Prompt #11 on 2026-10-11.

## Files

- Replaced the small brand row in `src/components/global/Footer.astro`.
- Added `src/styles/footer.css` with footer-only layout and visual rules.
- Added typed navigation and the approved statement in `src/data/footer.ts`.
- Removed the superseded footer selectors from `src/styles/global.css`.
- Added `tests/footer.spec.ts`.

No earlier homepage section, route, header, or central schema was redesigned.
No commits, pushes, or deployment were performed.

## Composition

The footer spans the page width and shares Section 10's deep black ending.
A large uppercase ELEVATEX text wordmark anchors the left, with the approved
brand statement beneath. Services and Explore form two navigation columns on
the right. A thin divider separates the current-year copyright and the small
“Web · AI · Automation” closing line.

The wordmark uses Outfit 400 from the existing font system; the body and links
use Instrument Sans. The X stays the same ivory color as the rest of the brand.
Container-relative sizing keeps the full wordmark within its column.

Below 1024px the brand sits above navigation. At 375px and wider, navigation
retains two comfortable columns; at 320–360px the groups stack. The bottom row
stacks on phones. Links have at least 44px touch targets and visible champagne
focus outlines.

There are no footer image, video, font, or JavaScript requests. The footer is
fully visible immediately, with subtle CSS link hover changes on desktop.
Mobile and reduced-motion users receive no transitions. All links work without
JavaScript. Copyright uses the year at build time.

## Navigation and missing information

The displayed service names come from the existing service data. Dedicated
service pages do not exist yet, so the footer uses real homepage headings:

| Label           | Current destination         | Required future page         |
| --------------- | --------------------------- | ---------------------------- |
| Web Development | `/#web-development-heading` | `/services/web-development/` |
| AI Automation   | `/#ai-automation-heading`   | `/services/ai-automation/`   |
| AI Chatbots     | `/#ai-chatbots-heading`     | `/services/ai-chatbots/`     |
| Landing Pages   | `/#landing-pages-heading`   | `/services/landing-pages/`   |

Explore uses `/work/`, `/insights/`, `/about/`, and `/contact/`.
Insights has a local archive route. Work, About, and Contact retain the existing
preview handoffs to the current live site. Those handoffs are not completed
standalone production pages.

`/privacy/` and `/terms/` are missing and are intentionally omitted. No generic
legal pages were created. These missing routes and the four planned service
routes are recorded in `pendingFooterRoutes` for the next content stage.

No verified social profiles, public email, WhatsApp number, office location,
or worldwide availability claim exists in central site configuration, so none
is displayed. Contact already appears in Explore, making an otherwise empty
Connect group unnecessary. There are no empty, dummy, or bare-`#` links.

These omissions were reported before implementation. The service-page and legal
link requirements cannot be finalized until their real pages are available.

## Semantics and entity consistency

The layout uses the existing `footer` landmark and one labeled Footer navigation
landmark. Navigation groups are named lists. The wordmark is a home link, not
an extra H1/H2. The brand name comes from `src/data/site.ts`; service names come
from the existing service source. Organization JSON-LD remains centralized and
is not repeated in the footer.

## Validation and preview

Browser coverage includes the footer and Section 10 regression suite in installed
Chrome and Edge. Footer checks cover every displayed internal destination and
service anchor, keyboard order/focus, scoped axe accessibility, no JavaScript,
200% root text size, mobile/reduced-motion behavior, and all requested viewports:

320×568, 360×800, 375×812, 390×844, 430×932, 768×1024, 1024×768,
1280×720, 1366×768, 1440×900, 1536×864, and 1920×1080.

Desktop, tablet, and phone screenshots are stored in ignored `artifacts/footer/`.
The local preview was restored at `http://127.0.0.1:4321/` using the built static
site after the Astro preview command stalled. The helper is local-only and does
not alter hosting configuration.

The final Astro production build passed. Astro/TypeScript passed with zero
errors, warnings, or hints. ESLint, Prettier, and the patch whitespace check
passed. All 22 browser checks passed against the completed build: 11 in Chrome
and 11 in Edge, covering the footer and Final CTA regression suite. Scoped axe
checks reported zero violations, with no browser errors in the checked flows.

The build has an existing warning for the empty Insights Markdown collection.
Firefox, Safari, physical-device and manual screen-reader QA, and a new Lighthouse
measurement were not run. This is not a full-site production-readiness claim.
