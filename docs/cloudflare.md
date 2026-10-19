# Cloudflare deployment preparation

This repository builds static assets into `dist/`. `wrangler.jsonc` declares static asset hosting, trailing slashes and a real custom 404 fallback. The owner confirmed production uses the existing GitHub-connected Workers Builds deployment on `main`; the supplied dashboard screenshot shows a Ready Git build on that branch. The screenshot deployment version is not a Git commit SHA. No account tokens or DNS changes are introduced by this release.

## Official domain

The approved production origin is **https://elevatexlab.org**, without www. `src/data/site.ts` is the shared source for Astro, canonical/social URLs, structured data, robots, sitemap and RSS. Do not introduce a separate environment override that conflicts with it. Local navigation and Services compatibility redirects remain relative to the requested host. Preview protection and the Home/Contact indexability gates remain unchanged.

At a separately authorized cutover, attach `elevatexlab.org` to the actual Cloudflare project, use the DNS targets/nameservers supplied by that account, and verify certificate issuance and HTTPS. Configure `www.elevatexlab.org` to redirect permanently to the apex while preserving path/query, then check for loops. These dashboard/DNS/TLS actions have not been performed or verified. No account-specific record values are supplied here.

Ownership of the old .com domain is unverified. Do not activate cross-domain redirects or the historical proposed path map without ownership and destination review. Keep the approved WhatsApp contact; no .org mailbox, MX, SPF, DKIM, DMARC, backend, Turnstile or analytics configuration is implied by this origin change. Future integrations must explicitly allow the approved origin and remain separately authorized.

## Preview preparation

1. Use Node 24 and `npm ci`.
2. Leave `DEPLOYMENT_ENV` unset or set it to `preview`.
3. Run `npm run qa`, then `npm run cloudflare:check` (dry-run, no publication).
4. When a preview is requested, authenticate Wrangler against the appropriate Cloudflare account and deploy the reviewed `dist/` using `npx wrangler deploy`.
5. Use Cloudflare Access if the preview must be private. Noindex does not prevent visitors from accessing it.

No payment-dependent feature is required by this foundation. Check account eligibility and current free-tier limits before enabling future dynamic services; do not assume unlimited usage.

### Navigation and compatibility routes

- Shared Services navigation links directly to `/#services`. The four service pages remain separate routes.
- `/services` and `/services/` have temporary same-host `302` compatibility rules to `/#services` in both build modes. A noindex HTML handoff also supports local static previews that do not execute Cloudflare rules. It is excluded from the sitemap and is not a Services overview page.
- `/work/`, `/about/` and `/contact/` serve the new pages on the requested preview host. The obsolete redirects to the old public site's homepage fragments have been removed.
- `node scripts/write-hosting-headers.mjs` reads the generated robots mode and reconstructs hosting files. It preserves any separately reviewed `public/_redirects` source rules, then adds the Services aliases; it never copies old rules from a prior `dist/`.
- For an isolated candidate build, pass its repository-relative output directory, e.g. `node scripts/write-hosting-headers.mjs artifacts/release-candidate`. Only build output under `dist/`, `artifacts/` or `test-results/` is accepted.
- Inspect fresh preview and production-candidate outputs locally. Verify HTTP statuses and `Location` headers on the actual protected Cloudflare preview before claiming hosted routing is validated. These local changes do not authorize a deployment or activate the historical migration map.

