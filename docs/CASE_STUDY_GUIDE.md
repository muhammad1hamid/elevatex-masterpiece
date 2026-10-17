# Adding a cinematic case study

The shared engine renders Qadeer Jewellers, Infinity Salon and Apex Detailing Studio from Markdown frontmatter. A future project normally needs **one collection entry and its media**, without a new Astro page or component.

The working automotive example is `src/content/case-studies/apex-detailing.md`. The complete, deliberately unpublished minimal example is `tests/fixtures/cinematic-study.json`. JSON can be used inside YAML frontmatter. Do not publish the synthetic fixture as business content.

## 1. Confirm the facts first

Record the project name, industry, public demo URL, permission to use media, project classification and what was actually built or inspected. The allowed classifications are `concept`, `demo`, `client` and `internal`. Classification is supplied once in `showcase.projectType`; the study derives its visible label from it.

Client status requires genuine confirmation. A concept with a public demo remains a concept. Screenshots demonstrate a visible interface, not sales, delivery, customer satisfaction, backend integrations or permission to disclose a client relationship. Do not infer those claims from a screenshot.

Apex deliberately retains the approved listing title **Classic Detailers**, while `projectStudy.displayName` is **Apex Detailing Studio** and the overview explains the demo's current branding. Do not rename an existing listing or URL as an incidental authoring change.

## 2. Retain and prepare media

Keep supplied originals and capture records in `source-assets/<project>/` and `artifacts/<project>/source/`. Use descriptive filenames. Never replace a real screenshot with an AI reconstruction.

To capture a public website with local Chrome:

```powershell
node scripts/capture-project-source.mjs project-slug https://example.com/
```

This records desktop, large desktop, tablet, mobile, full-page and available interface sections. The script is an evidence helper, not an assertion that every website has the same sections. Review its capture manifest and the actual website. Capture unusual interactions separately, without submitting forms or contacting anyone. `capture-apex-interactions.mjs` is the automotive-specific source audit, not a future-project requirement.

Create a JSON input manifest, for example `source-assets/project-slug/media-input.json`:

```json
{
  "slug": "project-slug",
  "liveUrl": "https://example.com/",
  "capturedAt": "2026-10-15",
  "images": [
    {
      "key": "desktop",
      "source": "artifacts/project-slug/source/desktop.png",
      "widths": [480, 800, 1200],
      "category": "AUTHENTIC_SCREENSHOT",
      "alt": "Describe the actual visible interface and its purpose.",
      "caption": "Actual website capture / Desktop / capture date.",
      "credit": "Public website capture by ElevateX."
    }
  ]
}
```

The example hostname is illustrative authoring syntax; replace it with the verified public URL. Use an actual capture date. Then run:

```powershell
node scripts/prepare-case-study-media.mjs source-assets/project-slug/media-input.json
```

The offline helper writes responsive AVIF and WebP files under `public/images/work/project-slug/` and a `media.generated.json` beside the input. It does not upscale. Copy the generated `media` dictionary into `projectStudy.media`, then review alt text, captions, dimensions and any mobile rendition. This JSON is preparation output; runtime pages read the collection entry.

### Provenance categories

