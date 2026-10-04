import { describe, expect, it } from 'vitest';
import { createCircuit, MAP_POOLS, playCircuitRound, simulateDetailedSeries, simulateSeries, tacticBonus } from './CircuitService';
import { generateCard } from '../cards/CardService';

const opponents = [
  { id: 'a', name: 'Rival A', rating: 1200 },
  { id: 'b', name: 'Rival B', rating: 1300 },
  { id: 'c', name: 'Rival C', rating: 1400 },
];

describe('scheduled tournament circuit', () => {
  it('sets three scheduled matches with BO3 semifinals and a BO5 final', () => {
    const event = createCircuit('fps', opponents, 1000);
    expect(event.rounds.map(round => round.bestOf)).toEqual([3, 3, 5]);
    expect(event.rounds.map(round => round.scheduledAt)).toEqual([1000, 31000, 61000]);
  });

  it('blocks early rounds and advances only after a played win', () => {
    const roster = [generateCard('fps', 0, () => 0.99)];
    const event = createCircuit('fps', opponents, 1000);
    const first = playCircuitRound(event, roster, 1000, () => 0)!;
    expect(first.currentRound).toBe(1);
    expect(first.rounds[0].result).toMatchObject({ won: true, playerMaps: 2, opponentMaps: 0 });
    expect(playCircuitRound(first, roster, 2000, () => 0)).toBeNull();
    const second = playCircuitRound(first, roster, 31000, () => 0)!;
    const final = playCircuitRound(second, roster, 61000, () => 0)!;
    expect(final.status).toBe('won');
    expect(final.rounds[2].result?.playerMaps).toBe(3);
    expect(playCircuitRound(final, roster, 62000, () => 0)).toBeNull();
  });

  it('resolves lower power as a lower chance across a complete series', () => {
    expect(simulateSeries(35, 1850, 3, () => 0.5).won).toBe(false);
    expect(simulateSeries(99, 1200, 3, () => 0.5).won).toBe(true);
  });

  it('uses the saved starter rather than the strongest bench card', () => {
    const template = generateCard('fps', 0, () => 0.15);
    const makeCard = (id: string, value: number) => ({ ...template, id, position: 'awper' as const,
      stats: { aim: value, macro: value, comms: value, tiltResistance: value },
      cardAttributes: { mechanics: value, gameSense: value, teamwork: value, clutch: value, adaptability: value, stamina: value } });
    const roster = [makeCard('low', 35), makeCard('high', 95)];
    const event = createCircuit('fps', opponents, 1000);
    const low = playCircuitRound(event, roster, 1000, () => 0.5, { awper: 'low' })!;
    const high = playCircuitRound(event, roster, 1000, () => 0.5, { awper: 'high' })!;
    expect(low.rounds[0].result?.won).toBe(false);
    expect(high.rounds[0].result?.won).toBe(true);
  });

  it('builds an eight-team bracket with rival fixtures and saves map veto and tactic results', () => {
    const field = Array.from({ length: 7 }, (_, index) => ({ id: `r${index}`, name: `Rival ${index}`, rating: 1200 + index * 50 }));
    const event = createCircuit('fps', field, 1000);
    expect(event.otherMatches).toHaveLength(4);
    expect(event.rounds[1].opponent.name).toBe('Rival 2');
    expect(event.rounds[2].opponent.name).toBe('Rival 6');
    const prepared = { ...event, rounds: event.rounds.map((round, index) => index === 0 ? { ...round, bannedMap: 'Astra', tactic: 'aggressive' as const } : round) };
    const played = playCircuitRound(prepared, [generateCard('fps', 0, () => 0.99)], 1000, () => 0)!;
    expect(played.rounds[0].result?.maps?.length).toBe(2);
    expect(played.rounds[0].result?.maps?.every(map => map.name !== 'Astra')).toBe(true);
    expect(played.rounds[0].bannedMap).toBe('Astra');
  });

  it('uses discipline-appropriate map scores and lineup attributes for tactics', () => {
    const result = simulateDetailedSeries(90, opponents[0], 3, MAP_POOLS.moba, 'Summit', 0, () => 0, 'moba');
    expect(result.maps[0]).toMatchObject({ name: 'River', playerRounds: 1, opponentRounds: 0 });
    const card = generateCard('fps', 0, () => 0.9);
    const elite = { ...card, cardAttributes: { mechanics: 90, clutch: 90, gameSense: 30, teamwork: 30, adaptability: 50, stamina: 50 } };
    expect(tacticBonus([elite], 'fps', { awper: elite.id }, 'aggressive')).toBeGreaterThan(0);
    expect(tacticBonus([elite], 'fps', { awper: elite.id }, 'macro')).toBeLessThan(0);
  });
});
