import { describe, expect, it } from 'vitest';
import { CARD_ODDS, LINEUP_SLOTS, autoFillLineup, developmentRate, generateCard, getOverall, lineupPower, resolveLineup, rollRarity, slotRating, trainingCeiling } from './CardService';

describe('collectible player cards', () => {
  it('publishes a complete 100% rarity table including Platinum and GOAT', () => {
    expect(CARD_ODDS.reduce((sum, tier) => sum + tier.weight, 0)).toBe(100);
    expect(rollRarity(() => 0)).toBe('bronze');
    expect(rollRarity(() => 0.72)).toBe('silver');
    expect(rollRarity(() => 0.995)).toBe('goat');
  });

  it('generates age, role, six attributes and a ceiling above a scaling card overall', () => {
    const rolls = [0.2, 0.05, 0.05, 0.9, 0.05, 0.05, 0.05];
    let index = 0;
    const card = generateCard('moba', 6, () => rolls[index++] ?? 0.05);
    expect(card.age).toBeGreaterThanOrEqual(17);
    expect(['top', 'jungler', 'mid', 'bottom', 'support']).toContain(card.position);
    expect(Object.keys(card.cardAttributes!)).toHaveLength(6);
    expect(card.personality).toBe('scaling');
    expect(card.potential).toBeGreaterThan(70);
    expect(trainingCeiling(card)).toBeGreaterThan(getOverall(card));
  });

  it('develops young high-potential cards faster while preserving legacy card rates', () => {
    const card = generateCard('fps', 0, () => 0.15);
    const prospect = { ...card, age: 18, potential: 95 };
    const veteran = { ...card, age: 33, potential: 70 };
    expect(developmentRate(prospect)).toBeGreaterThan(developmentRate(veteran));
    expect(developmentRate({ ...card, age: undefined, potential: undefined })).toBe(1);
  });

  it('uses card ratings, positions, and full lineup depth for competitive power', () => {
    const card = generateCard('fps', 0, () => 0.15);
    const single = lineupPower([card], 'fps');
    const full = lineupPower(Array.from({ length: 5 }, (_, index) => ({ ...card, id: String(index), position: index === 0 ? 'awper' : index === 1 ? 'igl' : 'rifler' })), 'fps');
    expect(full).toBeGreaterThan(single);
    expect(lineupPower([card], 'moba')).toBe(0);
  });

  it('fills each FPS slot with a unique eligible card and applies an off-role penalty', () => {
    const base = generateCard('fps', 0, () => 0.15);
    const roster = [
      { ...base, id: 'awp', position: 'awper' as const },
      { ...base, id: 'lead', position: 'igl' as const },
      ...[1, 2, 3].map(index => ({ ...base, id: `rifler${index}`, position: 'rifler' as const })),
    ];
    const lineup = autoFillLineup(roster, 'fps');
    expect(new Set(Object.values(lineup)).size).toBe(5);
    expect(lineup.awper).toBe('awp');
    expect(lineup.igl).toBe('lead');
    const awpSlot = LINEUP_SLOTS.fps[0];
    expect(slotRating(roster[0], awpSlot)).toBeGreaterThan(slotRating(roster[2], awpSlot));
    expect(lineupPower(roster, 'fps', lineup)).toBeGreaterThan(lineupPower(roster, 'fps', { ...lineup, awper: null }));
    expect(resolveLineup(roster, 'fps', { ...lineup, igl: 'awp' }).igl).toBeNull();
  });
});
