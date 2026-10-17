import type { gsap as Gsap } from 'gsap';
import { heroMotion } from '../../data/hero-motion';
const { sessionKey } = heroMotion;

/** Progressive enhancement: the unenhanced document is the complete final scene. */
export function initializeHero(): () => void {
  const element = document.querySelector<HTMLElement>('[data-hero-root]');
  if (!element) return () => {};
  const root = element;

  const controller = new AbortController();
  const { signal } = controller;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia(heroMotion.staticQuery);
  const intro = document.querySelector<HTMLElement>('[data-hero-intro]');
  const html = document.documentElement;
  let context: ReturnType<typeof Gsap.context> | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let inView = true;
  let attempt = 0;
  let pendingEntrance = false;
  let interacted = false;
  const staticMotion = () => reduced.matches || mobile.matches;
  const skipEntrance = () =>
    Boolean(location.hash) ||
    scrollY > 0 ||
    html.dataset['heroInterrupted'] === 'true';

  const synchronizePause = () => {
    root.dataset['paused'] = String(document.hidden || !inView);
  };

  const finish = (mode: 'static' | 'ambient' = 'ambient') => {
    attempt += 1;
    clearTimeout(watchdog);
    context?.revert();
    context = undefined;
    if (intro) intro.hidden = true;
    delete html.dataset['heroBoot'];
    window.dispatchEvent(new Event('elevatex:intro-finished'));
    root.dataset['motion'] = staticMotion() ? 'static' : mode;
    synchronizePause();
  };

  const synchronizePreference = () => {
    pendingEntrance = false;
    if (staticMotion()) root.dataset['intro'] = 'skipped';
    finish();
  };
  reduced.addEventListener('change', synchronizePreference, { signal });
  mobile.addEventListener('change', synchronizePreference, { signal });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden && root.dataset['motion'] === 'entering') finish();
      if (!document.hidden && pendingEntrance) {
        pendingEntrance = false;
        void startEntrance(seen === false);
      }
      synchronizePause();
    },
    { signal },
  );
  // Keyboard users and visitors who start scrolling can use the page immediately.
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Tab' || event.key === 'Escape') {
        interacted = true;
        pendingEntrance = false;
        if (root.dataset['motion'] !== 'ambient') finish();
      }
    },
    { signal },
  );
  const interruptEntrance = () => {
    interacted = true;
    pendingEntrance = false;
    if (
      root.dataset['motion'] === 'entering' ||
      root.dataset['motion'] === 'loading' ||
      html.dataset['heroBoot']
    )
      finish();
  };
  document.addEventListener('pointerdown', interruptEntrance, { signal });
  document.addEventListener('wheel', interruptEntrance, {
    passive: true,
    signal,
  });
  window.addEventListener(
    'scroll',
    () => {
      if (scrollY > 0) interruptEntrance();
    },
    { passive: true, signal },
  );
  window.addEventListener('pagehide', () => finish('static'), { signal });
  intro
    ?.querySelector('[data-intro-skip]')
    ?.addEventListener('click', () => finish(), { signal });

  const observer =
    typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(([entry]) => {
          inView = entry?.isIntersecting ?? false;
          if (!inView && root.dataset['motion'] === 'entering') finish();
          synchronizePause();
        })
      : undefined;
  observer?.observe(root);

  let seen: boolean | null;
  try {
    seen = staticMotion()
      ? null
      : sessionStorage.getItem(sessionKey) === 'true';
    // Probe writes without consuming the first visit before the entrance starts.
    if (seen !== null) sessionStorage.setItem(sessionKey, String(seen));
  } catch {
    // Storage restrictions disable the full entrance, never the page.
    seen = null;
  }
  root.dataset['intro'] =
    staticMotion() || seen === null || skipEntrance() || !observer
      ? 'skipped'
      : seen
        ? 'repeat'
        : 'first';

  async function startEntrance(full: boolean) {
    // Preserve the first-paint cover while importing GSAP; never flash the page first.
    clearTimeout(watchdog);
    context?.revert();
    context = undefined;
    attempt += 1;
    if (staticMotion() || skipEntrance()) {
      finish();
      return;
    }
    root.dataset['motion'] = 'loading';
    const currentAttempt = attempt;
    const startedAt = performance.now();
    watchdog = setTimeout(() => finish(), 1800);
    try {
      const { gsap } = await import('gsap');
      if (signal.aborted || currentAttempt !== attempt) return;
      if (document.hidden) {
        pendingEntrance = !interacted;
        finish();
        return;
      }
      // Do not replay a dramatic entrance over a page a slow connection already showed.
      if (
        staticMotion() ||
        !inView ||
        interacted ||
        skipEntrance() ||
        performance.now() - startedAt > 1800
      ) {
        root.dataset['intro'] = 'skipped';
        finish();
        return;
      }
      const pedestal = root.querySelector('[data-hero-pedestal]');
      const laptop = root.querySelector('[data-hero-laptop]');
      const halo = root.querySelector('[data-hero-halo]');
      const rim = root.querySelector('[data-hero-rim]');
      const reflection = root.querySelector('[data-hero-reflection]');
      const copy = root.querySelectorAll('[data-hero-copy]');
      const elevate = intro?.querySelector('[data-intro-elevate]');
      const x = intro?.querySelector('[data-intro-x]');
      const line = intro?.querySelector('[data-intro-line]');
      const highlight = x?.querySelector('i');
      const logo = document.querySelector('[data-hero-logo]');
      const arcs = root.querySelectorAll('[data-arc-path]');
      if (
        !pedestal ||
        !laptop ||
        !intro ||
        !halo ||
        !rim ||
        !reflection ||
        !elevate ||
        !x ||
        !highlight ||
        !line ||
        !logo
      ) {
        finish();
        return;
      }

      root.dataset['motion'] = 'entering';
      intro.hidden = !full;
      if (full) {
        html.dataset['heroBoot'] = 'playing';
        try {
          sessionStorage.setItem(sessionKey, 'true');
          seen = true;
        } catch {
          // The scene still completes if storage becomes unavailable mid-load.
        }
      }
      context = gsap.context(() => {}, root);
      context.add(() => {
        if (!full) {
          // Returning visits get a short scene entrance, without the logo overlay.
          gsap
            .timeline({
              defaults: { ease: 'power3.out' },
              onComplete: () => finish(),
            })
            .fromTo(
              copy,
              { y: 5, opacity: 0.8 },
              { y: 0, opacity: 1, duration: 0.4, stagger: 0.04 },
              0,
            )
            .fromTo(
              pedestal,
              { y: 22, opacity: 0.65 },
              { y: 0, opacity: 1, duration: 0.65 },
              0,
            )
            .fromTo(halo, { opacity: 0.5 }, { opacity: 1, duration: 0.7 }, 0.1)
            .fromTo(
              laptop,
              { y: 16, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5 },
              0.35,
            );
          return;
        }
        gsap.set(pedestal, {
          y: 100,
          scaleY: 0.95,
          opacity: 0.4,
        });
        gsap.set(laptop, {
          y: 44,
          scale: 0.96,
          rotateX: 4,
          opacity: 0,
        });
        gsap.set([halo, rim, reflection], { opacity: 0 });
        gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(copy, { y: 8, opacity: 0.65 });
        gsap.set([elevate, x, logo], { opacity: 0 });
        gsap.set(elevate, { y: 12 });
        gsap.set(x, { x: -8, y: 3 });
        gsap.set(line, { scaleX: 0.12, opacity: 0 });
        gsap.set(highlight, { xPercent: -120, opacity: 0 });

        const timeline = gsap.timeline({
          defaults: { ease: 'power2.out' },
          onComplete: () => finish(),
        });
        timeline
          .to(elevate, { opacity: 1, y: 0, duration: 0.7 }, 0.12)
          .to(x, { opacity: 1, x: 0, y: 0, duration: 0.7 }, 0.55)
          .to(line, { scaleX: 1, opacity: 0.85, duration: 0.95 }, 0.55)
          .to(
            highlight,
            {
              xPercent: 120,
              opacity: 0.7,
              duration: 0.7,
              ease: 'power1.inOut',
            },
            0.95,
          )
          .call(
            () => {
              delete html.dataset['heroBoot'];
            },
            [],
            1.65,
          )
          .to(intro, { opacity: 0, duration: 0.65 }, 1.65)
          .call(
            () => {
              intro.hidden = true;
            },
            [],
            2.3,
          )
          .to(logo, { opacity: 1, duration: 0.65 }, 1.65)
          .to(copy, { opacity: 1, y: 0, duration: 0.65, stagger: 0.1 }, 1.75)
          .to(
            pedestal,
            {
              y: 0,
              scaleY: 1,
              opacity: 1,
              duration: 1.25,
              ease: 'power3.out',
            },
            1.85,
          )
          .to(halo, { opacity: 1, duration: 1.2 }, 2.3)
          .to(arcs, { strokeDashoffset: 0, duration: 1.2 }, 2.3)
          .to(rim, { opacity: 1, duration: 0.8 }, 2.6)
          .to(reflection, { opacity: 0.65, duration: 0.8 }, 2.6)
          .to(
            laptop,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
              duration: 1.1,
              ease: 'power3.out',
            },
            2.95,
          );
      });
      clearTimeout(watchdog);
      watchdog = setTimeout(() => finish(), full ? 4600 : 1400);
    } catch {
      // CSS ambience is independent of the optional entrance runtime.
      if (!signal.aborted && currentAttempt === attempt) finish();
    }
  }

  if (staticMotion()) {
    finish('static');
  } else if (seen === null || skipEntrance() || !observer) {
    finish();
  } else if (document.hidden) {
    pendingEntrance = true;
    finish();
  } else {
    void startEntrance(seen === false);
  }

  return () => {
    controller.abort();
    observer?.disconnect();
    finish('static');
  };
}
