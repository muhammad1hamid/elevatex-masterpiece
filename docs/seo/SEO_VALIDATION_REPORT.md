# SEO validation record

21 October 2026. **Local implementation validated with explicit external limits.** Article publication is separately authorized; broader SEO release remains local. The production article result is recorded below once verified.

## Builds and source checks

| Check                                                                              | Result                            | Scope                                                                                             |
| ---------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run check`                                                                    | PASS, zero errors/warnings/hints  | Astro/TypeScript source diagnostics                                                               |
| `npm run lint`                                                                     | PASS                              | Existing ESLint rules                                                                             |
| `npm run format:check`                                                             | PASS                              | Prettier project formatting                                                                       |
| `npm run test:publication`                                                         | PASS                              | Production/preview rules, draft/scheduled fixtures, author graph, real routes, sitemap and robots |
| `npm run build`                                                                    | PASS, 21 HTML outputs             | Default noindex preview                                                                           |
| `DEPLOYMENT_ENV=production node scripts/build-site.mjs artifacts/seo-phase1/after` | PASS, 21 HTML outputs             | Local full SEO candidate, not a deployment                                                        |
| Isolated article release build/check/lint/format                                   | PASS; 281 files, zero diagnostics | Baseline source plus only the approved article, assets and relevant tests                         |

Astro's output count includes 404 and the compatibility handoff. It is not a count of sitemap-eligible pages.

## Browser regression evidence

- Initial Chrome run: **627 passed / 7 failed out of 634**. These initial failures were investigated, not hidden.
- Corrected the journal expectation to select three homepage entries in the same featured/date order as the implementation; changed the project-link assertion to include its full visible native name; rebuilt stale preview output after correcting the article date to the actual publication day.
- Four new axe checks initially timed out because the analysis frame requires JavaScript. No-JS usability now runs in its own context, followed by axe in a separate JS-enabled context. Both experiences are tested.
- Affected-file rerun: **36 passed / 1 infrastructure failure out of 37**. Two concurrent Astro test builds raced on `.astro/content-assets.mjs.tmp`. The shared-build test group is now serial.
- Final dedicated SEO rerun: **2 passed / 0 failed**. All initially failing scenarios have passing rerun coverage. This is not represented as a fresh single-run 634/634 result.
- Relevant rerun command: `npx playwright test --config artifacts/ga4-stream-update/playwright.config.ts tests/ai-slop-article.spec.ts tests/seo-phase1.spec.ts tests/insights.spec.ts tests/proof.spec.ts --workers=2`.
- SEO serial confirmation: same configuration with `tests/seo-phase1.spec.ts --workers=1`.
- Existing suite covers navigation, real service/work/about routes, touch/mobile layouts, motion fallback, keyboard access, no-JS, reduced motion, consent and mocked contact success/error paths. Article coverage adds widths 320, 390, 768 and 1440, actual image decoding and organization authorship.
- Chrome is installed. Firefox, WebKit/Safari and physical devices were not available/run in this audit. No manual screen-reader pass is claimed.

## Built HTML audit

`PLAYWRIGHT_CHANNEL=chrome node scripts/audit-seo.mjs artifacts/seo-phase1/after artifacts/seo-phase1/after.json`

| Check                       | Result                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Generated HTML              | 21 files inspected                                                                                                                      |
| Automated issues / warnings | 0 / 0 in the full local SEO candidate                                                                                                   |
| Indexable orphans           | 0                                                                                                                                       |
| Sitemap                     | 16 unique canonical eligible URLs in full local candidate                                                                               |
| Internal links/assets       | No unresolved local route, image, script/style or fragment target detected; 1,089 link instances inspected                              |
| Images                      | 125 rendered image instances; alt attribute and explicit dimensions checked                                                             |
| Metadata                    | Unique ordinary-page titles/descriptions, one H1, clean canonical, OG/Twitter metadata and real images                                  |
| JSON-LD                     | Parses, expected page types and stable entity IDs; matches article author/date/image and visible content                                |
| robots                      | Production allows discovery and OAI-SearchBot; GPTBot block retained. Preview has noindex HTML/headers and allows crawlers to read them |
| Publication filters         | Draft/future fixtures excluded from public routes, sitemap and RSS                                                                      |

The `/services/` handoff intentionally has no ordinary description/canonical and stays noindex. The 404 and legal pages remain excluded. These are not treated as failed metadata requirements. Static page sitemap records omit invented update dates; content entries use actual editorial dates.

This checks JSON syntax and relevant schema properties, not a full external Schema.org/Rich Results validation or a guarantee of search features. Automated graph reachability is not an assessment of every link's editorial usefulness.

## Mobile lab performance

Lighthouse 13.5.0, installed Chrome, default simulated mobile conditions against local production previews. One run per route before and after; no statistical significance or field improvement is claimed. Existing original conversion article is used for comparable before/after measurements.

| Route                                             | Performance before → after | LCP before → after | CLS before → after | TBT before → after | SEO before → after |
| ------------------------------------------------- | -------------------------- | ------------------ | ------------------ | ------------------ | ------------------ |
| `/`                                               | 95 → 95                    | 2.729 → 2.752 s    | 0 → 0              | 0 → 17 ms          | 69 → 100           |
| `/services/web-development/`                      | 99 → 99                    | 1.666 → 1.755 s    | 0 → 0              | 5 → 86 ms          | 100 → 100          |
| `/insights/what-makes-a-website-convert-in-2026/` | 99 → 99                    | 1.817 → 1.837 s    | 0 → 0              | 39 → 18 ms         | 100 → 100          |
| `/work/`                                          | 98 → 96                    | 1.966 → 1.990 s    | 0 → 0              | 107 → 156 ms       | 100 → 100          |
| `/contact/`                                       | 99 → 99                    | 1.808 → 1.854 s    | 0 → 0              | 0 → 31 ms          | 66 → 100           |

Accessibility scores were 100. Best Practices were 100 except Contact 96, where static preview lacks the Worker's `/api/contact` endpoint and logs a readiness 404. Live readiness separately returned HTTP 200 with `ready: true`; this preview limitation is not a demonstrated production backend failure.

Homepage SEO score changes follow local indexability eligibility, not improved rankings. Homepage LCP still misses the stricter project target of 2.0 s and the general 2.5 s good threshold in these lab runs. Its laptop resource is already discoverable/eager/high-priority; the after-run breakdown attributes most delay to rendering. No speculative preload, hero redesign or promised performance gain was added. Work TBT variation is recorded, not labeled INP.

[Field Core Web Vitals](https://web.dev/articles/vitals) uses real-user distributions; a local Lighthouse run cannot establish real-user INP or a field CWV pass. Search Console/CrUX verification remains required.

## Live HTTP checks and remaining issues

Read-only public requests; no form submissions, provider setting changes or DNS changes.

| Request                                                        | Observed response                    | Assessment                                                   |
| -------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| Ordinary existing canonical routes                             | 200 with expected canonical          | PASS in baseline crawl                                       |
| `/robots.txt`, `/sitemap.xml`                                  | 200, text/plain and XML respectively | PASS; exact live sitemap counts depend on release scope      |
| `/services`, `/services/`                                      | 302 to `/#services`                  | Intentional compatibility handoff                            |
| `/contact`                                                     | 307 to `/contact/`                   | WARNING: temporary asset normalization retained              |
| `/CONTACT/`, invented missing path                             | 404                                  | PASS: no blanket homepage redirect                           |
| Contact with service query                                     | 200; canonical excludes query        | PASS                                                         |
| `http://elevatexlab.org/contact/?service=web-development`      | 200, no Location; repeat confirmed   | P1 unresolved: confirm/enforce HTTPS at zone level           |
| `https://www.elevatexlab.org/contact/?service=web-development` | 522, no Location; repeat confirmed   | P1 unresolved: custom-domain/host routing needs owner review |
| `/api/contact`                                                 | 200, `ready: true` on repeat         | Readiness only; not proof of Resend/Gmail delivery           |

