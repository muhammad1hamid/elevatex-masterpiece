/** Native content and controls remain complete without this enhancement. */
export function initializeLandingPages(): void {
  const root = document.querySelector<HTMLElement>('[data-landing-page]');
  if (!root) return;
  const media = matchMedia(
    '(min-width:1024px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)',
  );
  const hero = root.querySelector<HTMLElement>('[data-landing-hero]');
  const anatomy = [...root.querySelectorAll<HTMLElement>('[data-anatomy-row]')];
  const slices = [...root.querySelectorAll<HTMLElement>('[data-journey-row]')];
  const journey = root.querySelector<HTMLElement>('[data-journey]');
  const radios = [
    ...root.querySelectorAll<HTMLInputElement>('[name="landing-journey"]'),
  ];
  let manual = false,
    frame = 0,
    entered = false;
  const near = new Set<Element>();
  const controller = new AbortController();
  const choose = (rows: HTMLElement[]) => {
    let index = 0;
    rows.forEach((row, i) => {
      if (row.getBoundingClientRect().top <= innerHeight * 0.55) index = i;
    });
    return index;
  };
  const update = () => {
    frame = 0;
    if (!media.matches || document.hidden) return;
    if (anatomy.some((row) => near.has(row))) {
      const index = choose(anatomy);
      anatomy.forEach((row, i) =>
        row.classList.toggle('is-current', i === index),
      );
    }
    if (!manual && slices.some((row) => near.has(row))) {
      const radio = radios[choose(slices)];
      if (radio) radio.checked = true;
    }
  };
  const schedule = () => {
    if (media.matches && near.size && !frame)
      frame = requestAnimationFrame(update);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) near.add(entry.target);
        else near.delete(entry.target);
        if (
          entry.target === hero &&
          entry.isIntersecting &&
          media.matches &&
          !entered
        ) {
          entered = true;
          hero?.classList.add('is-entered');
        }
      }
      schedule();
    },
    { rootMargin: '10% 0px' },
  );
  for (const element of [...anatomy, ...slices, ...(hero ? [hero] : [])])
    observer.observe(element);
  const takeControl = () => {
    manual = true;
  };
  journey?.addEventListener('focusin', takeControl, {
    signal: controller.signal,
  });
  journey?.addEventListener('change', takeControl, {
    signal: controller.signal,
  });
  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!media.matches) {
      hero?.classList.remove('is-entered');
      anatomy.forEach((row) => row.classList.remove('is-current'));
    } else schedule();
  };
  media.addEventListener('change', reset, { signal: controller.signal });
  window.addEventListener('scroll', schedule, {
    passive: true,
    signal: controller.signal,
  });
  window.addEventListener('resize', schedule, {
    passive: true,
    signal: controller.signal,
  });
  document.addEventListener('visibilitychange', reset, {
    signal: controller.signal,
  });
  // pagehide may enter the browser back/forward cache; pageshow restores observation.
  window.addEventListener(
    'pagehide',
    () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      observer.disconnect();
    },
    { signal: controller.signal },
  );
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted)
        for (const element of [...anatomy, ...slices, ...(hero ? [hero] : [])])
          observer.observe(element);
    },
    { signal: controller.signal },
  );
}
