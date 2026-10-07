# Hero preview navigation

The hero preserves its intended links: `/`, `/services/`, `/work/`, `/about/`,
and `/contact/`. The primary hero and header call links use `/contact/`.
The full destination pages are outside the approved hero stage.

Preview builds temporarily hand those routes to existing content. They do not
publish commercial placeholder pages or claim that the new pages are complete.

| Preview route | Temporary destination                  | Reason                                                                                 |
| ------------- | -------------------------------------- | -------------------------------------------------------------------------------------- |
| `/services/`  | `/#services`                           | The current local homepage contains the four approved services.                        |
| `/work/`      | `https://www.elevatexlab.com/#work`    | Existing live homepage work section.                                                   |
| `/about/`     | `https://www.elevatexlab.com/#home`    | Existing live agency overview; a dedicated working About destination is not available. |
| `/contact/`   | `https://www.elevatexlab.com/#contact` | Existing live homepage contact section.                                                |

## Implementation

`src/pages/[destination].astro` generates four small noindex redirect utilities
only when `DEPLOYMENT_ENV` is not `production`. An immediate HTML refresh works
without JavaScript; every utility also includes a normal fallback link.
External fallback links are labeled “Continue to the current ElevateX website.”
They contain no copied business details, invented proof, new forms or analytics.

`scripts/write-hosting-headers.mjs` emits matching temporary HTTP 302 rules to
`dist/_redirects` for preview builds. It handles both slash forms. Cloudflare uses
those HTTP redirects; the local Astro static preview serves the utility HTML
with HTTP 200 before its browser refresh. Checks should inspect the local
response without following the external website.

Production builds generate neither the utility pages nor these redirect rules.
The existing migration proposals in `docs/migration/` are unchanged. These
temporary preview handoffs must not become a production migration map.

## Destination verification — 2026-10-07

Read-only HTTP GET requests returned 200 for `https://www.elevatexlab.com/`.
Requests to `/portfolio`, `/about`, and `/contact`, including each trailing-slash
variant, returned 404. The live site advertises client-side routes for these
paths, but its server does not currently serve those deep links successfully.
Redirecting preview links to those paths would therefore create dead links.

The live homepage's public application bundle,
`https://www.elevatexlab.com/assets/index-CL936xLA.js`, returned 200 and explicitly
renders homepage sections with IDs `home`, `services`, `work`, and `contact`.
The selected fragment URLs refer to those existing sections on the working root
document. No homepage `about` section was found, so the About handoff uses the
existing agency overview and is explicitly temporary. Headless Chrome also
rendered the live root successfully and confirmed visible `home`, `work`, and
`contact` sections with real content. This check does not validate the truth of
legacy claims or prove contact-form delivery.

Before launch, publish the approved service, work, About and contact pages,
verify contact delivery and booking details, and replace these preview handoffs
with their actual destinations. A production cutover remains blocked until
those pages and the existing migration gates are complete.
