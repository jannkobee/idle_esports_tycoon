export const PLAYER_IDENTITIES = [
  { name: 'Kai Reyes', handle: 'K1netic' },
  { name: 'Amara Cole', handle: 'Nova' },
  { name: 'Yuna Park', handle: 'Glitch' },
  { name: 'Evan Blake', handle: 'Ember' },
  { name: 'Arjun Shah', handle: 'Cipher' },
  { name: 'Sofia Cruz', handle: 'Valkyrie' },
] as const;

/** Old saves get a stable local portrait without altering their identity or stats. */
export function getPortraitIndex(id: string, index?: number): number {
  if (Number.isInteger(index) && index! >= 0 && index! < PLAYER_IDENTITIES.length) return index!;
  if (id === 'p_starter_1') return 0;
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % PLAYER_IDENTITIES.length;
}
