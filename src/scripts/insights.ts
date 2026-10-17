import { createCinematicMotion } from './animations/cinematic';
const instances = new WeakMap<HTMLElement, () => void>();
export function initializeJournal(): () => void {
  const root = document.querySelector<HTMLElement>('[data-journal-page]');
  if (!root) return () => {};
  const previous = instances.get(root);
  if (previous) return previous;
  const controller = new AbortController(),
    { signal } = controller;
  const motion = createCinematicMotion(root),
    reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 767px)');
  let heroPlayed = false,
    frame = 0;
  const startMotion = () => {
    motion.stop();
    if (reduced.matches || document.hidden) return;
    if (
      !heroPlayed &&
      !location.hash &&
      scrollY < 20 &&
      performance.now() < 900 &&
      (
        performance.getEntriesByType('navigation')[0] as
          PerformanceNavigationTiming | undefined
      )?.type !== 'back_forward'
    ) {
      root
        .querySelectorAll('[data-journal-hero-item]')
        .forEach((element, index) =>
          motion.play(
            element,
            [
              {
                opacity: 0.35,
                transform: `translateY(${mobile.matches ? 8 : 18}px)`,
              },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: mobile.matches ? 500 : 760, delay: index * 80 },
          ),
        );
      motion.play(
        root.querySelector('[data-journal-light]'),
        [{ opacity: 0.3 }, { opacity: 1 }],
        { duration: 1300 },
      );
      const cover = root.querySelector('[data-journal-cover]');
      if (cover) motion.image(cover, false, 180);
    }
    heroPlayed = true;
    motion.observe('[data-journal-heading]', (heading) => {
      motion.text(heading.querySelector('.journal-eyebrow'));
      motion.text(heading.querySelector('h2'), 80);
    });
    motion.observe('[data-journal-story]', (story) => {
      motion.image(story.querySelector('[data-journal-image]'));
      motion.text(story.querySelector('.editorial-preview__copy'), 100, 10);
    });
    motion.observe('[data-article-diagram]', (figure) =>
      motion.text(figure, 0, 8),
    );
  };
  root.addEventListener('focusin', (event) => motion.focus(event.target), {
    signal,
  });
  root.addEventListener('pointerdown', (event) => motion.focus(event.target), {
    signal,
    passive: true,
  });
  document.addEventListener('keydown', () => motion.focus(root), { signal });
  const filters = root.querySelector<HTMLElement>('[data-journal-filters]');
  const stories = [
    ...root.querySelectorAll<HTMLElement>('[data-journal-story]'),
  ];
  if (filters) {
    filters.hidden = false;
    filters.addEventListener(
      'click',
      (event) => {
        const target =
          event.target instanceof Element
            ? event.target.closest<HTMLButtonElement>('[data-journal-filter]')
            : null;
        if (!target) return;
        const category = target.dataset['journalFilter'];
        motion.focus(root);
        let count = 0;
        for (const story of stories) {
          story.hidden =
            category !== 'all' && story.dataset['category'] !== category;
          if (!story.hidden) count++;
        }
        for (const group of root.querySelectorAll<HTMLElement>(
          '[data-journal-group]',
        ))
          group.hidden = ![
            ...group.querySelectorAll<HTMLElement>('[data-journal-story]'),
          ].some((story) => !story.hidden);
        for (const button of filters.querySelectorAll<HTMLButtonElement>(
          '[data-journal-filter]',
        ))
          button.setAttribute('aria-pressed', String(button === target));
        const output = root.querySelector('[data-journal-count]');
        if (output)
          output.textContent = `${count} ${count === 1 ? 'article' : 'articles'}${category === 'all' ? ' to explore' : ` in ${category}`}.`;
      },
      { signal },
    );
    root.querySelector('.journal-explore')?.addEventListener(
      'click',
      () => {
        if (root.querySelector<HTMLElement>('#featured-insight')?.hidden)
          filters
            .querySelector<HTMLButtonElement>('[data-journal-filter="all"]')
            ?.click();
      },
      { signal },
    );
  }
  const region = root.querySelector<HTMLElement>('[data-reading-region]');
  const progress = root.querySelector<HTMLElement>('[data-reading-progress]');
  const bar = progress?.querySelector<HTMLElement>('span');
  const updateReading = () => {
    frame = 0;
    if (!region || !progress || !bar) return;
    progress.hidden = reduced.matches;
    const box = region.getBoundingClientRect();
    const distance = Math.max(1, box.height - innerHeight * 0.55);
    const amount = Math.min(
      1,
      Math.max(0, (innerHeight * 0.2 - box.top) / distance),
    );
    bar.style.transform = `scaleX(${amount})`;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(updateReading);
  };
  if (region && progress) {
    window.addEventListener('scroll', schedule, { signal, passive: true });
    window.addEventListener('resize', schedule, { signal, passive: true });
    schedule();
  }
  const links = [...root.querySelectorAll<HTMLAnchorElement>('.insight-toc a')];
  const headingObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            const active = entries.find((entry) => entry.isIntersecting);
            if (!active) return;
            for (const link of links) {
              if (link.hash === `#${active.target.id}`)
                link.setAttribute('aria-current', 'location');
              else link.removeAttribute('aria-current');
            }
          },
          { rootMargin: '-32px 0px -60% 0px' },
        )
      : undefined;
  links.forEach((link) => {
    const target = document.getElementById(
      decodeURIComponent(link.hash.slice(1)),
    );
    if (target) headingObserver?.observe(target);
  });
  reduced.addEventListener(
    'change',
    () => {
      startMotion();
      schedule();
    },
    { signal },
  );
  window.addEventListener(
    'pagehide',
    () => {
      motion.stop();
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    },
    { signal },
  );
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted) {
        startMotion();
        schedule();
      }
    },
    { signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => (document.hidden ? motion.stop() : startMotion()),
    { signal },
  );
  const destroy = () => {
    controller.abort();
    motion.stop();
    headingObserver?.disconnect();
    if (frame) cancelAnimationFrame(frame);
    if (filters) filters.hidden = true;
    instances.delete(root);
  };
  document.addEventListener('astro:before-swap', destroy, {
    signal,
    once: true,
  });
  instances.set(root, destroy);
  startMotion();
  return destroy;
}
document.addEventListener('astro:page-load', initializeJournal);
