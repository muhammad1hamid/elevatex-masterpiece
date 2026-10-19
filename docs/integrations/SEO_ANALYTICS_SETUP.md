# Search verification and optional analytics

**Current state:** the corrected Clarity ID is `yzqephj94p`, confirmed by the owner screenshot and copied snippet. The owner confirmed GA4 Enhanced Measurement off; actual-provider probes verified the intended event set and consent behavior. `providerActivationVerified=true` permits production activation through the remaining legal/environment/origin/visitor gates. Explicit whole-body masking applies before SDK loading. See the legal approval record and release report for the earlier hold and current verification limits.

## Current implementation

Official origin: **https://elevatexlab.org**. This setup does not deploy the site, configure DNS, enable indexing or deliver inquiries.

| Provider          | Owner-supplied public identifier   | Current state                                         |
| ----------------- | ---------------------------------- | ----------------------------------------------------- |
| GA4               | `G-D9PL0YNQ33`                     | Prepared; collection off by default                   |
| Microsoft Clarity | `yzqephj94p`                       | Prepared; collection off by default                   |
| Bing              | `92656A7713620AB21B7AE30FA4E79FBC` | Static shared head tag; external verification pending |

IDs match the owner's screenshots and Master Prompt 31. They are public identifiers, not API credentials. There is no GTM installation or duplicate vendor loader. Google Search Console ownership is unverified; a GA4 property does not establish it.

## Activation gates

Public identifiers live in `src/data/integrations.ts`. Leave these build-time settings at their current values:

```dotenv
DEPLOYMENT_ENV=preview
PUBLIC_TRACKING_ENABLED=false
PUBLIC_TRACKING_PRIVACY_APPROVED=false
PUBLIC_TRACKING_PROVIDER_REVIEWED=false
```

Both optional providers require **all** of the following: an authorized production build, all three tracking flags true, the exact canonical runtime origin, a valid explicit visitor grant, and no browser DNT/GPC opt-out. Localhost, Pages previews, default builds and unresolved privacy approval do not load vendors. Search indexing remains controlled separately; enabling tracking never approves Home/Contact indexing.

The owner approved the three policy drafts and material facts on 19 October 2026, including 180-day consent storage and GA4 14-month retention. Provider settings below were confirmed by the owner, not inspected in the accounts. The legal revision gate now permits publication. Approved Workers Builds on main default operational gates to true; other Workers branches force preview and tracking off. Ordinary local builds remain off. Explicit `PUBLIC_TRACKING_ENABLED=false` is the production shutdown switch. Preferences remain accessible through the published legal footer when collection is disabled.

## Consent and data flow

The shared head contains one static Bing tag and a public JSON configuration. One small first-party module reuses the existing typed analytics boundary. It never loads vendor scripts before a grant: no advanced-consent/cookieless pings are intentionally enabled.

The conditional charcoal consent panel offers equal Accept/Reject actions, a persistent preferences control, keyboard operation and an explicit description of session recording. It is a nonmodal disclosure. Its versioned grant/denial record expires after 180 days; this duration was owner-approved on 19 October 2026. Invalid/expired/blocked storage defaults off. A grant with unavailable storage applies only to the current page.

GA4 receives default-denied consent followed by analytics-only consent. Advertising storage, ad user data, personalization and Google signals remain disabled. `send_page_view: false` disables the configuration pageview; the module sends one explicit view per full-document navigation. Normal full-page Astro navigation is in use; no ClientRouter is added. Hash changes do not send new views. BFCache restoration sends one new view. A future ClientRouter requires a separate lifecycle review.

Clarity uses `consentv2` with `analytics_Storage: granted` and `ad_Storage: denied`. Cookie denial alone is not treated as network blocking. Neither script is injected while consent is unknown/denied. Withdrawal disables the adapter/GA, calls Clarity stop/denial, expires known first-party GA/Clarity cookies and reloads when the denial was saved. The next document contains no loaded providers. If saving fails, collection is stopped for the current document and the UI reports the storage limitation. Providers may have received already-consented traffic before withdrawal; that cannot be recalled by this code.

