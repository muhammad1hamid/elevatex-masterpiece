import { createCinematicMotion } from './cinematic';

const instances = new WeakMap<HTMLElement, () => void>();
const regions = '[data-footer-cta], [data-footer-main], [data-footer-scene]';

/** One-time footer entrances over complete, visible static HTML. */
export function initializeFooterMotion(): () => void {
  const root = document.querySelector<HTMLElement>('[data-footer]');
  if (!root) return () => {};
  const existing = instances.get(root);
  if (existing) return existing;

  const effects = createCinematicMotion(root);
  const listeners = new AbortController();
  const { signal } = listeners;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 767px)');
  const settled = new WeakSet<Element>();

  const text = (
    element: Element | null,
    delay: number,
    duration: number,
    distance: number | string,
  ) =>
    effects.play(
      element,
      [
        {
          opacity: 0.3,
          transform: `translateY(${typeof distance === 'number' ? `${distance}px` : distance})`,
        },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { delay, duration },
    );

  // A preference/history change never reintroduces content already on screen.
  const settleVisible = () => {
    root.querySelectorAll<HTMLElement>(regions).forEach((region) => {
      const bounds = region.getBoundingClientRect();
      if (bounds.top < innerHeight && bounds.bottom > 0) settled.add(region);
    });
  };

  const observe = (
    selector: string,
    reveal: (element: HTMLElement) => void,
  ) => {
    effects.observe(selector, (element) => {
      if (settled.has(element)) return;
      settled.add(element);
      reveal(element);
    });
  };

  const start = (keepVisible = false) => {
    effects.stop();
    if (keepVisible || reduced.matches) settleVisible();
    root.dataset['footerMotion'] = reduced.matches
      ? 'static'
      : mobile.matches
        ? 'quiet'
        : 'cinematic';
    if (reduced.matches || document.hidden) return;

    observe('[data-footer-cta]', (cta) => {
      const quiet = mobile.matches;
      text(cta.querySelector('[data-footer-eyebrow]'), 0, quiet ? 400 : 620, 8);
      cta
        .querySelectorAll('[data-footer-heading-line]')
        .forEach((line, index) =>
          text(
            line,
            quiet ? 30 + index * 50 : 60 + index * 120,
            quiet ? 500 : 940,
            quiet ? 12 : '85%',
          ),
        );
      text(
        cta.querySelector('[data-footer-copy]'),
        quiet ? 100 : 320,
        quiet ? 500 : 760,
        quiet ? 6 : 12,
      );
      text(
        cta.querySelector('[data-footer-action]'),
        quiet ? 140 : 420,
        quiet ? 520 : 800,
        quiet ? 6 : 12,
      );
      if (!quiet)
        effects.play(
          cta.querySelector('[data-footer-cta-light]'),
          [
            { opacity: 0, transform: 'translateX(-8%)' },
            { opacity: 0.28, offset: 0.5 },
            { opacity: 0, transform: 'translateX(8%)' },
          ],
          { duration: 1220 },
        );
    });

    observe('[data-footer-main]', (main) => {
      // Mobile navigation stays immediately still and readable.
      if (mobile.matches) return;
      main
        .querySelectorAll('[data-footer-brand], [data-footer-nav-group]')
        .forEach((group, index) => text(group, index * 70, 560, 8));
    });

    observe('[data-footer-scene]', (scene) => {
      const quiet = mobile.matches;
      text(
        scene.querySelector('[data-footer-wordmark]'),
        quiet ? 0 : 180,
        quiet ? 600 : 950,
        quiet ? 8 : 14,
      );
      effects.play(
        scene.querySelector('[data-footer-arc]'),
        [{ opacity: 0.35 }, { opacity: 1 }],
        { duration: quiet ? 650 : 1150 },
      );
      if (quiet) return;

      effects.play(
        scene.querySelector('[data-footer-arc-path]'),
        [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }],
        { duration: 1150 },
      );
      effects.play(
        scene.querySelector('[data-footer-arc-highlight]'),
        [
          { opacity: 0, strokeDashoffset: '1' },
          { opacity: 0.55, offset: 0.28 },
          { opacity: 0.32, offset: 0.72 },
          { opacity: 0, strokeDashoffset: '-0.15' },
        ],
        { duration: 1250, easing: 'ease-in-out' },
      );
      // The overlaid glyphs stay fixed; only their clipped reflection moves.
      effects.play(
        scene.querySelector('[data-footer-sweep]'),
        [
          { opacity: 0, backgroundPosition: '180% 0' },
          { opacity: 0.24, offset: 0.45 },
          { opacity: 0, backgroundPosition: '-80% 0' },
        ],
        { delay: 350, duration: 900, easing: 'ease-in-out' },
      );
    });
  };

  const settleInteraction = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    const region = event.target.closest(regions);
    if (!region || !root.contains(region)) return;
    settled.add(region);
    effects.focus(region);
  };
  root.addEventListener('focusin', settleInteraction, { signal });
  root.addEventListener('pointerdown', settleInteraction, {
    signal,
    passive: true,
  });
  const restart = () => start(true);
  reduced.addEventListener('change', restart, { signal });
  mobile.addEventListener('change', restart, { signal });
  window.addEventListener('pagehide', () => effects.stop(), { signal });
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted) restart();
    },
    { signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => (document.hidden ? effects.stop() : restart()),
    { signal },
  );
  const destroy = () => {
    effects.stop();
    listeners.abort();
    instances.delete(root);
  };
  document.addEventListener('astro:before-swap', destroy, {
    signal,
    once: true,
  });
  instances.set(root, destroy);
  const navigation = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined;
  start(navigation?.type === 'back_forward');
  return destroy;
}

document.addEventListener('astro:page-load', initializeFooterMotion);
