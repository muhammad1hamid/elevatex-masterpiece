import { motion } from '../../lib/motion/config';
/** Finite enhancements over visible HTML. No pre-animation hidden state. */
export function createCinematicMotion(root: HTMLElement) {
  const animations = new Map<Animation, Element>();
  const callbacks = new Map<Element, (element: HTMLElement) => void>();
  const seen = new WeakSet<Element>();
  let observer: IntersectionObserver | undefined;

  const play = (
    element: Element | null,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions = {},
  ) => {
    if (
      !element ||
      matchMedia(motion.reducedQuery).matches ||
      typeof element.animate !== 'function' ||
      element.contains(document.activeElement)
    )
      return;
    try {
      // Keep interactive text and fields at their authored contrast throughout
      // an entrance. Their container may travel, but never fades through grey.
      const controls = 'a[href], button, input, textarea, select';
      const frames =
        element.matches(controls) || element.querySelector(controls)
          ? keyframes.map((frame) => ({ ...frame, opacity: 1 }))
          : keyframes;
      const animation = element.animate(frames, {
        duration: motion.duration.editorial,
        easing: motion.ease,
        fill: 'backwards',
        ...options,
      });
      animations.set(animation, element);
      void animation.finished.then(
        () => animations.delete(animation),
        () => animations.delete(animation),
      );
      return animation;
    } catch {
      // A failed enhancement leaves the authored final state intact.
      return;
    }
  };
  const stop = () => {
    observer?.disconnect();
    callbacks.clear();
    for (const animation of animations.keys()) animation.cancel();
    animations.clear();
  };
  const observe = (
    selector: string,
    callback: (element: HTMLElement) => void,
  ) => {
    if (!('IntersectionObserver' in window)) return;
    observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            observer?.unobserve(entry.target);
            const run = callbacks.get(entry.target);
            callbacks.delete(entry.target);
            if (seen.has(entry.target)) continue;
            seen.add(entry.target);
            // Fast scrolling never pulls already-passed content back into a reveal.
            if (
              entry.boundingClientRect.bottom < 0 ||
              entry.boundingClientRect.top < -40
            )
              continue;
            run?.(entry.target as HTMLElement);
          }
      },
      { threshold: 0.12 },
    );
    for (const element of root.querySelectorAll<HTMLElement>(selector)) {
      if (seen.has(element)) continue;
      callbacks.set(element, callback);
      observer.observe(element);
    }
  };
  const text = (element: Element | null, delay = 0, distance = 20) =>
    play(
      element,
      [
        { opacity: 0.25, transform: `translateY(${distance}px)` },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { delay, duration: motion.duration.editorial },
    );
  const image = (element: Element | null, vertical = false, delay = 0) =>
    play(
      element,
      [
        {
          clipPath: vertical ? 'inset(0 0 96% 0)' : 'inset(0 10% 0 10%)',
          opacity: 0.6,
        },
        { clipPath: 'inset(0 0 0 0)', opacity: 1 },
      ],
      { delay, duration: motion.duration.cinematic },
    );
  const sweep = (element: Element | null, delay = 0) =>
    play(
      element,
      [
        { transform: 'translateX(-65%)', opacity: 0 },
        { opacity: 0.8, offset: 0.4 },
        { transform: 'translateX(65%)', opacity: 0 },
      ],
      { delay, duration: 1300 },
    );
  const focus = (target: EventTarget | null) => {
    if (!(target instanceof Node)) return;
    for (const [animation, element] of animations)
      if (
        element.contains(target) ||
        (target instanceof Element && target.contains(element))
      ) {
        animation.cancel();
        animations.delete(animation);
      }
  };
  return { play, observe, text, image, sweep, stop, focus };
}
