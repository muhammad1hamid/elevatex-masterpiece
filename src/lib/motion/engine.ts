import { motion } from './config';
import { initializeReveals } from './reveals';

/** Normal documents today; replacement and bfcache lifecycle also release ownership. */
export function initializeMotionEngine() {
  const controller = new AbortController(),
    { signal } = controller;
  const reduced = matchMedia(motion.reducedQuery);
  const fine = matchMedia(motion.fineQuery);
  const contrast = matchMedia('(forced-colors: active)');
  let dispose: (() => void) | undefined,
    pending = false,
    version = 0,
    away = false,
    failed = false;
  const revealCleanup = initializeReveals();
  const eligible = () =>
    fine.matches &&
    !reduced.matches &&
    !contrast.matches &&
    !document.hidden &&
    !away;
  const suspend = () => {
    version++;
    pending = false;
    dispose?.();
    dispose = undefined;
  };
  const start = async () => {
    if (!eligible() || pending || dispose || failed) return;
    pending = true;
    const attempt = ++version;
    try {
      const { initializeAdvancedMotion } = await import('./advanced');
      if (attempt !== version || !eligible()) return;
      dispose = initializeAdvancedMotion();
    } catch {
      /* Optional module failure preserves native input and visible content. */
      failed = true;
    } finally {
      if (attempt === version) pending = false;
    }
  };
  const synchronize = () => {
    suspend();
  };
  // Avoid downloading desktop scrolling/cursor code in the critical rendering path.
  document.addEventListener(
    'pointermove',
    () => {
      void start();
    },
    { signal, passive: true },
  );
  document.addEventListener(
    'wheel',
    () => {
      void start();
    },
    { signal, passive: true },
  );
  reduced.addEventListener('change', synchronize, { signal });
  fine.addEventListener('change', synchronize, { signal });
  contrast.addEventListener('change', synchronize, { signal });
  document.addEventListener('visibilitychange', suspend, { signal });
  document.addEventListener(
    'keydown',
    (event) => {
      if (
        ['Tab', 'Escape', 'Home', 'End', 'PageUp', 'PageDown', ' '].includes(
          event.key,
        )
      )
        suspend();
    },
    { signal, capture: true },
  );
  window.addEventListener(
    'pagehide',
    () => {
      away = true;
      suspend();
    },
    { signal },
  );
  window.addEventListener(
    'pageshow',
    () => {
      away = false;
    },
    { signal },
  );
  return () => {
    suspend();
    revealCleanup();
    controller.abort();
  };
}
