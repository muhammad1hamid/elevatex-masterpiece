import { createCinematicMotion } from './cinematic';
const instances = new WeakMap<HTMLElement, () => void>();

export function initializeAbout(): () => void {
  const root = document.querySelector<HTMLElement>('[data-about-page]');
  if (!root) return () => {};
  const existing = instances.get(root);
  if (existing) return existing;
  const effects = createCinematicMotion(root),
    listeners = new AbortController(),
    { signal } = listeners;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'),
    desktop = matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine)',
    );
  let heroPlayed = false,
    parallaxObserver: IntersectionObserver | undefined,
    frame = 0;
  const visible = new Set<HTMLElement>();
  const layers = [
    ...root.querySelectorAll<HTMLElement>('[data-about-parallax]'),
  ];
  const suspend = () => {
    effects.stop();
    parallaxObserver?.disconnect();
    visible.clear();
    cancelAnimationFrame(frame);
    frame = 0;
    layers.forEach((layer) => layer.style.removeProperty('transform'));
  };
  const updateDepth = () => {
    frame = 0;
    if (!desktop.matches || reduced.matches || document.hidden) return;
    const positions = [...visible].map((layer) => {
      const bounds = layer.parentElement!.getBoundingClientRect();
      const progress = Math.max(
        -1,
        Math.min(
          1,
          (innerHeight / 2 - (bounds.top + bounds.height / 2)) /
            (innerHeight + bounds.height),
        ),
      );
      return { layer, y: progress * 24 };
    });
    positions.forEach(({ layer, y }) => {
      layer.style.transform = `translate3d(0,${y.toFixed(2)}px,0) scale(1.035)`;
    });
  };
  const scheduleDepth = () => {
    if (visible.size && !frame && !document.hidden)
      frame = requestAnimationFrame(updateDepth);
  };
  const playHero = () => {
    if (heroPlayed) return;
    heroPlayed = true;
    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    // Never hide a scene that has already been read on a slow load or history visit.
    if (
      location.hash ||
      scrollY > 20 ||
      navigation?.type === 'back_forward' ||
      performance.now() > 900
    )
      return;
    effects.text(root.querySelector('[data-about-hero-eyebrow]'), 0, 8);
    root
      .querySelectorAll('[data-about-hero-line]')
      .forEach((line, index) => effects.text(line, 90 + index * 120, 24));
    effects.text(root.querySelector('[data-about-hero-copy]'), 250, 10);
    effects.text(root.querySelector('[data-about-hero-actions]'), 340, 10);
    const stage = root.querySelector('[data-about-scene="hero"]');
    effects.image(
      stage?.querySelector('[data-about-image]') ?? null,
      false,
      220,
    );
    effects.sweep(stage?.querySelector('[data-about-light]') ?? null, 260);
    root.dataset['aboutHero'] = 'played';
  };
  const start = () => {
    suspend();
    root.dataset['aboutMotion'] = reduced.matches
      ? 'static'
      : desktop.matches
        ? 'cinematic'
        : 'quiet';
    if (reduced.matches || document.hidden) return;
    if (!desktop.matches) {
      effects.observe(
        '[data-about-heading], [data-about-project], .about-art__window',
        (element) =>
          effects.play(element, [{ opacity: 0.72 }, { opacity: 1 }], {
            duration: 480,
          }),
      );
      return;
    }
    playHero();
    effects.observe('[data-about-heading]', (heading) => {
      effects.text(heading.querySelector('.about-eyebrow'), 0, 8);
      heading
        .querySelectorAll('[data-about-line]')
        .forEach((line, index) => effects.text(line, 90 + index * 100, 22));
      effects.text(heading.querySelector('.about-lead'), 220, 10);
    });
    effects.observe('[data-about-row]', (element) =>
      effects.text(element, 0, 12),
    );
    effects.observe('[data-about-story-rule]', (element) =>
      effects.play(
        element,
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: 900 },
      ),
    );
    effects.observe('[data-about-scene="philosophy"]', (scene) => {
      effects.image(scene.querySelector('[data-about-image]'));
      scene.querySelectorAll('[data-about-draw]').forEach((line, index) =>
        effects.play(
          line,
          [
            { strokeDashoffset: '1', opacity: 0 },
            { strokeDashoffset: '0', opacity: 1 },
          ],
          { delay: 350 + index * 140, duration: 1050 },
        ),
      );
      scene
        .closest('section')
        ?.querySelectorAll('[data-about-label]')
        .forEach((label, index) => effects.text(label, 400 + index * 100, 8));
      effects.sweep(scene.querySelector('[data-about-light]'), 250);
    });
    effects.observe('[data-about-scene="founder"]', (scene) => {
      effects.image(scene.querySelector('[data-about-image]'), true);
      effects.sweep(scene.querySelector('[data-about-light]'), 300);
      scene
        .querySelectorAll('[data-about-founder-copy]')
        .forEach((element, index) =>
          effects.text(element, 120 + index * 75, 12),
        );
    });
    effects.observe('[data-about-scene="workspace"]', (scene) => {
      effects.image(scene.querySelector('[data-about-image]'), false);
      effects.sweep(scene.querySelector('[data-about-light]'), 180);
    });
    effects.observe('[data-about-workflow]', (workflow) => {
      effects.play(
        workflow.querySelector('[data-about-workflow-line]'),
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: 1400 },
      );
      workflow.querySelectorAll('[data-about-step]').forEach((step, index) => {
        effects.text(step, index * 170, 10);
        effects.play(
          step.querySelector('i'),
          [
            { opacity: 0.2, transform: 'scale(.6)' },
            { opacity: 1, transform: 'scale(1)' },
          ],
          { delay: index * 170, duration: 700 },
        );
      });
    });
    effects.observe('[data-about-project]', (project) =>
      effects.image(project.querySelector('[data-about-image]')),
    );
    if ('IntersectionObserver' in window) {
      parallaxObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
          else visible.delete(entry.target as HTMLElement);
        });
        scheduleDepth();
      });
      layers.forEach((layer) => parallaxObserver?.observe(layer));
    }
  };
  root.addEventListener('focusin', (event) => effects.focus(event.target), {
    signal,
  });
  const interruptHero = () => {
    if (root.dataset['aboutHero'] !== 'played') return;
    const hero = root.querySelector('[data-about-hero]');
    if (hero) effects.focus(hero);
  };
  // Interactions remain immediate during the short entrance.
  root.addEventListener('pointerdown', interruptHero, {
    signal,
    passive: true,
  });
  window.addEventListener('wheel', interruptHero, { signal, passive: true });
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Tab' || event.key === 'Escape') interruptHero();
    },
    { signal },
  );
  window.addEventListener('scroll', scheduleDepth, { signal, passive: true });
  window.addEventListener('resize', scheduleDepth, { signal, passive: true });
  reduced.addEventListener('change', start, { signal });
  desktop.addEventListener('change', start, { signal });
  window.addEventListener('pagehide', suspend, { signal });
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted) start();
    },
    { signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => (document.hidden ? suspend() : start()),
    { signal },
  );
  const destroy = () => {
    suspend();
    listeners.abort();
    instances.delete(root);
  };
  document.addEventListener('astro:before-swap', destroy, {
    signal,
    once: true,
  });
  instances.set(root, destroy);
  start();
  return destroy;
}

// Safe for a future Astro client router as well as today's normal page loads.
document.addEventListener('astro:page-load', () => {
  initializeAbout();
});
