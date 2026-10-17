/** Share the entrance version between the first-paint guard and the controller. */
export const heroMotion = {
  sessionKey: 'elevatexIntroSeen:v2',
  bootTimeout: 6500,
  staticQuery: '(max-width: 1023px), (hover: none) and (pointer: coarse)',
} as const;
