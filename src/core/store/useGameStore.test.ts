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

  it('earns automatically without player interaction', () => {
    useGameStore.setState({ lastSavedTimestamp: 1000 });
    useGameStore.getState().tick(11000);
    expect(useGameStore.getState().cash).toBeCloseTo(110.1);
    expect(useGameStore.getState()).not.toHaveProperty('tapScrim');
  });

  it('gives new recruits distinct generated portraits until the catalog is used', () => {
    for (let i = 0; i < 5; i++) useGameStore.getState().scoutPlayer(true);
    expect(new Set(useGameStore.getState().roster.map(p => p.portraitIndex)).size).toBe(6);
  });

  it('charges a card pack once and saves a role and potential with the recruited card', () => {
    useGameStore.setState({ cash: 1000 });
    const card = useGameStore.getState().buyCardPack('moba')!;
    expect(useGameStore.getState().cash).toBe(250);
    expect(card.discipline).toBe('moba');
    expect(card.potential).toBeGreaterThanOrEqual(card.stats.aim);
    expect(card.position).toBeDefined();
    expect(useGameStore.getState().buyCardPack('fps')).toBeNull();
  });

  it('persists circuit results and does not award the prize twice', () => {
    const state = useGameStore.getState();
    useGameStore.setState({ cash: 1000 });
    expect(state.startCircuit('fps', 1000)).toBe(true);
    expect(useGameStore.getState().circuitEvent?.rounds).toHaveLength(3);
    expect(state.playNextCircuitRound(999)).toBe(false);
  });

  it('persists bracket choices and never awards a completed match twice', async () => {
    useGameStore.setState({ cash: 1000 });
    const state = useGameStore.getState();
    expect(state.startCircuit('fps', 1000, 'fps_grassroots')).toBe(true);
    expect(useGameStore.getState().cash).toBe(900);
    expect(state.setCircuitVeto('Astra')).toBe(true);
    expect(state.setCircuitVeto('unknown')).toBe(false);
    expect(state.setCircuitTactic('macro')).toBe(true);
    await useGameStore.persist.rehydrate();
    const event = useGameStore.getState().circuitEvent!;
    expect(event.rounds[0]).toMatchObject({ bannedMap: 'Astra', tactic: 'macro' });
    expect(event.otherMatches).toHaveLength(4);
    expect(useGameStore.getState().playNextCircuitRound(1000)).toBe(true);
    const cash = useGameStore.getState().cash;
    expect(useGameStore.getState().playNextCircuitRound(1000)).toBe(false);
    expect(useGameStore.getState().cash).toBe(cash);
  });

  it('converts only bench duplicates and spends points below individual potential', () => {
    const starter = useGameStore.getState().roster[0];
    const duplicate = { ...starter, id: 'duplicate', role: 'sub' as const };
    useGameStore.setState({ roster: [starter, duplicate], developmentPoints: 0, teamLineups: { fps: { rifler_1: starter.id } } });
    expect(useGameStore.getState().convertDuplicateCard(starter.id)).toBe(0);
    expect(useGameStore.getState().convertDuplicateCard(duplicate.id)).toBe(2);
    expect(useGameStore.getState().convertDuplicateCard(duplicate.id)).toBe(0);
    const before = useGameStore.getState().roster[0].stats.aim;
    expect(useGameStore.getState().developPlayer(starter.id, 'mechanics')).toBe(true);
    expect(useGameStore.getState().roster[0].stats.aim).toBe(before + 1);
    expect(useGameStore.getState().developmentPoints).toBe(1);
    expect(useGameStore.getState().developPlayer(starter.id, 'mechanics')).toBe(true);
    expect(useGameStore.getState().developPlayer(starter.id, 'mechanics')).toBe(false);
  });

  it('swaps cards between saved lineup slots and rejects cards from another discipline', async () => {
    const starter = useGameStore.getState().roster[0];
    const second = { ...starter, id: 'p_second', position: 'awper' as const, handle: 'Second' };
    useGameStore.setState({ roster: [starter, second] });
    const store = useGameStore.getState();
    store.autoFillTeamLineup('fps');
    expect(useGameStore.getState().teamLineups.fps?.awper).toBe(second.id);
    expect(store.assignLineupSlot('fps', 'rifler_1', second.id)).toBe(true);
    expect(useGameStore.getState().teamLineups.fps?.rifler_1).toBe(second.id);
    expect(useGameStore.getState().teamLineups.fps?.awper).toBe(starter.id);
    expect(store.assignLineupSlot('fps', 'awper', second.id)).toBe(true);
    expect(useGameStore.getState().teamLineups.fps?.awper).toBe(second.id);
    expect(store.assignLineupSlot('fps', 'awper', 'unknown')).toBe(false);
    expect(store.assignLineupSlot('moba', 'top', starter.id)).toBe(false);
    const save = localStorage.getItem('esports_dynasty_save_v1');
    expect(save).toContain('p_second');
    await useGameStore.persist.rehydrate();
    expect(useGameStore.getState().teamLineups.fps?.awper).toBe(second.id);
  });

  it('upgrades a legacy save without losing progress or retaining tap mechanics', async () => {
    const initial = useGameStore.getState();
    localStorage.setItem('esports_dynasty_save_v1', JSON.stringify({ version: 1, state: {
      cash: 1234, tapPower: 2, roster: [{ ...initial.roster[0], portraitIndex: undefined, avatar: 'https://old.example/player.png' }],
    } }));
    await useGameStore.persist.rehydrate();
    const updated = useGameStore.getState();
    expect(updated.cash).toBe(1234);
    expect(updated.roster[0].portraitIndex).toBe(0);
    expect(updated.roster[0].stats).toEqual(initial.roster[0].stats);
    expect(updated.roster[0]).not.toHaveProperty('avatar');
    expect(updated).not.toHaveProperty('tapPower');
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

  it('upgrades the district and gives an outdoor treat run an Inspired recovery buff', () => {
    const starter = useGameStore.getState().roster[0];
    useGameStore.setState({ cash: 20000, roster: [{ ...starter, mood: 50, energy: 40 }] });
    expect(useGameStore.getState().upgradeDistrict()).toBe(true);
    expect(useGameStore.getState().empire.districtTier).toBe(2);
    useGameStore.getState().takeOutdoorBreak(starter.id);
    const refreshed = useGameStore.getState().roster[0];
    expect(refreshed.mood).toBeGreaterThan(50);
    expect(refreshed.energy).toBeGreaterThan(40);
    expect(refreshed.inspiredUntil).toBeGreaterThan(Date.now());
  });

  it('keeps empire fields optional when hydrating a v1-era save', async () => {
    localStorage.setItem('esports_dynasty_save_v1', JSON.stringify({ version: 1, state: { cash: 777 } }));
    await useGameStore.persist.rehydrate();
    const empire = useGameStore.getState().empire;
    expect(empire.districtTier).toBe(1);
    expect(empire.schedule).toEqual(['scrim', 'vod', 'gym', 'outdoor', 'rest']);
    expect(empire.branding.name).toBe('Dynasty Esports');
  });

  describe('Power Rankings and Tournament Circuit', () => {
    it('initializes with 12 world esports teams including Dynasty Esports', () => {
      const rankings = useGameStore.getState().powerRankings;
      expect(rankings.length).toBe(12);
      const playerTeam = rankings.find(t => t.isPlayerTeam);
      expect(playerTeam).toBeDefined();
      expect(playerTeam?.name).toBe('Dynasty Esports');
      expect(playerTeam?.rank).toBeGreaterThanOrEqual(1);
      expect(playerTeam?.rank).toBeLessThanOrEqual(12);
    });

    it('updates elo rating, form, and rankings upon tournament victory', () => {
      const initialRankings = useGameStore.getState().powerRankings;
      const initialPlayer = initialRankings.find(t => t.isPlayerTeam)!;
      const initialRating = initialPlayer.rating;
      const initialWins = initialPlayer.wins;

      useGameStore.getState().recordTournamentOutcome(true, 'fps_grassroots', 'karmine_corp');

      const updatedRankings = useGameStore.getState().powerRankings;
      const updatedPlayer = updatedRankings.find(t => t.isPlayerTeam)!;
      expect(updatedPlayer.rating).toBeGreaterThan(initialRating);
      expect(updatedPlayer.wins).toBe(initialWins + 1);
      expect(updatedPlayer.form[updatedPlayer.form.length - 1]).toBe('W');
    });

    it('penalizes elo rating and records loss upon tournament defeat', () => {
      const initialPlayer = useGameStore.getState().powerRankings.find(t => t.isPlayerTeam)!;
      const initialRating = initialPlayer.rating;
      const initialLosses = initialPlayer.losses;

      useGameStore.getState().recordTournamentOutcome(false, 'fps_grassroots', 'karmine_corp');

      const updatedPlayer = useGameStore.getState().powerRankings.find(t => t.isPlayerTeam)!;
      expect(updatedPlayer.rating).toBeLessThan(initialRating);
      expect(updatedPlayer.losses).toBe(initialLosses + 1);
      expect(updatedPlayer.form[updatedPlayer.form.length - 1]).toBe('L');
    });
  });
});
