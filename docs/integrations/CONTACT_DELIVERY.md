# Contact delivery

Authorized by the owner on 19 October 2026, including publication of legal revision v3 and one clearly labelled test notification.

## Production

- Existing Worker: `elevatex-masterpiece`; GitHub `main` continues to deploy automatically.
- Static Astro assets remain the default. Only `/api/*` runs the Worker first. `/api/contact` accepts exact-origin JSON POST requests from `https://elevatexlab.org`.
- Required Cloudflare runtime secrets: `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`. Never place values in source, public environment variables or logs. The owner reported these were saved, but the pre-release Wrangler runtime secret listing returned an empty array. Runtime setup is pending correction; do not claim live delivery until readiness and a real submission pass. A new deployment preserves existing Worker secrets.
- Public widget key: `0x4AAAAAAFbZihINVc96nVYv`. Turnstile hostname must allow `elevatexlab.org`; expected server-verified action is `contact_inquiry`.
- Server configuration in wrangler.jsonc: CONTACT_ENABLED, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL. Sender uses the owner-confirmed verified domain `send.elevatexlab.org`; receiving Gmail is server configuration, not browser markup.
- CONTACT_ENABLED=false disables acceptance; change its source configuration and redeploy. Missing bindings/secrets fail closed. GET /api/contact reports readiness only, never secret values or provider authentication success.

## Delivery and limits

Server validation, 32 KiB body cap, empty honeypot and verified Turnstile precede Resend. Rate bindings allow five attempts per hashed client IP and forty total attempts per minute **per Cloudflare location**, not a strict global or daily budget. Provider quotas still apply. Resend Free is limited, not unlimited; monitor account usage.

Messages are plain text to a fixed inbox, with the validated visitor email as Reply-To. The browser keeps form values only in memory; failed attempts preserve the fields. A stable submission UUID plus a normalized payload hash supplies Resend idempotency for unchanged retries (provider window: 24 hours). A changed inquiry is a new delivery. No application database or raw form logging is introduced. Provider/platform processing and mailbox retention still apply.

Only successful Resend acceptance returns success. Acceptance does not establish Gmail inbox placement, owner response, or a commercial agreement. The custom form_submit_success event contains no field values and still requires optional analytics consent. Necessary Turnstile protection is separate from optional marketing analytics.

Local/branch preview forms cannot send. Production security cannot be verified with static Astro preview alone. Never introduce a live test bypass or substitute a Turnstile test key in production.

References: [Turnstile verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Resend API](https://resend.com/docs/api-reference/emails/send-email).

## Release observation

Commit 561aa4939b2c25ed3a52715918e247e43248dac5 was pushed to main and the public release.json matched it in production. Workers Builds reported success. The public /api/contact readiness response was false. The owner screenshot locates both keys under **Builds**; the corresponding runtime secret list is empty. Runtime Variables and Secrets must be populated before the authorized test notification can be sent. No real email has been sent or claimed delivered.

Local verification: 76 focused Chromium checks passed (backend controls, mocked provider failure/acceptance, masked analytics, Contact accessibility/responsive layouts and legal pages), TypeScript 278 files without diagnostics, build/lint/format and Worker dry-run passed. Production publication fixture was updated to assert the authorized live form plus absence of provider secrets/inbox from HTML; it passed. These checks do not establish real provider delivery.
