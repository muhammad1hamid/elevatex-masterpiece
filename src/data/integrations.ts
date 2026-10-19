import { legalPublished } from './legal';
/** Public owner-supplied IDs. These are not credentials. */
export const integrations = {
  ga4: 'G-E1LMDQD9WE',
  clarity: 'yzqephj94p',
  bing: '92656A7713620AB21B7AE30FA4E79FBC',
  consentVersion: 'analytics-v2',
} as const;

// Owner supplied the replacement GA4 stream and explicitly requested Enhanced
// Measurement on. Corrected Clarity ID and whole-body masking are retained.
export const providerActivationVerified = true;

/** All three gates require explicit operational approval; preview is always off. */
export const trackingReady =
  providerActivationVerified &&
  legalPublished &&
  import.meta.env.DEPLOYMENT_ENV === 'production' &&
  import.meta.env.PUBLIC_TRACKING_ENABLED === 'true' &&
  import.meta.env.PUBLIC_TRACKING_PRIVACY_APPROVED === 'true' &&
  import.meta.env.PUBLIC_TRACKING_PROVIDER_REVIEWED === 'true';
