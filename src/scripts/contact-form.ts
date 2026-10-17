import {
  inquiryServices,
  inquiryBudgets,
  inquiryTimelines,
} from '../data/contact';
import { serviceSlugs } from '../data/site';

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const instances = new WeakMap<HTMLFormElement, () => void>();

/** Local review only: no fetch, storage, logging, analytics or delivery state. */
export function initializeInquiryForm(): () => void {
  const form = document.querySelector<HTMLFormElement>('[data-inquiry-form]');
  if (!form) return () => {};
  const previous = instances.get(form);
  if (previous) return previous;
  const controller = new AbortController(),
    { signal } = controller;
  const fields = [...form.querySelectorAll<Field>('input, select, textarea')];
  const button = form.querySelector<HTMLButtonElement>(
    '[data-inquiry-review]',
  )!;
  const status = form.querySelector<HTMLElement>('[data-inquiry-status]')!;
  const description = form.querySelector<HTMLTextAreaElement>(
    '#inquiry-description',
  )!;
  const count = form.querySelector<HTMLElement>('[data-inquiry-count]')!;
  const touched = new WeakSet<Field>();
  const query = new URLSearchParams(location.search).get('service');
  const service = form.querySelector<HTMLSelectElement>('#inquiry-service')!;
  if (query && serviceSlugs.some((slug) => slug === query) && !service.value)
    service.value = query;

  const errorFor = (field: Field): string => {
    const value = field.value.trim();
    switch (field.name) {
      case 'name':
        if (!value) return 'Please enter your name.';
        if (value.length < 2 || value.length > 100)
          return 'Use between 2 and 100 characters for your name.';
        return '';
      case 'email':
        if (!value) return 'Please enter your email address.';
        if (field.validity.typeMismatch || value.length > 254)
          return 'Enter a valid email address, such as you@company.com.';
        return '';
      case 'service':
        return inquiryServices.some((option) => option.value === value)
          ? ''
          : 'Please select a service.';
      case 'budget':
        return !value || inquiryBudgets.some((option) => option.value === value)
          ? ''
          : 'Choose one of the budget preferences.';
      case 'timeline':
        return !value ||
          inquiryTimelines.some((option) => option.value === value)
          ? ''
          : 'Choose one of the timeline preferences.';
      case 'phone':
        return value.length > 40
          ? 'Keep your phone number under 40 characters.'
          : '';
      case 'website':
        if (!value) return '';
        try {
          const url = new URL(value);
          if (
            value.length <= 2048 &&
            ['http:', 'https:'].includes(url.protocol) &&
            url.hostname &&
            !url.username &&
            !url.password
          )
            return '';
        } catch {
          /* A helpful field message is shown below. */
        }
        return 'Use a full website address starting with http:// or https://.';
      case 'description':
        if (!value) return 'Tell us a little about your project.';
        if (value.length < 10)
          return 'Add a little more detail — at least 10 characters.';
        if (value.length > 4000)
          return 'Keep your project description under 4,000 characters.';
        return '';
      default:
        return '';
    }
  };
  const validate = (field: Field) => {
    const message = errorFor(field);
    const output = document.getElementById(`${field.id}-error`)!;
    output.textContent = message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    return !message;
  };
  const updateCount = () => {
    count.textContent = `${description.value.length.toLocaleString('en-US')} / 4,000`;
  };
  const resetReview = () => {
    if (form.dataset['inquiryState'] === 'reviewed') {
      form.dataset['inquiryState'] = 'idle';
      status.textContent = '';
    }
  };
  for (const field of fields) {
    field.addEventListener(
      'blur',
      () => {
        if (field.value || touched.has(field)) {
          touched.add(field);
          validate(field);
        }
      },
      { signal },
    );
    field.addEventListener(
      'input',
      () => {
        resetReview();
        if (touched.has(field)) validate(field);
        if (field === description) updateCount();
      },
      { signal },
    );
    field.addEventListener(
      'change',
      () => {
        resetReview();
        if (touched.has(field)) validate(field);
      },
      { signal },
    );
  }
  // Native Enter cannot implicitly submit this multi-field form without a submit
  // button. Also cancel programmatic submissions when enhancement is available.
  form.addEventListener('submit', (event) => event.preventDefault(), {
    signal,
  });
  button.addEventListener(
    'click',
    () => {
      form.dataset['inquiryState'] = 'validating';
      let firstInvalid: Field | undefined,
        invalidCount = 0;
      for (const field of fields) {
        field.value = field.value.trim();
        touched.add(field);
        if (!validate(field)) {
          firstInvalid ??= field;
          invalidCount++;
        }
      }
      updateCount();
      if (firstInvalid) {
        form.dataset['inquiryState'] = 'invalid';
        status.textContent = `Please check ${invalidCount === 1 ? 'the highlighted field' : `the ${invalidCount} highlighted fields`}. Your details are still here.`;
        firstInvalid.focus();
        return;
      }
      form.dataset['inquiryState'] = 'reviewed';
      status.textContent =
        'Your details look ready. Nothing has been sent. Inquiry sending will be available soon.';
    },
    { signal },
  );
  button.disabled = false;
  updateCount();
  const destroy = () => {
    controller.abort();
    button.disabled = true;
    instances.delete(form);
  };
  document.addEventListener('astro:before-swap', destroy, {
    signal,
    once: true,
  });
  instances.set(form, destroy);
  return destroy;
}
document.addEventListener('astro:page-load', initializeInquiryForm);
