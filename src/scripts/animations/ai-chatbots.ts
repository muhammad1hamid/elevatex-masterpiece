import { trackEvent } from '../analytics';

export function initializeChatbots(): void {
  const root = document.querySelector<HTMLElement>('[data-ai-chatbots]');
  if (!root) return;
  const lifecycle = new AbortController();
  const media = matchMedia(
    '(min-width:1024px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)',
  );
  const hero = root.querySelector<HTMLElement>('[data-chat-preview]');
  const conversation = root.querySelector<HTMLElement>('[data-conversation]');
  const messages = [
    ...root.querySelectorAll<HTMLElement>('[data-conversation-message]'),
  ];
  const radios = [
    ...root.querySelectorAll<HTMLInputElement>('.conversation__radio'),
  ];
  const context = { path: '/services/ai-chatbots/', source: 'other' as const };
  let frame = 0,
    near = false,
    manual = false;
  const seen = new Set<Element>();
  const cancel = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const update = () => {
    frame = 0;
    if (!media.matches || !near || manual || document.hidden || !conversation)
      return;
    const anchor = innerHeight * 0.55;
    let index = 0;
    messages.forEach((message, i) => {
      if (message.getBoundingClientRect().top <= anchor) index = i;
    });
    const radio = radios[index];
    if (radio) radio.checked = true;
    conversation.classList.add('is-progressing');
    messages.forEach((message, i) =>
      message.classList.toggle('is-current', i === index),
    );
  };
  const schedule = () => {
    if (media.matches && near && !manual && !frame)
      frame = requestAnimationFrame(update);
  };
  const takeControl = () => {
    manual = true;
    cancel();
    conversation?.classList.remove('is-progressing');
    messages.forEach((m) => m.classList.remove('is-current'));
  };
  conversation?.addEventListener('focusin', takeControl, {
    signal: lifecycle.signal,
  });
  conversation?.addEventListener('change', takeControl, {
    signal: lifecycle.signal,
  });
  const reset = () => {
    cancel();
    if (!media.matches) {
      hero?.classList.remove('is-entered');
      conversation?.classList.remove('is-progressing');
      messages.forEach((m) => m.classList.remove('is-current'));
      const last = radios.at(-1);
      if (!manual && last) last.checked = true;
    } else schedule();
  };
  const observer =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.target === conversation) {
                near = entry.isIntersecting;
                if (near) schedule();
                else cancel();
              }
              if (
                !entry.isIntersecting ||
                entry.intersectionRatio < 0.15 ||
                seen.has(entry.target)
              )
                continue;
              seen.add(entry.target);
              if (entry.target === hero && media.matches)
                hero.classList.add('is-entered');
              if (entry.target === conversation)
                trackEvent('ai_chatbot_conversation_view', context);
              if (entry.target.id === 'chatbot-whatsapp')
                trackEvent('ai_chatbot_whatsapp_section', context);
            }
          },
          { threshold: [0, 0.15] },
        )
      : undefined;
  [hero, conversation, root.querySelector('#chatbot-whatsapp')].forEach(
    (el) => {
      if (el) observer?.observe(el);
    },
  );
  root.addEventListener(
    'click',
    (event) => {
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[data-cta-source]')
          : null;
      if (link?.getAttribute('href') !== '/contact/') return;
      if (link.dataset['ctaSource'] === 'ai_chatbot_hero_cta')
        trackEvent('ai_chatbot_hero_cta', context);
      if (link.dataset['ctaSource'] === 'ai_chatbot_final_cta')
        trackEvent('ai_chatbot_final_cta', context);
    },
    { signal: lifecycle.signal },
  );
  window.addEventListener('scroll', schedule, {
    passive: true,
    signal: lifecycle.signal,
  });
  window.addEventListener('resize', schedule, {
    passive: true,
    signal: lifecycle.signal,
  });
  media.addEventListener('change', reset, { signal: lifecycle.signal });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) cancel();
      else schedule();
    },
    { signal: lifecycle.signal },
  );
  window.addEventListener('pagehide', cancel, { signal: lifecycle.signal });
  document.addEventListener(
    'astro:before-swap',
    () => {
      cancel();
      observer?.disconnect();
      lifecycle.abort();
    },
    { once: true, signal: lifecycle.signal },
  );
}
