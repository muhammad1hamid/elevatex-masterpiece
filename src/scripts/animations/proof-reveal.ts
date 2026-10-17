import { initSectionReveal } from './section-reveal';

/** Preserve the approved proof timings through the shared section observer. */
export function initProofReveal() {
  initSectionReveal('[data-proof]', '[data-proof-reveal]');
}
