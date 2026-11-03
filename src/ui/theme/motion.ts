import { tokens, type ThemeTokens } from '@/ui/theme/tokens';

export type MotionDuration = keyof ThemeTokens['motion']['duration'];

export function motionDuration(theme: ThemeTokens, key: MotionDuration): number {
  return theme.motion.duration[key];
}

export const defaultMotion = tokens.motion;
