import { describe, expect, it } from 'vitest';
import { districtBonuses, nextSeasonStage, personalityMultiplier, scheduleActivity, scheduleSynergy } from './EmpireService';
import type { ProPlayer } from '../types/player.types';

const player = (id: string): ProPlayer => ({
  id, name: id, handle: id, portraitIndex: 0, discipline: 'fps', rarity: 'silver', role: 'starter', level: 1,
  salaryPerSec: 1, stats: { aim: 50, macro: 50, comms: 50, tiltResistance: 50 },
});

describe('Empire living-world mechanics', () => {
  it('scales district income, sponsor payout, recovery and visible fans by tier', () => {
    expect(districtBonuses(1)).toEqual({ incomeMultiplier: 1, sponsorMultiplier: 1, moodRecovery: 7, fanDensity: 1 });
    expect(districtBonuses(3)).toEqual({ incomeMultiplier: 1.24, sponsorMultiplier: 1.3, moodRecovery: 13, fanDensity: 3 });
  });

  it('maps the synchronized schedule to existing simulation activity categories', () => {
    expect(scheduleActivity('scrim')).toBe('practice');
    expect(scheduleActivity('vod')).toBe('review');
    expect(scheduleActivity('gym')).toBe('exercise');
    expect(scheduleActivity('outdoor')).toBe('break');
    expect(scheduleActivity('rest')).toBe('break');
    expect(scheduleSynergy([player('a'), player('b'), player('c')], 'scrim')).toBeCloseTo(0.15);
    expect(scheduleSynergy([player('a')], 'rest')).toBe(0);
  });

  it('applies personality specialization and cycles the four-stage circuit', () => {
    expect(personalityMultiplier('grinder', 'scrim')).toBe(1.25);
    expect(personalityMultiplier('tactician', 'vod')).toBe(1.35);
    expect(personalityMultiplier('showman', 'vod')).toBe(1);
    expect(nextSeasonStage('spring')).toBe('msi');
    expect(nextSeasonStage('msi')).toBe('summer');
    expect(nextSeasonStage('summer')).toBe('worlds');
    expect(nextSeasonStage('worlds')).toBe('spring');
  });
});
