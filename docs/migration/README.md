# Existing-domain migration review

Read-only audit captured 2026-10-06. Raw public responses are in `snapshots/`, response metadata in `live-audit.json`, and the advertised URL inventory in `url-inventory.csv`. This is a sitemap/HTTP crawl, not proof of Google indexing, traffic, backlinks or client-rendered content accuracy.

## Findings

- `https://elevatexlab.com/` resolves to `https://www.elevatexlab.com/`. Retain www provisionally; confirm Search Console properties and current host redirect status at cutover.
- Live HTML contains an empty application root and a module bundle rather than the primary page content. It has a generic title and no canonical in the initial response. Client-rendered metadata/content needs a separate browser/source review.
- Robots advertises bare-domain sitemap URLs despite the www redirect. The new metadata, robots and sitemap use one origin.
- Three sitemaps advertise service, portfolio, about, contact, blog and city URLs. All recorded sitemap dates are 2025-01-27; do not reuse those as evidence of real editorial updates.
- There are 15 advertised page URL entries including both home host variants (14 unique paths). Location relevance and article subjects need review before removal.
- Existing fonts, favicon/brand assets, work imagery and tracking continuity may be worth retaining after source/ownership/accuracy review. This repository contains none of their originals.

## Draft classification

| Existing path          | Proposal                        | Destination                  | Gate                                                       |
| ---------------------- | ------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| `/`                    | IMPROVE                         | `/`                          | Complete homepage and verify positioning                   |
| `/web-development`     | REDIRECT                        | `/services/web-development/` | Equivalent content and live target                         |
| `/ai-chatbots`         | REDIRECT                        | `/services/ai-chatbots/`     | Equivalent content and live target                         |
| `/landing-pages`       | REDIRECT                        | `/services/landing-pages/`   | Equivalent content and live target                         |
| `/portfolio`           | REDIRECT                        | `/work/`                     | Verified work migration                                    |
| `/about`               | IMPROVE                         | `/about/`                    | Real team and business facts                               |
| `/contact`             | IMPROVE                         | `/contact/`                  | Working delivery and correct contact details               |
| `/blog`                | REDIRECT                        | `/insights/`                 | Retained article inventory                                 |
| Three `/blog/*` URLs   | IMPROVE + REDIRECT after review | Matching `/insights/*/`      | Review full articles, relevance and search/backlink data   |
| `/locations/lahore`    | KEEP pending review             | Existing path temporarily    | Verify genuine content, service relevance and search value |
| `/locations/karachi`   | KEEP pending review             | Existing path temporarily    | Same; no invented office/location                          |
| `/locations/islamabad` | KEEP pending review             | Existing path temporarily    | Same; no invented office/location                          |

These are proposed editorial decisions, **not active redirects or newly published routes**. KEEP means preserve the current live URL until review, not manufacture a new city page. No URL is approved for REMOVE and no blind MERGE is planned. `redirects.proposed.csv` records candidate redirects separately from deployable assets.

## Before cutover

Export indexed pages, clicks/impressions, backlinks, top landing pages and existing redirects from owner-controlled tools. Obtain the old source and media. Render/crawl the client application and compare visible content against sitemap claims. Review each URL's business value and assign final KEEP/IMPROVE/MERGE/REDIRECT/REMOVE decisions, then validate every target and HTTP status. Confirm global premium positioning while preserving legitimate Pakistan relevance through useful content. Re-crawl both hostname variants after launch.
