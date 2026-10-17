# Content authoring

Insights now has three substantive, source-reviewed local entries and a shared publishing system. Evidence-backed client case studies remain unpublished. The case-studies collection holds owner-confirmed concept previews and three published cinematic concept studies: Qadeer Jewellers, Infinity Salon and Apex Detailing Studio. Use [the Insights publishing guide](INSIGHTS_PUBLISHING_GUIDE.md) for articles and [the cinematic case-study guide](CASE_STUDY_GUIDE.md) for project studies. Do not create fake sample articles, clients or statistics to fill layouts. Templates below live in documentation and are never routed or included in a sitemap.

## Insight template

Create `src/content/insights/approved-slug.md` or `.mdx` when verified content exists. The filename supplies the stable article URL; no separate slug is maintained. Replace all bracketed values. Use H2 and H3 in the body; the layout renders the H1, author and dates. See [the full publishing guide](INSIGHTS_PUBLISHING_GUIDE.md) for components, covers, sources and QA.

```yaml
---
title: '[Specific question or topic]'
description: '[Clear factual summary]'
draft: true
publishedDate: '[Actual publication date: YYYY-MM-DD]'
# updatedDate: '[Only when significantly revised]'
author:
  name: '[Confirmed person or ElevateX brand]'
  type: Organization # Use Person only for a confirmed individual author.
  # url: 'https://[real author profile]'
category: Web Development # Or AI Automation, AI Chatbots, Digital Strategy.
tags: []
featured: false
relatedServices: [web-development]
sources: []
# quickAnswer: '[Direct answer in 2–4 sentences]'
# takeaways: ['One useful point']
# featuredImage:
#   src: /images/approved-image.avif
#   alt: '[Useful description]'
#   width: 1600
#   height: 900
---
```

Answer the headline question immediately, then add useful first-party detail and relevant sources. Sources render in the article and should support the actual claim. Each configured cover/social image must exist locally and have real dimensions and appropriate alternative text. Existing AVIF/WebP variants are discovered by the shared helper; it does not generate assets. The collection drives the homepage, listing, article routes, related content and RSS. Drafts and future publication dates stay excluded through one shared gate; preview builds remain noindex.

## Case study model

Create `src/content/case-studies/approved-slug.md` only after confirming publication permission. Required fields: title, description, publishedDate, client, industry, summary, context, challenge, constraints (array), role, strategy, solution, before, after, timeline, technologies (array). `relatedServices` accepts the four approved service slugs.

`draft` defaults to true. `featured`, `featuredImage` and `updatedDate` are optional. `gallery` items have src/alt/width/height. Results are optional and each requires `claim` and `source`; include `measuredAt` and `methodology` where applicable. An empty results array is better than an invented metric. A testimonial requires quote, attribution, a provenance source and `permissionConfirmed: true`.

The case-study layout renders structured context, constraints, role, strategy, solution, timeline, technologies, before/after, results and media. Markdown adds original narrative; avoid duplicating those automatic sections. Internal links to services/insights are added when their actual routes exist; do not link to planned but unpublished pages.

## Publication review

### Portfolio previews

Use `entryType: showcase` in the existing case-studies collection for a verified project preview. Required metadata: title, description, industry, publishedDate, relatedServices and a `showcase` block containing projectType (`concept`, `demo`, `client`, `internal`), category, liveUrl, order, verifiedDate, verification and image (src, alt, width, height). Set featured and draft explicitly. Add a typed `projectStudy` block when a cinematic study is authorized; see the dedicated guide rather than copying an old page component.

Preview images use the same 4:3 capture ratio, with local 480, 800 and 1200 px AVIF/WebP variants. Point image.src at the `-1200.webp` fallback. The featured-work helper validates all variants and service associations at build time; malformed or missing previews fail the build. It selects up to three published featured entries, sorted by showcase.order. It excludes drafts and future publication dates.

Showcase entries retain their inspected live-project links. A separately published `projectStudy` adds its real study route, Work link, next-project eligibility and sitemap URL; a missing, draft or future-dated study adds none. Full evidence-backed case studies default to `entryType: case-study` and keep all existing evidence requirements; add an optional showcase block to feature one on the homepage with a link to its real detail page. Project classification needs owner confirmation. Public demo ratings/testimonials are not evidence of ElevateX results.

### Checklist

1. Verify claims, identities, permissions, source material and dates.
2. Verify related links and media dimensions; avoid unapproved location assertions.
3. Check direct answers and unique page intent.
4. Set `draft: false` only when approved. A future date still prevents route generation.
5. Build and run QA. Confirm schema matches visible content and sitemap/canonical URLs agree.
6. Deploy approved content and explicitly notify IndexNow if useful; never submit preview URLs.

Updates to already-published content go live at rebuild. Use a draft branch/PR for unfinished revisions, because a future `updatedDate` does not schedule a new version of an existing article. Set only actual editorial dates.
