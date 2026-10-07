# ElevateX

Astro + TypeScript rebuild for ElevateX. The foundation and primary cinematic hero are implemented. The remaining website pages, integrations and production launch are separate stages.

Read [AGENTS.md](AGENTS.md) before changing the project. Repository: [muhammad1hamid/elevatex-masterpiece](https://github.com/muhammad1hamid/elevatex-masterpiece).

## Start

Use Node 24 LTS (minimum 22.12) and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by Astro. No external accounts, secrets or paid services are needed. `.env.example` documents optional build controls; preview mode is the default without an environment file.

## Check

```sh
npx playwright install chromium
npm run qa
npm run cloudflare:check
```

`qa` runs Astro/TypeScript checks, lint, formatting, a temporary-fixture publication build, the static build and meaningful Playwright/axe checks. `npm run test:all-browsers` additionally supports Firefox and WebKit after `npx playwright install firefox webkit`. Real Safari, physical mobile devices and field performance remain launch QA work. If browser downloads are unavailable, set `PLAYWRIGHT_CHANNEL=chrome` or `msedge` to use an installed browser for the default suite. See [hero implementation and QA](docs/hero-implementation.md) for measured results and limitations.

## Structure

```text
public/                 Optimized hero layers, licensed fonts and favicon
src/components/         Global, UI, SEO and layered hero components
src/content/            Markdown insights and case studies (empty until verified)
src/content.config.ts   Validated content models, draft by default
src/data/               Brand facts, approved services and route registry
src/layouts/            Shared HTML document shell
src/pages/              Static preview, 404, publication routes, sitemap and robots
src/scripts/            Navigation, page-specific hero motion, analytics boundary
src/styles/             Tokens, typography, base styles and utilities
src/utils/              Canonicals, schema, publication rules and content access
scripts/                Hosting headers, live-site audit and explicit IndexNow
tests/                  Browser, accessibility, indexing and publishing checks
docs/                   Architecture, deployment, integrations and migration evidence
```

## Publishing rules

The homepage is a non-indexable hero preview with progressively enhanced motion and navigation. Content remains useful without JavaScript. Fonts and artwork are self-hosted; analytics and forms remain disabled. Temporary noindex [preview navigation handoffs](docs/hero-navigation.md) connect planned routes to existing content and are excluded from production.

Content entries default to `draft: true`. Public entries must have `draft: false` and a non-future `publishedDate`; their filename/optional `slug` must be lowercase words separated by hyphens. Markdown body headings start at H2. Docs templates are outside content collections. Actual editorial dates supply sitemap `lastmod`.

Indexing requires both `DEPLOYMENT_ENV=production` and page approval (static route `indexable`, or a published content entry). Preview pages send noindex through HTML and Cloudflare headers, and have an empty sitemap. Robots allows fetching so crawlers can see noindex; use authentication for confidential previews. See [Google's noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

Production canonicals provisionally use `https://www.elevatexlab.com`, matching the existing live redirect. No live DNS, redirect or site content has been changed. Read [migration review](docs/migration/README.md) before launch.

## Next stages

1. Review the implemented hero against the locked reference and [documented artwork differences](docs/hero-assets.md).
2. Implement approved page designs and verified content.
3. Resolve the legacy URL map and Pakistan positioning.
4. Build the contact service and approved measurement integrations.
5. Complete launch QA, then connect the production hostname on Cloudflare.

See [architecture](docs/architecture.md), [Cloudflare runbook](docs/cloudflare.md), [integration decisions](docs/integrations.md), and [QA evidence](docs/qa.md).
