import { describe, expect, it } from 'vitest';
import { coachPlan, coachSelectLineup, generateStaffMarket, managerDiscount, managerRatingBonus, nutritionBonus, staffDailySchedule, staffSlot } from './StaffService';
import { generateCard } from '../cards/CardService';

describe('generated staff market', () => {
  it('generates repeatable candidates with different coach styles and tier hierarchy', () => {
    const market = generateStaffMarket(123);
    expect(generateStaffMarket(123)).toEqual(market);
    expect(market.filter(person => person.kind === 'coach')).toHaveLength(8);
    expect(market.filter(person => person.kind === 'manager')).toHaveLength(8);
    expect(market.filter(person => person.kind === 'nutritionist')).toHaveLength(3);
    for (const discipline of ['fps', 'moba', 'br', 'fighting']) {
      const coaches = market.filter(person => person.kind === 'coach' && person.discipline === discipline);
      expect(new Set(coaches.map(person => person.tactic)).size).toBe(2);
    }
    expect(market.every(person => person.rating >= 45 && person.hireCost > 0)).toBe(true);
  });

  it('lets a hired coach determine the match plan and tier bonus', () => {
    const coach = generateStaffMarket(123).find(person => person.kind === 'coach' && person.discipline === 'fps')!;
    const interim = coachPlan([], 'fps', 'rival');
    const planned = coachPlan([coach], 'fps', 'rival');
    expect(interim.tactic).toBe('balanced');
    expect(planned.tactic).toBe(coach.tactic);
    expect(planned.bonus).toBeGreaterThan(0);
    expect(planned.bannedMap).toBeTruthy();
    expect(staffSlot(coach)).toBe('coach:fps');
  });

  it('gives managers and nutritionists rating- and style-based effects', () => {
    const market = generateStaffMarket(456);
    const gm = market.find(person => person.executiveRole === 'gm')!;
    const nutritionist = market.find(person => person.nutritionStyle === 'focus')!;
    expect(managerDiscount([gm], 'gm')).toBeGreaterThan(0);
    expect(managerDiscount([gm], 'ceo')).toBe(0);
    expect(managerRatingBonus([gm], 'gm')).toBeGreaterThan(0);
    expect(nutritionBonus([nutritionist]).training).toBeGreaterThan(0);
    expect(nutritionBonus([])).toEqual({ mood: 0, energy: 0, training: 0 });
  });

  it('lets staff choose starters and schedule priorities without player slot input', () => {
    const base = generateCard('fps', 0, () => 0.2);
    const tired = { ...base, id: 'tired', energy: 10, mood: 10 };
    const ready = { ...base, id: 'ready', energy: 100, mood: 100 };
    expect(coachSelectLineup([tired, ready], 'fps', []).awper).toBe('ready');
    const macroCoach = { ...generateStaffMarket(99).find(person => person.kind === 'coach' && person.discipline === 'fps')!, tactic: 'macro' as const };
    const ops = { ...generateStaffMarket(99).find(person => person.executiveRole === 'ops')!, rating: 80 };
    expect(staffDailySchedule([macroCoach, ops])).toEqual(['vod', 'scrim', 'gym', 'rest', 'rest']);
  });
});
