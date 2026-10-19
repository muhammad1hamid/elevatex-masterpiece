import { legalPublished } from './legal';
/** Public owner-supplied IDs. These are not credentials. */
export const integrations = {
  ga4: 'G-D9PL0YNQ33',
  clarity: 'yzeqphj94p',
  bing: '92656A7713620AB21B7AE30FA4E79FBC',
  consentVersion: 'analytics-v1',
} as const;

/** All three gates require explicit operational approval; preview is always off. */
export const trackingReady =
  legalPublished &&
  import.meta.env.DEPLOYMENT_ENV === 'production' &&
  import.meta.env.PUBLIC_TRACKING_ENABLED === 'true' &&
  import.meta.env.PUBLIC_TRACKING_PRIVACY_APPROVED === 'true' &&
  import.meta.env.PUBLIC_TRACKING_PROVIDER_REVIEWED === 'true';
