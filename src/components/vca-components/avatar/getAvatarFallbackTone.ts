import type { AvatarFallbackTone } from './Avatar';

const FALLBACK_AVATAR_TONES: AvatarFallbackTone[] = ['amber', 'rose', 'green', 'blue', 'taupe'];

export const getAvatarFallbackTone = (seed: string): AvatarFallbackTone => {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return FALLBACK_AVATAR_TONES[Math.abs(hash) % FALLBACK_AVATAR_TONES.length];
};
