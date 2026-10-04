export type PlayerRarity = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'goat';
export type PlayerRole = 'starter' | 'sub' | 'inactive';
export type EsportsDiscipline = 'fps' | 'moba' | 'br' | 'fighting';
export type PlayerPersonality = 'grinder' | 'showman' | 'tactician' | 'socialite' | 'night_owl' | 'scaling';
export type PlayerPosition = 'awper' | 'rifler' | 'igl' | 'top' | 'jungler' | 'mid' | 'bottom' | 'support' | 'fragger' | 'anchor' | 'fighter';
export interface CardAttributes {
  mechanics: number;
  gameSense: number;
  teamwork: number;
  clutch: number;
  adaptability: number;
  stamina: number;
}

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

export const RARITY_CAPS: Record<PlayerRarity, number> = {
  bronze: 70,
  silver: 80,
  gold: 90,
  platinum: 94,
  diamond: 98,
  goat: 99,
};

export interface ProPlayer {
  id: string;
  name: string;
  handle: string;
  portraitIndex: number;
  discipline: EsportsDiscipline;
  rarity: PlayerRarity;
  role: PlayerRole;
  level: number;
  stats: PlayerStats;
  salaryPerSec: number;
  age?: number;
  potential?: number;
  position?: PlayerPosition;
  cardAttributes?: CardAttributes;
  isTraining?: boolean;
  trainingProgress?: Partial<PlayerStats>;
  // Player status dynamics
  fans?: number;
  isClutch?: boolean;
  contractMatchesRemaining?: number;
  sleepQuality?: number; // 0 - 100
  mood?: number; // 0 - 100
  energy?: number; // 0 - 100
  /** Optional so existing v1 saves hydrate without migration. */
  personality?: PlayerPersonality;
  inspiredUntil?: number;
  /** Staff-designed plan; the player may choose another available activity. */
  dailySchedule?: ('scrim' | 'vod' | 'gym' | 'outdoor' | 'rest')[];
  sportsPreference?: 'basketball' | 'football' | 'none';
}

export interface Coach {
  id: string;
  name: string;
  title: string;
  discipline: EsportsDiscipline | 'wellness';
  specialty: string;
  buffText: string;
  hired: boolean;
  hireCost: number;
  salaryPerSec: number;
  minProsRequired: number;
  minFacilityLevel: number;
  facilityId: string;
}

export const INITIAL_COACHES: Coach[] = [
  {
    id: 'coach_fps_viper',
    name: 'Marcus "Viper" Vance',
    title: 'FPS Head Coach',
    discipline: 'fps',
    specialty: 'Aim Mechanics & Crosshair Placement',
    buffText: '+25% FPS Aim training & +15% FPS tournament power',
    hired: false,
    hireCost: 2500,
    salaryPerSec: 2,
    minProsRequired: 2,
    minFacilityLevel: 2,
    facilityId: 'scrim_lab',
  },
  {
    id: 'coach_moba_mind',
    name: 'Xiao "Mind" Chen',
    title: 'MOBA Strategy Director',
    discipline: 'moba',
    specialty: 'Macro Waves & Objective Control',
    buffText: '+30% Macro growth & +20% MOBA tournament power',
    hired: false,
    hireCost: 4000,
    salaryPerSec: 3,
    minProsRequired: 2,
    minFacilityLevel: 1,
    facilityId: 'analyst_room',
  },
  {
    id: 'coach_wellness_zenith',
    name: 'Dr. Elena "Zenith" Rostova',
    title: 'Sleep & Performance Psychologist',
    discipline: 'wellness',
    specialty: 'Circadian Sleep Cycles & Tilt Control',
    buffText: '+40% Sleep quality recovery & team immune to tilt burnout',
    hired: false,
    hireCost: 6000,
    salaryPerSec: 4,
    minProsRequired: 1,
    minFacilityLevel: 1,
    facilityId: 'gym',
  },
  {
    id: 'coach_br_blitz',
    name: 'Tyler "Blitz" Hayes',
    title: 'Battle Royale Aggression Coach',
    discipline: 'br',
    specialty: 'Late Game Rotations & Clutch Instincts',
    buffText: '+25% Comms growth & doubles team clutch play trigger chance',
    hired: false,
    hireCost: 8500,
    salaryPerSec: 5,
    minProsRequired: 2,
    minFacilityLevel: 2,
    facilityId: 'scrim_lab',
  },
];
