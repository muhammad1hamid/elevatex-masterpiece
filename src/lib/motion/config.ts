/** Milliseconds; finite effects always return to authored, visible HTML. */
export const motion = {
  duration: {
    micro: 160,
    fast: 280,
    standard: 560,
    editorial: 820,
    cinematic: 1100,
  },
  ease: 'cubic-bezier(.2,.8,.2,1)',
  distance: { text: 20, detail: 10, magnetic: 4 },
  fineQuery: '(hover: hover) and (pointer: fine)',
  desktopQuery: '(min-width: 1024px) and (hover: hover) and (pointer: fine)',
  reducedQuery: '(prefers-reduced-motion: reduce)',
} as const;