Tracking is additionally skipped on URLs containing any query string or an unknown/malformed hash, and when the document referrer contains a query/fragment. Known authored anchor IDs are allowed without an extra view. A change to an unknown hash stops collection for that document. Cached-page restoration rechecks stored consent before emitting a view, so a withdrawn/expired grant is not resurrected. This deliberately sacrifices some campaign attribution to avoid sending arbitrary inbound query/fragment data to session recording. No URL or form value is rewritten.

## Provider dashboard review required before activation

### Google Analytics

1. Confirm the web stream belongs to `https://elevatexlab.org` and uses the supplied measurement ID.
2. In **Admin → Data streams → web stream → Enhanced measurement**, disable automatic measurement. In particular disable history/page changes, outbound clicks, form interactions and site-search collection. The code supplies the allowed views/events; automatic link/form collection could otherwise transmit unintended URLs or duplicate events.
3. Keep Google signals, Ads linking, advertising personalization and user-provided data collection off. Approve retention/data sharing and the privacy disclosure.
4. After an approved deployment and visitor consent, inspect DebugView/Realtime using approved test traffic. A loader or queued command is not proof of receipt. Do not manufacture `generate_lead` events.

### Microsoft Clarity

1. Confirm the supplied project ID and approved website/domain in the Clarity project.
2. Enable the project's cookie-consent requirement. Use strict masking; review URLs, captures, retention, access and privacy terms. Do not add unmask rules for inputs, forms or user content.
3. The inquiry form has static `data-clarity-mask="true"`; before Clarity starts, all forms, inputs, selects, textareas and editable regions are also marked. No `identify` API or user IDs are sent. These local attributes do not prove that actual dashboard recordings are adequately masked.
4. In an approved accessible test environment, inspect real masked recordings and confirm withdrawal stops subsequent capture. Dashboard receipt, actual SDK masking and third-party performance have not been externally verified here.

### Bing and Google Search Console

After authorized deployment, inspect the public homepage source and select **Verify** in Bing Webmaster Tools. Keep the tag after verification. It is not verified merely because local HTML contains it. For GSC, use the owner's existing property if confirmed, or obtain the exact DNS TXT token for a Domain property from GSC; no token or external ownership is invented. Keep pre-launch noindex protection until release approval. Do not submit a sitemap now.

## Events and privacy boundary

| Event                | Actual interaction                                             |
| -------------------- | -------------------------------------------------------------- |
| `service_cta_click`  | A core service page link to Contact                            |
| `portfolio_open`     | A same-site case-study link                                    |
| `live_project_click` | An external project link in a project region                   |
| `contact_form_start` | First inquiry-form focus after consent in the current document |
| `whatsapp_click`     | A WhatsApp link click; never a confirmed conversation or lead  |
| `article_cta_click`  | An Insights link to a service                                  |

The provider adapter accepts only this allowlist and fixed dimensions: authored page type, canonical page location, blank referrer, a validated core service slug and a fixed CTA region. It ignores the legacy boundary's free-text label/source and arbitrary parameters. It sends no href, phone/WhatsApp number, email, name, message, field value, inbound query or private lead identifier. No hover/animation tracking is added. Legacy animation event names are not forwarded, avoiding duplicate CTA collection.

`generate_lead` is explicitly blocked in the shared boundary. The contact form has no delivery backend and local review/validation is not acceptance. A future backend-confirmed lead event requires its own approved server acceptance path. No fake success, email address or new integration was added.

## Cloudflare Pages and Git workflow

This is Astro static output, with no SSR adapter, Pages Functions or live form API. Existing `wrangler.jsonc` describes an alternative Workers static-assets target; it does not prove a Pages project exists. Do not run `wrangler deploy` to configure Pages Git integration.

