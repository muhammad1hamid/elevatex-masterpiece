# Cloudflare deployment preparation

This repository builds static assets into `dist/`. `wrangler.jsonc` declares static asset hosting, trailing slashes and a real custom 404 fallback. No account IDs, tokens, domain bindings or production deployment have been configured.

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
