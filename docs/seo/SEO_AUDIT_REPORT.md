# Technical and on-page SEO audit

Audit window: 20–21 October 2026. Repository baseline: `270d567cd0e1390c0fdc063f7c9acfd92198b959`. Canonical origin: `https://elevatexlab.org`.

## Executive summary

The existing Astro site already delivers useful static HTML, distinct service pages, canonical metadata, publication filters and a conservative schema graph. This audit preserves that architecture and the approved design. It does not establish Google indexing, search demand, rankings or field Core Web Vitals.

Safe local fixes address public homepage/contact indexability, missing default social images, RSS discovery, verified organization profiles and accessible project-link names. The independently authorized AI slop article is a separate publication. Broader SEO source changes remain local until production release is authorized.

## Architecture and coverage

- Astro static output, strict TypeScript, Markdown/MDX collections, custom CSS and the existing GSAP/Lenis motion engine.
- Cloudflare static assets plus a contact Worker; server-verified Turnstile and Resend. No backend or secrets changed by this audit.
- Four commercial service routes; Work index and three disclosed project studies; About; Contact; Insights index and four articles after the new publication; three legal pages; 404 and the intentional `/services/` compatibility handoff.
- Every generated HTML route was inspected. The exact metadata and intent map is in [SEO_PAGE_MAP.md](SEO_PAGE_MAP.md).
- Migration evidence in `docs/migration/` was reviewed. Historical `.com` mappings remain proposals; old-domain ownership and backlink value are not assumed.

## Confirmed findings

| Priority / state      | Finding                                                                                                                | Evidence and action                                                                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 / locally fixed    | Homepage and Contact retained earlier launch holds despite their completed public content.                             | Baseline built and live HTML: `noindex, follow`; neither in the 13-entry sitemap. Local registry now makes them eligible only in a production build. Preview remains noindex. Publication is still a separate decision. |
| P1 / external action  | HTTP did not consistently normalize to HTTPS and www did not reach a working canonical redirect in the observed crawl. | Recorded requests and repeat status checks in validation evidence. Requires Cloudflare zone/custom-domain review; no DNS or hosting changes authorized or made.                                                         |
| P2 / locally fixed    | Contact and legal pages had no default OG/Twitter image.                                                               | Baseline HTML warnings. Central SEO component now uses an existing real homepage social asset when a page supplies none.                                                                                                |
| P2 / locally fixed    | RSS existed without HTML discovery.                                                                                    | Feed route was valid; BaseLayout now advertises it with an alternate link.                                                                                                                                              |
| P2 / locally fixed    | Organization graph omitted the owner-confirmed social profiles and Lab alternate name.                                 | Existing Instagram/LinkedIn configuration reused; no new profiles or invented facts.                                                                                                                                    |
| P2 / locally fixed    | Project-card accessible names omitted some visible linked text.                                                        | Lighthouse reported three label/name mismatches. Removing the restrictive label reference lets the visible link content supply its name.                                                                                |
| P2 / measured warning | Homepage mobile lab LCP exceeded the project's 2.0 s target in baseline.                                               | Single-run baseline 2.729 s, performance 95, CLS 0. Existing responsive, eager/high-priority hero image is already discoverable. No speculative hero redesign. See measured comparison and limitations in validation.   |
| P3 / pending          | Genuine commercial evidence and search-demand data are limited.                                                        | Concept studies are disclosed. No client claims, city pages, testimonials, external citations or invented metrics were added.                                                                                           |

## Verified healthy behavior

- Important content, headings, navigation and answers render in HTML without JavaScript.
- Real page titles/descriptions are unique; canonical URLs use non-www HTTPS. Query parameters do not enter the Contact canonical.
- No broken internal destinations, missing local assets or missing image dimensions/alt attributes were detected by the built-output audit. No indexable orphan was found.
- Production robots permits discovery; preview noindex remains visible to crawlers. GPTBot stays blocked pending a business decision; OAI-SearchBot is allowed.
- Sitemap eligibility follows the publication registry and published collection filters. Draft and future-dated fixture content stays out of routes, sitemap and RSS. Editorial dates are not replaced with build dates.
- JSON-LD parses and matches the visible page types, author/entity identities and assets. No fabricated reviews, ratings, pricing or special AI markup.
- Missing routes return an actual 404. `/services/` is an intentional temporary handoff to `/#services`, not an indexable duplicate. It is exempt from ordinary page metadata checks.
- Legal pages deliberately remain noindex. This is an editorial choice, not an accidental crawl block.

## Warnings and unverified items

- A canonical is a preference signal; live host redirects remain a separate concern. HTTP/www observations need zone-owner follow-up.
- Slashless Contact currently uses Cloudflare's 307 normalization. A permanent normalization policy can be considered with the hosting owner; no route migration was guessed.
- No Search Console/Bing account access or exported search/backlink data was available for this audit. Index coverage, manual actions, sitemap processing and actual query cannibalization are not verified.
- Lighthouse is local simulated mobile lab data. It does not measure real-user INP or prove field CWV passes. Physical devices, manual screen readers and the complete cross-browser matrix remain outside the measured evidence.
- Contact readiness and mocked browser journeys are distinct from a confirmed real Gmail delivery. No live email delivery claim is made.
- Structured data was checked in generated HTML and tests, not submitted to an external rich-result eligibility service.

## Next actions

1. Review local SEO changes and authorize their production release separately from the article.
2. Repair/confirm HTTPS and www normalization in Cloudflare, preserving path and query, then repeat the HTTP matrix.
3. Inspect Search Console/Bing ownership, coverage and sitemap processing; export actual query/page data before changing keyword targets or historical redirects.
4. Use [the backlog](SEO_AEO_GEO_BACKLOG.md) for business facts, original evidence and measured follow-up.

## Evidence

Raw local evidence is in ignored `artifacts/seo-phase1/`: `before.json`, `after.json`, source/link logs, Playwright results and Lighthouse JSON. These artifacts contain technical observations, not credentials. [Validation](SEO_VALIDATION_REPORT.md) states the tested scope and remaining limits.
