# ElevateX motion system V2

Master Prompt #24 · implementation 17 October 2026; final verification 18 October 2026 · local implementation

## Audit and implementation plan

The site uses normal Astro documents, static HTML and custom CSS. There is no client router, smooth-scroll library or custom cursor in the pre-change baseline. GSAP 3.15.0 owns the homepage introduction and the process ScrollTrigger. IntersectionObserver and finite Web Animations own ordinary entrances. About has a small, visible-only parallax controller; service diagrams and article progress use passive native scroll events with one scheduled update. The footer already has its own complete, finite choreography.

Preserve those region owners. A second footer, hero or diagram timeline would conflict with existing transforms and lifecycle cleanup. Replace the old case-study observer with the global reveal controller; replace selected generic project entrances with image masks. Add Lenis as the only new dependency, sharing the existing GSAP package. Keep native document navigation and anchor/history handling. Keep contact's existing review-only validation and supported fallback.

Desktop enhancements load after a pointer/wheel interaction. One demand-driven GSAP ticker callback serves cursor inertia and Lenis. Lenis emits ScrollTrigger updates; debounced geometry changes refresh measurements. Cursor state uses delegated events and cached magnetic bounds. Selected CTA children move at most four pixels; their anchors do not move. Mobile keeps native scrolling and a quiet finite reveal. Reduced motion destroys advanced controls and cancels finite motion. Initial HTML never requires motion to become visible.

Risks to check: native input cursors, text selection, stale hover state during scrolling, wheel inertia during anchors/keyboard input, nested scroll containers, history restoration, duplicated listeners after lifecycle events, initial JS weight and LCP. QA includes build/types/lint/format, real Chrome/Edge interactions, axe, no-JS/reduced/touch routes, viewport checks, traces and compressed Lighthouse measurements. See the companion QA report for actual results and limitations.

## Ownership and dependencies

| Module                             | Responsibility                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `GlobalMotion.astro` / `engine.ts` | One shared cursor element, capability gates, deferred import, route/visibility/bfcache cleanup       |
| `config.ts`                        | Millisecond timing, easing, distances and media-query tokens                                         |
| `advanced.ts` / `ticker.ts`        | Advanced controllers and demand-driven shared GSAP clock                                             |
| `cursor.ts`                        | Delegated cursor contexts, click feedback, selection/input fallback and magnetic children            |
| `smooth-scroll.ts`                 | Lenis 1.3.27, native-input exceptions, ScrollTrigger synchronization and geometry refresh            |
| `reveals.ts` / `primitives.ts`     | Curated shared finite reveal presets and case-study theme timings                                    |
| `scripts/animations/cinematic.ts`  | Shared finite animation/observer/sweep/focus-cancellation utilities                                  |
| Existing page controllers          | Approved hero, process, service narratives, About parallax, reading progress and footer choreography |

