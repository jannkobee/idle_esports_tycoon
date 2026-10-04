import { PLAYER_IDENTITIES } from '../engine/PlayerAppearance';
import type { CardAttributes, EsportsDiscipline, PlayerPosition, PlayerRarity, ProPlayer } from '../types/player.types';

export const CARD_PACK_COST = 750;
export const CARD_ODDS: { rarity: PlayerRarity; weight: number; floor: number; ceiling: number }[] = [
  { rarity: 'bronze', weight: 45, floor: 35, ceiling: 70 },
  { rarity: 'silver', weight: 28, floor: 49, ceiling: 80 },
  { rarity: 'gold', weight: 15, floor: 62, ceiling: 90 },
  { rarity: 'platinum', weight: 7, floor: 72, ceiling: 94 },
  { rarity: 'diamond', weight: 4, floor: 82, ceiling: 98 },
  { rarity: 'goat', weight: 1, floor: 89, ceiling: 99 },
];

export const CARD_POSITIONS: Record<EsportsDiscipline, PlayerPosition[]> = {
  fps: ['awper', 'rifler', 'igl'],
  moba: ['top', 'jungler', 'mid', 'bottom', 'support'],
  br: ['fragger', 'anchor', 'igl'],
  fighting: ['fighter'],
};

export interface LineupSlot { id: string; label: string; position: PlayerPosition }
export type LineupAssignment = Record<string, string | null>;
export type TeamLineups = Partial<Record<EsportsDiscipline, LineupAssignment>>;

export const LINEUP_SLOTS: Record<EsportsDiscipline, LineupSlot[]> = {
  fps: [
    { id: 'awper', label: 'AWPer', position: 'awper' },
    { id: 'rifler_1', label: 'Rifler 1', position: 'rifler' },
    { id: 'rifler_2', label: 'Rifler 2', position: 'rifler' },
    { id: 'rifler_3', label: 'Rifler 3', position: 'rifler' },
    { id: 'igl', label: 'IGL', position: 'igl' },
  ],
  moba: [
    { id: 'top', label: 'Top', position: 'top' },
    { id: 'jungler', label: 'Jungler', position: 'jungler' },
    { id: 'mid', label: 'Mid', position: 'mid' },
    { id: 'bottom', label: 'Bottom', position: 'bottom' },
    { id: 'support', label: 'Support', position: 'support' },
  ],
  br: [
    { id: 'fragger', label: 'Fragger', position: 'fragger' },
    { id: 'anchor', label: 'Anchor', position: 'anchor' },
    { id: 'igl', label: 'IGL', position: 'igl' },
  ],
  fighting: [{ id: 'fighter', label: 'Fighter', position: 'fighter' }],
};

const clamp = (value: number, min = 1, max = 99) => Math.max(min, Math.min(max, Math.round(value)));

export function rollRarity(random = Math.random): PlayerRarity {
  let roll = random() * 100;
  for (const tier of CARD_ODDS) {
    roll -= tier.weight;
    if (roll < 0) return tier.rarity;
  }
  return 'goat';
}

export function getCardAttributes(player: ProPlayer): CardAttributes {
  const { aim, macro, comms, tiltResistance } = player.stats;
  return player.cardAttributes ?? {
    mechanics: aim, gameSense: macro, teamwork: comms, clutch: tiltResistance,
    adaptability: Math.round((macro + comms) / 2), stamina: Math.round((tiltResistance + aim) / 2),
  };
}

export function getPotential(player: ProPlayer): number {
  return Math.max(1, player.potential ?? CARD_ODDS.find(tier => tier.rarity === player.rarity)?.ceiling ?? 70);
}

export function getPosition(player: ProPlayer): PlayerPosition {
  return player.position ?? CARD_POSITIONS[player.discipline][0];
}

export function getOverall(player: ProPlayer): number {
  const attr = getCardAttributes(player);
  const position = getPosition(player);
  const weights: Record<string, Partial<Record<keyof CardAttributes, number>>> = {
    awper: { mechanics: 0.38, clutch: 0.25, gameSense: 0.2, adaptability: 0.17 },
    rifler: { mechanics: 0.3, adaptability: 0.25, teamwork: 0.2, stamina: 0.25 },
    igl: { gameSense: 0.35, teamwork: 0.3, adaptability: 0.2, clutch: 0.15 },
    jungler: { gameSense: 0.3, adaptability: 0.3, teamwork: 0.25, mechanics: 0.15 },
    support: { teamwork: 0.38, gameSense: 0.3, adaptability: 0.2, stamina: 0.12 },
  };
  const selected = weights[position] ?? { mechanics: 0.25, gameSense: 0.22, teamwork: 0.16, clutch: 0.17, adaptability: 0.1, stamina: 0.1 };
  return clamp(Object.entries(selected).reduce((sum, [key, weight]) => sum + attr[key as keyof CardAttributes] * weight, 0));
}

export function playerCeiling(player: ProPlayer): number {
  return Math.max(getOverall(player), getPotential(player));
}

export function trainingCeiling(player: ProPlayer): number {
  return Math.max(1, Math.min(99, player.potential ?? CARD_ODDS.find(tier => tier.rarity === player.rarity)?.ceiling ?? 70));
}

