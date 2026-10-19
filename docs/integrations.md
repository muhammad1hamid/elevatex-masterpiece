# Integration boundaries

## Contact and booking — not enabled

No recipient, booking URL or confirmed business email was supplied. Do not invent one or show a form that cannot deliver. Future implementation: native labeled form, server-side size/type validation, Turnstile server verification (including expected action/hostname), honeypot, rate limiting, accessible error summary and field errors, success redirect and durable delivery handling. Use Cloudflare secret bindings for credentials. Confirm the delivery service's free plan and privacy terms before implementation.

Required decisions: recipient/inbox or storage destination, booking destination, retention rules and privacy text. Never log raw form messages in analytics. Legal documents require real business/data-processing facts.

## Measurement — configured, activation disabled

The owner supplied GA4, Clarity and Bing identifiers. The shared integration uses `src/scripts/analytics.ts` and a consent-aware provider loader; optional collection remains disabled by default and on previews. The static Bing tag is installed independently of consent. See [setup and owner checklist](integrations/SEO_ANALYTICS_SETUP.md) for exact IDs, environment gates, allowed events, masking, provider dashboard settings and external verification limits. No backend exists, and `generate_lead` is blocked.

GSC ownership and provider dashboard receipt remain unverified. Do not install an additional GA/GTM/Clarity or Cloudflare analytics tracker over this setup. Archived live identifiers are historical; the owner's current supplied IDs are the integration source. Privacy policy, consent, retention and provider settings require approval before collection is activated.

## Search and AI crawlers

Production robots permits ordinary search crawlers and explicitly permits OAI-SearchBot. GPTBot defaults to block pending an explicit business preference; set `GPTBOT_POLICY=allow` if training access is approved. This preference is separate from search discoverability. No llms.txt or AI-visibility guarantee is supplied.

Preview robots permits crawling so engines can observe HTML/header noindex; it does not advertise a sitemap. Confidential previews require access control. See [Google noindex requirements](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

## IndexNow — explicit, dry-run first

`npm run indexnow -- https://elevatexlab.org/changed-path/` prepares a dry run after a production build. `--submit` additionally requires `INDEXNOW_KEY` and a matching public verification file. The script checks origin, removes duplicate URLs, rejects query/fragment URLs, verifies the key file and submits only the listed URLs. Removed URLs may be listed. Do not run this on every build; use it after actual publication, significant edits or removals.

The verification key is intended to be publicly served, unlike contact service secrets. Store operational configuration outside source until the key has been selected. Submission does not guarantee indexing. See [IndexNow protocol](https://www.indexnow.org/documentation).