| Category                     | Required evidence and treatment                                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AUTHENTIC_SCREENSHOT`       | Actual website capture, nonempty alt, HTTPS `sourceUrl`, real `capturedAt`, caption and credit. Required for website, technical, responsive, final-site and screenshot-viewer placements.               |
| `VERIFIED_BRAND_PHOTOGRAPHY` | Verified source, caption, credit and `permissionConfirmed: true`. Confirmation is an editorial responsibility.                                                                                          |
| `ILLUSTRATIVE_EDITORIAL_ART` | Visible caption containing “Illustrative” or “Editorial visual study”, plus credit. The schema rejects hidden or misleading illustration captions. Never proof of premises, staff, products or results. |
| `CONCEPT_VISUAL`             | Concept rendering with accurate caption/credit. Cannot be used in an evidence placement or browser frame.                                                                                               |

### Media fields

Every media item needs `base`, increasing `widths`, largest `width` and `height`, `category`, `alt`, `caption` and `credit`. A family such as `/images/work/project-slug/desktop` must have both `-480.avif` and `-480.webp`, and equivalent files for every declared width. Builds reject missing files.

Optional controls:

- `focalPoint: {x: 50, y: 50}`: percentages, each 0–100.
- `aspectRatio`: `native` (default), `wide`, `square`, `portrait`.
- `fit`: `contain` or `cover`. Explicit fit applies to a configured crop; native images retain the composition family's reviewed behavior.
- `position`: `inline` (default), `left`, `right`, `center`; alignment is useful when the containing layout constrains the image width.
- `mobile`: a separate rendition with its own `base`, `widths`, `width`, `height`. Supply an honest alternative capture or reviewed crop, not a stretched desktop image.

A placement refers to a dictionary key: `{media: desktop, browser: true}`. It may set `caption`, `showCaption`, and responsive `sizes`. Browser framing is allowed only for authentic screenshots. Captions on illustrative artwork must remain visible and accurate. Device and viewer captures can suppress redundant captions only when the surrounding evidence explanation is retained.

## 3. Add one collection entry

Create `src/content/case-studies/project-slug.md`. Start from a reviewed entry or the complete fixture structure, retaining only the chapters needed for this project.

### Collection fields

| Field                                   | Purpose                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| `entryType: showcase`                   | Uses this engine when `projectStudy` is present and published.                        |
| `title`, `description`, `industry`      | Accurate Work listing identity and summary.                                           |
| `publishedDate`, optional `updatedDate` | Actual editorial dates; an update cannot predate publication.                         |
| `draft`                                 | Defaults to true. Keep true while authoring.                                          |
| `featured`                              | Homepage inclusion preference. It does not publish a draft.                           |
| `relatedServices`                       | Existing service slugs only. At least one is needed for Work integration.             |
| `showcase`                              | Verified classification, live URL, real listing image, order and verification record. |
| `projectStudy`                          | Versioned cinematic content described below.                                          |

`showcase` requires `projectType`, `category`, `liveUrl`, `image`, `order`, `verifiedDate` and `verification`. Its listing `image.src` must end in `-1200.webp`, have alt/width/height, and have 480/800/1200 AVIF and WebP siblings. Select a real capture large enough for these sizes. The image helper can prepare this family; copy or name the outputs consistently. The listing's older image schema is intentionally retained to preserve the approved Work page.

Optional `showcase.portfolio` controls the existing featured Work composition (`featured`, approved `layout`, `focus`, `details`, optional real `mobileImage`). Ordinary future studies do not need to become featured homepage projects.

### Study fields

Required: `version: 1`, `presentation`, `theme`, `publishedDate`, `pageTitle`, `description`, `hero`, `media`, `sections`.

Optional:

- `slug`: route segment when it differs from the Markdown entry ID. Existing URLs must be preserved; check migration mappings before changing this.
- `displayName`: study identity when a documented alias differs from the approved listing name.
- `draft`: defaults to true, independent from the collection's draft flag.
- `updatedDate`: a real editorial update date.
- `socialImage`: local `src`, accurate `alt`, explicit `width` and `height`.
- `nextProjectSlug`: preferred published case-study route segment. Invalid, unpublished or self references fall back to published Work order.

There is no raw HTML, executable component name or arbitrary CSS field in study data. IDs must be stable lower-case anchors and unique across all section/heading IDs. Media references, variants, dates and URL protocols are validated at build time.

## 4. Select a reviewed composition

`presentation` selects a complete responsive layout family; `theme` selects the controlled heading accent. Composition families retain their own reviewed spacing, frames, backgrounds and device arrangement. These settings are separate so an agency is not forced to use the jewellery accent for every campaign-style study.

| Section               | `campaign`             | `editorial`         | `precision`           |
| --------------------- | ---------------------- | ------------------- | --------------------- |
| Hero                  | `immersive-photo`      | `portrait-arch`     | `immersive-photo`     |
| `overview`            | `panorama`             | `interior-split`    | `wide-studio`         |
| `website-showcase`    | `contained-browser`    | `immersive-browser` | `wide-editorial`      |
| `design-story`        | `image-left`           | `offset-editorial`  | `precision-detail`    |
| `responsive-showcase` | `layered-devices`      | `aligned-devices`   | `layered-devices`     |
| `technical-story`     | `interface-left`       | `notes-left`        | `precision-editorial` |
| `editorial-gallery`   | `asymmetric-editorial` | `portrait-mosaic`   | `cinematic-panorama`  |
| `final-showcase`      | `full-bleed`           | `contained`         | `contained`           |
| `related-project`     | `framed-preview`       | `editorial-preview` | `wide-preview`        |
| `cta`                 | `quiet-centered`       | `quiet-centered`    | `quiet-centered`      |

All families also support `minimal-typographic` hero. Unsupported family/variant combinations fail validation. These are reviewed combinations, not a promise that every visual variant can be mixed arbitrarily. A genuinely new composition requires a reusable renderer/style change, responsive QA and a schema/guide update once; ordinary new projects reuse existing families.

Themes: `jewellery` and `beauty` retain the approved champagne heading accent; `automotive` and `neutral` use silver. Brand CTA buttons retain the shared champagne treatment. No project-specific CSS is read from content.

## 5. Configure the story

The hero is separate from `sections`. It requires `id`, `titleId`, `variant`, `eyebrow`, `statement` (1–3 lines), `description`, `classificationSuffix`. Photo heroes require an `image`; portrait heroes may supply decorative `margins`. Optional `indexLink` points to a real section. The visible H1 comes from `displayName` or `title`; do not add a second H1. The primary hero link automatically targets the overview, or the first configured chapter if overview is omitted.

Put chapters in the desired order in `sections`; **omit unused chapters**. There is no duplicate enable/disable flag. A study needs 1–20 chapters, not every possible section.

Most sections require `id`, `eyebrow`, `heading: {id, lines}`, `intro`, `type` and `variant`:

| Type                  | Additional fields                                                                                                                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `overview`            | `facts` and `image`; optional `evidenceNote`. Facts use a controlled `source`: project, industry, classification, services, live or text. Services/live/text require display `text`; optional local `href`. `interior-split` requires `atmosphere` copy. |
| `website-showcase`    | Real `image`; optional `notes`, `liveLabel`, `viewer`.                                                                                                                                                                                                   |
| `design-story`        | Editorial `image`, genuine interface `detail`, `notes: [{title, text}]`; optional `detailEyebrow`, `noteKicker`.                                                                                                                                         |
| `responsive-showcase` | `devices` (1–3 unique desktop/tablet/mobile roles, each with label and real image), `notes`; optional `viewer`.                                                                                                                                          |
| `technical-story`     | `journey` strings, `notes`, actual `image`; optional actual `secondary` and `viewer`. Describe verified interface behavior; do not invent a technology stack.                                                                                            |
| `editorial-gallery`   | `images` (1–6 placements). Arrange lead/closing imagery for the selected composition and review short or long sets visually.                                                                                                                             |
| `final-showcase`      | Actual `image`, `buttonLabel`, `related` inline text/link parts. The website CTA uses the verified live URL.                                                                                                                                             |
| `related-project`     | `id`, `variant`, `eyebrow`, `linkLabel`; optional `descriptionLines`. Target/image/classification are derived from published collection data.                                                                                                            |
| `cta`                 | `id`, `variant`, `eyebrow`, `heading`, `intro`, primary/secondary labels and optional real hrefs. Defaults are `/contact/` and `/work/`; ensure the active site's destination handling is appropriate.                                                   |

A screenshot `viewer` uses native HTML details and a keyboard-scrollable image region: `image`, `summary`, optional `instructions`, optional `regionLabel`. It works without JavaScript.

`related` supports `{type: text, text: ...}` and `{type: link, label: ..., href: ...}`. Links must be local paths, local anchors or HTTPS URLs. Use useful existing service/work links; do not create placeholder pages to fill the story.

Verified results and quotations remain in the existing evidence-backed `entryType: case-study` model, including sources and quote permission. This cinematic version has no results/testimonial section; unsupported types are rejected. Do not smuggle unsupported claims into general notes.

## 6. Motion

Hero `motion` is `cinematic` or `none`. Optional chapter `motion` is `none`, `subtle-reveal`, `soft-reveal`, `browser-reveal`, `detail-reveal`, `device-reveal` or `gallery-reveal`. Names map to a small finite reveal system, not separate animation libraries. Choose `none` where motion adds no value.

Content is visible before scripts. Reveals run only for fine-pointer desktop users at least 1024 px wide who have not requested reduced motion. Reduced motion, mobile, missing animation APIs and no-JS retain the readable final state. No scroll hijack, looping scene, WebGL or React island is required.

## 7. Social preview and publication

Configure `socialImage` before generating it, then run:

```powershell
node scripts/create-case-study-social.mjs src/content/case-studies/project-slug.md
```

The helper uses the first authentic website-showcase image and self-hosted Outfit, producing a 1200×630 PNG at the configured path. Inspect the output and its alt text; a long project name may need a reusable layout adjustment.

When approved, set **both** collection and study `draft: false`, with nonfuture editorial dates. Work listing visibility is controlled by collection publication; full study routes also require study publication. A listing can therefore exist while its study remains draft. Do not change existing publication flags merely to populate navigation.

Routing is automatic through `src/pages/work/[id].astro`. Published studies get `/work/<study.slug or entry-id>/`, Work case-study links, sitemap entries and next-project eligibility. Duplicate route segments fail the build. Next projects follow the collection's `showcase.order`, wrapping among published studies; unpublished entries never become next links.

Preview builds intentionally use noindex. Production indexing/robots are controlled centrally; a successful local build does not authorize a production cutover or GitHub publication. Keep actual dates, consistent www canonicals and accurate visible/schema content.

## 8. Validate and review

Run checks sequentially because content generation and publication fixtures share Astro's content cache:

```powershell
npm run check
npm run lint
npm run format:check
npm run test:publication
npm run build
```

Run the targeted suite with the repository's normal Playwright configuration. It starts its own preview on port 4321; stop any manually running server on that port first. Local Chrome can be selected explicitly:

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome'
npx playwright test tests/qadeer-study.spec.ts tests/infinity-study.spec.ts tests/apex-study.spec.ts tests/case-study-engine.spec.ts tests/work.spec.ts
```

