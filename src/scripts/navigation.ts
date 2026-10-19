/** Native disclosure keeps navigation available when scripts are disabled. */
export function initializeNavigation(): () => void {
  const menu = document.querySelector<HTMLDetailsElement>('[data-mobile-menu]');
  const toggle = menu?.querySelector<HTMLElement>('[data-menu-toggle]');

  if (!menu || !toggle) return () => {};

  const controller = new AbortController();
  const { signal } = controller;
  const desktop = window.matchMedia('(min-width: 64rem)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set<Animation>();
  const settle = () => {
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  };

  const synchronize = () => {
    toggle.setAttribute('aria-expanded', String(menu.open));
    toggle.setAttribute('aria-label', menu.open ? 'Close menu' : 'Open menu');
  };

  const close = (restoreFocus = false) => {
    menu.open = false;
    synchronize();
    if (restoreFocus) toggle.focus();
  };

  menu.addEventListener('toggle', synchronize, { signal });
  menu.addEventListener(
    'click',
    (event: MouseEvent) => {
      if (
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        event.target instanceof Element &&
        event.target.closest('a[href]')
      ) {
        // Close the disclosure before native navigation handles the hash/focus.
        close();
      }
    },
    { signal },
  );
  menu.addEventListener(
    'toggle',
    () => {
      settle();
      if (!menu.open || reduced.matches) return;
      menu.querySelectorAll('nav a').forEach((link, index) => {
        if (typeof link.animate !== 'function') return;
        const animation = link.animate([{ opacity: 0.55 }, { opacity: 1 }], {
          duration: 280,
          delay: index * 35,
        });
        animations.add(animation);
        void animation.finished.then(
          () => animations.delete(animation),
          () => animations.delete(animation),
        );
      });
    },
    { signal },
  );
  reduced.addEventListener('change', settle, { signal });
  menu.addEventListener('focusin', settle, { signal });

  document.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.open) {
        event.preventDefault();
        close(true);
      }
    },
    { signal },
  );

  document.addEventListener(
    'click',
    (event: MouseEvent) => {
      if (
        menu.open &&
        event.target instanceof Node &&
        !menu.contains(event.target)
      ) {
        close();
      }
    },
    { signal },
  );

  desktop.addEventListener(
    'change',
    (event: MediaQueryListEvent) => {
      if (event.matches) close();
    },
    { signal },
  );

  synchronize();
  return () => {
    settle();
    controller.abort();
  };
}
