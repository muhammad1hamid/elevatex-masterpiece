# Insights publishing system — Master Prompt #22

Implemented and reviewed locally on **2026-10-16**. Nothing was deployed, pushed to GitHub or submitted for indexing. The Contact backend remains deferred.

## 1. Files created

- `src/pages/insights/[slug].astro` and `src/pages/insights/rss.xml.ts`.
- `src/data/insight-topics.ts`, `src/lib/insights/articles.ts`, `src/scripts/insights.ts`.
- `src/styles/insights.css` and `src/styles/insight-article.css`.
- Eight components in `src/components/insights/`: `EditorialHeading`, `EditorialImage`, `EditorialPreview`, `InsightsCTA`, `ArticleDiagram`, `ArticleCallout`, `ArticleTable`, `ArticleMarkdownTable`.
- Three substantive MDX entries in `src/content/insights/` and three corresponding `*-social.png` images in `public/images/insights/`.
- `tests/insights-journal.spec.ts`, `scripts/capture-insights.mjs`, this report, `docs/INSIGHTS_PUBLISHING_GUIDE.md` and `docs/insights-source-review.md`.

Ignored local captures, source evidence, browser results, output comparisons and Lighthouse reports are retained in `artifacts/insights/`.

## 2. Files modified

`AGENTS.md`, `astro.config.ts`, `package.json`, `package-lock.json`, `src/content.config.ts`, `src/utils/structured-data.ts`, `src/data/insight-previews.ts`, `src/components/insights/InsightCard.astro`, `src/components/sections/InsightsSection.astro`, `src/pages/insights/index.astro`, `scripts/check-publication-build.mjs`, `tests/insights.spec.ts`, and the Insights guidance in `docs/content-authoring.md`.

The former `[id].astro` template is replaced by `[slug].astro`; the existing descriptive article IDs are retained. The previous manually maintained preview copy is removed; `insight-previews.ts` now contains only a presentation type. Other dirty workspace files predate this task.

## 3. Listing sections

Centered cinematic journal hero; compact topic explorer; a large split featured story; two asymmetrical supporting stories; a short ElevateX perspective; typographic service links; final project/Work actions; existing global footer.

The topic controls sit before the stories so their effect is visible and they remain usable while categories hide a story group. With three articles, there are no empty slots, repeated filler previews, search service or pagination controls. Empty categories are omitted. Further published entries join the supporting collection automatically.

## 4. Article engine

One static Astro route renders eligible collection entries through `render()`. Collection data supplies titles, descriptions, bylines, dates, covers, URLs, related recommendations, metadata, schema, sitemap entries, RSS and homepage previews. Filenames supply stable slugs; no new Astro page is required for another entry.

Astro **7.3.6** is retained. Added compatible **@astrojs/mdx 8.1.0**, verified against its official package peer requirements. MDX is used for actual explanatory diagrams and callouts; ordinary Markdown remains supported. No React island or client rendering of article content.

## 5. Reusable components

Shared headings, responsive images and previews maintain the editorial hierarchy. Diagram variants explain a visitor decision path, an inquiry workflow with control points, and support routing. Callouts hold a useful note or takeaway. Tables automatically receive a named, keyboard-focusable overflow region while keeping native captions and header cells. The adapter avoids requiring authors to reproduce the scrolling treatment.

## 6. Content schema

Validated category taxonomy: Web Development, AI Automation, AI Chatbots, Digital Strategy. Required title, description, publication date, category and author name; typed Person/Organization attribution. Draft defaults to true.

Optional/defaulted fields: update date, featured, tags, cover, cover caption, social image, short answer, takeaways, SEO title/description, approved related services/projects and sources. Sources require a title and HTTP(S) URL; publisher and context are optional. Updates cannot precede publication. Missing configured cover or social files fail the build; responsive image sources are emitted only for files that exist.

## 7. Initial articles

| Title                                                        | Route                                                    |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| What Makes a Website Convert in 2026?                        | `/insights/what-makes-a-website-convert-in-2026/`        |
| Where AI Automation Actually Saves Businesses Time           | `/insights/where-ai-automation-saves-businesses-time/`   |
| AI Chatbots vs Traditional Customer Support: Where Each Fits | `/insights/ai-chatbots-vs-traditional-customer-support/` |

## 8. Publication and authorship

All three are substantive, source-reviewed entries with `draft: false` and first editorial date **2026-10-16**. They are available in the authorised local preview; none has been deployed. Byline and schema identify **ElevateX as an Organization**, without attributing authorship or review to Hamid.

