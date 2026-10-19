import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MotionClock } from './ticker';

export function initializeSmoothScroll(clock: MotionClock) {
  gsap.registerPlugin(ScrollTrigger);
  const controller = new AbortController(),
    { signal } = controller;
  const lenis = new Lenis({
    autoRaf: false,
    anchors: false,
    syncTouch: false,
    smoothWheel: true,
    lerp: 0.16,
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
    prevent: (node) =>
      node.matches(
        'textarea, select, input, [contenteditable], [data-lenis-prevent], dialog, [data-mobile-menu], pre',
      ),
    virtualScroll: ({ event }) =>
      !event.ctrlKey &&
      !document.querySelector('dialog[open], [data-mobile-menu][open]'),
  });
  document.documentElement.dataset['smoothScroll'] = 'lenis';
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;
  let elapsed = 0;
  const tick = (_time: number, delta: number) => {
    try {
      // The shared clock sleeps when idle. Bound its logical elapsed time so
      // the first wheel event after a long pause cannot jump straight to target.
      elapsed += Math.min(delta, 50);
      lenis.raf(elapsed);
      return lenis.isScrolling === 'smooth';
    } catch {
      destroy();
      return false;
    }
  };
  const wake = () => {
    // Lenis emits virtual-scroll before it starts its interpolation. Queue the
    // clock attachment until that state is ready, including a sleeping ticker.
    queueMicrotask(() => {
      if (!signal.aborted) clock.wake(tick);
    });
  };
  const off = lenis.on('scroll', ScrollTrigger.update);
  const offVirtual = lenis.on('virtual-scroll', wake);
  // Keyboard, history, selection and real anchor navigation cancel wheel inertia.
  // Their default browser behavior remains responsible for focus, hashes and restoration.
  const settle = () => {
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  };
  document.addEventListener('pointerdown', settle, {
    signal,
    capture: true,
    passive: true,
  });
  document.addEventListener(
    'click',
    (event) => {
      if (event.target instanceof Element && event.target.closest('a[href]'))
        settle();
    },
    { signal, capture: true },
  );
  window.addEventListener('popstate', settle, { signal });
  window.addEventListener('hashchange', settle, { signal });
  const refresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    }, 120);
  };
  const resize = new ResizeObserver(refresh);
  resize.observe(document.body);
  document.addEventListener('load', refresh, { signal, capture: true });
  document.addEventListener('toggle', refresh, { signal, capture: true });
  document.fonts.addEventListener('loadingdone', refresh, { signal });
  function destroy() {
    controller.abort();
    clearTimeout(refreshTimer);
    resize.disconnect();
    off();
    offVirtual();
    clock.remove(tick);
    lenis.destroy();
    delete document.documentElement.dataset['smoothScroll'];
  }
  return destroy;
}
