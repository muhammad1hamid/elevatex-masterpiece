# ElevateX project constitution

Read this file before modifying this repository. Preserve working code and make changes in logical, reversible stages.

## Scope and brand

- ElevateX is a premium digital systems agency: **Premium Digital Systems For Serious Growth.**
- Supporting proposition: **We help ambitious businesses grow with high-converting websites, AI systems, and smart chatbots.**
- The commercial services are Web Development, AI Automation, AI Chatbots, and Landing Pages. Do not advertise SEO/AEO/GEO as services without confirmation.
- Current stage: primary hero implementation authorized by the Hero Master Prompt and locked Image A received 2026-10-07. Match that reference; build semantic HTML, independent transparent assets, CSS/SVG studio lighting and a short GSAP entrance. The complete site and unrelated homepage sections remain outside this stage.
- Use concrete, concise copy. Never fabricate clients, team members, contact details, testimonials, awards, statistics, locations, pricing, or results.

## Architecture and cost

- Astro, strict TypeScript, static HTML by default. Primary content must work without JavaScript. Islands require a concrete interaction need.
- Use custom CSS and design tokens. No React-heavy SPA, paid CMS, or paid infrastructure dependency. Prefer Cloudflare static hosting and minimal Workers when dynamic functionality is needed.
- Markdown content collections own insights and case studies. Add MDX only when an actual component use case requires it. Keep frontmatter typed and validated.
- Approved future routes: `/`, `/services/` and its four service routes, `/work/` and case studies, `/about/`, `/insights/` and articles, `/contact/`, `/privacy/`, `/terms/`.
- Simple future navigation: Home, Services, Work, About, Contact. Do not create placeholder commercial routes merely to populate navigation.
- Homepage sequence: hero, genuine trust/proof, what ElevateX does, four services, featured work, why ElevateX, process, technology capabilities, documented result, decision questions, human/about trust, final CTA, footer. Omit unavailable proof instead of fabricating it.
- Each future service page answers one buyer intent through proposition/direct definition, audience, problems, deliverables/inclusions, process, relevant verified work/results, technology, timeline expectations, pricing factors, decision criteria, questions, CTA and useful related service/work/insight links. Avoid arbitrary word counts and filler.

## Visual system

- Dark, cinematic, editorial, minimal: black, charcoal, graphite, silver, off-white, restrained champagne/gold.
- Prefer negative space, precise medium-weight typography, real proof, and purposeful composition. Avoid card grids everywhere, neon, purple/blue SaaS gradients, excessive glass, generic blobs, and ultra-bold type.
- At most one editorial/display family and one readable body family. The approved hero fonts are self-hosted Bodoni Moda Variable (normal and italic) and Instrument Sans Variable. Use licensed Latin WOFF2 subsets and preload only critical styles; reserve suitable font metrics.
- Mobile requires its own composition. Future hero order: logo/menu, headline, copy, primary CTA, secondary CTA, visual. Reduce imagery, fog, reflections and motion on small screens.

## Motion and performance

- CSS for simple motion, SVG for vector lighting, GSAP for complex timelines only when needed. No overlapping animation libraries. Default to lightweight 2.5D; no WebGL/Three.js/Spline without a demonstrated requirement.
- Content is visible and usable before scripts execute. Animation failure must never hide content. Reduced motion receives the final state immediately; no forced intros, scroll hijacking or zoom restrictions.
- Animate transform/opacity and restrained SVG properties. Avoid animated layout, large blurs/shadows, permanent GPU promotion or unnecessary will-change.
- Targets: LCP <=2.0 s, INP <=150 ms, CLS <=0.05; Lighthouse mobile performance >=90, accessibility/best practices >=95, SEO 100 on launch-ready indexable pages. These are targets, never measured claims or ranking guarantees.
- Initial homepage JS <=120 KB gzip; hero-specific JS <=60 KB gzip. Load animation only on relevant pages.
- Critical hero raster budget: desktop 500–700 KB maximum preferred; mobile 300–450 KB. AVIF/WebP, responsive sources, explicit dimensions; SVG for vectors. No autoplay video without a justified budget.

