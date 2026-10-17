export {};
const eligible = window.matchMedia(
  '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
);
const active = new Set<Animation>();
let observer: IntersectionObserver | undefined;
const initialize = () => {
  observer?.disconnect();
  for (const animation of active) animation.cancel();
  active.clear();
  if (!eligible.matches || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          observer?.unobserve(entry.target);
          if (typeof entry.target.animate !== 'function') continue;
          const motion = (entry.target as HTMLElement).dataset.studyMotion;
          const soft = motion === 'soft-reveal' || motion === 'gallery-reveal';
          const animation = entry.target.animate(
            soft
              ? [{ opacity: 0.6 }, { opacity: 1 }]
              : [
                  {
                    opacity: 0.4,
                    transform: `translateY(${motion === 'detail-reveal' ? 8 : 14}px)`,
                  },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
            {
              duration: motion === 'gallery-reveal' ? 900 : 700,
              easing: 'cubic-bezier(.2,.8,.2,1)',
            },
          );
          active.add(animation);
          void animation.finished
            .then(() => active.delete(animation))
            .catch(() => active.delete(animation));
        }
    },
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(
      '[data-case-study] [data-study-motion]:not([data-study-motion="none"])',
    )
    .forEach((element) => observer?.observe(element));
};
initialize();
eligible.addEventListener('change', initialize);
