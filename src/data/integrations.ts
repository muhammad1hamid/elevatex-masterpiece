import { legalPublished } from './legal';
/** Public owner-supplied IDs. These are not credentials. */
export const integrations = {
  ga4: 'G-D9PL0YNQ33',
  clarity: 'yzqephj94p',
  bing: '92656A7713620AB21B7AE30FA4E79FBC',
  consentVersion: 'analytics-v1',
} as const;

// Owner confirmed GA4 automatic measurement off and corrected Clarity ID.
// Real-provider probe passed on 2026-10-19; explicit whole-body masking is enforced.
export const providerActivationVerified = true;

/** All three gates require explicit operational approval; preview is always off. */
export const trackingReady =
  providerActivationVerified &&
  legalPublished &&
  import.meta.env.DEPLOYMENT_ENV === 'production' &&
  import.meta.env.PUBLIC_TRACKING_ENABLED === 'true' &&
  import.meta.env.PUBLIC_TRACKING_PRIVACY_APPROVED === 'true' &&
  import.meta.env.PUBLIC_TRACKING_PROVIDER_REVIEWED === 'true';