For visual captures, run `npm run preview -- --port 4321` in a separate terminal, then `node scripts/capture-case-study.mjs project-slug`. The capture helper records 390, 768, 1366, 1440 and 1920 px views. Review desktop and mobile chapters, image crops, full-page flow and screenshot viewers. Browser tests cover additional widths, keyboard access, reduced motion, no-JS, text enlargement, links, schema and axe. They do not replace manual screen-reader, physical-device or Safari testing.

The engine fixture is permanent **test data**, outside the content collection. `test:publication` temporarily writes a draft entry and a dedicated `qa-engine-preview` host, renders it through the shared layout in an isolated output directory, asserts noindex and reordered optional chapters, checks exclusion from Work/sitemap/ordinary project routes, then removes the temporary source files. It never adds a fixture route to the ordinary site build. Run a normal build after publication checks to restore the ordinary content cache.

For a new project, inspect the files, dates, claims and external URL yourself, then add meaningful project-specific expectations to the existing reusable tests where needed. Preserve the approved three studies with baseline comparisons before changing shared styles. Do not report Lighthouse targets as measured results or submit forms during source inspection.

## Engine ownership

- Content: `src/content/case-studies/*.md`.
- Validation: `src/lib/case-study/schema.ts`, `src/content.config.ts`.
- Shared context/media validation: `src/lib/case-study/`.
- Layout/sections: `src/components/case-studies/`.
- Reviewed compositions: `src/styles/case-study-{campaign,editorial,precision}.css`.
- Themes: `src/styles/case-study-themes.css`.
- Finite motion: `src/scripts/animations/case-study.ts`.
- Publication, Work and sitemap: existing centralized content/SEO helpers.

The practical future workflow is: verify facts → retain/capture media → optimize → add one typed entry → select a reviewed composition → validate → visually review → obtain publication authorization when required.
