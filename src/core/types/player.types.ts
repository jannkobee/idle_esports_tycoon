export type PlayerRarity = 'bronze' | 'silver' | 'gold' | 'diamond';
export type PlayerRole = 'starter' | 'sub' | 'inactive';
export type EsportsDiscipline = 'fps' | 'moba' | 'br' | 'fighting';

export const DISCIPLINE_INFO = {
  fps: { name: 'FPS', icon: 'Crosshair' },
  moba: { name: 'MOBA', icon: 'Shield' },
  br: { name: 'Battle Royale', icon: 'Flame' },
  fighting: { name: 'Fighting', icon: 'Swords' },
} satisfies Record<EsportsDiscipline, { name: string; icon: string }>;

export interface PlayerStats {
  aim: number;
  macro: number;
  comms: number;
  tiltResistance: number;
}

export interface ProPlayer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  discipline: EsportsDiscipline;
  rarity: PlayerRarity;
  role: PlayerRole;
  level: number;
  stats: PlayerStats;
  salaryPerSec: number;
  isTraining?: boolean;
}
