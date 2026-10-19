import { motion } from './config';
import type { MotionClock } from './ticker';

/** One delegated pointer controller; no layout reads in its animation frame. */
export function initializeCursor(clock: MotionClock) {
  const root = document.querySelector<HTMLElement>('[data-motion-cursor]');
  const dot = root?.querySelector<HTMLElement>('[data-cursor-dot]');
  const ring = root?.querySelector<HTMLElement>('[data-cursor-ring]');
  const label = root?.querySelector<HTMLElement>('[data-cursor-label]');
  if (!root || !dot || !ring || !label) return () => {};
  const controller = new AbortController(),
    { signal } = controller;
  const html = document.documentElement;
  let x = 0,
    y = 0,
    rx = 0,
    ry = 0,
    visible = false,
    selecting = false;
  let magnetic: HTMLElement | null = null;
  let visual: HTMLElement | SVGElement | null = null;
  let bounds: DOMRect | undefined;
  const releaseMagnet = () => {
    visual?.style.removeProperty('translate');
    magnetic = null;
    visual = null;
    bounds = undefined;
  };
  const hide = () => {
    visible = false;
    root.hidden = true;
    delete root.dataset['pressed'];
    delete html.dataset['cursorReady'];
    clock.remove(frame);
    releaseMagnet();
  };
  const frame = (_time: number, delta: number) => {
    if (!visible) return false;
    try {
      const blend = 1 - Math.exp(-Math.min(delta, 50) / 48);
      rx += (x - rx) * blend;
      ry += (y - ry) * blend;
      dot.style.transform = `translate3d(${x}px,${y}px,0)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      return Math.abs(x - rx) + Math.abs(y - ry) > 0.15;
    } catch {
      hide();
      return false;
    }
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || selecting || document.hidden) {
      hide();
      return;
    }
    const target = event.target instanceof Element ? event.target : null;
    if (
      !target ||
      target.closest(
        'input, textarea, select, option, [contenteditable]:not([contenteditable="false"]), [data-cursor="native"], iframe, dialog[open], [data-mobile-menu][open]',
      ) ||
      window.getSelection()?.type === 'Range'
    ) {
      hide();
      return;
    }
    x = event.clientX;
    y = event.clientY;
    const link = target.closest(
      'a[href], button:not(:disabled), summary, [role="button"]',
    );
    const context = target.closest<HTMLElement>('[data-cursor]');
    const requested = context?.dataset['cursor'];
    const customLabel =
      requested === 'label' ? context?.dataset['cursorText'] : undefined;
    const state = customLabel
      ? 'label'
      : link && requested === 'view'
        ? 'view'
        : link
          ? 'link'
          : 'default';
    root.dataset['state'] = state;
    label.textContent = customLabel ?? (state === 'view' ? 'VIEW ↗' : '');
    if (!visible) {
      rx = x;
      ry = y;
      // Render first. Native cursor is hidden only after a valid custom position exists.
      dot.style.transform = `translate3d(${x}px,${y}px,0)`;
      ring.style.transform = `translate3d(${x}px,${y}px,0)`;
      root.hidden = false;
      visible = true;
      html.dataset['cursorReady'] = '';
    }
    const next = target.closest<HTMLElement>('[data-magnetic]');
    if (next !== magnetic) {
      releaseMagnet();
      magnetic = next;
      visual =
        next?.querySelector<HTMLElement | SVGElement>(
          '[data-magnetic-content]',
        ) ?? null;
      bounds = visual ? next?.getBoundingClientRect() : undefined;
    }
    if (visual && bounds && !magnetic?.matches(':focus-visible')) {
      const limit = motion.distance.magnetic;
      const mx = Math.max(
        -limit,
        Math.min(
          limit,
          ((x - bounds.left - bounds.width / 2) / bounds.width) * limit * 2,
        ),
      );
      const my = Math.max(
        -limit,
        Math.min(
          limit,
          ((y - bounds.top - bounds.height / 2) / bounds.height) * limit * 2,
        ),
      );
      visual.style.translate = `${mx.toFixed(2)}px ${my.toFixed(2)}px`;
    }
    clock.wake(frame);
  };
  document.addEventListener('pointermove', move, { signal, passive: true });
  document.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest('a,button,summary')) {
        selecting = true;
        hide();
      } else root.dataset['pressed'] = '';
    },
    { signal, passive: true },
  );
  document.addEventListener(
    'pointerup',
    () => {
      selecting = false;
      delete root.dataset['pressed'];
    },
    { signal },
  );
  document.documentElement.addEventListener('pointerleave', hide, { signal });
  document.addEventListener(
    'pointercancel',
    () => {
      selecting = false;
      hide();
    },
    { signal },
  );
  document.addEventListener('keydown', hide, { signal });
  document.addEventListener('focusin', releaseMagnet, { signal });
  document.addEventListener(
    'selectionchange',
    () => {
      if (window.getSelection()?.type === 'Range') hide();
    },
    { signal },
  );
  window.addEventListener(
    'blur',
    () => {
      selecting = false;
      hide();
    },
    { signal },
  );
  // Scrolling can replace the element under a stationary pointer. Restore the
  // native pointer until the next actual pointer event establishes its context.
  window.addEventListener('scroll', hide, { signal, passive: true });
  window.addEventListener('resize', hide, { signal, passive: true });
  return () => {
    controller.abort();
    hide();
    delete root.dataset['pressed'];
  };
}
