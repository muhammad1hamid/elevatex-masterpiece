# Integration boundaries

## Contact delivery — owner authorized

Production uses the existing Cloudflare Worker, server-verified Turnstile and Resend notifications to the owner-confirmed Gmail inbox. Local and branch previews retain the review-only form. See [contact delivery operations](integrations/CONTACT_DELIVERY.md). Booking remains unconfigured.

## Measurement — approved, consent required

**Current activation:** the owner confirmed GA4 automatic measurement off and pasted the corrected Clarity ID `yzqephj94p`. Real-provider probes passed: no pre-consent requests; one GA4 pageview; successful Clarity SDK/collection; no automatic scroll/form events; withdrawal stops further document collection. The source activation gate is approved. Whole-body `data-clarity-mask` markup enforces content masking independently of the dashboard. Production still requires visitor consent, the canonical origin and all environment/legal gates. Default/branch previews remain off; provider dashboard receipt is unverified.

The owner supplied GA4, Clarity and Bing identifiers. The shared integration uses `src/scripts/analytics.ts` and a consent-aware provider loader; optional collection remains disabled by default and on previews. The static Bing tag is installed independently of consent. See [setup and owner checklist](integrations/SEO_ANALYTICS_SETUP.md) for exact IDs, environment gates, allowed events, masking, provider dashboard settings and external verification limits. The generic `generate_lead` event is blocked; `form_submit_success` is emitted only after backend acceptance.

On 19 October 2026 the owner approved the policy drafts, operator Hamid trading as ElevateX Lab in Pakistan, WhatsApp privacy contact, inquiry-retention criteria and 180-day consent preference. The owner confirmed GA4 14-month retention, Enhanced Measurement off, and Clarity strict masking/consent settings. These are owner confirmations, not an independent dashboard inspection. Approved Cloudflare Workers Builds on `main` enable the consent interface; local/branch previews keep collection off. `PUBLIC_TRACKING_ENABLED=false` remains a build-time shutdown switch. `src/data/legal.ts` also requires a matching approved legal revision before activation.

GSC ownership and provider dashboard receipt remain unverified. Do not install an additional GA/GTM/Clarity or Cloudflare analytics tracker over this setup. Archived live identifiers are historical; the owner's current supplied IDs are the integration source. See the current legal release report for publication and deployment evidence.

## Search and AI crawlers

Production robots permits ordinary search crawlers and explicitly permits OAI-SearchBot. GPTBot defaults to block pending an explicit business preference; set `GPTBOT_POLICY=allow` if training access is approved. This preference is separate from search discoverability. No llms.txt or AI-visibility guarantee is supplied.

Preview robots permits crawling so engines can observe HTML/header noindex; it does not advertise a sitemap. Confidential previews require access control. See [Google noindex requirements](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

## IndexNow — explicit, dry-run first

`npm run indexnow -- https://elevatexlab.org/changed-path/` prepares a dry run after a production build. `--submit` additionally requires `INDEXNOW_KEY` and a matching public verification file. The script checks origin, removes duplicate URLs, rejects query/fragment URLs, verifies the key file and submits only the listed URLs. Removed URLs may be listed. Do not run this on every build; use it after actual publication, significant edits or removals.

The verification key is intended to be publicly served, unlike contact service secrets. Store operational configuration outside source until the key has been selected. Submission does not guarantee indexing. See [IndexNow protocol](https://www.indexnow.org/documentation).

Current GA4 stream is `G-E1LMDQD9WE`; the owner explicitly requested Enhanced Measurement ON, superseding the historical OFF setup described above.
