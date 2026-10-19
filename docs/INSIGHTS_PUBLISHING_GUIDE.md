# Publishing an ElevateX Insight

The Insights collection owns the homepage previews, `/insights/`, article routes, related recommendations and `/insights/rss.xml`. Add content without creating another Astro page. The implementation is in `src/content.config.ts`, `src/lib/insights/articles.ts` and `src/pages/insights/`.

## Create the content entry

Add `src/content/insights/a-clear-stable-topic.mdx`, or `.md` when components are unnecessary. The filename becomes `/insights/a-clear-stable-topic/`. Use lowercase words separated by hyphens, keep entries at the collection root and preserve published filenames. There is no separate `slug` field. A later URL change needs a reviewed migration and relevant redirect.

Start as a draft:

```yaml
---
title: A clear, specific article title
description: A factual summary of what the reader will learn.
publishedDate: 2026-10-16 # Replace with the actual first publication date.
draft: true
featured: false
author:
  name: ElevateX
  type: Organization
  url: https://elevatexlab.org/about/
category: Web Development
tags: [user experience, digital strategy]
quickAnswer: A useful, independently understandable answer in two to four sentences.
takeaways:
  - One concrete point the reader can apply.
relatedServices: [web-development]
sources:
  - title: Actual source title
    url: https://www.w3.org/WAI/tutorials/forms/labels/
    publisher: W3C Web Accessibility Initiative
    context: Explain the specific guidance used in the article.
---
```

Required metadata is `title`, `description`, `publishedDate`, `author.name` and `category`. `author.type` accepts `Person` or `Organization` and defaults to `Person`; set it explicitly for brand attribution. Use a person's name only with confirmed authorship. Do not automatically attribute articles to Hamid.

Categories are **Web Development**, **AI Automation**, **AI Chatbots** and **Digital Strategy**. Use tags for narrower subjects. Related service slugs are `web-development`, `ai-automation`, `ai-chatbots`, `landing-pages`. Related project IDs currently accept `qadeer-jewellers`, `infinity-salon`, `apex-detailing-studio`; those are concept studies, not verified commercial results.

Optional fields include `updatedDate`, `featured`, `featuredImage`, `coverCaption`, `socialImage`, `quickAnswer`, `takeaways`, `seoTitle`, `seoDescription`, `relatedServices`, `relatedProjects` and `sources`. Arrays default to empty. Sources require title and HTTP(S) URL; publisher/context are optional. Titles and descriptions supply the default SEO metadata.

## Write and illustrate

The template renders the H1, byline and dates. Start body headings at H2. Use left-aligned prose, direct explanations, concrete examples and inline citations beside factual claims. Sources render automatically below the body. Verify what each source actually says; no fictional statistics or references. See [the initial source review](insights-source-review.md).

MDX is trusted repository-authored content only. Never execute untrusted submissions or embed unsanitised third-party HTML.

```mdx
import ArticleDiagram from '../../components/insights/ArticleDiagram.astro';
import ArticleCallout from '../../components/insights/ArticleCallout.astro';

## A useful explanation

Readable prose comes first.

<ArticleDiagram variant="automation" />

<ArticleCallout title="A practical point" tone="takeaway">
  <p>One useful explanation belongs here.</p>
</ArticleCallout>
```

Diagram variants are `conversion`, `automation`, `support`; each represents a labelled illustrative workflow. Callout tone is `note` (default) or `takeaway`. Use native Markdown tables or a direct semantic HTML `<table>` with headers/caption. The article template maps tables through `ArticleMarkdownTable`, supplying an accessible overflow region. **Do not manually wrap them in `ArticleTable`**, which would duplicate that region.

For covers, provide actual local dimensions and descriptive alternative text:

```yaml
featuredImage:
  src: /images/insights/topic-wide-720.webp
  alt: Describe the actual image.
  width: 720
  height: 405
coverCaption: Editorial illustration; interface text is illustrative.
socialImage:
  src: /images/insights/topic-social.png
  alt: Describe the social image.
  width: 1200
  height: 630
```

Create those files before referencing them. The helper discovers existing AVIF/WebP siblings for `-wide-` or `-article-` names at supported widths (480, 720, 768, 960, 1200, 1600) and matching `-mobile-` variants (400, 640, 720). It does not generate images. A different local filename uses the normal image fallback. Missing configured cover/social files fail the build. Use `coverCaption` for truthful provenance; artwork text is not evidence.

## What the system generates

Reading time is an approximate prose estimate at 220 words per minute, excluding imports, fenced code and markup. Related articles rank shared category, services and tags, exclude the current article and use only positive matches. H2 headings generate a TOC when there are at least five. Ordinary anchors, content, sources and service links work without JavaScript; topic filtering, active TOC tracking and reading progress enhance them. Empty topics are omitted. There is no search service or pagination for the initial three articles.

## Review and publish

`draft` defaults to `true`. Set `draft: false` only after editorial approval. The shared publication gate also excludes future `publishedDate` values from routes, listings, recommendations, sitemap and RSS. Dates render in UTC; date-only values become midnight UTC. A rebuild is needed when scheduled content becomes eligible. `updatedDate` must not precede publication and changes only for a real revision; it does not schedule a draft revision.

Canonicals use `https://elevatexlab.org` and trailing slashes. Metadata, Article/Organization relationships and breadcrumbs derive from content. Preview builds remain noindex. Approved published Insights become indexable and enter the sitemap only in a production-environment build. This does not authorise deployment or activate analytics.

Run sequentially from the repository:

```powershell
npm run check
npm run lint
npm run format:check
npm run test:publication
npm run build
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm test -- tests/insights.spec.ts tests/insights-journal.spec.ts
```

The default browser command starts preview on port 4321; free that port first. `test:publication` runs an isolated production build with temporary published/draft/future MDX fixtures, validates compilation, automatic routes, metadata, RSS and sitemap exclusion, then removes fixtures. Run it separately from other Astro builds/checks.

Inspect mobile/desktop screenshots, keyboard use, no-JS/reduced-motion behaviour, links, sources and image loading. Confirm the actual date, author, classification and metadata in output. Keep unfinished revisions in a draft branch. Local approval is not permission to push, deploy, submit IndexNow or cut over production.
