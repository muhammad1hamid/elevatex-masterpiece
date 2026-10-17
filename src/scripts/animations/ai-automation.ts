import { trackEvent } from '../analytics';

/** Native controls and complete HTML work independently of this enhancement. */
export function initializeAutomationPage(): void {
  const root = document.querySelector<HTMLElement>('[data-ai-automation]');
  if (!root) return;
  const lifecycle = new AbortController();
  const motion = matchMedia(
    '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  );
  const workflow = root.querySelector<HTMLElement>(
    '[data-automation-workflow]',
  );
  const signal = root.querySelector<HTMLElement>('[data-automation-signal]');
  const radios = [
    ...root.querySelectorAll<HTMLInputElement>('.inquiry-step__radio'),
  ];
  const steps = [...root.querySelectorAll<HTMLElement>('[data-inquiry-step]')];
  const context = {
    path: '/services/ai-automation/',
    source: 'other' as const,
  };
  let observer: IntersectionObserver | undefined;
  let nearWorkflow = false;
  let manualSelection = false;
  let frame = 0;
  const seen = new Set<Element>();

  const cancelFrame = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const update = () => {
    frame = 0;
    if (
      !workflow ||
      !motion.matches ||
      !nearWorkflow ||
      manualSelection ||
      document.hidden
    )
      return;
    const box = workflow.getBoundingClientRect();
    const start = innerHeight * 0.72;
    const travel = Math.max(box.height - innerHeight * 0.25, 1);
    const progress = Math.min(1, Math.max(0, (start - box.top) / travel));
    const active = Math.min(
      radios.length - 1,
      Math.floor(progress * radios.length),
    );
    const radio = radios[active];
    if (radio) radio.checked = true;
    steps.forEach((step, index) =>
      step.classList.toggle('is-complete', index < active),
    );
  };
  const schedule = () => {
    if (motion.matches && nearWorkflow && !manualSelection && !frame)
      frame = requestAnimationFrame(update);
  };
  const resetMotion = () => {
    cancelFrame();
    if (!motion.matches) {
      steps.forEach((step) => step.classList.remove('is-complete'));
      signal?.classList.remove('is-entered');
    } else schedule();
  };
  root.addEventListener(
    'change',
    (event) => {
      if (
        event.target instanceof HTMLInputElement &&
        event.target.matches('.inquiry-step__radio')
      ) {
        manualSelection = true;
        cancelFrame();
        steps.forEach((step) => step.classList.remove('is-complete'));
      }
    },
    { signal: lifecycle.signal },
  );
  workflow?.addEventListener(
    'focusin',
    () => {
      manualSelection = true;
      cancelFrame();
    },
    { signal: lifecycle.signal },
  );
  root.addEventListener(
    'click',
    (event) => {
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[data-cta-source]')
          : null;
      if (
        link?.dataset['ctaSource'] === 'ai_automation_hero_cta' &&
        link.getAttribute('href') === '/contact/'
      )
        trackEvent('ai_automation_hero_cta', context);
      if (
        link?.dataset['ctaSource'] === 'ai_automation_final_cta' &&
        link.getAttribute('href') === '/contact/'
      )
        trackEvent('ai_automation_final_cta', context);
    },
    { signal: lifecycle.signal },
  );
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === workflow) {
            nearWorkflow = entry.isIntersecting;
            if (nearWorkflow) schedule();
            else cancelFrame();
          }
          if (
            !entry.isIntersecting ||
            entry.intersectionRatio < 0.15 ||
            seen.has(entry.target)
          )
            continue;
          seen.add(entry.target);
          if (entry.target === signal && motion.matches)
            signal.classList.add('is-entered');
          if (entry.target === workflow)
            trackEvent('ai_automation_workflow_view', context);
          if (entry.target.hasAttribute('data-automation-use-case'))
            trackEvent('ai_automation_use_case', context);
        }
      },
      { threshold: [0, 0.15], rootMargin: '0px' },
    );
    if (signal) observer.observe(signal);
    if (workflow) observer.observe(workflow);
    root
      .querySelectorAll('[data-automation-use-case]')
      .forEach((element) => observer?.observe(element));
  }
  window.addEventListener('scroll', schedule, {
    passive: true,
    signal: lifecycle.signal,
  });
  window.addEventListener('resize', schedule, {
    passive: true,
    signal: lifecycle.signal,
  });
  motion.addEventListener('change', resetMotion, { signal: lifecycle.signal });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) cancelFrame();
      else schedule();
    },
    { signal: lifecycle.signal },
  );
  window.addEventListener('pagehide', cancelFrame, {
    signal: lifecycle.signal,
  });
  document.addEventListener(
    'astro:before-swap',
    () => {
      cancelFrame();
      observer?.disconnect();
      lifecycle.abort();
    },
    { once: true, signal: lifecycle.signal },
  );
}
