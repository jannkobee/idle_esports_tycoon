import type { EsportsDiscipline, ProPlayer } from '../types/player.types';
import type { ExecutiveRole } from '../empire/EmpireService';
import { MAP_POOLS, type MatchTactic } from '../tournaments/CircuitService';
import { LINEUP_SLOTS, getCardAttributes, isMatchEligible, slotRating, type LineupAssignment } from '../cards/CardService';
import type { ScheduleBlock } from '../empire/EmpireService';

export type StaffTier = 'rookie' | 'regional' | 'elite' | 'world_class' | 'legendary';
export type StaffKind = 'coach' | 'manager' | 'nutritionist';
export type NutritionStyle = 'recovery' | 'endurance' | 'focus';
export interface StaffCandidate {
  id: string;
  name: string;
  kind: StaffKind;
  tier: StaffTier;
  rating: number;
  hireCost: number;
  discipline?: EsportsDiscipline;
  executiveRole?: ExecutiveRole;
  tactic?: MatchTactic;
  nutritionStyle?: NutritionStyle;
}

export const STAFF_TIERS: StaffTier[] = ['rookie', 'regional', 'elite', 'world_class', 'legendary'];
const FIRST = ['Alex', 'Maya', 'Jordan', 'Samira', 'Kai', 'Emilio', 'Nia', 'Ravi', 'Elena', 'Noah', 'Zara', 'Mateo'];
const LAST = ['Reyes', 'Chen', 'Vance', 'Okafor', 'Patel', 'Santos', 'Kim', 'Brooks', 'Navarro', 'Rivera', 'Park', 'Morgan'];
const DISCIPLINES: EsportsDiscipline[] = ['fps', 'moba', 'br', 'fighting'];
const MANAGERS: ExecutiveRole[] = ['ceo', 'gm', 'ops', 'cmo'];
const TACTICS: MatchTactic[] = ['aggressive', 'macro', 'defensive', 'balanced'];
const NUTRITION: NutritionStyle[] = ['recovery', 'endurance', 'focus'];

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}

export function generateStaffMarket(seed: number): StaffCandidate[] {
  const random = seeded(seed);
  const result: StaffCandidate[] = [];
  const make = (kind: StaffKind, slot: string, index: number, extra: Partial<StaffCandidate>) => {
    const roll = random();
    const tierIndex = roll < 0.4 ? 0 : roll < 0.69 ? 1 : roll < 0.87 ? 2 : roll < 0.97 ? 3 : 4;
    const rating = Math.min(99, 45 + tierIndex * 11 + Math.floor(random() * 10));
    const name = `${FIRST[Math.floor(random() * FIRST.length)]} ${LAST[Math.floor(random() * LAST.length)]}`;
    result.push({ id: `${seed}_${slot}_${index}`, name, kind, tier: STAFF_TIERS[tierIndex], rating,
      hireCost: Math.round((600 + tierIndex * tierIndex * 900 + rating * 14) * (kind === 'manager' ? 1.4 : 1)), ...extra });
  };
  for (const discipline of DISCIPLINES) {
    const firstStyle = Math.floor(random() * TACTICS.length);
    for (let index = 0; index < 2; index++)
      make('coach', discipline, index, { discipline, tactic: TACTICS[(firstStyle + index) % TACTICS.length] });
  }
  for (const executiveRole of MANAGERS) for (let index = 0; index < 2; index++)
    make('manager', executiveRole, index, { executiveRole });
  for (let index = 0; index < 3; index++)
    make('nutritionist', 'nutritionist', index, { nutritionStyle: NUTRITION[index] });
  return result;
}

export function staffSlot(staff: StaffCandidate): string {
  return staff.kind === 'coach' ? `coach:${staff.discipline}` : staff.kind === 'manager' ? `manager:${staff.executiveRole}` : 'nutritionist';
}

export function activeCoach(staff: StaffCandidate[], discipline: EsportsDiscipline): StaffCandidate | undefined {
  return staff.find(person => person.kind === 'coach' && person.discipline === discipline);
}

