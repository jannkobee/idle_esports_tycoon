import type { EsportsDiscipline, ProPlayer } from '../types/player.types';
import { getCardAttributes, lineupPower, resolveLineup, type LineupAssignment } from '../cards/CardService';

export type MatchTactic = 'balanced' | 'aggressive' | 'macro' | 'defensive';
export const MATCH_TACTICS: { id: MatchTactic; label: string; description: string }[] = [
  { id: 'balanced', label: 'Balanced', description: 'No specialization; steady play.' },
  { id: 'aggressive', label: 'Aggressive', description: 'Favors high mechanics and clutch.' },
  { id: 'macro', label: 'Macro', description: 'Favors game sense and teamwork.' },
  { id: 'defensive', label: 'Defensive', description: 'Favors stamina and clutch.' },
];
export const MAP_POOLS: Record<EsportsDiscipline, string[]> = {
  fps: ['Astra', 'Foundry', 'Haven', 'Reactor', 'Citadel', 'Canal', 'Metro'],
  moba: ['Summit', 'River', 'Citadel', 'Wildwood', 'Crossroads', 'Temple', 'Abyss'],
  br: ['Outlands', 'Frontier', 'Skyline', 'Badlands', 'Canyon', 'Harbor', 'Eclipse'],
  fighting: ['Arena', 'Dojo', 'Temple', 'Rooftop', 'Metro', 'Garden', 'Coliseum'],
};

export interface TournamentConfig {
  id: string;
  name: string;
  discipline: EsportsDiscipline;
  entryFee: number;
  cashPrize: number;
  hypePrize: number;
  minTeamPower: number;
}

export const TOURNAMENTS: TournamentConfig[] = [
  { id: 'fps_grassroots', name: 'Grassroots LAN Cup', discipline: 'fps', entryFee: 100, cashPrize: 800, hypePrize: 25, minTeamPower: 35 },
  { id: 'moba_challenger', name: 'Continental Challenger', discipline: 'moba', entryFee: 1200, cashPrize: 10000, hypePrize: 150, minTeamPower: 55 },
  { id: 'br_trios_invitational', name: 'Survival Showdown', discipline: 'br', entryFee: 8000, cashPrize: 75000, hypePrize: 600, minTeamPower: 70 },
  { id: 'fgc_world_clash', name: 'Fighter World Championship', discipline: 'fighting', entryFee: 35000, cashPrize: 350000, hypePrize: 2500, minTeamPower: 85 },
];

export interface CircuitOpponent { id: string; name: string; rating: number }
export interface CircuitRound {
  name: 'Quarterfinal' | 'Semifinal' | 'Final';
  scheduledAt: number;
  bestOf: 3 | 5;
  opponent: CircuitOpponent;
  bannedMap?: string;
  tactic?: MatchTactic;
  result?: { won: boolean; playerMaps: number; opponentMaps: number; maps?: MapResult[] };
}
export interface MapResult { name: string; playerRounds: number; opponentRounds: number; winner: 'player' | 'opponent' }
export interface BracketFixture { round: 'Quarterfinal' | 'Semifinal'; teamA: string; teamB: string; winner: string }
export interface CircuitEvent {
  id: string;
  discipline: EsportsDiscipline;
  name: string;
  entryFee: number;
  prize: number;
  hypePrize?: number;
  tournamentId?: string;
  otherMatches?: BracketFixture[];
  rounds: CircuitRound[];
  currentRound: number;
  status: 'active' | 'won' | 'eliminated';
}

export function createCircuit(discipline: EsportsDiscipline, opponents: CircuitOpponent[], now: number, config?: TournamentConfig): CircuitEvent {
  const pool = opponents.slice(0, 3);
  if (pool.length < 3) throw new Error('Circuit requires three opponents');
  const names = { fps: 'Counter-Strike Open', moba: 'MOBA Regional Cup', br: 'Battle Royale Invitational', fighting: 'Fighting Championship' };
  const otherMatches: BracketFixture[] = [];
  let semifinal = pool[1];
  let final = pool[2];
  if (opponents.length >= 7) {
    const fixture = (round: BracketFixture['round'], first: CircuitOpponent, second: CircuitOpponent) => {
      const winner = first.rating >= second.rating ? first : second;
      otherMatches.push({ round, teamA: first.name, teamB: second.name, winner: winner.name });
      return winner;
    };
    semifinal = fixture('Quarterfinal', opponents[1], opponents[2]);
    const rightA = fixture('Quarterfinal', opponents[3], opponents[4]);
    const rightB = fixture('Quarterfinal', opponents[5], opponents[6]);
    final = fixture('Semifinal', rightA, rightB);
  }
  return {
    id: `circuit_${now}`, discipline, name: config?.name ?? names[discipline],
    entryFee: config?.entryFee ?? 500, prize: config?.cashPrize ?? 5000,
    hypePrize: config?.hypePrize ?? 100, tournamentId: config?.id, otherMatches,
    rounds: [
      { name: 'Quarterfinal', scheduledAt: now, bestOf: 3, opponent: pool[0] },
      { name: 'Semifinal', scheduledAt: now + 30_000, bestOf: 3, opponent: semifinal },
      { name: 'Final', scheduledAt: now + 60_000, bestOf: 5, opponent: final },
    ],
    currentRound: 0, status: 'active',
  };
}

