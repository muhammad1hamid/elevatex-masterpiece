import {
  inquiryFields,
  validateInquiry,
  type InquiryErrors,
} from '../lib/contact/validation';
import { serviceSlugs } from '../data/site';
import { trackEvent } from './analytics';

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(id: string): void;
  remove(id: string): void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** The browser never receives provider secrets or the receiving inbox address. */
export function initializeInquiryDelivery(form: HTMLFormElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const fields = inquiryFields.map(
    (key) => form.elements.namedItem(key) as Field,
  );
  const button = form.querySelector<HTMLButtonElement>(
    '[data-inquiry-review]',
  )!;
  const status = form.querySelector<HTMLElement>('[data-inquiry-status]')!;
  const count = form.querySelector<HTMLElement>('[data-inquiry-count]')!;
  const widget = form.querySelector<HTMLElement>('[data-inquiry-turnstile]')!;
  let ready = false,
    pending = false,
    stopped = false,
    token = '',
    widgetId: string | undefined,
    sdk: Promise<void> | undefined;
  let submissionId = crypto.randomUUID();
  const touched = new Set<string>();
  const values = () =>
    Object.fromEntries(fields.map((field) => [field.name, field.value]));
  const syncButton = () => {
    button.disabled = !ready || !token || pending;
  };
  const updateCount = () => {
    const description = form.elements.namedItem(
      'description',
    ) as HTMLTextAreaElement;
    count.textContent = `${description.value.length.toLocaleString('en-US')} / 4,000`;
  };
  const showErrors = (errors: InquiryErrors) => {
    for (const field of fields) {
      const message = errors[field.name as keyof InquiryErrors] ?? '';
      const output = document.getElementById(`${field.id}-error`)!;
      output.textContent = message;
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }
  };
  const preselected = new URLSearchParams(location.search).get('service');
  const service = form.elements.namedItem('service') as HTMLSelectElement;
  if (preselected && serviceSlugs.some((slug) => slug === preselected))
    service.value = preselected;
  const resetWidget = () => {
    token = '';
    if (widgetId !== undefined) window.turnstile?.reset(widgetId);
    syncButton();
  };
  const loadWidget = async () => {
    if (!ready || stopped || widgetId !== undefined) return;
    sdk ??= new Promise<void>((resolve, reject) => {
      if (window.turnstile) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.referrerPolicy = 'no-referrer';
      const timeout = window.setTimeout(() => {
        script.remove();
        reject(new Error('Security check unavailable'));
      }, 15000);
      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        reject(new Error('Security check unavailable'));
      };
      document.head.append(script);
    });
    try {
      await sdk;
      if (stopped || widgetId !== undefined || !window.turnstile) return;
      widgetId = window.turnstile.render(widget, {
        sitekey: widget.dataset['sitekey'],
        theme: 'dark',
        size: 'flexible',
        action: 'contact_inquiry',
        callback: (next: string) => {
          if (!stopped) {
            token = next;
            syncButton();
          }
        },
        'expired-callback': () => {
          if (!stopped) resetWidget();
        },
        'error-callback': () => {
          token = '';
          syncButton();
          status.textContent =
            'The security check could not load. Please reload this page or contact us on WhatsApp.';
        },
      });
    } catch {
      sdk = undefined;
      if (!stopped)
        status.textContent =
          'The security check could not load. Please reload this page or contact us on WhatsApp.';
    }
  };
  form.noValidate = true;
  form.addEventListener(
    'focusin',
    () => {
      void loadWidget();
    },
    { signal },
  );
  for (const field of fields) {
    field.addEventListener(
      'blur',
      () => {
        touched.add(field.name);
        const { errors } = validateInquiry(values());
        showErrors(
          Object.fromEntries(
            Object.entries(errors).filter(([key]) => touched.has(key)),
          ),
        );
      },
      { signal },
    );
    field.addEventListener(
      'input',
      () => {
        if (pending) return;
        if (form.dataset['inquiryState'] === 'sent') {
          form.dataset['inquiryState'] = 'idle';
          status.textContent = '';
        }
        if (touched.has(field.name)) {
          const { errors } = validateInquiry(values());
          showErrors(
            Object.fromEntries(
              Object.entries(errors).filter(([key]) => touched.has(key)),
            ),
          );
        }
        updateCount();
      },
      { signal },
    );
  }
  form.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();
      if (pending || !ready || stopped) return;
      const checked = validateInquiry(values());
      fields.forEach((field) => touched.add(field.name));
      showErrors(checked.errors);
      if (Object.keys(checked.errors).length) {
        form.dataset['inquiryState'] = 'invalid';
        status.textContent =
          'Please check the highlighted fields. Your details are still here.';
        fields
          .find((field) => checked.errors[field.name as keyof InquiryErrors])
          ?.focus();
        return;
      }
      if (!token) {
        status.textContent = 'Complete the security check before sending.';
        void loadWidget();
        return;
      }
      pending = true;
      syncButton();
      form.dataset['inquiryState'] = 'sending';
      form.setAttribute('aria-busy', 'true');
      status.textContent = 'Sending your inquiry…';
      fields.forEach((field) => {
        field.disabled = true;
      });
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          credentials: 'same-origin',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            ...checked.values,
            company: (form.elements.namedItem('company') as HTMLInputElement)
              .value,
            submissionId,
            turnstileToken: token,
          }),
          signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]),
        });
        const result = (await response.json()) as {
          ok?: boolean;
          message?: string;
          errors?: InquiryErrors;
        };
        if (stopped) return;
        if (!response.ok || result.ok !== true) {
          form.dataset['inquiryState'] = 'invalid';
          status.textContent =
            result.message ??
            'Your inquiry could not be sent. Please try again or use WhatsApp.';
          if (result.errors) showErrors(result.errors);
          return;
        }
        form.dataset['inquiryState'] = 'sent';
        status.textContent =
          'Your inquiry was accepted for email delivery. Thank you — we’ll reply by email.';
        form.reset();
        touched.clear();
        showErrors({});
        updateCount();
        submissionId = crypto.randomUUID();
        trackEvent('form_submit_success', {
          path: '/contact/',
          source: 'direct',
        });
      } catch {
        if (!stopped) {
          form.dataset['inquiryState'] = 'invalid';
          status.textContent =
            'Delivery could not be confirmed. Your details are still here. Retry this inquiry or contact us on WhatsApp.';
        }
      } finally {
        pending = false;
        if (!stopped) {
          fields.forEach((field) => {
            field.disabled = false;
          });
          form.removeAttribute('aria-busy');
          resetWidget();
        }
      }
    },
    { signal },
  );
  void (async () => {
    try {
      const response = await fetch('/api/contact', {
        cache: 'no-store',
        signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]),
      });
      const result = (await response.json()) as { ready?: boolean };
      if (stopped) return;
      ready = response.ok && result.ready === true;
      if (ready) {
        button.type = 'submit';
        syncButton();
        if (form.contains(document.activeElement)) void loadWidget();
      } else
        status.textContent =
          'Inquiry sending is temporarily unavailable. Please contact us on WhatsApp.';
    } catch {
      if (!stopped)
        status.textContent =
          'Inquiry sending is temporarily unavailable. Please contact us on WhatsApp.';
    }
  })();
  updateCount();
  const cleanup = () => {
    stopped = true;
    controller.abort();
    button.disabled = true;
    if (widgetId !== undefined) window.turnstile?.remove(widgetId);
  };
  document.addEventListener('astro:before-swap', cleanup, {
    once: true,
    signal,
  });
  return cleanup;
}
