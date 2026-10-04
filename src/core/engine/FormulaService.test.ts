import { describe, it, expect } from 'vitest';
import { FormulaService } from './FormulaService';
import { Facility } from '../types/facility.types';

describe('FormulaService', () => {
  it('calculates upgrade cost with exponential scaling', () => {
    const baseCost = 100;
    expect(FormulaService.calculateUpgradeCost(baseCost, 0)).toBe(100);
    expect(FormulaService.calculateUpgradeCost(baseCost, 1)).toBe(115);
    expect(FormulaService.calculateUpgradeCost(baseCost, 2)).toBe(132);
  });

  it('calculates facility milestone bonuses correctly', () => {
    const mockFacility: Facility = {
      id: 'scrim_lab',
      name: 'PC Scrim Lab',
      category: 'training',
      description: 'Practice arena',
      level: 1,
      baseCost: 10,
      costMultiplier: 1.15,
      baseIncomePerSec: 5,
      icon: 'Monitor',
      isUnlocked: true,
      unlockCost: 0,
      requiredHype: 0,
    };

    // Level 1: 5 * 1 = 5
    expect(FormulaService.calculateFacilityIncome(mockFacility)).toBe(5);

    // Level 25: 5 * 25 * 1.5 = 187.5 -> 187.5
    mockFacility.level = 25;
    expect(FormulaService.calculateFacilityIncome(mockFacility)).toBe(187.5);

    // Level 50: 5 * 50 * 2 = 500
    mockFacility.level = 50;
    expect(FormulaService.calculateFacilityIncome(mockFacility)).toBe(500);
  });

  it('applies 2x ad boost to total income', () => {
    const facilities: Facility[] = [{
      id: 'scrim_lab',
      name: 'PC Scrim Lab',
      category: 'training',
      description: 'Practice arena',
      level: 10,
      baseCost: 10,
      costMultiplier: 1.15,
      baseIncomePerSec: 10,
      icon: 'Monitor',
      isUnlocked: true,
      unlockCost: 0,
      requiredHype: 0,
    }];

    const normalIncome = FormulaService.calculateTotalIncomePerSec(facilities, false, 0);
    const boostedIncome = FormulaService.calculateTotalIncomePerSec(facilities, true, 0);

    expect(boostedIncome).toBe(normalIncome * 2);
  });

  it('keeps baseline income positive before any room is unlocked', () => {
    expect(FormulaService.calculateTotalIncomePerSec([], false, 0)).toBe(1);
  });

  it('calculates offline earnings with 3x ad boost and respects 8h cap', () => {
    const now = 10000000;
    const oneHourAgo = now - (3600 * 1000);
    const incomePerSec = 10;

    const result = FormulaService.calculateOfflineEarnings(oneHourAgo, now, incomePerSec);
    expect(result.offlineSeconds).toBe(3600);
    expect(result.baseCashEarned).toBe(36000);
    expect(result.boostedCashEarned).toBe(108000); // 3x

    // 12 hours ago (capped at 8h = 28800s)
    const twelveHoursAgo = now - (12 * 3600 * 1000);
    const cappedResult = FormulaService.calculateOfflineEarnings(twelveHoursAgo, now, incomePerSec);
    expect(cappedResult.offlineSeconds).toBe(28800);
  });
});