export function developmentRate(player: ProPlayer): number {
  if (player.age === undefined && player.potential === undefined) return 1;
  const age = player.age ?? 24;
  const ageMultiplier = age <= 21 ? 1.25 : age <= 25 ? 1.1 : age >= 31 ? 0.75 : 1;
  const potentialGap = Math.max(0, getPotential(player) - getOverall(player));
  return ageMultiplier * (1 + Math.min(0.2, potentialGap / 150));
}

export function duplicateKey(player: ProPlayer): string {
  return `${player.discipline}:${player.name.toLocaleLowerCase()}`;
}

export function duplicateValue(player: ProPlayer): number {
  return ({ bronze: 1, silver: 2, gold: 3, platinum: 5, diamond: 8, goat: 12 })[player.rarity];
}

export function developmentCost(attributeValue: number): number {
  return attributeValue >= 85 ? 4 : attributeValue >= 70 ? 3 : attributeValue >= 50 ? 2 : 1;
}

export function generateCard(discipline: EsportsDiscipline, rosterSize: number, random = Math.random): ProPlayer {
  const rarity = rollRarity(random);
  const tier = CARD_ODDS.find(item => item.rarity === rarity)!;
  const age = 17 + Math.floor(random() * 17);
  const scaling = age <= 22 && random() < 0.12;
  const potential = clamp(tier.floor + 12 + random() * (tier.ceiling - tier.floor - 11) + (age <= 21 ? 4 : age >= 29 ? -4 : 0) + (scaling ? 14 : 0), tier.floor, scaling ? 99 : tier.ceiling);
  const base = clamp(tier.floor + random() * Math.min(15, potential - tier.floor), tier.floor, potential);
  const positions = CARD_POSITIONS[discipline];
  const position = positions[Math.floor(random() * positions.length)];
  const identityIndex = Math.floor(random() * PLAYER_IDENTITIES.length);
  const identity = PLAYER_IDENTITIES[identityIndex];
  const stat = () => clamp(base - 6 + random() * 13, 1, potential);
  const mechanics = stat(), gameSense = stat(), teamwork = stat(), clutch = stat(), adaptability = stat(), stamina = stat();
  return {
    id: crypto.randomUUID(), name: identity.name, handle: `${identity.handle}_${rosterSize + 1}`,
    portraitIndex: identityIndex, discipline, rarity, role: rosterSize < 5 ? 'starter' : 'sub',
    level: 1, salaryPerSec: Math.round(base / 20), age, potential, position,
    stats: { aim: mechanics, macro: gameSense, comms: teamwork, tiltResistance: clutch },
    cardAttributes: { mechanics, gameSense, teamwork, clutch, adaptability, stamina },
    fans: Math.round(base * (rarity === 'goat' ? 500 : 20)), isClutch: rarity === 'goat' || clutch > 83,
    contractMatchesRemaining: 20, sleepQuality: 90, mood: 90, energy: 100,
    personality: scaling ? 'scaling' : age <= 21 && potential >= 85 ? 'grinder' : 'tactician',
    sportsPreference: random() < 0.42 ? 'basketball' : random() < 0.72 ? 'football' : 'none',
  };
}

export function isMatchEligible(player: ProPlayer, discipline: EsportsDiscipline): boolean {
  return player.discipline === discipline && player.role !== 'inactive' && (player.contractMatchesRemaining ?? 20) > 0;
}

export function slotRating(player: ProPlayer, slot: LineupSlot): number {
  return Math.max(1, getOverall(player) - (getPosition(player) === slot.position ? 0 : 8));
}

export function autoFillLineup(roster: ProPlayer[], discipline: EsportsDiscipline): LineupAssignment {
  const available = roster.filter(player => isMatchEligible(player, discipline));
  const used = new Set<string>();
  const lineup: LineupAssignment = {};
  for (const slot of LINEUP_SLOTS[discipline]) {
    const best = available.filter(player => !used.has(player.id))
      .sort((a, b) => slotRating(b, slot) - slotRating(a, slot))[0];
    lineup[slot.id] = best?.id ?? null;
    if (best) used.add(best.id);
  }
  return lineup;
}

export function resolveLineup(roster: ProPlayer[], discipline: EsportsDiscipline, saved?: LineupAssignment): LineupAssignment {
  if (!saved) return autoFillLineup(roster, discipline);
  const seen = new Set<string>();
  const resolved: LineupAssignment = {};
  for (const slot of LINEUP_SLOTS[discipline]) {
    const id = saved[slot.id];
    const valid = id && !seen.has(id) && roster.some(player => player.id === id && isMatchEligible(player, discipline));
    resolved[slot.id] = valid ? id : null;
    if (valid) seen.add(id);
  }
  return resolved;
}

export function lineupPower(roster: ProPlayer[], discipline: EsportsDiscipline, saved?: LineupAssignment): number {
  const assignments = resolveLineup(roster, discipline, saved);
  const slots = LINEUP_SLOTS[discipline];
  const starters = slots.map(slot => ({ slot, player: roster.find(player => player.id === assignments[slot.id]) }))
    .filter((entry): entry is { slot: LineupSlot; player: ProPlayer } => Boolean(entry.player));
  if (!starters.length) return 0;
  const average = starters.reduce((sum, { slot, player }) => sum + slotRating(player, slot) * (0.85 + (player.energy ?? 100) * 0.0015), 0) / starters.length;
  const depthPenalty = (slots.length - starters.length) * 4;
  const completeBonus = starters.length === slots.length ? 4 : 0;
  return Math.max(1, Math.round(average + completeBonus - depthPenalty));
}
