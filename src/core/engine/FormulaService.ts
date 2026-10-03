import { Facility } from '../types/facility.types';

export class FormulaService {
  /**
   * Calculates the cost to upgrade a facility to the next level.
   * Standard exponential curve: Cost = BaseCost * (1.15)^Level
   */
  static calculateUpgradeCost(
    baseCost: number,
    currentLevel: number,
    multiplier: number = 1.15
  ): number {
    if (currentLevel < 0) return baseCost;
    return Math.round(baseCost * Math.pow(multiplier, currentLevel));
  }

  /**
   * Calculates the cumulative cost to buy N levels at once.
   */
  static calculateBulkUpgradeCost(
    baseCost: number,
    currentLevel: number,
    count: number,
    multiplier: number = 1.15
  ): number {
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += this.calculateUpgradeCost(baseCost, currentLevel + i, multiplier);
    }
    return total;
  }

  /**
   * Income of an individual facility.
   * Income = BaseIncome * Level * MilestoneBonus (2x at lvl 25, 50, 100)
   */
  static calculateFacilityIncome(facility: Facility): number {
    if (!facility.isUnlocked || facility.level <= 0) return 0;

    let milestoneMultiplier = 1;
    if (facility.level >= 100) milestoneMultiplier *= 4;
    else if (facility.level >= 50) milestoneMultiplier *= 2;
    else if (facility.level >= 25) milestoneMultiplier *= 1.5;

    return facility.baseIncomePerSec * facility.level * milestoneMultiplier;
  }

  /**
   * Calculates total income per second across all facilities,
   * factoring in Hype multiplier and active Rewarded Ad 2X boost.
   */
  static calculateTotalIncomePerSec(
    facilities: Facility[],
    isBoostActive: boolean,
    hype: number
  ): number {
    const rawFacilityIncome = facilities.reduce((sum, fac) => {
      return sum + this.calculateFacilityIncome(fac);
    }, 0);

    // Baseline minimum income if at least 1 facility unlocked
    const baseIncome = Math.max(rawFacilityIncome, facilities.some(f => f.isUnlocked) ? 1 : 0);

    // Hype multiplier: Every 50 Hype provides +5% global boost
    const hypeMultiplier = 1 + (Math.max(0, hype) * 0.001);

    // Rewarded Video 2x Boost
    const adMultiplier = isBoostActive ? 2 : 1;

    return baseIncome * hypeMultiplier * adMultiplier;
  }

  /** Integrate income across boost expiry; keep fractional cash between ticks. */
  static calculateIntervalIncome(start: number, end: number, income: number, boostExpiresAt: number): number {
    const seconds = Math.max(0, (end - start) / 1000);
    const boostedSeconds = Math.max(0, (Math.min(end, boostExpiresAt) - start) / 1000);
    return income * (seconds + boostedSeconds);
  }

  /**
   * Calculates offline progression when the player returns.
   */
  static calculateOfflineEarnings(
    lastSavedTimestamp: number,
    currentTimestamp: number,
    incomePerSec: number,
    maxOfflineSeconds: number = 28800 // 8 hours default cap
  ): {
    offlineSeconds: number;
    baseCashEarned: number;
    boostedCashEarned: number;
  } {
    if (!lastSavedTimestamp || currentTimestamp <= lastSavedTimestamp) {
      return { offlineSeconds: 0, baseCashEarned: 0, boostedCashEarned: 0 };
    }

    const elapsedSeconds = Math.floor((currentTimestamp - lastSavedTimestamp) / 1000);
    // Ignore small intervals under 15 seconds to prevent popup spam
    if (elapsedSeconds < 15) {
      return { offlineSeconds: 0, baseCashEarned: 0, boostedCashEarned: 0 };
    }

    const eligibleSeconds = Math.min(elapsedSeconds, maxOfflineSeconds);
    const baseCashEarned = Math.floor(eligibleSeconds * incomePerSec);
    // Rewarded ad triples (3x) the offline return
    const boostedCashEarned = baseCashEarned * 3;

    return {
      offlineSeconds: eligibleSeconds,
      baseCashEarned,
      boostedCashEarned,
    };
  }

  /**
   * Prestige / Season Rebrand trophy calculation based on lifetime earnings.
   * Trophies = floor(15 * sqrt(lifetimeEarnings / 1,000,000))
   */
  static calculatePrestigeTrophies(lifetimeEarnings: number): number {
    if (lifetimeEarnings < 1000000) return 0;
    return Math.floor(15 * Math.sqrt(lifetimeEarnings / 1000000));
  }
}
