# Section 10: Final conversion CTA

Implemented locally on 2026-10-11 from Master Prompt #10.

## Files and scope

- Added `src/components/sections/FinalCTASection.astro`.
- Added `src/styles/final-cta.css`.
- Added `tests/final-cta.spec.ts`.
- Added the section immediately after FAQ in `src/pages/index.astro`.
- Updated the homepage section-count assertion from nine to ten in the existing
  services, featured-system, why-ElevateX, process, founder, and insights tests.

The existing sections, global design tokens, routes, and footer were not
redesigned. No commits, pushes, or deployment were performed.

## Design and content

The full-width section uses a centered inner width of up to 1248px. Outfit 400
provides the main heading; Instrument Sans remains the body font. The approved
headline and supporting paragraph are real HTML. The phrase “something real.”
uses the existing soft champagne token.

The layout uses responsive type rather than fixed line breaks at every viewport.
At 1440px the heading fits two lines; at 1920px the larger type creates the
approved three-line arrangement. Phones use a balanced four-line heading and
stacked actions. Very large text can reflow within words to prevent clipping.

The backdrop is CSS only: a deep black/graphite gradient, a restrained warm
radial light, and a thin fading rule at the lower edge. No images, visual assets,
cards, forms, extra copy, or new fonts were added.

The primary “Start a Project” link uses a champagne pill with a minimum height of
58px and points to `/contact/`. “View Our Work” is an understated underlined
secondary link to `/work/`. Phone primary links fill the available width up to
340px. Desktop hover moves the primary by 1px and the arrow by 3px.

Large desktops use a 76svh minimum height; smaller and shorter screens use
content-driven height. There is no pinning, parallax, or scroll interception.

## Motion and performance

The component reuses `initSectionReveal`, already used elsewhere on the page.
It reveals the eyebrow, heading lines, paragraph, and action group once, with
780ms movement and a maximum 270ms stagger. The generated component initializer
is 124 bytes before compression in the inspected build; it imports the existing
shared utility. There are no new dependencies or image requests.

The default HTML is visible. Unsupported or failed animation leaves it visible;
keyboard focus cancels an active reveal on the focused content. Mobile, coarse
pointer, and reduced-motion visitors receive the final state immediately.
Reduced-motion users also receive no hover movement. Ambient light stays static.

The browser check compared the section's document position and height before
and after entrance; they did not change. This is a section-level check, not a
whole-site CLS or Lighthouse claim.

## Accessibility and search

There is one H2, two native navigation links, decorative arrows hidden from
assistive technology, visible focus indicators, and large touch targets. The
section works without JavaScript and supports enlarged text.

The copy uses the approved service terminology without additional claims or
keyword paragraphs. No new H1, schema, canonical, sitemap, or indexing changes
were introduced.

Both destination routes return local preview pages. They currently hand off to
the existing live contact/work anchors, as established before this task; complete
standalone production pages remain a later stage.

## Validation

The targeted suite covers six CTA checks and seven FAQ regression checks, run
in installed Chrome and Edge. It checks semantic HTML and section order, routes,
viewport geometry, heading boundaries, button arrangement, keyboard focus, axe
accessibility, no JavaScript, 200% root text size, one-time reveal timing, layout
stability during entrance, and immediate mobile/reduced-motion states.

CTA viewports: 320×568, 360×800, 375×812, 390×844, 430×932, 768×1024,
1024×768, 1280×720, 1366×768, 1440×900, 1536×864, and 1920×1080.

Visual captures at 1440, 1920, 768, 390, and 320px, plus enlarged text, are stored
in ignored `artifacts/final-cta/`. No browser page errors occurred in the captures.

Final outcomes: **26 browser tests passed** (13 each in Chrome and Edge).
Scoped axe checks reported no violations. Astro build passed;
Astro/TypeScript reported zero errors, warnings, or hints. ESLint, Prettier,
and the patch whitespace check passed.

Remaining scope limits: Firefox/Safari, physical-device and manual screen-reader
QA, and a new Lighthouse measurement were not performed. The build still emits
the existing warning that the Insights Markdown collection is empty. This task
does not establish whole-site production readiness.
