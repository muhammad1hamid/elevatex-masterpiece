/** One finite hero entrance; evidence and annotations remain static HTML. */
export function initializeLandingPages(): void {
  const root = document.querySelector<HTMLElement>('[data-landing-page]');
  const hero = root?.querySelector<HTMLElement>('[data-landing-hero]');
  if (!hero || !('IntersectionObserver' in window)) return;
  const media = matchMedia(
    '(min-width:1024px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)',
  );
  const controller = new AbortController();
  let entered = false;
  const observer = new IntersectionObserver((entries) => {
    if (
      !entered &&
      media.matches &&
      entries.some((entry) => entry.isIntersecting)
    ) {
      entered = true;
      hero.classList.add('is-entered');
    }
  });
  const observe = () => observer.observe(hero);
  observe();
  media.addEventListener(
    'change',
    () => {
      if (!media.matches) hero.classList.remove('is-entered');
      else if (!entered) observe();
    },
    { signal: controller.signal },
  );
  window.addEventListener('pagehide', () => observer.disconnect(), {
    signal: controller.signal,
  });
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted) observe();
    },
    { signal: controller.signal },
  );
  document.addEventListener(
    'astro:before-swap',
    () => {
      observer.disconnect();
      controller.abort();
    },
    { once: true, signal: controller.signal },
  );
}
