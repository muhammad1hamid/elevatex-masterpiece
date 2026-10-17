import { heroMotion } from '../../data/hero-motion';

/** One scroll controller. All content and the native sticky layout exist without it. */
export function initializeProcess() {
  const root = document.querySelector<HTMLElement>('[data-process]');
  const journey = root?.querySelector<HTMLElement>('[data-process-journey]');
  if (!root || !journey || !('IntersectionObserver' in window)) return;
  const chapters = [
    ...root.querySelectorAll<HTMLElement>('[data-process-chapter]'),
  ];
  const nodes = [...root.querySelectorAll<HTMLElement>('[data-process-node]')];
  const numbers = [
    ...root.querySelectorAll<HTMLElement>('[data-process-number]'),
  ];
  const visuals = [
    ...root.querySelectorAll<HTMLElement | SVGSVGElement>(
      '[data-process-visual]',
    ),
  ];
  const captions = [
    ...root.querySelectorAll<HTMLElement>('[data-process-caption]'),
  ];
  const track = root.querySelector<SVGSVGElement>('[data-process-track]');
  const light = root.querySelector<HTMLElement>('[data-thread-light]');
  if (!track || !light || !chapters.length || chapters.length !== nodes.length)
    return;
  const paths = [
    ...track.querySelectorAll<SVGPathElement>('[data-thread-path]'),
  ];
  const progressPaths = [
    ...track.querySelectorAll<SVGPathElement>('[data-thread-progress]'),
  ];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia(heroMotion.staticQuery);
  const listeners = new AbortController();
  let version = 0;
  let cleanup: (() => void) | undefined;
  let loader: IntersectionObserver | undefined;
  let destroyed = false;
  const staticMode = () => reduced.matches || mobile.matches;

  const reset = () => {
    delete root.dataset['processEnhanced'];
    delete root.dataset['activeStage'];
    delete root.dataset['progress'];
    chapters.forEach((chapter) => delete chapter.dataset['active']);
    [numbers, visuals, captions].forEach((group) =>
      group.forEach((element, i) => {
        element.removeAttribute('style');
        element.classList.toggle('is-current', i === 0);
      }),
    );
    track.setAttribute('viewBox', '0 0 24 100');
    paths.forEach((path) => {
      path.setAttribute('d', 'M12 0V100');
      path.removeAttribute('style');
    });
    light.removeAttribute('style');
  };

  const load = async (attempt: number) => {
    try {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (attempt !== version || destroyed || staticMode()) return;
      gsap.registerPlugin(ScrollTrigger);
      let points: number[] = [];
      let start = 0;
      let end = 1;
      let current = -1;
      let transition: gsap.core.Timeline | undefined;
      let frame = 0;
      const runtime: { trigger?: ReturnType<typeof ScrollTrigger.create> } = {};
      let resize: ResizeObserver | undefined;
      const measure = () => {
        const bounds = journey.getBoundingClientRect();
        points = nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return box.top + box.height / 2 - bounds.top;
        });
        const first = points[0] ?? 0;
        const last = points.at(-1) ?? 1;
        track.setAttribute('viewBox', `0 0 24 ${Math.max(1, bounds.height)}`);
        paths.forEach((path) => path.setAttribute('d', `M12 ${first}V${last}`));
        start = bounds.top + scrollY + first - innerHeight * 0.46;
        end = Math.max(
          start + 1,
          bounds.top + scrollY + last - innerHeight * 0.46,
        );
      };
      const activate = (index: number, animate: boolean) => {
        if (index === current) return;
        const previous = current;
        current = index;
        transition?.kill();
        root.dataset['activeStage'] =
          chapters[index]!.dataset['processChapter'];
        chapters.forEach((chapter, i) => {
          if (i === index) chapter.dataset['active'] = '';
          else delete chapter.dataset['active'];
        });
        [numbers, visuals, captions].forEach((group) =>
          group.forEach((element, i) => {
            element.classList.toggle('is-current', i === index);
            gsap.set(element, { opacity: i === index ? 1 : 0, y: 0 });
          }),
        );
        if (!animate || previous < 0 || document.hidden) return;
        transition = gsap.timeline();
        transition
          .fromTo(
            numbers[previous]!,
            { opacity: 1, y: 0 },
            { opacity: 0, y: -16, duration: 0.4, ease: 'power2.out' },
            0,
          )
          .fromTo(
            numbers[index]!,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.48, ease: 'power2.out' },
            0,
          )
          .fromTo(
            visuals[index]!,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            0,
          )
          .fromTo(
            visuals[previous]!,
            { opacity: 1 },
            { opacity: 0, duration: 0.35 },
            0,
          )
          .fromTo(
            captions[index]!,
            { opacity: 0 },
            { opacity: 1, duration: 0.45 },
            0,
          );
      };
      const update = (progress: number, animate = true) => {
        const first = points[0] ?? 0;
        const last = points.at(-1) ?? 1;
        const y = first + progress * (last - first);
        progressPaths.forEach((path) => {
          path.style.strokeDasharray = '1';
          path.style.strokeDashoffset = String(1 - progress);
        });
        light.style.transform = `translateY(${y}px)`;
        root.dataset['progress'] = progress.toFixed(4);
        // A chapter takes over at its node. A four-pixel dead band avoids boundary jitter.
        let next = current < 0 ? 0 : current;
        while (next < points.length - 1 && y >= points[next + 1]! + 4) next++;
        while (next > 0 && y < points[next]! - 4) next--;
        if (progress >= 0.9999) next = points.length - 1;
        activate(next, animate);
      };
      const refresh = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => runtime.trigger?.refresh());
      };
      const settle = () => {
        if (document.hidden) transition?.progress(1);
      };
      // Establish teardown before any observer or plugin setup can fail.
      cleanup = () => {
        cancelAnimationFrame(frame);
        resize?.disconnect();
        window.removeEventListener('resize', refresh);
        document.removeEventListener('visibilitychange', settle);
        runtime.trigger?.kill();
        transition?.kill();
        gsap.killTweensOf([...numbers, ...visuals, ...captions]);
        reset();
      };
      root.dataset['processEnhanced'] = '';
      measure();
      runtime.trigger = ScrollTrigger.create({
        id: 'elevatex-process',
        trigger: journey,
        start: () => start,
        end: () => end,
        onRefreshInit: measure,
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => update(self.progress, false),
      });
      update(runtime.trigger.progress, false);
      if (typeof ResizeObserver === 'function') {
        resize = new ResizeObserver(refresh);
        resize.observe(journey);
      } else {
        window.addEventListener('resize', refresh);
      }
      document.addEventListener('visibilitychange', settle);
    } catch {
      cleanup?.();
      cleanup = undefined;
      reset();
    }
  };
  const synchronize = () => {
    const attempt = ++version;
    loader?.disconnect();
    cleanup?.();
    cleanup = undefined;
    reset();
    if (staticMode() || destroyed) return;
    loader = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        loader?.disconnect();
        void load(attempt);
      },
      { rootMargin: '600px 0px' },
    );
    loader.observe(root);
  };
  const suspend = () => {
    ++version;
    loader?.disconnect();
    cleanup?.();
    cleanup = undefined;
  };
  const destroy = () => {
    destroyed = true;
    suspend();
    listeners.abort();
  };
  reduced.addEventListener('change', synchronize, { signal: listeners.signal });
  mobile.addEventListener('change', synchronize, { signal: listeners.signal });
  window.addEventListener('pagehide', suspend, { signal: listeners.signal });
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted) synchronize();
    },
    { signal: listeners.signal },
  );
  document.addEventListener('astro:before-swap', destroy, {
    signal: listeners.signal,
    once: true,
  });
  synchronize();
}