No HTTPS/www repair was attempted because the SEO prompt does not authorize production hosting/DNS changes. Historical `.com` aliases are unverified and remain proposed mappings.

## Article release validation

The article-only source was assembled from the baseline commit with the approved article files. It deliberately retains production noindex holds for Home/Contact. Its production sitemap should contain **14** URLs, compared with **16** in the broader local SEO candidate. A different count is expected and must not be treated as missing SEO changes.

Article canonical, one H1, direct answer, organization author, 21 October date, real social image, four illustrations, source links and RSS inclusion are checked. The separate preview stays noindex. Actual deployment identity and live URL checks are appended after publication.

## Remaining manual verification

- Search Console/Bing: ownership, actual coverage, chosen canonicals, sitemap processing, manual actions and actual query demand. Account access or owner exports required; no passwords/API secrets should be pasted into chat.
- Cloudflare zone owner: HTTPS/www behavior with path/query preservation and real deployed redirect responses.
- Browser/device and assistive technology matrix beyond installed Chrome; external structured-data eligibility and social cache refresh.
- A human-verified inquiry and received email to establish actual delivery, separate from API readiness and mocked tests.
- Real-user metrics and original project evidence. No indexing, traffic, ranking or AI-citation gain is claimed.

## Reproducible evidence

Ignored local evidence: `artifacts/seo-phase1/before.json`, `after.json`, `host-repeat.json`, `article-source-links.json`, `playwright.log`, `rerun.log`, `seo-rerun.log`, `publication.log`, build/source logs and `lighthouse/*`. Isolated approved source/build records are in `artifacts/article-release/`. No credential values are included.
