# Motion V2 implementation and QA

Implementation and performance samples: 17 October 2026 · final verification: 18 October 2026 · Master Prompt #24 · local preview

## Delivered

One shared global enhancement entry point now controls capability detection, contextual cursor, selected magnetic CTA content, Lenis and shared reveal presets. Existing hero, service, About, article and footer controllers retain their approved scenes. Static HTML, page layouts, image provenance, contact review behavior and real navigation remain intact.

### Files created

- `src/components/motion/GlobalMotion.astro`
- `src/lib/motion/config.ts`, `engine.ts`, `advanced.ts`, `ticker.ts`
- `src/lib/motion/cursor.ts`, `smooth-scroll.ts`, `primitives.ts`, `reveals.ts`
- `src/styles/motion.css`
- `tests/motion-engine.spec.ts`
- `docs/MOTION_SYSTEM_GUIDE.md`, this QA report

### Files updated or consolidated

- `BaseLayout.astro` mounts the shared enhancement once.
- Header, Footer and ServiceActions opt selected visual children into magnetic movement.
- ProjectShowcase, SelectedWebWork, Work index and shared case-study hero/media/next-project components opt into curated masks and contextual project links.
- CaseStudyLayout releases its obsolete dedicated observer; `scripts/animations/case-study.ts` was removed. Its behavior now belongs to `lib/motion/reveals.ts`.
- `scripts/animations/cinematic.ts` uses central motion tokens and refuses new animations during reduced motion.
- `scripts/navigation.ts` adds finite menu item feedback; `scripts/work.ts` adds finite filter feedback.
- `package.json` / lockfile pin Lenis 1.3.27. GSAP remains 3.15.0. No other dependency was added.
- `tsconfig.json` excludes generated QA artifacts, which otherwise caused generated minified bundles to be checked as source.
- `AGENTS.md` records the newly authorized motion stage.
- Contact's privacy regression waits for optional first-interaction script imports before observing submission traffic; it still requires zero requests during form review. Work's mobile assertion now checks completion of the newly authorized short reveal, instead of requiring no reveal at all.
- Footer WhatsApp accessible name now includes its complete contiguous visible label and number, fixing the additional label-in-name check found during this audit.

## Interaction and page coverage

| Requirement                        | Implementation                                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cursor                             | Fine-pointer dot/ring, link response, VIEW on real project links, click compression, native input/selection/keyboard/blur/leave/scroll fallback                    |
| Cursor states intentionally absent | DRAG and PLAY: no actual draggable galleries or media players exist                                                                                                |
| Magnetic behavior                  | Maximum 4px visual-child translation, stable anchor bounds; header text, shared primary arrow, footer arrow                                                        |
| Smooth scroll                      | Lenis only after eligible desktop interaction; native touch, keyboard, hashes, history and nested scroll                                                           |
| GSAP synchronization               | One demand-driven ticker callback for cursor and Lenis; scroll events update ScrollTrigger; geometry refresh is debounced                                          |
| Idle/resume                        | Bounded logical frame time; clock attaches after Lenis establishes its interpolation state                                                                         |
| Navigation                         | Normal Astro document navigation, no added router or navigation delay; native details menu with short finite feedback                                              |
| Reusable primitives                | Text, editorial-up, left/right cinematic masks, soft unveil, subtle zoom and line presets; existing shared text/image/sweep sequence utility; explicit hover scale |
| Home                               | Approved hero preserved; selected work gains mask reveals and VIEW cursor; existing process synchronized                                                           |
| Services                           | Alternating Web Development project reveals; original workflow/conversation/conversion-path controllers preserved; shared primary CTA response                     |
| Work / case studies                | Directional feature reveals, project masks/hover/filter feedback; theme-configured shared study reveals and next-project hover                                     |
| About                              | Existing hero, authentic founder portrait, philosophy, workspace, workflow and small visible-only depth preserved                                                  |
| Insights / articles                | Existing covers, filters, reading progress and figure motion preserved; no paragraph or TOC interception                                                           |
| Contact                            | Existing local review and validation preserved; no submission backend or false success state added                                                                 |
| Footer                             | Approved arc, CTA, navigation groups, sweep and wordmark use their existing single controller                                                                      |
| Mobile / tablet                    | Native touch scroll; no touch cursor; quiet 560ms shared reveals; native menu and controls                                                                         |
| Reduced motion                     | Live preference change destroys cursor/Lenis and cancels shared reveals; content stays visible                                                                     |
| No JS / failed modules             | Visible HTML and native links remain; no cursor hiding or scroll interception if advanced import fails                                                             |

Full ownership, lifecycle, data attributes and page-by-page timings are in [MOTION_SYSTEM_GUIDE.md](MOTION_SYSTEM_GUIDE.md).

## Source and visual integrity