## SEO, AEO and GEO

- Design content, conversion, accessibility, performance and SEO together. Render real HTML headings, answers, navigation and links; never bake primary text into images/canvas.
- One clear H1, unique title/description, clean canonical, logical headings, descriptive URLs and contextual internal links per important page.
- Use the centralized site configuration and SEO helpers. Current provisional canonical is `https://www.elevatexlab.com`, reflecting the live apex-to-www redirect observed on 2026-10-06. Reconcile hostnames at cutover.
- Preserve existing URLs and legitimate Pakistan relevance. Read `docs/migration/` before changing routes. Review KEEP/IMPROVE/MERGE/REDIRECT/REMOVE decisions; changed valuable URLs need relevant permanent redirects. Never blanket-redirect missing pages to the homepage.
- Answers start with a direct, independently understandable 2–4 sentence response, then useful detail and evidence. Each service page has one commercial intent. No thin location pages, generic mass-produced articles or keyword-stuffed hero copy.
- GEO is crawlability, entity clarity, useful original information, trustworthy authorship, citations, internal links and first-party evidence. No visibility promises or magic plugins; llms.txt is optional experimentation, not a ranking mechanism.
- Organization/Website/WebPage, Service, BreadcrumbList and Article schema must describe visible, verified content. Never invent ratings, reviews, people, awards, prices, clients or addresses. Escape JSON-LD safely. FAQ rich-result eligibility is not a site architecture goal.
- Drafts and scheduled content must not generate public routes or appear in sitemaps. Only approved canonical indexable routes belong in sitemaps. Use actual editorial update dates, never build dates as lastmod.
- Preview builds are noindex. Robots permits search discovery for production. GPTBot access remains an explicit business decision; default block pending that decision is documented. Robots is not access control.

## Content and integrations

- Case studies support context, industry, problem, constraints, role, strategy, technology, build details, before/after, evidence/provenance, media, timeline and genuine quotes. Results require sources.
- Insights require verified author identities, publication/update dates, category, tags and related services. Do not publish the documentation templates.
- Keep analytics disabled until identifiers and privacy choices are confirmed. Track CTA/form/content journeys through a small typed boundary; never send form contents or personal data in analytics.
- Future forms: server validation, Turnstile verification on server, honeypot, accessible errors/success, practical rate limiting and secret bindings. Do not show a functioning form until delivery and abuse controls exist.
- IndexNow is explicit and limited to genuinely changed canonical URLs; never submit on every build.

## Accessibility and definition of done

- Target WCAG 2.2 AA. Native semantic landmarks, real links/buttons, correct labels, visible focus, skip navigation and keyboard access. Decorative graphics are hidden from assistive technology. ARIA only when needed.
- Before completing code work: Astro build and TypeScript pass; lint/format pass; no browser console errors; HTML remains useful without JS; metadata, schema and links are valid; images reserve dimensions; reduced motion and mobile layout are checked; avoidable CLS and unnecessary JS are addressed.
- Use Playwright + axe for meaningful browser/accessibility checks, including keyboard access, no JS and reduced motion. Automated checks do not replace manual screen-reader or physical-device QA.
- Launch matrix: 320, 375, 390/393, 430, tablet, 1024, 1280, 1440, 1920 and ultrawide; Chrome, Firefox, Safari and Edge; slow network, fonts/images, forms, 404/status, redirects, canonicals, sitemap, robots, schema and performance.
- Report exactly what was tested and any remaining blockers. Do not claim production readiness from a successful build alone.
- Stages: foundation, design system, hero, homepage, services, case studies, insights, technical SEO, analytics, QA, deployment. No production cutover until migration mappings, real content, integrations and launch QA are ready.
