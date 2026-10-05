import { describe, expect, it } from 'vitest';
import { branchIncomePerSecond, branchTrainingMultiplier, branchUpgradeCost } from './BranchService';

describe('esports branch network', () => {
  it('scales passive income and discipline-specific training by tier', () => {
    const branches = [{ id: 'west_coast' as const, tier: 2 as const }, { id: 'seoul' as const, tier: 1 as const }];
    expect(branchIncomePerSecond(branches)).toBe(7);
    expect(branchTrainingMultiplier(branches, 'fps')).toBeCloseTo(1.1);
    expect(branchTrainingMultiplier(branches, 'moba')).toBeCloseTo(1.05);
    expect(branchTrainingMultiplier(branches, 'br')).toBe(1);
    expect(branchUpgradeCost({ id: 'west_coast', tier: 3 })).toBe(Infinity);
  });
});
