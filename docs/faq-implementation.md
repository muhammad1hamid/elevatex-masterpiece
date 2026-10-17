# Section 09: FAQ refinement

Implemented locally on 2026-10-11 against FAQ Master Prompt #9. No commits,
pushes, or deployment were performed.

## Composition and source changes

- `src/components/sections/FAQSection.astro`: flattened the layout into named
  grid areas. The intro, capabilities, accordion, and contact prompt now occupy
  explicit positions. Removed the independent sticky panel and sticky contact
  offsets that caused the overlap. Added explicit whitespace between heading
  lines for the accessible heading text.
- `src/styles/faq-section.css`: full-width 44/56 desktop split, natural section
  height, restrained gold borders, and a workspace photograph fading into the
  dark FAQ panel. The heading uses the existing Outfit token at weight 400.
  Photography remains visible behind the left content. The contact prompt sits
  below the capabilities, aligned with the bottom of the FAQ list.
- Tablet/mobile at 1100px and below: intro, image, capabilities, questions, then
  contact prompt. Image has a 4:3 composition capped at 512px high on tablets.
  At 400px and below the four capabilities use two rows to prevent label overlap.
- `tests/faq.spec.ts`: added geometry, label-fit, keyboard traversal, reverse
  opening order, touch, short-screen, and enlarged-text regression checks.

## Assets

The existing optimized derivatives of the supplied **Elevatex\_ Luxe Amber
Workspace.png** are reused. No new generated artwork or image derivatives were
needed for this correction. The other supplied image is a composition reference,
not a screenshot embedded as section content.

| Width  | AVIF bytes | WebP bytes |
| ------ | ---------: | ---------: |
| 768px  |     11,747 |     19,466 |
| 1280px |     22,663 |     36,700 |
| 1672px |     31,729 |     50,440 |

Files live in `public/images/faq/`. The picture selects responsive AVIF with WebP
fallback, loads lazily, decodes asynchronously, and reserves dimensions. Mobile
source selection follows the viewport width. Desktop requests the largest
derivative to preserve detail through the tall cover crop; that AVIF is only
about 31 KiB. No image preloads or new JavaScript dependencies were added.

## Content, behavior, and accessibility

`src/data/faqs.ts` remains the typed source for all ten questions and direct
answers, in the brief's order. The existing `FAQItem.astro` uses native
`details`/`summary` with a shared name for one-open-at-a-time behavior. The first
answer starts open. Answers work without JavaScript; decorative plus/minus
indicators are not nested interactive controls. Native expansion is immediate;
desktop border/icon changes are subtle. Mobile and reduced-motion users receive
no FAQ transitions.

Questions, answers, the H2, and links are rendered as static HTML. Icons and the
background photo are decorative. Visible keyboard focus, touch targets,
reflow, text enlargement, and accessible heading text are retained.

## Search and factual content

Visible answers explain the same four approved commercial services. No prices,
fixed delivery promises, client counts, or overseas offices were invented.
International availability stays qualified pending the actual project fit.
Answers remain independently understandable and brand references remain natural.

FAQPage schema is omitted, consistent with the existing approach: semantic
visible answers are provided without promising FAQ rich results. No route,
canonical, sitemap, or indexing policy changes were needed; the local preview
keeps its existing noindex setting.

Contact links use `/contact/`. That route is the site's existing preview handoff
to the live contact area; this section does not introduce a new contact form.

## Validation

- Astro production build passed, including generation of hosting headers.
- Astro/TypeScript check: zero errors, warnings, or hints.
- Repository ESLint and Prettier checks passed.
- Seven FAQ tests passed in each of installed Chrome and Edge: **14 passed**.
- Checked 320×568, 360×800, 375×812, 390×844, 430×932, 768×1024, 1024×768,
  1100×768, 1101×768, 1280×720, 1366×768, 1440×900, 1536×864, and 1920×1080.
- Also checked 1280×600 with 200% root text size.
- Verified server-rendered answers, first-open state, single-open behavior,
  mouse, Space/Enter, Tab through every summary, reverse opening order, touch,
  no JavaScript, reduced motion, image loading attributes, contact links, no
  horizontal overflow, and non-overlapping desktop/mobile geometry.
- Axe found no violations in the FAQ for the inspected default and enlarged-text
  states. No page JavaScript errors occurred during these checks or captures.
- Visually inspected desktop, tablet, 390px, and 320px screenshots. Local captures
  and the preview test configuration are in ignored `artifacts/faq/`.

The initial keyboard test ran while the existing hero entrance covered the page.
The FAQ-specific keyboard checks now start with reduced motion to isolate the
accordion interaction. No hero behavior was changed.

## Remaining validation limits

Firefox, Safari, physical devices, and manual screen-reader testing were not run
in this refinement. Lighthouse and site-wide performance scores were not
remeasured. The build still reports the existing empty Insights Markdown
collection warning; this is unrelated to the FAQ. These checks are not a claim
of full-site production readiness.
