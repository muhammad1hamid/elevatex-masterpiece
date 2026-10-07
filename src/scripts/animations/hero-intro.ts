import type { gsap as Gsap } from 'gsap';

const sessionKey = 'elevatexIntroSeen';

/** Progressive enhancement: the unenhanced document is the complete final scene. */
export function initializeHero(): () => void {
  const root = document.querySelector<HTMLElement>('[data-hero-root]');
  if (!root) return () => {};

  const controller = new AbortController();
  const { signal } = controller;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const intro = root.querySelector<HTMLElement>('.hero__intro');
  const toggle = root.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  const toggleLabel = toggle?.querySelector('span');
  let context: ReturnType<typeof Gsap.context> | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let userPaused = false;
  let inView = true;

  const synchronizePause = () => {
    root.dataset['paused'] = String(userPaused || document.hidden || !inView);
    toggle?.setAttribute('aria-pressed', String(userPaused));
    if (toggleLabel)
      toggleLabel.textContent = userPaused ? 'Resume motion' : 'Pause motion';
  };

  const finish = (mode: 'static' | 'ambient' = 'ambient') => {
    clearTimeout(watchdog);
    context?.revert();
    context = undefined;
    if (intro) intro.hidden = true;
    root.dataset['motion'] = reduced.matches ? 'static' : mode;
    if (toggle) toggle.hidden = root.dataset['motion'] !== 'ambient';
    synchronizePause();
  };

  toggle?.addEventListener(
    'click',
    () => {
      userPaused = !userPaused;
      synchronizePause();
    },
    { signal },
  );
  reduced.addEventListener('change', () => finish(), { signal });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden && root.dataset['motion'] === 'entering') finish();
      synchronizePause();
    },
    { signal },
  );
  // Keyboard users and visitors who start scrolling can use the page immediately.
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Tab' && root.dataset['motion'] === 'entering')
        finish();
    },
    { signal },
  );
  root.addEventListener(
    'pointerdown',
    () => {
      if (root.dataset['motion'] === 'entering') finish();
    },
    { signal },
  );
  window.addEventListener('pagehide', () => finish('static'), { signal });

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? false;
    if (!inView && root.dataset['motion'] === 'entering') finish();
    synchronizePause();
  });
  observer.observe(root);

  let seen: boolean | null;
  try {
    seen = sessionStorage.getItem(sessionKey) === 'true';
    sessionStorage.setItem(sessionKey, 'true');
  } catch {
    // Storage restrictions disable the full entrance, never the page.
    seen = null;
  }
  root.dataset['intro'] =
    reduced.matches || seen === null ? 'skipped' : seen ? 'repeat' : 'first';

  if (reduced.matches) {
    finish('static');
  } else if (seen !== false) {
    finish();
  } else {
    void (async () => {
      try {
        const { gsap } = await import('gsap');
        if (signal.aborted) return;
        // Do not replay a dramatic entrance over a page a slow connection already showed.
        if (
          reduced.matches ||
          document.hidden ||
          !inView ||
          performance.now() > 1800
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
        const elevate = root.querySelector('[data-intro-elevate]');
        const x = root.querySelector('[data-intro-x]');
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
          !logo
        ) {
          finish('static');
          return;
        }

        root.dataset['motion'] = 'entering';
        intro.hidden = false;
        context = gsap.context(() => {}, root);
        context.add(() => {
          gsap.set(pedestal, {
            y: mobile ? 70 : 100,
            scaleY: 0.95,
            opacity: 0.4,
          });
          gsap.set(laptop, {
            y: mobile ? 32 : 44,
            scale: 0.96,
            rotateX: 4,
            opacity: 0,
          });
          gsap.set([halo, rim, reflection], { opacity: 0 });
          gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 1 });
          gsap.set(copy, { y: 8, opacity: 0.65 });
          gsap.set([elevate, x, logo], { opacity: 0 });
          gsap.set(x, { x: -5 });

          const timeline = gsap.timeline({
            defaults: { ease: 'power2.out' },
            onComplete: () => finish(),
          });
          timeline
            .to(elevate, { opacity: 1, duration: 0.28 }, 0.05)
            .to(x, { opacity: 1, x: 0, duration: 0.32 }, 0.28)
            .to(
              highlight,
              { opacity: 0.36, duration: 0.1, repeat: 1, yoyo: true },
              0.48,
            )
            .to(intro, { opacity: 0, duration: 0.28 }, 0.6)
            .to(logo, { opacity: 1, duration: 0.28 }, 0.64)
            .to(copy, { opacity: 1, y: 0, duration: 0.42, stagger: 0.09 }, 0.78)
            .to(
              pedestal,
              {
                y: 0,
                scaleY: 1,
                opacity: 1,
                duration: 1.05,
                ease: 'power3.out',
              },
              0.98,
            )
            .to(halo, { opacity: 1, duration: 1.12 }, 1.25)
            .to(arcs, { strokeDashoffset: 0, duration: 1.12 }, 1.25)
            .to(rim, { opacity: 1, duration: 0.48 }, 1.55)
            .to(reflection, { opacity: 0.65, duration: 0.65 }, 1.55)
            .to(
              laptop,
              {
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                duration: 0.76,
                ease: 'power3.out',
              },
              mobile ? 1.55 : 1.72,
            );
          if (mobile) timeline.timeScale(1.58);
        });
        watchdog = setTimeout(() => finish(), mobile ? 2300 : 2900);
      } catch {
        finish('static');
      }
    })();
  }

  return () => {
    controller.abort();
    observer.disconnect();
    finish('static');
  };
}
