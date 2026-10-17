# Homepage Section 07: Behind ElevateX

## Implementation

- Added a semantic, server-rendered founder section after Process, preserving the existing page order and all earlier section components.
- Kept the supplied portrait source unchanged and created responsive AVIF/WebP derivatives. The displayed 6:7 crop removes the embedded artwork lettering while retaining the face, hair, headroom, and shoulders. The visible identity and copy are real HTML.
- Used the existing Outfit heading and Instrument Sans body tokens, graphite/champagne palette, global content width, and the established reveal utility.
- Desktop uses an asymmetric 44/56 image-to-copy grid. The portrait is constrained to its grid track to prevent overlap around 1024–1150 px. Tablet and mobile stack the introduction, portrait, and founder details in that order. The image has reserved dimensions, responsive sources, lazy loading, and async decoding.
- Reveal motion is limited to a short opacity/vertical entrance. The existing utility disables this on mobile and reduced-motion preferences and leaves content visible if animation is unavailable.
- Added the verified Hamid founder relationship to the central Organization schema. No credentials, biography, outcomes, social profiles, or other unverified facts were added.
- Calls to action use `/work/` and `/contact/`, matching the existing site navigation and current preview handoffs.

## Verification

- Passed: ESLint, Prettier, and `tsc --noEmit --ignoreDeprecations 6.0`.
- Passed: Astro compiler transform for the changed homepage and founder component, with no diagnostics.
- Passed: 103 Playwright checks in Chrome across the founder, process, services, featured system, and Why ElevateX sections. After the grid sizing fix, all 14 founder checks passed, including a no-overlap assertion at 1024, 1040, 1067, 1100, and 1150 px. Founder checks also cover 320–1920 px widths, reduced motion, no JavaScript, image decode, and an axe scan. Desktop, mobile, and 1067 px screenshots were reviewed. The existing homepage tests now expect seven sections.
- The 480 px and 840 px variants are 10 KB and 24 KB in AVIF, and 16 KB and 41 KB in WebP.
- Blocked: `npm run check` and `npm run build` both stop before Astro project analysis/build. Vite's module runner throws `require is not defined` while loading `source-map-js/lib/source-map-generator.js`.
- The local preview at `http://127.0.0.1:4322/` uses the ignored `dist` copy, updated for review because Astro cannot rebuild in the current runtime. It is not a substitute for a fresh build; rerun the check and build after the Vite/Node loader issue is resolved.
