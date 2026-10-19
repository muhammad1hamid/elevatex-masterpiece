import { gsap } from 'gsap';

type Frame = (milliseconds: number, delta: number) => boolean;
/** Shared, demand-driven GSAP clock. Returning false releases a client. */
export function createMotionClock() {
  const clients = new Set<Frame>();
  let attached = false;
  const tick = (seconds: number, delta: number) => {
    for (const client of clients) {
      if (!client(seconds * 1000, delta)) clients.delete(client);
    }
    if (!clients.size) {
      gsap.ticker.remove(tick);
      attached = false;
    }
  };
  return {
    wake(client: Frame) {
      clients.add(client);
      if (!attached) {
        attached = true;
        gsap.ticker.add(tick);
      }
    },
    remove(client: Frame) {
      clients.delete(client);
    },
    destroy() {
      clients.clear();
      gsap.ticker.remove(tick);
      attached = false;
    },
  };
}
export type MotionClock = ReturnType<typeof createMotionClock>;