- Compared generated main text, titles/meta/canonicals/JSON-LD against the saved pre-motion build: **16 pages preserved**, zero mismatches. Each full page still has one shared footer; the existing service handoff remains its own route.
- Captured **41 screenshots**, including 13 routes at desktop, a scrolled section and 390px, plus the settled homepage and VIEW cursor.
- Work checked at all 14 requested viewport sizes from **320×568 through 2560×1440**: zero horizontal overflow. Existing contact/footer/process/service suites provide additional responsive and enlarged-text coverage.
- Recorded Playwright interaction trace with screenshots/snapshots. This is a replayable browser trace, not a claimed real-time video recording.
- Manually inspected the settled homepage, Work desktop/mobile, About hero and contextual cursor captures. The initial homepage capture at 2.6 seconds catches the approved introduction in progress; use the separate settled capture for the final composition.

## Performance measurements

Lighthouse 13.5.0, installed Chrome, default simulated mobile profile, locally compressed static preview on port 4322. One representative run per page; these are laboratory measurements, not field Core Web Vitals.

| Page               | Performance | Accessibility | Best practices | SEO |    LCP |   TBT | CLS |
| ------------------ | ----------: | ------------: | -------------: | --: | -----: | ----: | --: |
| Home               |          94 |           100 |            100 |  69 | 2.697s |  24ms |   0 |
| Work               |          94 |           100 |            100 |  69 | 1.959s | 173ms |   0 |
| Conversion article |          98 |           100 |            100 |  69 | 1.763s |   0ms |   0 |

SEO 69 reflects the intentional preview noindex configuration; it is not a production SEO result. Home exceeds the prompt's 2.5s LCP target. The previous footer baseline was 96 / 2.605s for Home and 100 / 1.658s for the article; single-run differences do not isolate the cause and no improvement is claimed. The approved hero was preserved.

The mobile Home audit requested **16 script resources / 14,059 transferred bytes including response overhead**. It did not download Lenis, GSAP or ScrollTrigger. The advanced bundle sampled during desktop interaction was approximately **6.9KB gzip**, plus shared GSAP **27.3KB gzip** and ScrollTrigger **17.5KB gzip** when not already loaded by a page. These library chunks are reused, not duplicated.

A separate Chrome Work-page wheel/pointer sample recorded **276 frame intervals**, median **16.7ms**, p95 **16.8ms**, **zero long tasks**, and **CLS 0**. This does not establish universal 60 FPS or field INP. GC-assisted JS heap samples before and after five About/Work navigation cycles were **2,263,584 bytes** and **1,918,212 bytes** respectively; no increasing heap was observed in that bounded sample, which is not proof against every possible leak.

## Artifacts

- Screens: `artifacts/motion-v2/screens/`
- Final hero: `screens/home-desktop-settled.png`
- Cursor: `screens/view-cursor.png`
- Browser trace: `artifacts/motion-v2/motion-trace.zip`
- Viewport, frame, heap and transfer observations: `artifacts/motion-v2/visual-runtime.json`
- Content comparison: `artifacts/motion-v2/preservation.json`
- Lighthouse: `artifacts/motion-v2/{home,work,article}-lighthouse.report.{html,json}`
- Build, types, lint and formatting logs: `artifacts/motion-v2/`

QA artifacts are intentionally ignored by Git. Source tests and documentation are tracked changes.

## Verification results

- Astro build: 17 static pages, passed. TypeScript/Astro: 248 files, zero errors, warnings or hints. ESLint and Prettier passed.
- The broader Chrome page suite covered About, all four services, Work, the case-study engine and Insights: 165 of 168 initially passed. The two About label checks and the Work mobile timing assertion were corrected; their follow-up run passed all six Chrome/Edge cases (`corrections.log`).
- The comprehensive contact/footer/process/motion run passed 149 of 150 cases. The remaining zero-duration keyboard-input test was replaced with realistic 100ms keypress timing after native/enhanced comparison; three consecutive repetitions passed in each browser (`keyboard-final.log`: six passes).
- The final combined motion, affected contact privacy/entrance and footer keyboard/axe/reveal run passed **22 of 22 checks** (`verified.log`). It covers both Chrome and Edge, native inputs, live preferences, lifecycle, module failure, anchors/history/reload, nested scroll, keyboard scrolling and 13 routes in desktop/reduced/no-JS/touch modes.
- The final keyboard path releases Lenis before native navigation keys. Shared entrances preserve full opacity for interactive controls, fixing a transient button-contrast failure found by axe during animation.
- No unexpected runtime errors were recorded in the captured route/profile sample. Intentional failed-module tests verify native fallback.

## Remaining limits and verdict

**READY WITH MINOR ISSUES** for local motion review. This is not production cutover approval.

- Homepage mobile LCP remains above the prompt's 2.5s and constitution's 2.0s targets in this measured run.
- Chrome and Edge were available. Firefox and WebKit browser packages were absent; Safari, physical touch devices, real trackpads and manual screen-reader testing remain unverified.
- Synthetic wheel/keyboard/touch-capability tests do not replace physical-device QA. No field INP or guaranteed frame rate is claimed.
- No real drag gallery, media player or modal was introduced merely to demonstrate extra cursor states.
- Contact delivery/backend, analytics/privacy decisions and production migration/launch gates retain their existing deferred status.

Changes remain local; no new commit, push or deployment was performed for this task.