No decorative artwork date was reused. New articles have no invented update date. The shared draft/future-date gate controls routes, lists, recommendations, RSS and sitemap eligibility. Preview pages remain noindex; eligible articles become indexable only in the production-mode build.

## 9. Research and source verification

[The source review](insights-source-review.md) records retrieval results, checked facts, dates actually observed, original reasoning, excluded claims and limitations for each article.

Nine primary references were actually retrieved and read: web.dev Web Vitals; W3C label, notification and target-size guidance; Microsoft approvals; Stripe idempotent requests; official OWASP prompt-injection source; Google Dialogflow handoff documentation; Meta WhatsApp platform overview. The OWASP main site returned 403, so its official GitHub/Markdown source was used. An unread NIST PDF was excluded from article claims.

No competitor article was copied, no statistics fabricated and no illustrative workflow presented as a client result. Interface availability, completed actions and successful human transfer are explicitly distinguished.

## 10. Images and original demonstrations

Approved clean AVIF/WebP covers are reused at their existing native resolutions. Existing variants are approximately **9.6–37.6 KB** each. Their baked UI wording is illustrative and supplies no factual evidence. Cover provenance is visible in HTML captions and alternative text.

Three 1200×630 social PNGs place the approved crops at native resolution on dark canvases. No regenerated art or invented headline/metric was added. Each article contains a code-based explanatory diagram; the support article also contains a seven-row comparison table. The conversion article links the Qadeer concept study with its actual classification and no commercial-result claim.

## 11. Homepage integration

The approved homepage layout is retained. The three previews now derive the same published titles, descriptions, cover sources, dates, estimated reading times and real links as the article pages. Featured selection uses the shared collection order. No parallel copy array remains.

## 12. Cinematic motion

Finite hero text entrances, subtle light, cover masks, story entrances and restrained image/arrow hover. The shared native Web Animations helper is reused. Body paragraphs do not animate. Focus and pointer interactions settle affected entrances; lifecycle listeners are cleaned up; reduced motion receives static content. Initial HTML is visible and usable before enhancement.

## 13. Reading progress

A thin decorative line measures the article-reading region, including its sources, rather than unrelated recommendations or footer height. Passive scroll/resize listeners schedule one animation-frame update; only the line transform changes. The indicator is hidden without JavaScript and under reduced motion. Browser checks verified completion before the footer and disabled reduced-motion behavior.

## 14. Table of contents

Five or more actual H2 headings produce a native details/navigation block. It forms a sticky desktop rail and a collapsible mobile block. Anchors work without JavaScript and account for heading offsets. An IntersectionObserver adds the active location without hijacking scrolling. Short entries omit the TOC.

## 15. Topic filters

Real buttons, visible focus, `aria-pressed`, represented categories and a polite result count. Filtering changes the existing server-rendered stories, hides empty groups and preserves the featured-anchor route. With JavaScript unavailable, controls are omitted and every eligible article remains visible. There are no empty category routes.

## 16. Related articles

Positive shared category, service and tag matches determine recommendations, with deterministic date/ID ordering. Current, draft and scheduled entries are excluded. Fewer recommendations render when no relevant candidates exist. Related project links are restricted to the existing published concept studies.

## 17. Metadata

Listing title: **Insights on Web Design, AI & Digital Strategy | ElevateX**. Its description explains the real topics. Article title/description, social image, article author/category and publication/update metadata derive from the entry, with optional SEO overrides. Each route has one H1, title, description and canonical.

## 18. Canonicals and migration

Retained centralized **https://www.elevatexlab.com** and trailing slashes. Existing long preview IDs become their corresponding article URLs. No live URL was removed, no active migration redirect introduced and no production cutover performed. The provisional www origin remains subject to the site's existing cutover reconciliation.

## 19. Structured data

Listing: Organization, WebSite, CollectionPage, BreadcrumbList and ItemList of real eligible articles. Articles: Organization, WebSite, WebPage, BreadcrumbList and Article with matching author, dates, publisher and cover. Shared entity IDs connect the graph. JSON-LD remains safely serialized. No fake reviews, external reviewers, endorsements, ratings or automatic FAQPage markup.

## 20. Direct answers

Every initial entry has a useful short answer, explicit takeaways, descriptive headings, concise questions and contextual examples. The support comparison and workflow diagrams explain decisions through real HTML. Long paragraphs stay left-aligned in a reading column of at most 46rem.

## 21. Discoverability foundations