GSAP remains 3.15.0. Lenis 1.3.27 is pinned, self-hosted through the build, and has no runtime dependency. There is no React island, extra animation library, remote runtime script or ClientRouter. Implementation follows the [official Lenis integration](https://github.com/darkroomengineering/lenis#gsap-scrolltrigger) and [GSAP ticker API](https://gsap.com/docs/v3/GSAP/gsap.ticker/).

## Cursor and magnetic API

```html
<!-- Only on real links that open a project or preview. -->
<a href="/work/qadeer-jewellers/" data-cursor="view">Explore project</a>
<!-- Link/button/summary state is automatic. Explicit native opt-out: -->
<div data-cursor="native">Native pointer region</div>
<!-- Decorative name pill on the homepage founder image. -->
<img data-cursor="label" data-cursor-text="Hamid" ... />
<!-- Stable clickable element; one visual child receives <= 4px translation. -->
<a href="/contact/" data-magnetic>
  Start a Project <span aria-hidden="true" data-magnetic-content>→</span>
</a>
```

Supported states: default five-pixel dot with 34-pixel ring; link ring; VIEW pill for real links; pressed compression; native input/selection/keyboard state. There are no draggable galleries or interactive audio/video controls in the current site, so no misleading DRAG/PLAY states are advertised. An unspecified data state falls back to normal link/default behavior.

Fine pointer + hover + no reduced motion + no forced colors are required. Touch events never activate the cursor. The native cursor is hidden only after the custom cursor has a valid rendered position. Leaving the document, blur, scrolling, keyboard use, selection, pagehide or preference changes restores it. Inputs, selects, contenteditable, iframes, open dialogs and the mobile menu retain native behavior. Overlay elements cannot intercept clicks. Form focus indicators are unchanged.

Current magnetic targets: desktop header CTA text, shared service primary CTA arrow, footer project CTA arrow. No form field, submit control or ordinary navigation link is magnetic.

## Scroll and lifecycle

Lenis uses `autoRaf: false`, `lerp: 0.16`, native touch (`syncTouch: false`), normal wheel multiplier, and nested-scroll detection. It is initialized only after supported desktop interaction. The shared clock converts GSAP seconds to milliseconds; Lenis accumulates its millisecond frame delta, bounded to 50ms, so waking after an idle interval cannot snap to the wheel target. Cursor and Lenis release their clock clients when settled; there is no second Lenis RAF. Existing page observers retain their scoped finite/event-driven updates.

Navigation keys (Home, End, Page Up/Down, Space, Tab and Escape) release the advanced controllers before the browser handles the action. Fresh pointer/wheel input can enable them again. Pointer presses and anchor clicks settle wheel inertia. Anchors remain real links: hashes, focus, back/forward, deep links and scroll restoration stay native. Contact's existing smooth inquiry anchor is preserved. Native textareas, selects, editable regions, code blocks, dialogs and marked `data-lenis-prevent` containers bypass smoothing. Open mobile menus/dialogs bypass wheel smoothing; the current mobile menu is a native disclosure, not a modal and does not acquire a new page lock.

Body ResizeObserver, captured resource loads, disclosure toggles and font loading trigger a 120 ms debounced resize/ScrollTrigger refresh. No refresh occurs on pointer movement. Only this controller's resources are released: it does not kill other page ScrollTriggers or change global GSAP lag settings.

Visibility/pagehide suspend the advanced controllers. Page return waits for fresh user input. `astro:before-swap` destroys ownership; `astro:page-load` can safely reinitialize, although production currently uses full document navigation. Async import version guards prevent a stale page from acquiring controllers. No route delay or full-screen transition was added.

## Reveal API and primitives

```html
<h2 data-motion-reveal="text">A clear, semantic heading.</h2>
<figure data-motion-reveal="cinematic-left">…</figure>
<a href="/work/" data-hover-image><img ... /></a>
```

Presets: `text`, `editorial-up`, `cinematic-left`, `cinematic-right`, `soft-unveil`, `subtle-zoom`, `line`. Desktop text lasts 820 ms, media 1100 ms; quiet layouts use a 560 ms opacity-only entrance. Jewellery multiplies media timing by 1.08, automotive by 0.86, beauty/neutral retain base timing. No character splitting or repeated paragraph entrances. Existing case-study frontmatter `motion` values map to shared presets; `none` is respected. Parent composition ownership prevents nested duplicate reveals.

Use `createCinematicMotion(root)` for an authored section sequence: `observe()` once, `text()` with small staggered delays, `image()`, `sweep()`, or `play()` with finite keyframes. `focus()` settles related animations; `stop()` disconnects and cancels. Existing About uses `data-about-parallax` only on its three approved visual layers, capped to 24px total travel and disabled below the desktop capability gate. Do not add parallax to article text or form controls. Its existing controller remains the sole depth owner.

The `line` preset provides line drawing; existing About/Contact process and footer SVG arcs retain their tailored line sequences. Image hover scales by 1.018 only on explicitly marked interactive images. Button arrows respond by a few pixels. These are optional composition tools, not a mandate to animate every region.

No CSS rule pre-hides reveal content. WAAPI temporarily animates the visible authored final state and releases it. Interactive controls and their containers retain full authored opacity during shared entrances, preserving button and field contrast. Already-passed sections are skipped. Focus and keyboard use cancel shared reveal travel. Late-loaded/history H1 entrances are skipped. Reduced motion prevents creation and cancels active motion. The image assets, dimensions, provenance labels, headings and content stay intact.

## Page matrix

| Page / region        | Existing owner                        | V2 change                                                                                      | Trigger / duration / intensity              | Touch / reduced                    |
| -------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------- |
| Home hero            | GSAP intro                            | Preserve laptop/rock/halo and interruptible logo sequence                                      | Existing finite signature / high            | Existing static composition        |
| Home selected work   | Generic upward observer               | Editorial image-mask composition + VIEW links                                                  | Once in view / 1100 ms / medium             | 560 ms quiet / static              |
| Home process         | ScrollTrigger                         | Lenis emits synchronized updates                                                               | Existing scroll progression / medium        | Native static chapters             |
| Home final CTA       | Shared section observer               | Preserve text-line sequence                                                                    | Existing finite reveal / medium             | Static                             |
| Web development work | Generic upward observer               | Alternating left/right masks, magnetic primary arrows                                          | Once / 1100 ms / medium                     | Quiet / static                     |
| AI automation        | Native radios + scroll workflow       | Preserve workflow, synchronize native scroll; shared CTA response                              | Scroll/manual selection / medium            | Native manual controls             |
| AI chatbots          | Conversation controller               | Preserve context/response/handoff; shared CTA response                                         | Scroll/manual selection / medium            | Native manual controls             |
| Landing pages        | Conversion journey                    | Preserve section hierarchy/progression; shared CTA response                                    | Scroll/manual selection / medium            | Native manual controls             |
| Work                 | Static gallery + filter               | Heading masks, directional feature reveals, quiet filter feedback, image hover + VIEW          | Once / 820–1100 ms; filters 350 ms / medium | Quiet / static                     |
| All case studies     | Separate observer                     | Shared theme presets, hero/title entrance, browser/device/gallery variants, next-project hover | Once / 700–1188 ms / medium                 | Quiet / static                     |
| About                | Shared finite narrative + local depth | Preserve founder mask, philosophy drawing, workflow, 24px depth                                | Existing finite/visible-scroll / medium     | Quiet; no depth / static           |
| Insights listing     | Shared journal controller             | Preserve editorial covers/filter, global cursor/scroll/CTA integration                         | Existing finite reveal / low                | Quiet / static                     |
| Articles             | Journal + progress                    | Preserve cover/figure/progress, native TOC and calm body                                       | Cover/figure only / low                     | Native reading / static decoration |
| Contact              | Finite typography/form/process        | Preserve local validation/review, native inputs and CTA response                               | Existing finite / low                       | Existing shorter sequence / static |
| All headers          | Native details + CSS                  | Underline travel and 280ms menu opacity stagger                                                | Hover/open / low                            | Short disclosure / static          |
| All footers          | Dedicated footer controller           | Preserve arc/wordmark/sweep; add stable magnetic arrow                                         | Existing once / medium                      | Existing quiet sequence / static   |

## Adding or disabling motion

Prefer explicit attributes on a single existing visual wrapper. Do not animate both it and a descendant. Use the shared helper for section choreography, and register cleanup with the page controller. Unmarked content stays static. Remove the attribute or set study motion to `none` to disable a reveal; use `data-cursor="native"` and `data-lenis-prevent` for input exceptions. User reduced-motion preference disables optional effects live.

Avoid permanent `will-change`, unbounded loops, per-frame layout queries, huge blur effects, translating hit areas, changing text into images, or loading advanced bundles on touch. Keep primary hero media independent of reveal completion. Measure after changes, including slow devices: lab traces do not prove universal 60 FPS or field INP.

## Native disclosure and hover refinement / Prompt 29

The shared `disclosures.css` adds a 420ms native intrinsic-size transition to small text disclosures within `.faq-item`, `.service-faq`, `.build-evidence` and `.work-tile`. Its feature gate requires `interpolate-size: allow-keywords` and `details::details-content`; unsupported browsers retain native opening/closing. No JavaScript controller, measured height, click interception or initially hidden answer is added. Native summary keyboard activation and exclusive `name` grouping remain owned by the browser.

This deliberate user-triggered layout transition also applies on mobile. Long case-study screenshot viewers and the mobile navigation are excluded. Reduced motion removes the transition immediately, including preference changes while the page is open. The service FAQ's plus line now rotates/fades rather than changing `display`, and its border/circle colors transition without moving the control.

The existing desktop cursor ring morphs its width/height over 240ms and its contextual label fades over 180ms. These are CSS transitions on the existing overlay; cursor ownership, pointer handling, idle suspension and preference gates are unchanged.

Primary Home/final CTAs, the Contact review control, header/footer project links and footer navigation keep stationary hover hit areas. Color and interior arrow feedback remain. The stationary boundary rule applies to fine-pointer hover even under reduced motion: disabling a transition alone still allows a translated target to oscillate at its edge. Supported-browser checks exercise normal and reduced-motion boundaries, rapid FAQ reversal, exclusive selection and live preference changes. Actual frame traces are retained in `artifacts/refinement-29/`; they are local behavior evidence, not a universal smoothness or FPS guarantee.

## Verification

Run `npm run check`, `npm run lint`, `npm run format:check`, `npm run build`, and `npx playwright test tests/motion-engine.spec.ts` with the normal preview config. Local installed Chrome/Edge can use the ignored `artifacts/faq/preview.config.ts` against an existing server. The dedicated tests cover cursor contexts, selection, keyboard, stable hit area, preferences, wheel/anchors/history/reload, nested scroll, lifecycle, failed-module fallback, no-JS, touch and scoped axe across the site. Existing process/contact/footer suites cover their native interactions and responsive layouts. Consult `MOTION_V2_QA.md` for the recorded run, artifacts, performance and remaining manual checks.
