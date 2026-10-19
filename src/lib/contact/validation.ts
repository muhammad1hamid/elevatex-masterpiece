import {
  inquiryServices,
  inquiryBudgets,
  inquiryTimelines,
} from '../../data/contact';

export const inquiryFields = [
  'name',
  'email',
  'service',
  'budget',
  'phone',
  'timeline',
  'website',
  'description',
] as const;
export type InquiryField = (typeof inquiryFields)[number];
export type InquiryValues = Record<InquiryField, string>;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

/** Shared browser/server rules. Only these fields enter the notification email. */
export function validateInquiry(input: Record<string, unknown>): {
  values: InquiryValues;
  errors: InquiryErrors;
} {
  const values = Object.fromEntries(
    inquiryFields.map((key) => [
      key,
      typeof input[key] === 'string' ? input[key].trim() : '',
    ]),
  ) as InquiryValues;
  const errors: InquiryErrors = {};
  if (values.name.length < 2 || values.name.length > 100)
    errors.name = 'Use between 2 and 100 characters for your name.';
  if (
    values.email.length > 254 ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(values.email)
  )
    errors.email = 'Enter a valid email address, such as you@company.com.';
  if (!inquiryServices.some(({ value }) => value === values.service))
    errors.service = 'Please select a service.';
  if (
    values.budget &&
    !inquiryBudgets.some(({ value }) => value === values.budget)
  )
    errors.budget = 'Choose one of the budget preferences.';
  if (
    values.timeline &&
    !inquiryTimelines.some(({ value }) => value === values.timeline)
  )
    errors.timeline = 'Choose one of the timeline preferences.';
  if (values.phone.length > 40)
    errors.phone = 'Keep your phone number under 40 characters.';
  if (values.website) {
    try {
      const url = new URL(values.website);
      if (
        values.website.length > 2048 ||
        !['http:', 'https:'].includes(url.protocol) ||
        !url.hostname ||
        url.username ||
        url.password
      )
        throw new Error('Invalid URL');
    } catch {
      errors.website =
        'Use a full website address starting with http:// or https://.';
    }
  }
  if (values.description.length < 10 || values.description.length > 4000)
    errors.description =
      'Use between 10 and 4,000 characters for your project description.';
  for (const key of inquiryFields) {
    if (input[key] !== undefined && typeof input[key] !== 'string')
      errors[key] = 'Enter a text value for this field.';
    const text =
      key === 'description'
        ? values[key].replace(/[\n\r\t]/g, '')
        : values[key];
    if (/\p{Cc}/u.test(text))
      errors[key] = 'Remove unsupported control characters.';
  }
  return { values, errors };
}
