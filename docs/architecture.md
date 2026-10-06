# Foundation architecture and decisions

## Existing state

The selected GitHub repository had no commits and the local directory contained only Git metadata. No application source, assets, package setup or prior local work needed migration. The live site is a separate deployment: its HTML advertises bundled scripts/CSS, loads remote fonts and analytics, and renders an empty `#root` container before JavaScript. This indicates a client-rendered application; source-level framework claims cannot be verified without its original repository.

The current logo, original work imagery, existing copy and search performance data may be worth preserving. Their existence in a deployed bundle does not establish permission to reuse client imagery, accuracy of metrics, or continued contact ownership. Obtain originals and validate claims before reusing them. Archived HTML includes existing asset URLs and analytics identification for continuity; no tracker is re-enabled here.

## Runtime

Astro static output with TypeScript strictest settings fits this content-oriented site. Native HTML and CSS deliver the base experience. Build-time content collections use Astro's glob loader and Zod schemas. No client framework, animation engine or CMS is required for the foundation. React/MDX/GSAP can only be added for specific later needs.

Routes come from Astro files. Shared publication helpers exclude drafts and future publication dates from generated content routes and the sitemap. Static pages enter the sitemap only through the reviewed route registry. Production mode alone does not approve an unfinished homepage.

The custom sitemap endpoint is small and explicit: it shares publication rules with routes, supports accurate content lastmod, and avoids accidental indexing of preview/utility routes. This replaces the need for a sitemap integration in this foundation.

## Metadata and evidence

Central `site.ts` contains verified entity facts and the provisional hostname. SEO components provide title, description, canonical, robots, Open Graph, conditional image metadata and social cards. No fictitious social image, logo asset, founder, address, phone or review schema is supplied.

Schema functions support Organization, WebSite, WebPage/AboutPage/ContactPage, Service, Article and BreadcrumbList. Case studies use CreativeWork without inventing a Person author. JSON-LD serialization escapes HTML-breaking characters. Article authors are required; case-study numeric or qualitative results require sources; testimonials require explicit permission confirmation. Editorial review still validates truth.

## Styling and accessibility

Tokens cover neutral/gold colors, typography, spacing, containers, breakpoints, radii, glow, duration and easing. System font fallbacks keep this foundation free of font downloads; later licensed WOFF2 selection must include metrics/fallback review. CSS variables document breakpoint values, while media queries use matching literals because standard variables cannot be media-query conditions.

Semantic landmarks, skip link, visible keyboard focus, fluid type and reduced-motion/forced-color handling are shared. All content starts visible. There is no mobile menu until the final navigation design requires one; the foundation's one-link navigation works at every width without JavaScript.

## Packages and exclusions

- Astro: static rendering, routing, content collection validation and optimized build.
- TypeScript + `@astrojs/check`: strict application and Astro template checking.
- ESLint + TypeScript/Astro support: consistent code and framework-aware checks. Versions are matched by peer requirements, never forced through incompatible peer dependencies.
- Prettier + Astro plugin: predictable formatting.
- Playwright + axe: browsers, responsive behavior, keyboard and automated accessibility checks.
- Wrangler: Cloudflare static-assets validation and later deployment, no adapter/runtime needed for static pages.
- A scoped npm override pins Miniflare's Sharp dependency from 0.35.4 to patched 0.35.5 for [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w). Remove the override when the upstream dependency is patched; retain the audit and deployment checks.
- No Tailwind, React, Three.js, animation stack, icon library, paid CMS, remote font service or live analytics package in this stage.

## Performance

The foundation intentionally has zero executable page scripts and no critical raster/font downloads. Tooling packages are development/build dependencies and do not become browser bundles merely by being installed. Future assets and interactions must satisfy AGENTS.md budgets. A fast foundation is not proof of future hero performance or field Core Web Vitals.

## Milestones and pending decisions

Foundation → design system → dedicated hero → homepage/services → verified case studies/insights → migration/SEO → contact/analytics → QA → deployment.

Non-blocking now, required before launch: official logo/fonts and usage rights; founder/team/contact/legal facts; real case-study evidence; booking/form delivery destination; global/Pakistan positioning; final hostname confirmation against Search Console; GPTBot preference; Cloudflare ownership and production domain bindings.

References: [Astro collections](https://docs.astro.build/en/guides/content-collections/), [Astro Cloudflare deployment](https://docs.astro.build/en/guides/deploy/cloudflare/), [Cloudflare static headers](https://developers.cloudflare.com/workers/static-assets/headers/).
