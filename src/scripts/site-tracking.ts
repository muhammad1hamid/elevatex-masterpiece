import {
  configureAnalytics,
  trackEvent,
  type TrackingEvent,
} from './analytics';

interface Configuration {
  ga4: string;
  clarity: string;
  consentVersion: string;
  enabled: boolean;
  preferencesAvailable?: boolean;
  origin: string;
  path: string;
}
interface ClarityCommand {
  (...args: unknown[]): void;
  q?: IArguments[];
}
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: ClarityCommand;
  }
}

const events = new Set<TrackingEvent>([
  'service_cta_click',
  'portfolio_open',
  'live_project_click',
  'contact_form_start',
  'whatsapp_click',
  'article_cta_click',
  'form_submit_success',
]);
const services = new Set([
  'web-development',
  'ai-automation',
  'ai-chatbots',
  'landing-pages',
]);
const consentKey = 'elevatex.analytics-consent';
let initialized = false;

function clearAnalyticsCookies(): void {
  for (const name of document.cookie
    .split(';')
    .map((v) => v.trim().split('=')[0] ?? '')) {
    if (!/^(_ga(?:_|$)|_clck$|_clsk$)/.test(name)) continue;
    for (const domain of [
      '',
      `; Domain=${location.hostname}`,
      `; Domain=.${location.hostname}`,
    ])
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}${domain}`;
  }
}

/** Full-document Astro navigation. No router, second tag manager or automatic events. */
export function initializeSiteTracking(): void {
  if (initialized) return;
  initialized = true;
  const node = document.getElementById('site-tracking-config');
  let config: Configuration;
  try {
    config = JSON.parse(node?.textContent ?? '') as Configuration;
  } catch {
    return;
  }
  const ui = document.querySelector<HTMLElement>(
    '[data-analytics-preferences]',
  );
  const panel = ui?.querySelector<HTMLElement>('#analytics-choice');
  const manage = ui?.querySelector<HTMLButtonElement>(
    '[data-analytics-manage]',
  );
  const status = ui?.querySelector<HTMLElement>('[data-analytics-status]');
  if (!ui || !panel || !manage || !status) return;
  const privacySignal =
    navigator.doNotTrack === '1' ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true;
  if (!config.enabled || privacySignal || location.origin !== config.origin) {
    if (config.preferencesAvailable) {
      let returnFocus: HTMLElement | undefined;
      const open = (show: boolean) => {
        ui.hidden = !show;
        panel.hidden = !show;
        manage.setAttribute('aria-expanded', String(show));
        if (show) manage.focus();
        else returnFocus?.focus();
      };
      const note = panel.querySelector<HTMLElement>(
        '[data-analytics-disabled]',
      );
      if (note && privacySignal)
        note.textContent =
          'Your browser privacy preference keeps optional analytics off.';
      if (privacySignal)
        status.textContent =
          'Your browser privacy preference keeps optional analytics off.';
      ui.querySelector<HTMLButtonElement>(
        '[data-analytics-accept]',
      )?.setAttribute('disabled', '');
      document
        .querySelectorAll<HTMLAnchorElement>('[data-cookie-preferences]')
        .forEach((link) =>
          link.addEventListener('click', (event) => {
            event.preventDefault();
            returnFocus = link;
            open(true);
          }),
        );
      manage.addEventListener('click', () => open(true));
      ui.querySelector('[data-analytics-close]')?.addEventListener(
        'click',
        () => open(false),
      );
      ui.querySelector('[data-analytics-reject]')?.addEventListener(
        'click',
        () => {
          clearAnalyticsCookies();
          try {
            localStorage.setItem(
              consentKey,
              JSON.stringify({
                choice: 'denied',
                version: config.consentVersion,
                expires: Date.now() + 180 * 86400000,
              }),
            );
            open(false);
          } catch {
            status.textContent =
              'Analytics remain off. Your browser could not save the preference.';
          }
        },
      );
      ui.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') open(false);
      });
    }
    return;
  }
  if (
    !/^G-[A-Z0-9]+$/.test(config.ga4) ||
    !/^[a-z0-9]+$/.test(config.clarity) ||
    !/^\/[a-z0-9/-]*$/.test(config.path)
  )
    return;
  const canonical = config.origin + config.path;
  const pageType =
    config.path === '/' ? 'home' : (config.path.split('/')[1] ?? 'other');
  const pageService = config.path.split('/')[2] ?? '';
  const controller = new AbortController();
  const { signal } = controller;
  let started = false,
    stopped = false,
    pageSent = false,
    formStarted = false;
  const readChoice = (): 'granted' | 'denied' | undefined => {
    try {
      const stored = JSON.parse(localStorage.getItem(consentKey) ?? 'null');
      if (
        stored?.version === config.consentVersion &&
        stored.expires > Date.now() &&
        ['granted', 'denied'].includes(stored.choice)
      )
        return stored.choice;
    } catch {
      /* Storage unavailable or invalid: default off. */
    }
    return undefined;
  };
  let choice = readChoice();

  const cleanUrl = () => {
    try {
      if (document.referrer) {
        const referrer = new URL(document.referrer);
        if (referrer.search || referrer.hash) return false;
      }
      return (
        !location.search &&
        (!location.hash ||
          Boolean(
            document.getElementById(decodeURIComponent(location.hash.slice(1))),
          ))
      );
    } catch {
      return false;
    }
  };
  const allowed = () => choice === 'granted' && !stopped;
  const safeCall = (callback: () => void) => {
    try {
      callback();
    } catch {
      /* Optional. */
    }
  };
  const denied = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  };
  const disableKey = `ga-disable-${config.ga4}`;
  const globals = window as unknown as Record<string, unknown>;
  const stop = () => {
    stopped = true;
    configureAnalytics(undefined);
    globals[disableKey] = true;
    safeCall(() =>
      window.clarity?.('consentv2', {
        ad_Storage: 'denied',
        analytics_Storage: 'denied',
      }),
    );
    safeCall(() => window.clarity?.('stop'));
    safeCall(() => window.gtag?.('consent', 'update', denied));
    for (const id of ['elevatex-ga4', 'elevatex-clarity'])
      document.getElementById(id)?.remove();
    clearAnalyticsCookies();
  };
  const openPanel = (open: boolean) => {
    panel.hidden = !open;
    manage.setAttribute('aria-expanded', String(open));
  };
  const persist = (value: 'granted' | 'denied') => {
    try {
      const record = JSON.stringify({
        choice: value,
        version: config.consentVersion,
        expires: Date.now() + 180 * 86400000,
      });
      localStorage.setItem(consentKey, record);
      return localStorage.getItem(consentKey) === record;
    } catch {
      return false;
    }
  };
  const pageView = () => {
    if (!allowed() || pageSent || !cleanUrl()) return;
    pageSent = true;
    safeCall(() =>
      window.gtag?.('event', 'page_view', {
        page_location: canonical,
        page_referrer: '',
        page_title: pageType,
        page_type: pageType,
        send_to: config.ga4,
      }),
    );
  };
  const inject = (id: string, src: string) => {
    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.src = src;
    script.referrerPolicy = 'no-referrer';
    script.onerror = () => script.remove();
    document.head.append(script);
  };
  const start = () => {
    if (!allowed() || started || !cleanUrl()) return;
    // Do not stack this integration over an unknown existing provider installation.
    if (
      window.gtag ||
      window.clarity ||
      document.querySelector('script[src*="googletagmanager.com/"]')
    )
      return;
    started = true;
    document
      .querySelectorAll('form, input, textarea, select, [contenteditable]')
      .forEach((element) => element.setAttribute('data-clarity-mask', 'true'));
    globals[disableKey] = false;
    window.dataLayer = [];
    window.gtag = function () {
      // Keep the provider's documented bootstrap queue shape.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
    window.gtag('consent', 'default', denied);
    window.gtag('consent', 'update', {
      ...denied,
      analytics_storage: 'granted',
    });
    window.gtag('js', new Date());
    window.gtag('config', config.ga4, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ignore_referrer: true,
      page_location: canonical,
      page_referrer: '',
      page_title: pageType,
    });
    const clarity: ClarityCommand = function () {
      // Keep the provider's documented bootstrap queue shape.
      // eslint-disable-next-line prefer-rest-params
      (clarity.q ??= []).push(arguments);
    };
    window.clarity = clarity;
    clarity('consentv2', {
      ad_Storage: 'denied',
      analytics_Storage: 'granted',
    });
    configureAnalytics((event, context) => {
      if (!allowed() || !events.has(event as TrackingEvent)) return;
      const params: Record<string, string> = {
        page_type: pageType,
        page_location: canonical,
        page_referrer: '',
        send_to: config.ga4,
      };
      if (context.service_slug && services.has(context.service_slug))
        params.service_slug = context.service_slug;
      if (
        context.cta_location &&
        ['header', 'footer', 'article', 'page'].includes(context.cta_location)
      )
        params.cta_location = context.cta_location;
      // Free text, labels, hrefs, phone numbers and form values never cross this boundary.
      safeCall(() => window.gtag?.('event', event, params));
    });
    inject(
      'elevatex-ga4',
      `https://www.googletagmanager.com/gtag/js?id=${config.ga4}`,
    );
    inject('elevatex-clarity', `https://www.clarity.ms/tag/${config.clarity}`);
    pageView();
  };
  ui.hidden = false;
  openPanel(choice === undefined);
  manage.addEventListener(
    'click',
    () => {
      openPanel(true);
      panel.querySelector<HTMLButtonElement>('button')?.focus();
    },
    { signal },
  );
  let returnFocus: HTMLElement | undefined;
  document
    .querySelectorAll<HTMLElement>('[data-cookie-preferences]')
    .forEach((link) => {
      link.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          returnFocus = link;
          openPanel(true);
          panel.querySelector<HTMLButtonElement>('button')?.focus();
        },
        { signal },
      );
    });
  ui.querySelector('[data-analytics-close]')?.addEventListener(
    'click',
    () => {
      openPanel(false);
      (returnFocus ?? manage).focus();
    },
    { signal },
  );
  ui.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') {
        openPanel(false);
        (returnFocus ?? manage).focus();
      }
    },
    { signal },
  );
  ui.querySelector('[data-analytics-accept]')?.addEventListener(
    'click',
    () => {
      choice = 'granted';
      persist(choice);
      start();
      openPanel(false);
      manage.focus();
    },
    { signal },
  );
  const reject = () => {
    choice = 'denied';
    const saved = persist(choice);
    if (started) {
      stop();
      if (saved) {
        location.reload();
        return;
      }
      status.textContent =
        'Tracking stopped for this page. Your browser could not save the preference.';
    } else {
      openPanel(false);
      manage.focus();
    }
  };
  ui.querySelector('[data-analytics-reject]')?.addEventListener(
    'click',
    reject,
    { signal },
  );
  document.addEventListener(
    'click',
    (event) => {
      if (!allowed() || !started || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!link) return;
      let url: URL;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      const context = {
        path: config.path,
        source: 'direct' as const,
        cta_location: link.closest('header')
          ? 'header'
          : link.closest('footer')
            ? 'footer'
            : pageType === 'insights'
              ? 'article'
              : 'page',
        ...(services.has(pageService) ? { service_slug: pageService } : {}),
      };
      let name: TrackingEvent | undefined;
      if (url.hostname === 'wa.me') name = 'whatsapp_click';
      else if (
        url.origin !== location.origin &&
        link.closest(
          '.work-feature, .work-tile, .project-showcase, [data-case-study]',
        )
      )
        name = 'live_project_click';
      else if (
        url.origin === location.origin &&
        /^\/work\/.+/.test(url.pathname)
      )
        name = 'portfolio_open';
      else if (
        url.origin === location.origin &&
        url.pathname === '/contact/' &&
        services.has(pageService)
      )
        name = 'service_cta_click';
      else if (
        url.origin === location.origin &&
        (/^\/services\//.test(url.pathname) || url.pathname === '/contact/') &&
        pageType === 'insights' &&
        Boolean(link.closest('main'))
      )
        name = 'article_cta_click';
      if (name) trackEvent(name, context);
    },
    { signal, capture: true },
  );
  document.addEventListener(
    'focusin',
    (event) => {
      if (
        !allowed() ||
        !started ||
        formStarted ||
        !(event.target instanceof Element) ||
        !event.target.closest('[data-inquiry-form]')
      )
        return;
      formStarted = true;
      trackEvent('contact_form_start', { path: config.path, source: 'direct' });
    },
    { signal },
  );
  window.addEventListener(
    'pageshow',
    (event) => {
      if (event.persisted) {
        // A cached page must not resurrect an expired/withdrawn grant.
        if (readChoice() !== 'granted') {
          stop();
          location.reload();
          return;
        }
        pageSent = false;
        formStarted = false;
        pageView();
      }
    },
    { signal },
  );
  window.addEventListener(
    'hashchange',
    () => {
      if (!cleanUrl() && started) stop();
    },
    { signal },
  );
  window.addEventListener(
    'storage',
    (event) => {
      if (event.key === consentKey) {
        stop();
        location.reload();
      }
    },
    { signal },
  );
  window.addEventListener(
    'pagehide',
    (event) => {
      if (!event.persisted) {
        configureAnalytics(undefined);
        controller.abort();
      }
    },
    { signal },
  );
  // Initial denied/unknown state does not load either vendor, including cookieless pings.
  start();
}
