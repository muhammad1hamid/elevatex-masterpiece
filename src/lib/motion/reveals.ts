import { createCinematicMotion } from '../../scripts/animations/cinematic';
import { motion } from './config';
import { revealDuration, revealFrames, type RevealPreset } from './primitives';

/** Curated opt-in only. Existing page controllers retain their own regions. */
export function initializeReveals() {
  const effects = createCinematicMotion(document.body);
  const controller = new AbortController(),
    { signal } = controller;
  const reduced = matchMedia(motion.reducedQuery),
    desktop = matchMedia(motion.desktopQuery);
  const start = () => {
    effects.stop();
    if (reduced.matches || document.hidden) return;
    effects.observe(
      '[data-motion-reveal], [data-case-study] [data-study-motion]:not([data-study-motion="none"])',
      (element) => {
        const navigation = performance.getEntriesByType('navigation')[0] as
          PerformanceNavigationTiming | undefined;
        if (
          element.matches('h1') &&
          (performance.now() > 900 ||
            location.hash ||
            navigation?.type === 'back_forward')
        )
          return;
        // An explicit parent owns the entire composition, not a second nested reveal.
        if (
          element.parentElement?.closest(
            '[data-motion-reveal], [data-study-motion]:not([data-study-motion="none"])',
          )
        )
          return;
        let preset = element.dataset['motionReveal'] as
          RevealPreset | undefined;
        const variant = element.dataset['studyMotion'];
        const theme =
          element.closest<HTMLElement>('[data-study-theme]')?.dataset[
            'studyTheme'
          ] ?? '';
        if (!preset)
          preset =
            variant === 'detail-reveal'
              ? 'text'
              : variant === 'browser-reveal'
                ? 'cinematic-left'
                : variant === 'device-reveal'
                  ? 'editorial-up'
                  : 'soft-unveil';
        const quiet = !desktop.matches;
        const duration =
          revealDuration(preset, quiet) *
          (theme.includes('jewel')
            ? 1.08
            : theme.includes('automotive')
              ? 0.86
              : 1);
        effects.play(element, revealFrames(preset, quiet), { duration });
      },
    );
  };
  document.addEventListener('focusin', (event) => effects.focus(event.target), {
    signal,
  });
  document.addEventListener(
    'pointerdown',
    (event) => effects.focus(event.target),
    { signal, passive: true },
  );
  document.addEventListener('keydown', () => effects.focus(document.body), {
    signal,
  });
  reduced.addEventListener('change', start, { signal });
  desktop.addEventListener('change', start, { signal });
  document.addEventListener(
    'visibilitychange',
    () => (document.hidden ? effects.stop() : start()),
    { signal },
  );
  window.addEventListener('pagehide', () => effects.stop(), { signal });
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted) start();
    },
    { signal },
  );
  start();
  return () => {
    effects.stop();
    controller.abort();
  };
}