For a separately authorized Cloudflare Pages Git project:

1. In **Workers & Pages → Create application → Pages → Connect to Git**, authorize the actual GitHub account and select `muhammad1hamid/elevatex-masterpiece`.
2. Set the repository root as the build root, `npm run build` as the build command, `dist` as output, and Node **24** (matching `.nvmrc` and this repository's build workflow).
3. Confirm which branch is production before enabling builds. The integration branch is `codex/seo-analytics-integrations`; do not designate it as production or merge it into production without approval. Check preview branch controls before pushing: connected projects can automatically deploy feature branches to preview hosts.
4. Keep preview environment settings at `DEPLOYMENT_ENV=preview` and all tracking flags false. Production tracking flags also remain false pending the approvals above. Existing generated `_headers` and relative `_redirects` work with static hosting; verify their real edge behavior separately.
5. After deployment approval, attach `elevatexlab.org`, using only the account's actual DNS targets/nameservers. Verify TLS and www-to-apex path/query preservation. Neither DNS nor domain binding has been changed by this task.

The existing GitHub quality workflow runs on push/PR and performs builds, types, lint, publication and browser checks. It contains no Cloudflare deployment credentials/workflow. External Cloudflare Git linkage and production branch settings cannot be inferred from that file. A feature-branch push is not proof of automatic deployment or successful CI. Review the actual checks before merge.

## Privacy change request / pending owner facts

Before activation, approve the legal/business identity, privacy-request contact, applicable markets, provider retention/sharing/access, storage durations, session recording disclosure, consent withdrawal description and any international data handling. The approved WhatsApp route is retained, but it is not silently designated a privacy-request channel. This is an implementation checklist, not published legal terms.

## Validation boundaries

Tests intercept vendor URLs with local command-recording stubs. Production-shaped builds are isolated, and no test events/recordings are sent to the supplied properties. They check default/preview blocking, static Bing placement, identifiers, grants/denials/withdrawal, duplicate prevention, views, safe events, storage failures and masking attributes. They do not prove GA/Clarity dashboard receipt, legal compliance, provider SDK internals or physical-device performance.

Repository integration changes are prepared independently from the existing uncommitted local design/motion work. That work is not silently included in the feature-branch commit. The .org origin and required domain-aware expectations accompany the integration branch; no production merge is authorized.

## Local validation record / 19 October 2026

The exact isolated feature branch passed **32 installed-Chrome checks**: 14 integration tests and 18 existing foundation checks, with zero retries. These include 320–2560px foundation layouts, keyboard/no-JS fallbacks, metadata, preview headers, links, static Bing output, consent grants/denials/withdrawal, GPC, blocked storage/providers, sensitive URL/referrer blocking and allowed events. The first foundation attempt had one failure because its no-JS helper hardcoded another local server port; the helper now uses the configured base URL, with the original assertions retained. An earlier integration attempt selected the listing link rather than a case-study link; the test now targets the actual study link.

Astro preview build produces the same 17 HTML documents. Strict TypeScript, lint, formatting and isolated production publication checks pass on the integration branch. All vendor traffic in integration tests was intercepted; dashboard receipt and real third-party SDK performance remain unverified. No motion controller, stylesheet, image bytes, package or lockfile is changed by the feature-branch integration. Existing uncommitted local motion work is outside this branch, so its unavailable live-preference check is not presented as a passing branch check.

No production deployment, DNS changes, provider-dashboard changes, real lead submission, analytics activation or public indexing activation was performed. Merge requires owner review of the branch and of any connected Cloudflare production deployment implication.

## Official references

- [Google basic consent implementation](https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic)
- [Google tag configuration](https://developers.google.com/tag-platform/gtagjs/reference)
- [Clarity consent V2](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2)
- [Clarity masking API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api)
- [Cloudflare Pages Astro build](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Cloudflare Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
