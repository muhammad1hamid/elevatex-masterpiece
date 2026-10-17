# Contact frontend — Master Prompt #21

Implementation and local QA: **2026-10-15**. Route: `/contact/`.

The owner's latest instruction explicitly defers backend implementation. This delivery is the complete Contact frontend with local field review. It does not send, store or deliver inquiries. Nothing was deployed or published.

## 1. Files created

- `src/pages/contact.astro`
- `src/components/contact/ContactHero.astro`
- `src/components/contact/ContactHeading.astro`
- `src/components/contact/InquiryForm.astro`
- `src/components/contact/ContactNextSteps.astro`
- `src/data/contact.ts`
- `src/styles/contact.css`
- `src/scripts/contact-form.ts`
- `src/scripts/animations/contact.ts`
- `src/utils/contact-link.ts`
- `tests/contact.spec.ts`
- This report. Local screenshots, browser results, output comparisons and Lighthouse reports are retained in ignored `artifacts/contact/`.

## 2. Files modified

`AGENTS.md`, `src/pages/[destination].astro`, `src/data/site.ts`, `src/utils/structured-data.ts`, `src/components/services/ServiceActions.astro`, `src/components/services/ServiceFAQ.astro`, and `scripts/check-publication-build.mjs`.

Updated obsolete Contact destination assertions in the Web Development, AI Automation, AI Chatbots, Landing Pages and Infinity study browser suites. Other dirty files in the workspace predate this task.

## 3. Final page sections

Shared header; centered typographic hero; project inquiry; three next steps; editorial WhatsApp contact; closing reassurance with a return-to-form link; shared footer. No duplicate footer or large closing CTA panel.

## 4. Form fields

| Field                  | Requirement                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| Your Name              | Required, 2–100 characters                                         |
| Email Address          | Required, native email validation, maximum 254 characters          |
| What Can We Help With? | Required; four services, Not Sure Yet, Something Else              |
| Approximate Budget     | Optional; Not Sure Yet / Prefer to Discuss                         |
| WhatsApp / Phone       | Optional, international formats accepted, maximum 40 characters    |
| Preferred Timeline     | Optional; practical soon, one month, one to three months, flexible |
| Existing Website       | Optional, full HTTP(S) URL, no embedded credentials                |
| Project Description    | Required, 10–4,000 characters                                      |

Timeline choices express preferences, not delivery promises. No invented prices or project minimums.

## 5. Form design

Single restrained graphite panel, fine borders, persistent labels, native controls, champagne focus and action styling. Two desktop columns collapse to one below 768px. Controls have 16px text and at least 58px height. Description and website span both columns. Errors appear below their associated controls; feedback preserves values and focuses the first invalid field.

## 6. Hero animation

Finite masked line reveals, staggered supporting copy/action and subtle CSS illumination. The light settles within 1.3 seconds; the desktop accent sweep is finite. No bitmap, video, canvas, WebGL or external animation dependency. Late loads, history restoration, focus and reduced motion are accommodated.

## 7. Form entrance

Brief opacity entrance with small field-row offsets and a restrained action reveal. Shared native Web Animations helpers provide visibility observation, cancellation and lifecycle cleanup. Initial HTML remains visible before JavaScript; motion is optional.

## 8. Focus and hover

Visible champagne outlines, subtle input surface changes and small pointer hover movement. Focus/pointer interaction settles an active entrance. Reduced motion disables animation and transitions. Hero and return links focus the inquiry section; reduced motion uses immediate scrolling.

## 9. Submission loading behavior

Not implemented because backend work is deferred. The button is **Review Project Inquiry**, `type="button"`; there is no submit control. It becomes available only when the local review handler is attached. No artificial sending spinner, simulated delay or submission request.

## 10. Success experience

There is no delivery-success state. Valid local review displays: “Your details look ready. Nothing has been sent. Inquiry sending will be available soon.” Editing a field clears that review confirmation. The form is never reset as if a message had been delivered.

## 11. Failure handling

Local errors identify required/invalid values, use `aria-describedby` and `aria-invalid`, announce a short summary, and move focus to the first invalid field. Enter does not submit the multi-field form, with or without JavaScript. Network failures, retries and provider errors cannot be exercised because no delivery path exists.

## 12. Backend architecture

**Deferred by explicit owner instruction.** Existing static Astro architecture retained. No endpoint, Worker, server action or server integration added.

## 13. Delivery or storage provider

None selected or configured. No email service, CRM, database, mailbox, booking provider or fake delivery receipt.

## 14. Spam protection

Deferred with the receiving endpoint. No placeholder Turnstile or decorative security claim. Server validation, abuse controls and verified challenge handling are requirements before enabling live sending.

## 15. Rate limiting

Not implemented; no receiving endpoint exists. Configure and test server-side rate limits when backend work is authorized.

## 16. Environment variables

No new variables or credentials required for this frontend. Future provider, destination and challenge secrets depend on the eventual backend decision and must remain server-only. Existing deployment-mode configuration is unchanged.

## 17. Privacy

The review code makes no requests, writes no browser storage, logs no field values and emits no analytics events. Input is used only to provide local validation. Browser-managed autofill/history is independent of the page. The interface clearly says details are not sent or saved by the page. No broken privacy link was added: an actual privacy notice covering future collection, retention and providers is needed before live collection.

## 18. Alternative contacts

