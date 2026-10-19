# ElevateX Lab — legal and analytics release

**Record date:** 19 October 2026. **Verdict:** approved legal pages are public; optional analytics are held off pending correction/verification of provider settings. This is not a claim of full production, legal-compliance or accessibility certification.

## Published scope and approval

| Item            | Status                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| Privacy Policy  | https://elevatexlab.org/privacy/ — approved, HTTP 200 verified                                       |
| Website Terms   | https://elevatexlab.org/terms/ — approved, HTTP 200 verified                                         |
| Cookie Policy   | https://elevatexlab.org/cookies/ — approved, HTTP 200 verified                                       |
| Footer          | All three policy links and working Cookie Preferences                                                |
| Operator        | Hamid, trading as ElevateX Lab, Pakistan; no registration/address invented                           |
| Privacy contact | Owner-approved WhatsApp +92 335 6709222                                                              |
| Retention       | Approved inquiry-purpose criteria; 180-day consent choice; owner-confirmed GA4 14 months             |
| Legal approval  | Owner explicitly approved reviewed wording/facts; revision legal-2026-10-19-v1, effective 2026-10-19 |

See `docs/integrations/LEGAL_APPROVAL.md`. The inquiry form remains a browser-only review with no delivery backend, email or database. WhatsApp is the available conversation channel. No fake lead was sent.

## Live verification and protective hold

The initial approved release was tested on the real domain using a clean, isolated browser and an explicit non-sensitive test grant:

- Unknown consent: **zero optional provider requests/cookies** observed.
- Reject: **zero optional provider requests** observed.
- Accept: one GA4 loader and one Clarity tag request; one explicit GA4 page_view collected with HTTP 204 response. No account-dashboard receipt is inferred from transport status.
- An additional automatic GA4 `scroll` event was observed. The owner's later GA4 screenshot shows Enhanced Measurement **ON**, superseding the earlier statement that it was off. The supplied GA4 ID and official .org stream URL match the integration.
- Clarity's supplied tag returned **empty HTTP 204**. No working SDK, recording receipt, or particular failure cause is claimed. Exact copied Clarity snippet/identifier and project privacy settings have been requested.
- Withdrawal persisted denial, removed both injected tags and known first-party analytics cookies in the live test; no browser page errors were observed.
- Both optional providers were immediately disabled through `providerActivationVerified=false`, independent of environment flags. The public site subsequently returned `enabled:false` at the protective-hold commit.

