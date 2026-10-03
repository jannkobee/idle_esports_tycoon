import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGameStore } from './useGameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState(), true);
    useGameStore.setState({
      cash: 100,
      hype: 10,
      energyCans: 5,
      lifetimeEarnings: 100,
      tapPower: 2,
      boostExpiresAt: 0,
      dailyAdsWatched: 0,
    });
  });

  afterEach(() => vi.useRealTimers());

  it('pays each daily sponsor milestone once and ignores duplicate completion', () => {
    for (let i = 0; i < 6; i++) {
      useGameStore.getState().requestAd('scout_vip_pull');
      useGameStore.getState().closeAdModal(true);
      useGameStore.getState().closeAdModal(true);
    }
    expect(useGameStore.getState().cash).toBe(55100);
    expect(useGameStore.getState().energyCans).toBe(10);
    expect(useGameStore.getState().dailyAdsWatched).toBe(6);
  });

  it('does not reward skipped ads or overwrite an active callback', () => {
    const first = vi.fn();
    const second = vi.fn();
    useGameStore.getState().requestAd('scout_vip_pull', first);
    useGameStore.getState().requestAd('boost_2x_income', second);
    useGameStore.getState().closeAdModal(false);
    expect(first).toHaveBeenCalledWith(false);
    expect(second).not.toHaveBeenCalled();
    expect(useGameStore.getState().dailyAdsWatched).toBe(0);
  });

  it('integrates fractional income across boost expiry', () => {
    useGameStore.setState({ lastSavedTimestamp: 1000, boostExpiresAt: 1500 });
    useGameStore.getState().tick(2000);
    expect(useGameStore.getState().cash).toBeCloseTo(101.515);
  });

  it('caps offline earnings, preserves unclaimed rewards, and claims only once', () => {
    vi.useFakeTimers();
    const start = 100000000;
    vi.setSystemTime(start + 12 * 3600000);
    useGameStore.setState({ lastSavedTimestamp: start, boostExpiresAt: start + 3600000 });
    useGameStore.getState().checkOfflineCatchup();
    const reward = useGameStore.getState().offlineModal!;
    expect(reward.offlineSeconds).toBe(28800);
    expect(reward.baseCash).toBeCloseTo(32400 * 1.01);
    useGameStore.getState().checkOfflineCatchup();
    expect(useGameStore.getState().offlineModal).toEqual(reward);
    useGameStore.getState().claimOfflineReward(true);
    useGameStore.getState().claimOfflineReward(true);
    expect(useGameStore.getState().cash).toBeCloseTo(100 + reward.baseCash * 3);
  });

  it('reloads saves without restoring an ad whose callback was lost', async () => {
    useGameStore.getState().requestAd('boost_2x_income');
    await useGameStore.persist.rehydrate();
    expect(useGameStore.getState().isSimulatedAdOpen).toBe(false);
    expect(useGameStore.getState().pendingCallback).toBeNull();
  });

  it('scouts the selected discipline and does not charge for maxed training', () => {
    const player = useGameStore.getState().scoutPlayer(true, 'fighting')!;
    expect(player.discipline).toBe('fighting');
    useGameStore.setState({ cash: 1000, roster: [{ ...player, stats: { ...player.stats, aim: 100 } }] });
    useGameStore.getState().trainPlayer(player.id, 'aim');
    expect(useGameStore.getState().cash).toBe(1000);
  });

  it('increments cash when tapping scrim', () => {
    const earned = useGameStore.getState().tapScrim();
    expect(earned).toBe(2);
    expect(useGameStore.getState().cash).toBe(102);
  });

  it('doubles tap earnings when 2x ad boost is active', () => {
    useGameStore.setState({ boostExpiresAt: Date.now() + 10000 });
    const earned = useGameStore.getState().tapScrim();
    expect(earned).toBe(4);
    expect(useGameStore.getState().cash).toBe(104);
  });

  it('adds boost hours correctly up to 8 hours maximum', () => {
    useGameStore.getState().addBoostHours(2);
    const status = useGameStore.getState().getBoostStatus();
    expect(status.isActive).toBe(true);
    expect(status.multiplier).toBe(2);
    expect(status.remainingSeconds).toBeGreaterThan(7000);
  });

  it('upgrades facility when cash is sufficient', () => {
    const success = useGameStore.getState().upgradeFacility('scrim_lab');
    expect(success).toBe(true);
    expect(useGameStore.getState().facilities.scrim_lab.level).toBe(2);
  });
});