export function coachPlan(staff: StaffCandidate[], discipline: EsportsDiscipline, opponentId: string): { tactic: MatchTactic; bannedMap: string; bonus: number } {
  const coach = activeCoach(staff, discipline);
  const pool = MAP_POOLS[discipline];
  const hash = [...opponentId].reduce((sum, char) => (Math.imul(sum, 31) + char.charCodeAt(0)) >>> 0, 0);
  const banIndex = (hash + (coach?.rating ?? 0) + TACTICS.indexOf(coach?.tactic ?? 'balanced')) % pool.length;
  return { tactic: coach?.tactic ?? 'balanced', bannedMap: pool[banIndex], bonus: coach ? (coach.rating - 40) / 9 : 0 };
}

export function managerDiscount(staff: StaffCandidate[], role: ExecutiveRole): number {
  const manager = staff.find(person => person.kind === 'manager' && person.executiveRole === role);
  return manager ? Math.min(0.35, 0.12 + (manager.rating - 45) / 250) : 0;
}

export function managerRatingBonus(staff: StaffCandidate[], role: ExecutiveRole): number {
  const manager = staff.find(person => person.kind === 'manager' && person.executiveRole === role);
  return manager ? manager.rating / 500 : 0;
}

export function nutritionBonus(staff: StaffCandidate[]): { mood: number; energy: number; training: number } {
  const nutritionist = staff.find(person => person.kind === 'nutritionist');
  if (!nutritionist) return { mood: 0, energy: 0, training: 0 };
  const strength = Math.round(nutritionist.rating / 12);
  return { mood: nutritionist.nutritionStyle === 'recovery' ? strength * 2 : strength,
    energy: nutritionist.nutritionStyle === 'endurance' ? strength * 3 : strength,
    training: nutritionist.nutritionStyle === 'focus' ? nutritionist.rating / 500 : 0 };
}

export function coachSelectLineup(roster: ProPlayer[], discipline: EsportsDiscipline, staff: StaffCandidate[]): LineupAssignment {
  const coach = activeCoach(staff, discipline);
  const tactic = coach?.tactic ?? 'balanced';
  const available = roster.filter(player => isMatchEligible(player, discipline));
  const used = new Set<string>();
  const lineup: LineupAssignment = {};
  for (const slot of LINEUP_SLOTS[discipline]) {
    const best = available.filter(player => !used.has(player.id)).sort((first, second) => {
      const rating = (player: ProPlayer) => {
        const attributes = getCardAttributes(player);
        const emphasis = tactic === 'aggressive' ? (attributes.mechanics + attributes.clutch) / 2
          : tactic === 'macro' ? (attributes.gameSense + attributes.teamwork) / 2
            : tactic === 'defensive' ? (attributes.stamina + attributes.clutch) / 2 : 0;
        return slotRating(player, slot) + emphasis * (coach ? coach.rating / 500 : 0)
          + (player.mood ?? 85) / 40 + (player.energy ?? 80) / 30;
      };
      return rating(second) - rating(first) || first.id.localeCompare(second.id);
    })[0];
    lineup[slot.id] = best?.id ?? null;
    if (best) used.add(best.id);
  }
  return lineup;
}

export function staffDailySchedule(staff: StaffCandidate[], discipline?: EsportsDiscipline): ScheduleBlock[] {
  const ops = staff.find(person => person.kind === 'manager' && person.executiveRole === 'ops');
  const coaches = staff.filter(person => person.kind === 'coach');
  const coach = discipline
    ? activeCoach(staff, discipline)
    : coaches.sort((a, b) => b.rating - a.rating)[0];
  const breakBlock = ops && ops.rating >= 70 ? 'rest' : 'outdoor';
  if (discipline && coach) {
    if (coach.tactic === 'macro') return ['vod', 'vod', 'scrim', 'gym', breakBlock];
    if (coach.tactic === 'aggressive') return ['scrim', 'scrim', 'vod', 'gym', breakBlock];
    if (coach.tactic === 'defensive') return ['vod', 'gym', 'scrim', breakBlock, 'rest'];
    return ['scrim', 'vod', 'gym', breakBlock, 'rest'];
  }
  const first = coach?.tactic === 'macro' ? 'vod' : 'scrim';
  const second = first === 'vod' ? 'scrim' : 'vod';
  return [first, second, 'gym', breakBlock, 'rest'];
}