Cloudflare redirect syntax and precedence: [Static asset redirects](https://developers.cloudflare.com/workers/static-assets/redirects/).

## Production cutover gates

- Obtain the old source/assets and Search Console/Bing/analytics exports where available.
- Complete the per-URL migration review, implement replacement content, and verify meaningful permanent redirects including the alternate hostname. Do not deploy the draft redirect map directly.
- Approve final content, correct contact delivery and legal pages; no placeholder pages or unfinished hero.
- Set `DEPLOYMENT_ENV=production` **at build time** and approve completed static routes in `src/data/site.ts`. Page metadata must read this same registry, as the homepage already does.
- Set the intentional GPTBot policy; search bots and OAI-SearchBot remain allowed in production.
- Build in an isolated production job. Never reuse production `dist/` for an unprotected preview host: indexable HTML is baked into that output.
- Keep only `elevatexlab.org` eligible for approved indexing. Redirect www to the apex preserving path/query in a Cloudflare zone redirect rule; this requires access to the actual zone and is not simulated in `_redirects`.
- Generate verified path redirects in `public/_redirects` only after destinations exist. Confirm no chains, loops or homepage blanket redirects.
- Test Cloudflare's actual HTTP status, headers, asset caching, 404 and slash redirects; Astro preview alone does not emulate all edge behavior.
- Complete browser/accessibility/content/performance QA. Then bind the real hostname and run a post-cutover crawl before sitemap submission.

## Headers and future Workers

Build output `_headers` contains defensive headers and immutable caching only for hashed `/_astro/` assets. Preview `X-Robots-Tag: noindex, follow` is generated from the actual built robots mode to keep environments consistent. Avoid permanent immutable caching for user-named assets until they are fingerprinted.

No CSP is claimed yet: later GSAP, Turnstile, analytics and forms need an explicit policy tested in report-only mode. Do not introduce an untested CSP that blocks the site.

When the contact feature is built, use a narrowly routed Worker/function with server-only secret bindings and native HTML fallback. Add the Astro Cloudflare adapter only if actual on-demand Astro routes are required. Static pages need no SSR runtime.

References: [headers](https://developers.cloudflare.com/workers/static-assets/headers/), [HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).

## Optional analytics and Pages Git setup

The official origin is `https://elevatexlab.org` (non-www). Optional tracking remains disabled. Follow [the integration setup and owner checklist](integrations/SEO_ANALYTICS_SETUP.md) for the static Pages build, consent gates, preview protection and separately authorized Git/domain setup. The existing Wrangler file is a Workers static-assets target, not proof of an existing Pages Git project.

## Approved legal and consent release � 19 October 2026

The owner approved Master Prompt #32 publication and the reviewed legal facts/wording. The production target is the existing **Workers Builds static-assets** project, not Cloudflare Pages. `npm run build` now uses `scripts/build-site.mjs`:

- `WORKERS_CI=1` and `WORKERS_CI_BRANCH=main` select production and default the three approved tracking gates to true. Explicit false is respected, including `PUBLIC_TRACKING_ENABLED=false` as the shutdown switch.
- Other Workers branches force preview/noindex and all tracking gates false, even if production flags were inherited. Ordinary local builds default to preview with tracking off.
- Legal approval, runtime exact origin `https://elevatexlab.org`, browser privacy signals and visitor analytics consent remain independent gates. Main build selection alone never loads a provider.
- `dist/release.json` includes only a validated public `WORKERS_CI_COMMIT_SHA` and deployment mode, so the served build can be compared to Git. No secret or arbitrary environment data is published.
- Existing Home/Contact and legal route noindex decisions remain unchanged; this release does not authorize broad SEO indexing, DNS changes or historical .com migration.
- `/services` aliases remain relative to `/#services`. `_redirects` does not redirect real Work/About/Contact pages or missing URLs to the homepage. www canonicalization belongs to the existing zone settings and remains externally unverified.

Cloudflare Workers Builds ignores Wrangler custom build settings; keep the existing dashboard build command pointing at `npm run build` and existing Git deployment workflow. No manual Wrangler publish is part of this release. A successful Git push is distinct from a successful Cloudflare deployment. If no dashboard access exists, live build identity may be checked, but dashboard deployment status must remain unverified.

References: [Workers Builds defaults](https://developers.cloudflare.com/changelog/post/2025-06-10-default-env-vars/), [build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [build branches](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/).

## Verified Git connection — 19 October 2026

The connected Cloudflare API confirmed the active elevatexlab.org domain maps to Worker elevatex-masterpiece. Its GitHub connection is muhammad1hamid/elevatex-masterpiece, production branch main, auto_build_enabled=true, root /, build npm run build and deploy npx wrangler deploy. The production trigger includes main and all paths. A push_event build for 070254e6243723c01c2a38eec2d3e4c62b28dd77 completed successfully and the deployed version received 100% traffic. No DNS or duplicate Worker was created.

For future updates: commit the reviewed source, push main, wait for the automatic Workers Build to succeed, then compare the commit in https://elevatexlab.org/release.json with git rev-parse HEAD and check the changed public pages. Feature branches do not update the production domain. Previews keep analytics disabled and noindex. A failed build leaves the previous deployment active. The GitHub quality workflow runs separately; a successful Cloudflare build alone does not certify all browser checks.

## Authorized contact Worker — 19 October 2026

`worker/index.ts` now handles /api/contact using the same Worker and Git deployment. ASSETS serves static pages; run_worker_first is limited to /api/*. Two native rate-limit bindings and existing runtime secret bindings protect delivery. See [contact operations](integrations/CONTACT_DELIVERY.md) for configuration, limits, shutdown and delivery semantics. This supersedes the earlier future-backend guidance; it does not authorize unrelated DNS or indexing changes.
