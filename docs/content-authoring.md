# Content authoring

Collections are intentionally empty. Do not create fake sample articles, clients or statistics to fill layouts. Templates below live in documentation and are never routed or included in a sitemap.

## Insight template

Create `src/content/insights/approved-slug.md` when verified content exists. Replace all bracketed values. Use H2 and H3 in the body; the layout renders the H1, author and dates.

```yaml
---
title: '[Specific question or topic]'
description: '[Clear factual summary]'
draft: true
publishedDate: '[Actual publication date: YYYY-MM-DD]'
# updatedDate: '[Only when significantly revised]'
author:
  name: '[Verified person]'
  # url: 'https://[real author profile]'
category: '[Editorial category]'
tags: []
featured: false
relatedServices: [web-development]
sources: []
# featuredImage:
#   src: /images/approved-image.avif
#   alt: '[Useful description]'
#   width: 1600
#   height: 900
---
```

Answer the headline question immediately, then add useful first-party detail and relevant sources. Sources are rendered in the article and should support the actual claim. Each image requires real dimensions and appropriate alternative text. Future responsive image components should use AVIF/WebP sources; the foundation does not generate imaginary image variants.

## Case study model

Create `src/content/case-studies/approved-slug.md` only after confirming publication permission. Required fields: title, description, publishedDate, client, industry, summary, context, challenge, constraints (array), role, strategy, solution, before, after, timeline, technologies (array). `relatedServices` accepts the four approved service slugs.

`draft` defaults to true. `featured`, `featuredImage` and `updatedDate` are optional. `gallery` items have src/alt/width/height. Results are optional and each requires `claim` and `source`; include `measuredAt` and `methodology` where applicable. An empty results array is better than an invented metric. A testimonial requires quote, attribution, a provenance source and `permissionConfirmed: true`.

The case-study layout renders structured context, constraints, role, strategy, solution, timeline, technologies, before/after, results and media. Markdown adds original narrative; avoid duplicating those automatic sections. Internal links to services/insights are added when their actual routes exist; do not link to planned but unpublished pages.

## Publication review

1. Verify claims, identities, permissions, source material and dates.
2. Verify related links and media dimensions; avoid unapproved location assertions.
3. Check direct answers and unique page intent.
4. Set `draft: false` only when approved. A future date still prevents route generation.
5. Build and run QA. Confirm schema matches visible content and sitemap/canonical URLs agree.
6. Deploy approved content and explicitly notify IndexNow if useful; never submit preview URLs.

Updates to already-published content go live at rebuild. Use a draft branch/PR for unfinished revisions, because a future `updatedDate` does not schedule a new version of an existing article. Set only actual editorial dates.
