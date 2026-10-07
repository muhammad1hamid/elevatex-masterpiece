/** Native disclosure keeps navigation available when scripts are disabled. */
export function initializeNavigation(): () => void {
  const menu = document.querySelector<HTMLDetailsElement>('[data-mobile-menu]');
  const toggle = menu?.querySelector<HTMLElement>('[data-menu-toggle]');

  if (!menu || !toggle) return () => {};

  const controller = new AbortController();
  const { signal } = controller;
  const desktop = window.matchMedia('(min-width: 64rem)');

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
  return () => controller.abort();
}
