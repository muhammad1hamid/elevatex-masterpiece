import { heroMotion } from '../../data/hero-motion';

/** A user-controlled illustration only. No request, order or form submission. */
export function initializeFeaturedWorkflow() {
  const root = document.querySelector<HTMLElement>('[data-system-preview]');
  const button = root?.querySelector<HTMLButtonElement>('[data-workflow-play]');
  const label = button?.querySelector<HTMLElement>('[data-workflow-label]');
  if (!root || !button || !label || typeof root.animate !== 'function') return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia(heroMotion.staticQuery);
  const timers = new Set<number>();
  const animations = new Set<Animation>();
  let playing = false;
  let played = false;
  const staticMode = () => reduced.matches || mobile.matches;

  const finish = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    playing = false;
    root.dataset['workflowState'] = 'complete';
    button.removeAttribute('aria-disabled');
    label.textContent = played ? 'Replay Flow' : 'See the Flow';
  };
  const synchronize = () => {
    finish();
    button.hidden = staticMode();
  };
  const animate = (
    selector: string,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) => {
    const element = root.querySelector<HTMLElement>(selector);
    if (!element) return;
    const animation = element.animate(keyframes, options);
    animations.add(animation);
    const clean = () => animations.delete(animation);
    void animation.finished.then(clean, clean);
  };
  const later = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      if (!playing || staticMode()) {
        finish();
        return;
      }
      try {
        callback();
      } catch {
        finish();
      }
    }, delay);
    timers.add(timer);
  };

  button.addEventListener('click', () => {
    if (playing || staticMode() || document.hidden) return;
    played = true;
    playing = true;
    button.setAttribute('aria-disabled', 'true');
    label.textContent = 'Showing flow…';
    root.dataset['workflowState'] = 'message';
    later(() => {
      root.dataset['workflowState'] = 'processing';
      animate(
        '[data-workflow-pulse]',
        [
          { strokeDashoffset: '.08', opacity: 0 },
          { opacity: 0.85, offset: 0.2 },
          { strokeDashoffset: '-1', opacity: 0 },
        ],
        { duration: 550, easing: 'linear' },
      );
    }, 300);
    later(() => {
      root.dataset['workflowState'] = 'draft';
      animate(
        '.order-draft__items',
        [
          { opacity: 0.7, transform: 'translateY(3px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' },
      );
    }, 850);
    later(() => {
      root.dataset['workflowState'] = 'complete';
    }, 1400);
    later(finish, 1750);
  });

  reduced.addEventListener('change', synchronize);
  mobile.addEventListener('change', synchronize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finish();
  });
  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
          if (entry && !entry.isIntersecting) finish();
        })
      : undefined;
  observer?.observe(root);
  window.addEventListener('pagehide', finish);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) synchronize();
  });
  synchronize();
}
