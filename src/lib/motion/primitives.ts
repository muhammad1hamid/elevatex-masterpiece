import { motion } from './config';
export type RevealPreset =
  | 'editorial-up'
  | 'cinematic-left'
  | 'cinematic-right'
  | 'soft-unveil'
  | 'subtle-zoom'
  | 'text'
  | 'line';
export function revealFrames(preset: RevealPreset, quiet = false): Keyframe[] {
  if (quiet) return [{ opacity: 0.75 }, { opacity: 1 }];
  switch (preset) {
    case 'text':
      return [
        {
          opacity: 0.35,
          transform: 'translateY(20px)',
          clipPath: 'inset(0 0 12% 0)',
        },
        { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(0)' },
      ];
    case 'line':
      return [
        { transform: 'scaleX(0)', transformOrigin: 'left' },
        { transform: 'scaleX(1)', transformOrigin: 'left' },
      ];
    case 'editorial-up':
      return [
        { clipPath: 'inset(14% 0 0 0)', opacity: 0.65 },
        { clipPath: 'inset(0)', opacity: 1 },
      ];
    case 'cinematic-left':
      return [
        { clipPath: 'inset(0 16% 0 0)', opacity: 0.65 },
        { clipPath: 'inset(0)', opacity: 1 },
      ];
    case 'cinematic-right':
      return [
        { clipPath: 'inset(0 0 0 16%)', opacity: 0.65 },
        { clipPath: 'inset(0)', opacity: 1 },
      ];
    case 'subtle-zoom':
      return [
        { scale: '1.025', opacity: 0.65 },
        { scale: '1', opacity: 1 },
      ];
    default:
      return [{ opacity: 0.5 }, { opacity: 1 }];
  }
}
export const revealDuration = (preset: RevealPreset, quiet: boolean) =>
  quiet
    ? motion.duration.standard
    : preset === 'text'
      ? motion.duration.editorial
      : motion.duration.cinematic;