Crawlable prose, accurate attribution, specific primary references, original examples, descriptive stable URLs, service/Work/article links and consistent visible/schema information. No promises of rankings, AI recommendations or unsupported visibility results. Analytics remains disabled; no new tracking or personal data collection was introduced.

## 22. Accessibility tests

Chrome and Edge: zero axe WCAG A/AA violations for all four Insights routes at **390 and 1440px**. Keyboard filters, selected states, TOC links, table scrolling, visible focus, no-JavaScript reading and reduced motion passed. The initial table test expected the removed duplicate wrapper's label; it now targets the single intended region and asserts there is only one wrapper.

These checks do not replace manual screen-reader and physical-device testing.

## 23. Responsive and visual checks

Listing and all three articles checked at **320×568, 360×800, 375×812, 390×844, 430×932, 768×1024, 820×1180, 1024×768, 1280×720, 1366×768, 1440×900, 1536×864 and 1920×1080**. Images decode, headings/paragraphs/figures stay within bounds, and no resource or console errors were found. Enlarged-text checks passed.

Sixteen route/viewport combinations were captured at 390, 768, 1440 and 1920px, with fold/full-page and targeted featured/TOC/diagram/table/related/CTA captures: **108 PNGs**. The final capture audit reports no browser errors. Visual review covered the final featured composition, mobile article opening, comparison overflow and workflow, as well as initial full-page compositions. Table scrolling preserves the full comparison rather than squeezing columns into unreadable mobile text.

## 24. Actual build and browser results

- Static build: **17 pages**, successful MDX compilation and preview headers.
- Astro check: **277 files; zero errors, warnings or hints**.
- Configured lint, repository formatting and whitespace checks passed.
- Publication integration passed, including a temporary new MDX entry/component, generated metadata/route, draft/scheduled exclusion, production sitemap/RSS and the existing service/case-study gates. Synthetic fixtures were removed.
- **68 unique browser checks passed across Chrome and Edge.** The first run passed 64; two heading-space failures and two obsolete table-label assertions were corrected, then all four affected checks passed on targeted rerun. No outstanding failed check.
- **11 existing unrelated HTML pages remain byte-identical** to the pre-task baseline. Only the authorised homepage Insights output and Insights listing changed among existing pages.

External script graph for the journal enhancement is **2,383 bytes gzip**, including its shared cinematic helper. Inline global behavior remains part of HTML; this is not a claim about total page transfer size. Article reading time is an approximate body-prose estimate at 220 words/minute, not an invented fixed duration.

## 25. Lighthouse

Local mobile results on the compressed static preview:

| Page               | Performance | Accessibility | Best practices | Preview SEO | LCP  | TBT   | CLS   |
| ------------------ | ----------- | ------------- | -------------- | ----------- | ---- | ----- | ----- |
| Insights listing   | 100         | 100           | 100            | 66          | 1.7s | 0ms   | 0.006 |
| Website conversion | 94          | 100           | 100            | 69          | 1.9s | 250ms | 0     |
| AI automation      | 92          | 100           | 100            | 69          | 1.9s | 250ms | 0     |
| Support comparison | 94          | 100           | 100            | 69          | 1.9s | 250ms | 0     |

Reports are retained as `artifacts/insights/lighthouse-*.report.html` and `.json`. Preview noindex/crawl restrictions remain intentional; a preview SEO score must not be described as a launch score. These are local laboratory measurements. TBT is not field INP, and no production performance guarantee is inferred.

## 26. Publishing guide

[INSIGHTS_PUBLISHING_GUIDE.md](INSIGHTS_PUBLISHING_GUIDE.md) describes the actual metadata, component/table use, image naming, sources, drafts, real dates, related content, generated SEO/RSS and sequential QA workflow. The existing authoring guide links to it. The source-review report documents the first three entries separately.

## 27. Remaining limits

Firefox, Safari/WebKit, physical devices and manual screen readers were not exercised. The small initial catalog deliberately has no pagination/search. Image quality remains bounded by the supplied clean crops; generated artwork is not real project evidence. Source documents may change and need review for future editorial updates. Local laboratory results do not establish field INP or production network performance.

The existing migration/hostname reconciliation, publication authorization, privacy/integration decisions and deferred inquiry backend remain separate site-level gates. No newsletter, paid CMS, external search service or new analytics provider was added.

## 28. Readiness verdict

**READY WITH MINOR ISSUES for the requested local Insights implementation.** Three substantive source-reviewed articles, the reusable publishing engine, listing, homepage data integration, RSS and authoring workflow are implemented. The browser/platform launch checks listed above remain. This verdict does not authorize or claim a production deployment.
