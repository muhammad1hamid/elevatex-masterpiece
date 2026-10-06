# Integration boundaries

## Contact and booking — not enabled

No recipient, booking URL or confirmed business email was supplied. Do not invent one or show a form that cannot deliver. Future implementation: native labeled form, server-side size/type validation, Turnstile server verification (including expected action/hostname), honeypot, rate limiting, accessible error summary and field errors, success redirect and durable delivery handling. Use Cloudflare secret bindings for credentials. Confirm the delivery service's free plan and privacy terms before implementation.

Required decisions: recipient/inbox or storage destination, booking destination, retention rules and privacy text. Never log raw form messages in analytics. Legal documents require real business/data-processing facts.

## Measurement — disabled

`src/scripts/analytics.ts` is an optional typed event boundary with no installed adapter and no client import. Supported events cover call/work/contact clicks, form starts and confirmed successful submissions, and navigation between services, work and insights. Attribution accepts organic/AI/direct/other categories without recording inbound query strings. Only invoke a form success event after confirmed server success.

Prepare Search Console and Bing ownership verification once the owner provides verified tokens. Choose Cloudflare Web Analytics as the lightweight baseline; assess Microsoft Clarity and consent/retention requirements before enabling it. Do not stack duplicate trackers. Archived live HTML records an existing Google Analytics identifier; confirm account access and continuity before deciding whether to retain it.

## Search and AI crawlers

Production robots permits ordinary search crawlers and explicitly permits OAI-SearchBot. GPTBot defaults to block pending an explicit business preference; set `GPTBOT_POLICY=allow` if training access is approved. This preference is separate from search discoverability. No llms.txt or AI-visibility guarantee is supplied.

Preview robots permits crawling so engines can observe HTML/header noindex; it does not advertise a sitemap. Confidential previews require access control. See [Google noindex requirements](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

## IndexNow — explicit, dry-run first

`npm run indexnow -- https://www.elevatexlab.com/changed-path/` prepares a dry run after a production build. `--submit` additionally requires `INDEXNOW_KEY` and a matching public verification file. The script checks origin, removes duplicate URLs, rejects query/fragment URLs, verifies the key file and submits only the listed URLs. Removed URLs may be listed. Do not run this on every build; use it after actual publication, significant edits or removals.

The verification key is intended to be publicly served, unlike contact service secrets. Store operational configuration outside source until the key has been selected. Submission does not guarantee indexing. See [IndexNow protocol](https://www.indexnow.org/documentation).
