# Foundation QA

Recorded on 2026-10-06. Performance thresholds in AGENTS.md are targets, not achieved scores.

## Results

| Check                                                | Result                                                                                                                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro/TypeScript                                     | Passed: 0 errors, warnings or hints                                                                                                                         |
| ESLint and formatting                                | Passed                                                                                                                                                      |
| Static build                                         | Passed                                                                                                                                                      |
| Publication integration build                        | Passed: published article/case study rendered; drafts and future publications absent from routes/sitemap; unfinished home stayed noindex in production mode |
| Playwright with installed Google Chrome              | 21 tests passed                                                                                                                                             |
| Axe mobile/desktop checks                            | Zero violations in the tested WCAG rule set                                                                                                                 |
| No-JavaScript, reduced motion and keyboard skip link | Passed                                                                                                                                                      |
| Responsive overflow checks                           | Passed at all 11 widths listed below                                                                                                                        |
| Browser console, resource errors and internal links  | Passed                                                                                                                                                      |
| Cloudflare deployment dry run                        | Passed; nothing deployed                                                                                                                                    |
| npm dependency audit                                 | Zero reported vulnerabilities after the documented Sharp patch override                                                                                     |
| Visual inspection                                    | Mobile 390px and desktop 1440px screenshots reviewed                                                                                                        |

Baseline homepage output: HTML 3,533 bytes (1,037 gzip), CSS 5,270 bytes (1,827 gzip); zero executable page JavaScript, raster assets or font downloads. These are file-size measurements, not Lighthouse or field-performance results.

Playwright's browser download endpoint repeatedly timed out. The suite successfully used the installed Google Chrome via `PLAYWRIGHT_CHANNEL=chrome`. Firefox/WebKit configuration is prepared but those engines were not run; no Safari/Edge claim is made. Empty-collection build warnings are expected until real content is added, and do not represent fabricated sample content or missing published routes.

## Automated scope

- Astro/TypeScript strict checks, ESLint, Prettier, static build.
- Static HTML content and no executable homepage JavaScript.
- One H1, canonical, title/description and valid JSON-LD.
- Keyboard skip link, no-JavaScript navigation, reduced-motion rendering.
- Responsive widths 320, 375, 390, 393, 430, 768, 1024, 1280, 1440, 1920, 2560.
- Axe WCAG checks at mobile and desktop widths, browser console/resource errors, internal links.
- Draft/future publication filtering, malformed canonical rejection, safe JSON-LD serialization.
- Preview noindex HTML/header and empty sitemap behavior.

## Still required before launch

Real Safari and Edge, physical mobile devices, manual screen-reader checks, high zoom, slow network, final image/font behavior, final hero motion/FPS/GPU/battery, live contact delivery and error handling, analytics/consent behavior, production canonicals/redirects/statuses and complete content review. Browser engines are useful coverage but are not a substitute for physical browsers/devices.

Measure Lighthouse/PageSpeed against finished launch pages; preview noindex intentionally conflicts with the launch SEO=100 target. Field INP and real Core Web Vitals require representative user traffic. Manually validate eligible structured data with relevant validators, without promising rich results.
