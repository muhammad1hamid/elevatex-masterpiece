# Cloudflare deployment preparation

This repository builds static assets into `dist/`. `wrangler.jsonc` declares static asset hosting, trailing slashes and a real custom 404 fallback. No account IDs, tokens, domain bindings or production deployment have been configured.

## Preview preparation

1. Use Node 24 and `npm ci`.
2. Leave `DEPLOYMENT_ENV` unset or set it to `preview`.
3. Run `npm run qa`, then `npm run cloudflare:check` (dry-run, no publication).
4. When a preview is requested, authenticate Wrangler against the appropriate Cloudflare account and deploy the reviewed `dist/` using `npx wrangler deploy`.
5. Use Cloudflare Access if the preview must be private. Noindex does not prevent visitors from accessing it.

No payment-dependent feature is required by this foundation. Check account eligibility and current free-tier limits before enabling future dynamic services; do not assume unlimited usage.

## Production cutover gates

- Obtain the old source/assets and Search Console/Bing/analytics exports where available.
- Complete the per-URL migration review, implement replacement content, and verify meaningful permanent redirects including the alternate hostname. Do not deploy the draft redirect map directly.
- Approve final content, correct contact delivery and legal pages; no placeholder pages or unfinished hero.
- Set `DEPLOYMENT_ENV=production` **at build time** and approve completed static routes in `src/data/site.ts`. Page metadata must read this same registry, as the homepage already does.
- Set the intentional GPTBot policy; search bots and OAI-SearchBot remain allowed in production.
- Build in an isolated production job. Never reuse production `dist/` for an unprotected preview host: indexable HTML is baked into that output.
- Keep only the selected canonical hostname indexable. Redirect the apex to www preserving path/query in a Cloudflare zone redirect rule; this requires access to the actual zone and is not simulated in `_redirects`.
- Generate verified path redirects in `public/_redirects` only after destinations exist. Confirm no chains, loops or homepage blanket redirects.
- Test Cloudflare's actual HTTP status, headers, asset caching, 404 and slash redirects; Astro preview alone does not emulate all edge behavior.
- Complete browser/accessibility/content/performance QA. Then bind the real hostname and run a post-cutover crawl before sitemap submission.

## Headers and future Workers

Build output `_headers` contains defensive headers and immutable caching only for hashed `/_astro/` assets. Preview `X-Robots-Tag: noindex, follow` is generated from the actual built robots mode to keep environments consistent. Avoid permanent immutable caching for user-named assets until they are fingerprinted.

No CSP is claimed yet: later GSAP, Turnstile, analytics and forms need an explicit policy tested in report-only mode. Do not introduce an untested CSP that blocks the site.

When the contact feature is built, use a narrowly routed Worker/function with server-only secret bindings and native HTML fallback. Add the Astro Cloudflare adapter only if actual on-demand Astro routes are required. Static pages need no SSR runtime.

References: [headers](https://developers.cloudflare.com/workers/static-assets/headers/), [HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).