On 2026-10-16, the owner supplied **+92 3356709222** and requested WhatsApp only. The direct-contact section displays **Chat on WhatsApp**, the formatted number **+92 335 6709222**, and the normalized destination `https://wa.me/923356709222`. It opens in a new tab with appropriate link protection and an accessible name. The link works without JavaScript and does not automatically include inquiry fields or send a message. No email or booking URL is displayed. The inquiry backend remains deferred.

## 19. Service preselection

Primary and FAQ contact links on the four service pages append the matching service slug. The Contact enhancement accepts only those four known slugs, ignores unknown input and leaves the select editable. Direct Contact navigation has no forced selection. Existing intentional links elsewhere are preserved.

## 20. SEO title

**Contact — Start a Website or AI Project | ElevateX**

## 21. Meta description

Have a website, AI automation, chatbot or landing page project in mind? Explore the ElevateX project inquiry and the next steps for your idea.

## 22. Canonical

`https://www.elevatexlab.com/contact/`, using the existing centralized www origin. Contact remains **noindex, follow**, including in a production-mode build, and excluded from the sitemap until live collection is ready. Preview robots/header restrictions remain intact. The old Contact meta-refresh handoff is removed.

## 23. Structured data

Organization, WebSite, ContactPage and BreadcrumbList through centralized helpers. ContactPage references the shared organization identity. No invented address, email, telephone, opening hours, ratings or delivery claims.

## 24. AEO/GEO foundations

Readable server-rendered content, one H1, logical headings, explicit commercial service names, concise process explanations, consistent entity references and contextual links. No ranking promises, keyword stuffing or extra schema unrelated to visible content.

## 25. Responsive QA

Chrome and Edge checked at **320×568, 360×800, 375×812, 390×844, 430×932, 768×1024, 820×1180, 1024×768, 1280×720, 1366×768, 1440×900, 1536×864 and 1920×1080**. Fields fit, tap heights and 16px control text pass, the intended column count is correct, and validation introduces no horizontal overflow. A 200% text check passed at 1280px.

Twenty-one local PNG captures cover 390, 768 and 1440px: hero, full page, form, next steps, focus, errors and reviewed state. Desktop/mobile hero and form compositions were visually inspected. Firefox, Safari/WebKit and physical devices were not exercised.

## 26. Accessibility results

Zero automated axe WCAG A/AA violations at 390 and 1440px in Chrome and Edge, both before and after required-field errors. Keyboard order, visible focus, live feedback, native controls, first-error focus, reduced motion and no-JavaScript content/anchor behavior passed. These checks do not replace manual screen-reader and physical-device testing.

## 27. Tests run

- Astro check, configured ESLint, Prettier and Git whitespace checks.
- Ordinary static build and isolated production publication integration.
- Full Contact browser suite in installed Chrome and Edge.
- Five affected existing service/portfolio navigation checks in both browsers.
- Local mobile Lighthouse on the compressed static preview.
- Nine protected-page HTML comparisons against the retained pre-Contact baseline.

## 28. Actual outcomes

**42/42 Contact browser checks and 10/10 navigation regression checks passed.** An initial no-JavaScript assertion incorrectly queried the `noscript` wrapper; it was corrected to the visible message element, and the full suite passed on rerun. No failing, skipped or flaky tests in the final runs.

Astro check: **258 files, zero errors/warnings/hints**. Lint, formatting, whitespace, static build and publication integration passed. Ordinary preview output contains 14 pages. The empty insights collection remains an expected informational build warning.

No browser console/page errors or failed asset responses were found in the responsive checks. Local review emitted no requests and wrote no local/session storage. The production fixture verified Contact's noindex/sitemap exclusion and all four service parameters.

Homepage, Work listing and three case-study HTML files remain byte-identical to the retained baseline. All four service HTML files are identical after normalizing only the authorized Contact query parameters. About source was not edited in this task.

## 29. Lighthouse

Local mobile run: **Performance 98, Accessibility 100, Best Practices 100, SEO 66**. LCP **1.5s**, TBT **170ms**, CLS **0**. The SEO deduction is the intentional preview/indexability gate; it must stay until live collection is ready. These are local laboratory results, not production or field INP measurements.

Report: `artifacts/contact/mobile.report.html` and `.json`. The Contact entry script is 2,590 bytes gzip; this is the entry module size, not the total shared resource budget. No Contact image payload was introduced.

## 30. Remaining setup

When backend work is authorized: confirm real contact destinations/provider, implement server validation and delivery, establish privacy/retention terms, add server-side abuse protection and rate limits, verify actual message receipt and failure behavior, and then review indexability. Complete Safari/Firefox, real-device and screen-reader launch checks. Publication remains separately authorized.

## 31. Production readiness verdict

**Frontend implementation complete for local review. NOT READY for live inquiry collection through the form.** This is the intended boundary of the owner's request to defer backend work. The inquiry form cannot currently send messages. WhatsApp is available as a direct contact link. No fake successful delivery was shown or claimed.

WhatsApp follow-up QA on **2026-10-16**: build, lint, formatting and Astro check passed (259 files, zero errors/warnings/hints). Eight targeted Chrome/Edge checks passed, including semantic content, no-JavaScript behavior and axe AA scans. The WhatsApp destination, displayed number, keyboard focus and layout were checked without JavaScript at 320, 390 and 1440px; the mobile section capture was visually inspected. Initial browser attempts were blocked by the restricted localhost environment; checks passed after restarting the preview in the browser-accessible environment. No WhatsApp message was sent. Captures and results: `artifacts/contact/whatsapp/`.