**Current activation is blocked.** Confirm GA4 Enhanced Measurement/automatic event detection is off for the actual stream, verify the exact Clarity project identifier/domain and strict masking/consent settings, then rerun actual-provider checks before removing the source hold. Do not paste a second raw tag beside the shared consent controller. Google documents automatic scroll/outbound/form collection in [Enhanced measurement](https://support.google.com/analytics/answer/9216061?hl=en) and [Google tag automatic detection](https://support.google.com/analytics/answer/12131703?hl=en).

## Consent and privacy controls

The existing typed event boundary is reused. Accept/Reject have equal controls; footer preferences reopen the interface, Escape/Close return focus, and withdrawal remains usable during the operational hold. A rejection during the hold replaces an earlier saved grant and removes known first-party analytics cookies. Invalid/expired/unavailable storage defaults off; DNT/GPC also keep providers off.

When operationally approved, GA4 receives analytics-only consent; advertising storage, ad user data, personalization and Google signals remain denied. Full-document navigation uses one explicit pageview; no ClientRouter or duplicate tag manager was added. Sensitive query URLs, unknown/malformed fragments and sensitive referrers block loading. Custom events exclude form values, free text, names, email, phone and destination URLs. `generate_lead` remains blocked without a delivery backend.

Clarity forms/inputs/editable regions are statically or immediately marked for masking before startup. No identify/unmask API is introduced. Owner-confirmed strict masking is not independently verified by a real recorded session. Actual dashboard masking, retention/account access and permitted session receipt remain external checks. The policy distinguishes provider technical processing from anonymous data and does not promise universal compliance.

## Domain, routing and search

- Canonical origin stays **https://elevatexlab.org**, non-www. No DNS/domain binding was changed.
- Live smoke: Home, Work, About, Insights, Contact, four services, three flagship studies and three policies returned HTTP 200. Each HTML response had one correct Bing tag, the .org canonical and legal footer links.
- `/services/` returned **302 → /#services**. Source `_redirects` keeps both Services aliases relative, so previews stay on their own host; no obsolete .com redirects, real-page redirects, missing-page blanket redirects or unapproved historical migration rules were added.
- A missing live URL returned **404**. Production robots and .org sitemap were observed.
- Home, Contact and legal pages retain noindex. Existing approved service/work/about/insight indexability remains intact. Draft review routes remain absent from production and sitemap. No search launch or broad indexing approval is inferred.
- Bing meta `92656A7713620AB21B7AE30FA4E79FBC` is present publicly. Bing's Verify action/account ownership remains unverified. Google Search Console ownership and any sitemap submissions remain unverified; no token or ranking claim is invented.

## Checks actually run

| Check                                | Observed result                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Strict Astro/TypeScript source check | 252 files; 0 errors, 0 warnings, 0 hints                                                                                              |
| ESLint / Prettier / diff whitespace  | Passed                                                                                                                                |
| Preview build                        | 20 static HTML pages, including three approved policies                                                                               |
| Production candidate                 | 19 static HTML pages; correct production mode, legal routes and release manifest; private review excluded                             |
| Publishing integration               | Passed: drafts, schedules, approved routes, sitemap and robots                                                                        |
| Cloudflare static-assets dry run     | Passed; no publication performed by Wrangler                                                                                          |
| Initial local full suite             | 539/552 passed; 13 stale hidden-heading/pending-legal assertions failed                                                               |
| Corrected affected tests             | Fresh 18/18 passed, no retries; no app layout weakened to satisfy the assertions                                                      |
| Final legal/consent/hold suite       | Fresh **48/48 passed**, no retries; intercepted provider stubs for the loader harness                                                 |
| Enlarged text/navigation             | Fresh **2/2 passed** after awaiting final font metrics                                                                                |
| Initial release GitHub CI            | 551/552 passed; one pre-existing 320px enlarged-text check measured 321px on Linux; final font wait added, follow-up CI pending       |
| Responsive/legal accessibility       | 320, 360, 390, 430, 768, 1024, 1440, 1920px; native contents/no-JS, reduced motion and whole-policy axe AA checks passed in Chrome    |
| Visual review                        | Mobile/desktop captures of approved policies reviewed; no overflow/cut-off controls in tested legal layouts                           |
| Performance scope                    | First-party tracking bootstrap 2634 bytes gzip versus 2423 in prior integration candidate; real third-party performance not certified |

Earlier interrupted/configuration runs are not counted as successful runs. No physical-device, manual screen-reader, Safari, Firefox or WebKit certification is claimed. The current public analytics hold supersedes the initial enabled candidate. Local inert-provider tests do not prove real SDK behavior or dashboard receipt.

## Git and deployment evidence

Repository: https://github.com/muhammad1hamid/elevatex-masterpiece

- Actual production branch **main** was owner-confirmed and corroborated by the Ready Workers Builds screenshot. Its Cloudflare deployment version was not treated as a Git SHA.
- Original remote main: `36e2e73dc685bd2945ac9260071c2a59a67d161e`.
- Prior isolated integration: `95dd543a9a157f1c986d141cfcd8ffa9fd2cdf04`.
- Approved policy/consent implementation: `2b2689b52590deafbf8a1d5582642516abcdf9ac` — push confirmed.
- Urgent provider hold: `3e579190b5b8fe6e06b5617a6e8b4fc811bb1548` — push confirmed and public release identity/disabled configuration observed.
- Follow-up withdrawal/test safeguards: `18571f36381c7dd609f61748f94e6279f538c7a3` — push confirmed; follow-up live verification recorded below when observed.
- All pushes were normal fast-forwards to main, through an isolated release worktree; no force/reset or unrelated working-tree commit. Existing uncommitted design/motion/content work in the original workspace was preserved.
- Existing Git-connected **Cloudflare Workers static-assets** deployment was used. No manual Wrangler deployment, DNS cutover or extra backend was performed. Workers main-build detection and `release.json` expose only the validated public commit SHA and mode; previews force tracking off/noindex.
- Public release identity and actual responses were verified. **Cloudflare dashboard build logs/Ready state were not accessible here**, so dashboard deployment status remains externally unverified. A successful Git push and observed public source are reported separately.

## Files and evidence

Shared legal data/content/layout/styles/routes were added. Existing Footer, SEO title helper, tracking head/preferences/controller, provider gate, pending-footer data, hosting redirect generator and build wrapper were updated. Related tests, build-output TypeScript exclusions and integration/Cloudflare documentation were updated. No hero, case-study imagery, GSAP choreography, fonts, cursor or form backend was redesigned in this release.

Local evidence lives in the ignored `artifacts/legal-release-branch/artifacts/release-32/` directory: legal captures, live HTTP/consent observations, production candidate and dry-run output. Only public provider IDs/statuses and sanitized test observations are recorded; no credentials or inquiry contents are committed.

## Remaining actions

1. Owner: GA4 Enhanced Measurement/automatic detection OFF; provide the saved setting or confirmation for an actual-provider recheck.
2. Owner: paste Microsoft Clarity's exact installation snippet and provide strict masking/consent settings. The Google snippet already supplied matches GA4 and should not be added a second time.
3. Verify valid Clarity SDK delivery and permitted masked recording/GA4 receipt in their dashboards. Only then review removing the source hold.
4. Check final GitHub CI and Cloudflare dashboard deployment identity/logs. Bing/GSC ownership, www redirect and any broader indexing decisions remain external or separately approved work.

**Final state:** legal publication and .org routing are implemented and pushed; optional analytics are deliberately disabled pending the provider corrections above.

### Latest public hold check

At **2026-10-19 03:41 UTC**, `release.json` identified `18571f36381c7dd609f61748f94e6279f538c7a3` in production. On the actual `/privacy/` page an isolated earlier-grant visitor had `enabled:false`, disabled Accept, zero optional-provider requests, a saved denial after Reject, no remaining known first-party analytics cookies, and no page errors. The hold is publicly verified; account configuration and a subsequent activation remain pending.
