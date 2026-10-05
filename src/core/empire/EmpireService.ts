import type { ProPlayer } from '../types/player.types';

export type PlayerPersonality = 'grinder' | 'showman' | 'tactician' | 'socialite' | 'night_owl' | 'scaling';
export type ScheduleBlock = 'scrim' | 'vod' | 'gym' | 'outdoor' | 'rest';
export type FleetTier = 1 | 2 | 3;
export type DistrictTier = 1 | 2 | 3;
export type FacilityTier = 1 | 2 | 3;
export type SportsTier = 1 | 2 | 3;
export type SeasonStage = 'spring' | 'msi' | 'summer' | 'worlds';
export type ExecutiveRole = 'ceo' | 'gm' | 'ops' | 'cmo';
export type VipItemId = 'rgb_neon' | 'luxury_arcade' | 'hypercar_wrap' | 'gold_pedestal' | 'wall_cyberpunk' | 'wall_carbon' | 'wall_minimalist' | 'floor_oak' | 'floor_marble' | 'floor_neon' | 'facade_sandstone' | 'facade_glass' | 'facade_carbon';

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

/** Immutable record created after each World Championship, for the season archive. */
export interface SeasonHistoryEntry {
  year: number;
  stageWins: Record<SeasonStage, number>;
  worldChampion: boolean;
  finalRank: number;
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

export const VIP_ITEMS: { id: VipItemId; name: string; cost: number; description: string; category: 'Wallpaper' | 'Flooring' | 'Facade' | 'Objects' }[] = [
  { id: 'wall_cyberpunk', name: 'Cyberpunk Walls', cost: 30, description: 'Neon cyan and deep indigo.', category: 'Wallpaper' },
  { id: 'wall_carbon', name: 'Carbon Walls', cost: 35, description: 'Graphite and cobalt trim.', category: 'Wallpaper' },
  { id: 'wall_minimalist', name: 'Scandinavian Walls', cost: 25, description: 'Warm cream and honey.', category: 'Wallpaper' },
  { id: 'floor_oak', name: 'Oak Hallways', cost: 25, description: 'Warm timber throughout the halls.', category: 'Flooring' },
  { id: 'floor_marble', name: 'Marble Hallways', cost: 45, description: 'Bright white stone.', category: 'Flooring' },
  { id: 'floor_neon', name: 'Neon Hallways', cost: 50, description: 'Electric blue floor finish.', category: 'Flooring' },
  { id: 'facade_sandstone', name: 'Sandstone House', cost: 40, description: 'Sunlit California exterior.', category: 'Facade' },
  { id: 'facade_glass', name: 'Glass House', cost: 60, description: 'Cool blue architectural finish.', category: 'Facade' },
  { id: 'facade_carbon', name: 'Carbon House', cost: 65, description: 'Graphite exterior with light trim.', category: 'Facade' },
  { id: 'rgb_neon', name: 'RGB Dynasty Neon', cost: 40, description: 'A custom neon crest for the scrim floor.', category: 'Objects' },
  { id: 'luxury_arcade', name: 'Luxury Arcade Cabinet', cost: 65, description: 'Premium lounge cabinet.', category: 'Objects' },
  { id: 'hypercar_wrap', name: 'Hypercar Wrap', cost: 90, description: 'A signature wrap for the team fleet.', category: 'Objects' },
  { id: 'gold_pedestal', name: 'Gold Trophy Pedestal', cost: 120, description: 'A gilded display for championship hardware.', category: 'Objects' },
];

export function getPersonality(player: ProPlayer): PlayerPersonality {
  return player.personality ?? 'grinder';
}

export function playerSportsPreference(player: ProPlayer): 'basketball' | 'football' | 'none' {
  if (player.sportsPreference) return player.sportsPreference;
  const hash = [...player.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (['basketball', 'football', 'none'] as const)[hash % 3];
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

export const BASKETBALL_TIER_DETAILS: Record<SportsTier, { name: string; cost: number; perk: string; description: string }> = {
  1: { name: 'Blacktop Half-Court', cost: 8500, perk: '+15% mood recovery during gym & breaks', description: 'Asphalt blacktop with painted free-throw line, steel hoop, and chain-link fence.' },
  2: { name: 'Dynasty Poly-Court', cost: 32000, perk: '+30% mood recovery & +10% team chemistry', description: 'Impact-absorbing poly-resin court, regulation 3-point arc, tempered glass backboard, and LED floodlights.' },
  3: { name: 'Dynasty Championship Arena', cost: 0, perk: '+50% mood recovery, +25% team synergy & +5% sponsor hype', description: 'Full dual-hoop arena court with electronic shot clocks, team crest center-court, VIP bench, and stadium floodlights.' },
};

export const FOOTBALL_TIER_DETAILS: Record<SportsTier, { name: string; cost: number; perk: string; description: string }> = {
  1: { name: 'Backyard Training Pitch', cost: 10000, perk: '-20% player tilt & fatigue accumulation', description: 'Compact synthetic turf grass with training mini-goals and agility cones.' },
  2: { name: 'Pro Turf Field', cost: 45000, perk: '-40% tilt accumulation & +15% match stamina', description: 'Regulation turf with crisp white pitch markings, pro steel goalposts with mesh netting, player benches, and corner flags.' },
  3: { name: 'Dynasty Grand Stadium Pitch', cost: 0, perk: 'Immunity to burnout, +30% match stamina & +8% tournament win rating', description: 'Striped championship turf pitch, illuminated electronic LED scoreboard (DYNASTY 3 - 0 RIVALS), covered acrylic dugouts, and stadium floodlights.' },
};

export function basketballTierName(tier: SportsTier = 1): string {
  return BASKETBALL_TIER_DETAILS[tier]?.name ?? BASKETBALL_TIER_DETAILS[1].name;
}

export function footballTierName(tier: SportsTier = 1): string {
  return FOOTBALL_TIER_DETAILS[tier]?.name ?? FOOTBALL_TIER_DETAILS[1].name;
}

export function sportsBonuses(basketballTier: SportsTier = 1, footballTier: SportsTier = 1) {
  return {
    moodRecoveryMultiplier: 1 + (basketballTier - 1) * 0.25,
    teamChemistryBoost: (basketballTier - 1) * 0.10,
    fatigueReduction: (footballTier - 1) * 0.20,
    staminaBoost: (footballTier - 1) * 0.15,
  };
}
