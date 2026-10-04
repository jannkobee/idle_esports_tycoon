import type { ProPlayer } from '../types/player.types';

export type PlayerPersonality = 'grinder' | 'showman' | 'tactician' | 'socialite' | 'night_owl' | 'scaling';
export type ScheduleBlock = 'scrim' | 'vod' | 'gym' | 'outdoor' | 'rest';
export type FleetTier = 1 | 2 | 3;
export type DistrictTier = 1 | 2 | 3;
export type FacilityTier = 1 | 2 | 3;
export type SeasonStage = 'spring' | 'msi' | 'summer' | 'worlds';
export type ExecutiveRole = 'ceo' | 'gm' | 'ops' | 'cmo';
export type VipItemId = 'rgb_neon' | 'luxury_arcade' | 'hypercar_wrap' | 'gold_pedestal';

export interface OrgBranding {
  name: string;
  crestId: number;
  primaryColor: string;
  accentColor: string;
}

export interface ExecutiveStaff {
  role: ExecutiveRole;
  name: string;
  title: string;
  cost: number;
  hired: boolean;
  perk: string;
}

export interface SeasonCalendar {
  year: number;
  stage: SeasonStage;
  stageWins: Record<SeasonStage, number>;
  trophies: number;
}

export const PERSONALITY_DETAILS: Record<PlayerPersonality, { label: string; perk: string }> = {
  grinder: { label: 'The Grinder', perk: '+25% training speed; needs regular rest.' },
  showman: { label: 'The Showman', perk: '+50% stream hype and fan energy.' },
  tactician: { label: 'Ice-Cold Tactician', perk: '+35% VOD macro; tilt-proof.' },
  socialite: { label: 'Social Butterfly', perk: 'Raises team morale during breaks.' },
  night_owl: { label: 'Night Owl', perk: 'Excels in late-day free time.' },
  scaling: { label: 'Scaling Prodigy', perk: 'Develops faster while young; unusually high potential.' },
};

export const SCHEDULE_LABELS: Record<ScheduleBlock, string> = {
  scrim: 'Scrim Block', vod: 'Tactical VOD Review', gym: 'Gym Fitness', outdoor: 'Outdoor Treat / Walk', rest: 'Rest & Recovery',
};

export const CRESTS = ['Falcon', 'Crown', 'Wolf', 'Nova', 'Dragon', 'Bolt', 'Titan', 'Orbit', 'Viper', 'Phoenix', 'Shield', 'Comet'];

export const INITIAL_BRANDING: OrgBranding = {
  name: 'Dynasty Esports', crestId: 0, primaryColor: '#06b6d4', accentColor: '#f43f5e',
};

export const INITIAL_EXECUTIVES: ExecutiveStaff[] = [
  { role: 'ceo', name: 'Maya Chen', title: 'Chief Executive Officer', cost: 15000, hired: false, perk: '+20% sponsor payouts and seed capital.' },
  { role: 'gm', name: 'Jordan Reyes', title: 'General Manager', cost: 10000, hired: false, perk: '-20% scouting and renewal costs.' },
  { role: 'ops', name: 'Avery Brooks', title: 'Operations Coordinator', cost: 8500, hired: false, perk: 'Automates routines and protects from burnout.' },
  { role: 'cmo', name: 'Samira Patel', title: 'Chief Marketing Officer', cost: 12000, hired: false, perk: '+30% merch and fan conversion.' },
];

export const INITIAL_SEASON: SeasonCalendar = { year: 1, stage: 'spring', stageWins: { spring: 0, msi: 0, summer: 0, worlds: 0 }, trophies: 0 };

export const VIP_ITEMS: { id: VipItemId; name: string; cost: number; description: string }[] = [
  { id: 'rgb_neon', name: 'RGB Dynasty Neon', cost: 40, description: 'A custom neon crest for the scrim floor.' },
  { id: 'luxury_arcade', name: 'Luxury Arcade Cabinet', cost: 65, description: 'Mood-boosting premium lounge cabinet.' },
  { id: 'hypercar_wrap', name: 'Hypercar Wrap', cost: 90, description: 'A signature wrap for the team fleet.' },
  { id: 'gold_pedestal', name: 'Gold Trophy Pedestal', cost: 120, description: 'A gilded display for championship hardware.' },
];

export function getPersonality(player: ProPlayer): PlayerPersonality {
  return player.personality ?? 'grinder';
}

export function districtBonuses(tier: DistrictTier) {
  return { incomeMultiplier: 1 + (tier - 1) * 0.12, sponsorMultiplier: 1 + (tier - 1) * 0.15, moodRecovery: 4 + tier * 3, fanDensity: tier };
}

export function scheduleActivity(block: ScheduleBlock): 'practice' | 'review' | 'exercise' | 'break' {
  if (block === 'scrim') return 'practice';
  if (block === 'vod') return 'review';
  if (block === 'gym') return 'exercise';
  return 'break';
}

export function scheduleSynergy(players: ProPlayer[], block: ScheduleBlock): number {
  const active = players.filter(p => p.role !== 'inactive');
  return active.length >= 2 && block !== 'rest' ? Math.min(0.3, active.length * 0.05) : 0;
}

export function personalityMultiplier(personality: PlayerPersonality, block: ScheduleBlock): number {
  if (personality === 'grinder' && block === 'scrim') return 1.25;
  if (personality === 'showman' && block === 'outdoor') return 1.15;
  if (personality === 'tactician' && block === 'vod') return 1.35;
  if (personality === 'night_owl' && block === 'rest') return 1.12;
  return 1;
}

export function nextSeasonStage(stage: SeasonStage): SeasonStage {
  const stages: Record<SeasonStage, SeasonStage> = { spring: 'msi', msi: 'summer', summer: 'worlds', worlds: 'spring' };
  return stages[stage];
}

export function facilityTierName(tier: FacilityTier): string {
  return ['Suburban Gaming Villa', 'Regional Training Facility', 'Dynasty Tower'][tier - 1];
}
