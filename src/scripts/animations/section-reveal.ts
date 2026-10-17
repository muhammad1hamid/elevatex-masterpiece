import { heroMotion } from '../../data/hero-motion';

/** Visible HTML is the default; only intersecting desktop content is animated. */
export function initSectionReveal(
  rootSelector: string,
  targetSelector: string,
  { distance = 20, duration = 780 } = {},
) {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root || !('IntersectionObserver' in window)) return;
  const elements = [...root.querySelectorAll<HTMLElement>(targetSelector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia(heroMotion.staticQuery);
  const seen = new Set<Element>();
  const active = new Map<Element, Animation>();
  const listeners = new AbortController();
  let observer: IntersectionObserver | undefined;

  const clear = () => {
    observer?.disconnect();
    active.forEach((animation) => animation.cancel());
    active.clear();
  };
  const synchronize = () => {
    clear();
    if (reduced.matches || mobile.matches) return;
    observer = new IntersectionObserver(
      (entries) => {
        let stagger = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer?.unobserve(entry.target);
          seen.add(entry.target);
          if (
            entry.boundingClientRect.top < 0 ||
            entry.target.contains(document.activeElement)
          )
            continue;
          try {
            const animation = entry.target.animate(
              [
                { opacity: 0, transform: `translateY(${distance}px)` },
                { opacity: 1, transform: 'translateY(0)' },
              ],
              {
                duration,
                delay: Math.min(stagger++ * 90, 270),
                easing: 'cubic-bezier(.22, 1, .36, 1)',
                fill: 'backwards',
              },
            );
            active.set(entry.target, animation);
            const complete = () => active.delete(entry.target);
            void animation.finished.then(complete, complete);
          } catch {
            // Unsupported/failed animation leaves the original content visible.
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -16px 0px' },
    );
    elements
      .filter((element) => !seen.has(element))
      .forEach((element) => observer?.observe(element));
  };

  root.addEventListener(
    'focusin',
    (event) => {
      active.forEach((animation, element) => {
        if (event.target instanceof Node && element.contains(event.target)) {
          animation.cancel();
          active.delete(element);
        }
      });
    },
    { signal: listeners.signal },
  );
  reduced.addEventListener('change', synchronize, { signal: listeners.signal });
  mobile.addEventListener('change', synchronize, { signal: listeners.signal });
  window.addEventListener('pagehide', clear, { signal: listeners.signal });
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted) synchronize();
    },
    { signal: listeners.signal },
  );
  document.addEventListener(
    'astro:before-swap',
    () => {
      clear();
      listeners.abort();
    },
    { once: true, signal: listeners.signal },
  );
  synchronize();
}
