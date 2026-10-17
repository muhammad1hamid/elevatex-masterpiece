import { createCinematicMotion } from './cinematic';
const instances = new WeakMap<HTMLElement, () => void>();

export function initializeContactMotion(): () => void {
  const root = document.querySelector<HTMLElement>('[data-contact-page]');
  if (!root) return () => {};
  const previous = instances.get(root);
  if (previous) return previous;
  const effects = createCinematicMotion(root),
    listeners = new AbortController(),
    { signal } = listeners;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 767px)');
  let heroPlayed = false;
  const text = (element: Element | null, delay = 0) =>
    effects.play(
      element,
      [
        {
          opacity: 0.35,
          transform: `translateY(${mobile.matches ? 8 : 18}px)`,
        },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { delay, duration: mobile.matches ? 500 : 760 },
    );
  const start = () => {
    effects.stop();
    root.dataset['contactMotion'] = reduced.matches ? 'static' : 'cinematic';
    if (reduced.matches || document.hidden) return;
    const navigation = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined;
    if (
      !heroPlayed &&
      !location.hash &&
      scrollY < 20 &&
      performance.now() < 900 &&
      navigation?.type !== 'back_forward'
    ) {
      text(root.querySelector('[data-contact-hero-eyebrow]'));
      root
        .querySelectorAll('[data-contact-hero-line]')
        .forEach((line, index) => text(line, 80 + index * 110));
      text(root.querySelector('[data-contact-hero-copy]'), 240);
      text(root.querySelector('[data-contact-hero-action]'), 320);
      if (!mobile.matches)
        effects.sweep(root.querySelector('[data-contact-shine]'), 140);
      effects.play(
        root.querySelector('[data-contact-light]'),
        [{ opacity: 0.3 }, { opacity: 1 }],
        { duration: 1300 },
      );
    }
    heroPlayed = true;
    effects.observe('[data-contact-heading]', (heading) => {
      text(heading.querySelector('.contact-eyebrow'));
      heading
        .querySelectorAll('[data-contact-line]')
        .forEach((line, index) => text(line, 50 + index * 90));
      text(heading.querySelector('.contact-lead'), 180);
    });
    effects.observe('[data-inquiry-form]', (form) => {
      effects.play(form, [{ opacity: 0.65 }, { opacity: 1 }], {
        duration: 650,
      });
      form
        .querySelectorAll('[data-contact-field]')
        .forEach((field, index) => text(field, Math.floor(index / 2) * 60));
      text(form.querySelector('[data-contact-form-action]'), 220);
    });
    effects.observe('[data-contact-steps]', (steps) => {
      const axis = mobile.matches ? 'Y' : 'X';
      effects.play(
        steps.querySelector('[data-contact-process-line]'),
        [{ transform: `scale${axis}(0)` }, { transform: `scale${axis}(1)` }],
        { duration: 1200 },
      );
      steps
        .querySelectorAll('[data-contact-step]')
        .forEach((step, index) => text(step, index * 160));
    });
    effects.observe('[data-contact-row]', (row) => text(row));
  };
  root.addEventListener('focusin', (event) => effects.focus(event.target), {
    signal,
  });
  root.addEventListener('pointerdown', (event) => effects.focus(event.target), {
    signal,
    passive: true,
  });
  root
    .querySelectorAll<HTMLAnchorElement>('a[href="#project-inquiry"]')
    .forEach((link) => {
      link.addEventListener(
        'click',
        (event) => {
          if (
            event.button ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          const target = document.getElementById('project-inquiry');
          if (!target) return;
          event.preventDefault();
          if (location.hash !== '#project-inquiry')
            history.pushState(null, '', '#project-inquiry');
          effects.focus(target);
          target.focus({ preventScroll: true });
          target.scrollIntoView({
            behavior: reduced.matches ? 'auto' : 'smooth',
            block: 'start',
          });
        },
        { signal },
      );
    });
  const settleHero = () => {
    const hero = root.querySelector('[data-contact-hero]');
    if (hero) effects.focus(hero);
  };
  window.addEventListener('wheel', settleHero, { signal, passive: true });
  document.addEventListener('keydown', settleHero, { signal });
  reduced.addEventListener('change', start, { signal });
  mobile.addEventListener('change', start, { signal });
  window.addEventListener('pagehide', () => effects.stop(), { signal });
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted) start();
    },
    { signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => (document.hidden ? effects.stop() : start()),
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
  start();
  return destroy;
}
document.addEventListener('astro:page-load', initializeContactMotion);
