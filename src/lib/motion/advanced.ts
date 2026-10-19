import { createMotionClock } from './ticker';
import { initializeCursor } from './cursor';
import { initializeSmoothScroll } from './smooth-scroll';

export function initializeAdvancedMotion() {
  const clock = createMotionClock();
  let cursor: (() => void) | undefined, scroll: (() => void) | undefined;
  try {
    cursor = initializeCursor(clock);
  } catch {
    /* Native cursor remains. */
  }
  try {
    scroll = initializeSmoothScroll(clock);
  } catch {
    /* Native scroll remains. */
  }
  return () => {
    cursor?.();
    scroll?.();
    clock.destroy();
  };
}