function hash(value: string): number {
  let result = 2166136261;
  for (let i = 0; i < value.length; i++) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
  return result >>> 0;
}

export function tacticBonus(roster: ProPlayer[], discipline: EsportsDiscipline, lineup: LineupAssignment | undefined, tactic: MatchTactic): number {
  if (tactic === 'balanced') return 0;
  const ids = new Set(Object.values(resolveLineup(roster, discipline, lineup)));
  const players = roster.filter(player => ids.has(player.id));
  if (!players.length) return 0;
  const average = (key: keyof ReturnType<typeof getCardAttributes>) => players.reduce((sum, player) => sum + getCardAttributes(player)[key], 0) / players.length;
  if (tactic === 'aggressive') return (average('mechanics') + average('clutch') - 120) / 22;
  if (tactic === 'macro') return (average('gameSense') + average('teamwork') - 120) / 22;
  return (average('stamina') + average('clutch') - 120) / 22;
}

export function simulateDetailedSeries(
  power: number, opponent: CircuitOpponent, bestOf: 3 | 5, mapPool: string[], bannedMap: string | undefined,
  bonus: number, random = Math.random, discipline: EsportsDiscipline = 'fps',
): { won: boolean; playerMaps: number; opponentMaps: number; maps: MapResult[] } {
  const target = (bestOf + 1) / 2;
  const available = mapPool.filter(map => map !== bannedMap);
  let playerMaps = 0, opponentMaps = 0;
  const maps: MapResult[] = [];
  for (let index = 0; index < bestOf && playerMaps < target && opponentMaps < target; index++) {
    const name = available[index % available.length];
    const mapEdge = ((hash(name) % 7) - (hash(opponent.id + name) % 7)) * 0.6;
    const opponentPower = Math.max(35, Math.min(95, 45 + (opponent.rating - 1200) / 12));
    const probability = Math.max(0.12, Math.min(0.88, 0.5 + (power + bonus + mapEdge - opponentPower) * 0.012));
    const win = random() < probability;
    if (win) playerMaps++; else opponentMaps++;
    const loserRounds = discipline === 'fps' ? 5 + Math.floor(random() * 8) : 0;
    const winningRounds = discipline === 'fps' ? 13 : 1;
    maps.push({ name, playerRounds: win ? winningRounds : loserRounds, opponentRounds: win ? loserRounds : winningRounds, winner: win ? 'player' : 'opponent' });
  }
  return { won: playerMaps > opponentMaps, playerMaps, opponentMaps, maps };
}

export function simulateSeries(power: number, rating: number, bestOf: 3 | 5, random = Math.random) {
  const target = (bestOf + 1) / 2;
  const opponentPower = Math.max(35, Math.min(95, 45 + (rating - 1200) / 12));
  const probability = Math.max(0.12, Math.min(0.88, 0.5 + (power - opponentPower) * 0.012));
  let playerMaps = 0, opponentMaps = 0;
  while (playerMaps < target && opponentMaps < target) {
    if (random() < probability) playerMaps++;
    else opponentMaps++;
  }
  return { won: playerMaps > opponentMaps, playerMaps, opponentMaps };
}

export function playCircuitRound(event: CircuitEvent, roster: ProPlayer[], now: number, random = Math.random, lineup?: LineupAssignment): CircuitEvent | null {
  const round = event.rounds[event.currentRound];
  if (event.status !== 'active' || !round || now < round.scheduledAt) return null;
  const power = lineupPower(roster, event.discipline, lineup);
  if (power <= 0) return null;
  const result = simulateDetailedSeries(power, round.opponent, round.bestOf, MAP_POOLS[event.discipline], round.bannedMap,
    tacticBonus(roster, event.discipline, lineup, round.tactic ?? 'balanced'), random, event.discipline);
  const rounds = event.rounds.map((item, index) => index === event.currentRound ? { ...item, result } : item);
  return { ...event, rounds, currentRound: result.won ? event.currentRound + 1 : event.currentRound,
    status: result.won ? event.currentRound === event.rounds.length - 1 ? 'won' : 'active' : 'eliminated' };
}
