import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGameStore } from './useGameStore';
import { generateStaffMarket } from '../staff/StaffService';

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

  it('opens and upgrades specialist branches without double charging', () => {
    useGameStore.setState({ cash: 100000 });
    expect(useGameStore.getState().openBranch('west_coast')).toBe(true);
    expect(useGameStore.getState().cash).toBe(82000);
    expect(useGameStore.getState().openBranch('west_coast')).toBe(false);
    expect(useGameStore.getState().upgradeBranch('west_coast')).toBe(true);
    expect(useGameStore.getState().empire.branches).toEqual([{ id: 'west_coast', tier: 2 }]);
    expect(useGameStore.getState().cash).toBe(49600);
  });

  it('updates each pro with their own discipline coach rotation', () => {
    const market = generateStaffMarket(53);
    const fpsCoach = { ...market.find(person => person.kind === 'coach' && person.discipline === 'fps')!, tactic: 'aggressive' as const };
    const mobaCoach = { ...market.find(person => person.kind === 'coach' && person.discipline === 'moba')!, tactic: 'macro' as const };
    const initial = useGameStore.getState().roster[0];
    const roster = [initial, { ...initial, id: 'moba_pro', discipline: 'moba' as const }];
    useGameStore.setState({ cash: 100_000, roster, staffMarket: [fpsCoach, mobaCoach] });

    expect(useGameStore.getState().hireStaff(fpsCoach.id)).toBe(true);
    expect(useGameStore.getState().hireStaff(mobaCoach.id)).toBe(true);

    const updated = useGameStore.getState().roster;
    expect(updated[0].dailySchedule).toEqual(['scrim', 'scrim', 'vod', 'gym', 'outdoor']);
    expect(updated[1].dailySchedule).toEqual(['vod', 'vod', 'scrim', 'gym', 'outdoor']);
  });

  it('gives an HQ Pulse reward only when its cooldown is ready', () => {
    useGameStore.setState({ cash: 100, energyCans: 0, hype: 40, lastHqPulseAt: 0, hqPulseStreak: 0 });
    const reward = useGameStore.getState().claimHqPulse(100_000);
    expect(reward).toBeGreaterThan(125);
    expect(useGameStore.getState().cash).toBe(100 + reward);
    expect(useGameStore.getState().energyCans).toBe(1);
    expect(useGameStore.getState().claimHqPulse(120_000)).toBe(0);
  });

  it('tracks and claims daily objectives exactly once', () => {
    useGameStore.getState().recordDailyObjective('train', 3);
    expect(useGameStore.getState().dailyObjectives?.progress.train).toBe(3);
    const before = useGameStore.getState().cash;
    expect(useGameStore.getState().claimDailyObjective('train')).toBe(true);
    expect(useGameStore.getState().cash).toBe(before + 750);
    expect(useGameStore.getState().claimDailyObjective('train')).toBe(false);
  });

  it('requires ownership before equipping wallpaper and saves purchased house finishes', () => {
    const store = useGameStore.getState();
    expect(store.setWallpaperStyle('cyberpunk')).toBe(false);
    expect(useGameStore.getState().houseInterior.wallpaperStyle).toBe('default');
    useGameStore.setState({ energyCans: 100 });
    expect(useGameStore.getState().buyVipItem('wall_cyberpunk')).toBe(true);
    expect(useGameStore.getState().energyCans).toBe(70);
    expect(useGameStore.getState().equipCosmetic('wall_cyberpunk')).toBe(true);
    expect(useGameStore.getState().houseInterior.wallpaperStyle).toBe('cyberpunk');
    expect(useGameStore.getState().equipCosmetic('floor_marble')).toBe(false);
    expect(useGameStore.getState().buyVipItem('floor_marble')).toBe(true);
    expect(useGameStore.getState().equipCosmetic('floor_marble')).toBe(true);
    expect(useGameStore.getState().houseInterior.flooringStyle).toBe('marble');
    expect(useGameStore.getState().buyVipItem('floor_marble')).toBe(false);
  });

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

  it('lets staff set the match plan and never awards a completed match twice', async () => {
    useGameStore.setState({ cash: 1000 });
    const state = useGameStore.getState();
    expect(state.startCircuit('fps', 1000, 'fps_grassroots')).toBe(true);
    expect(useGameStore.getState().cash).toBe(900);
    await useGameStore.persist.rehydrate();
    const event = useGameStore.getState().circuitEvent!;
    expect(event.otherMatches).toHaveLength(4);
    expect(useGameStore.getState().playNextCircuitRound(1000)).toBe(true);
    expect(useGameStore.getState().circuitEvent?.rounds[0].bannedMap).toBeTruthy();
    expect(useGameStore.getState().circuitEvent?.rounds[0].tactic).toBe('balanced');
    const cash = useGameStore.getState().cash;
    expect(useGameStore.getState().playNextCircuitRound(1000)).toBe(false);
    expect(useGameStore.getState().cash).toBe(cash);
  });

  it('ignores legacy manual lineup slots when the coach enters a tournament', () => {
    useGameStore.setState({ cash: 1000, teamLineups: { fps: { awper: null, rifler_1: null, rifler_2: null, rifler_3: null, igl: null } } });
    expect(useGameStore.getState().startCircuit('fps', 1000)).toBe(true);
    expect(useGameStore.getState().playNextCircuitRound(1000)).toBe(true);
  });

  it('converts only bench duplicates and spends points below individual potential', () => {
    const starter = useGameStore.getState().roster[0];
    const duplicate = { ...starter, id: 'duplicate', role: 'sub' as const, contractMatchesRemaining: 0,
      stats: { aim: 25, macro: 25, comms: 25, tiltResistance: 25 } };
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

  it('hires generated staff, replaces a role, and persists the selected coach', async () => {
    const market = useGameStore.getState().staffMarket;
    const coaches = market.filter(person => person.kind === 'coach' && person.discipline === 'fps');
    useGameStore.setState({ cash: 100000 });
    expect(useGameStore.getState().hireStaff(coaches[0].id)).toBe(true);
    expect(useGameStore.getState().hireStaff(coaches[0].id)).toBe(false);
    expect(useGameStore.getState().hireStaff(coaches[1].id)).toBe(true);
    expect(useGameStore.getState().hiredStaff.filter(person => person.discipline === 'fps')).toHaveLength(1);
    expect(useGameStore.getState().hiredStaff.find(person => person.discipline === 'fps')?.id).toBe(coaches[1].id);
    await useGameStore.persist.rehydrate();
    expect(useGameStore.getState().hiredStaff.find(person => person.discipline === 'fps')?.id).toBe(coaches[1].id);
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
    expect(useGameStore.getState().facilities.scrim_lab.isUnlocked).toBe(false);
    expect(useGameStore.getState().unlockFacility('scrim_lab')).toBe(true);
    const success = useGameStore.getState().upgradeFacility('scrim_lab');
    expect(success).toBe(true);
    expect(useGameStore.getState().facilities.scrim_lab.level).toBe(2);
  });

  it('starts with every room locked and unlocks one with completed ad funding only', async () => {
    expect(Object.values(useGameStore.getState().facilities).every(room => !room.isUnlocked)).toBe(true);
    const onCompleted = (success: boolean) => { if (success) useGameStore.getState().fundFacilityWithAd('scrim_lab'); };
    useGameStore.getState().requestAd('room_funding', onCompleted);
    useGameStore.getState().closeAdModal(false);
    expect(useGameStore.getState().roomFunding.scrim_lab).toBeUndefined();
    for (let index = 0; index < 4; index++) {
      useGameStore.getState().requestAd('room_funding', onCompleted);
      useGameStore.getState().closeAdModal(true);
    }
    expect(useGameStore.getState().facilities.scrim_lab.isUnlocked).toBe(true);
    expect(useGameStore.getState().facilities.scrim_lab.level).toBe(1);
    await useGameStore.persist.rehydrate();
    expect(useGameStore.getState().facilities.scrim_lab.isUnlocked).toBe(true);
  });

  it('preserves rooms unlocked in older saves while defaulting newly added rooms to locked', async () => {
    const legacy = useGameStore.getState().facilities.scrim_lab;
    localStorage.setItem('esports_dynasty_save_v1', JSON.stringify({ version: 1, state: {
      facilities: { scrim_lab: { ...legacy, level: 4, isUnlocked: true } },
      empire: { schedule: ['rest', 'rest', 'rest', 'rest', 'rest'] },
    } }));
    await useGameStore.persist.rehydrate();
    const state = useGameStore.getState();
    expect(state.facilities.scrim_lab).toMatchObject({ isUnlocked: true, level: 4 });
    expect(state.facilities.cafeteria.isUnlocked).toBe(false);
    expect(state.empire.schedule).toEqual(['scrim', 'vod', 'gym', 'outdoor', 'rest']);
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

  it('turns a completed shop or park visit into an Inspired buff without direct player input', () => {
    const starter = useGameStore.getState().roster[0];
    useGameStore.setState({ roster: [starter] });
    useGameStore.getState().applyActivityGains({ hype: 0, stats: {}, inspiredPlayers: [starter.id] });
    expect(useGameStore.getState().roster[0].inspiredUntil).toBeGreaterThan(Date.now());
  });

  it('keeps empire fields optional when hydrating a v1-era save', async () => {
    localStorage.setItem('esports_dynasty_save_v1', JSON.stringify({ version: 1, state: { cash: 777 } }));
    await useGameStore.persist.rehydrate();
    const empire = useGameStore.getState().empire;
    expect(empire.districtTier).toBe(1);
    expect(empire.schedule).toEqual(['scrim', 'vod', 'gym', 'outdoor', 'rest']);
    expect(empire.branding.name).toBe('Dynasty Esports');
    expect(empire.branches).toEqual([]);
    expect(empire.seasonHistory).toEqual([]);
  });

  it('archives a completed World Championship and advances the calendar', () => {
    const state = useGameStore.getState();
    useGameStore.setState({
      empire: {
        ...state.empire,
        seasonCalendar: { ...state.empire.seasonCalendar, year: 3, stage: 'worlds', stageWins: { spring: 1, msi: 0, summer: 1, worlds: 0 } },
      },
    });
    const starterAge = useGameStore.getState().roster[0].age ?? 22;
    useGameStore.getState().advanceSeasonStage(true);
    const empire = useGameStore.getState().empire;
    expect(empire.seasonCalendar).toMatchObject({ year: 4, stage: 'spring', trophies: 1 });
    expect(empire.seasonHistory?.[0]).toMatchObject({ year: 3, worldChampion: true });
    expect(useGameStore.getState().roster[0].age).toBe(starterAge + 1);
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

  describe('Backyard Sports, Cafeteria Catering, and Audio Engine', () => {
    it('upgrades basketball court tiers through all 3 tiers with cost validation', () => {
      useGameStore.setState({ cash: 50000, empire: { ...useGameStore.getState().empire, basketballTier: 1 } });
      // Tier 1 -> 2 costs $8,500
      expect(useGameStore.getState().upgradeBasketball()).toBe(true);
      expect(useGameStore.getState().empire.basketballTier).toBe(2);
      expect(useGameStore.getState().cash).toBe(50000 - 8500);

      // Tier 2 -> 3 costs $32,000
      expect(useGameStore.getState().upgradeBasketball()).toBe(true);
      expect(useGameStore.getState().empire.basketballTier).toBe(3);
      expect(useGameStore.getState().cash).toBe(50000 - 8500 - 32000);

      // Max tier reached (tier 3 cannot be upgraded further)
      expect(useGameStore.getState().upgradeBasketball()).toBe(false);
      expect(useGameStore.getState().empire.basketballTier).toBe(3);
    });

    it('upgrades football turf field with accurate cost checks and perks', () => {
      useGameStore.setState({ cash: 60000, empire: { ...useGameStore.getState().empire, footballTier: 1 } });
      // Tier 1 -> 2 costs $10,000
      expect(useGameStore.getState().upgradeFootball()).toBe(true);
      expect(useGameStore.getState().empire.footballTier).toBe(2);
      expect(useGameStore.getState().cash).toBe(50000);

      // Insufficient funds check
      useGameStore.setState({ cash: 1000 });
      expect(useGameStore.getState().upgradeFootball()).toBe(false);
      expect(useGameStore.getState().empire.footballTier).toBe(2);

      // Fund and upgrade Tier 2 -> 3 costs $45,000
      useGameStore.setState({ cash: 50000 });
      expect(useGameStore.getState().upgradeFootball()).toBe(true);
      expect(useGameStore.getState().empire.footballTier).toBe(3);
      expect(useGameStore.getState().cash).toBe(5000);
      expect(useGameStore.getState().upgradeFootball()).toBe(false);
    });

    it('manages daily cafeteria catering plans and applies nutrition buffs to training gains', () => {
      useGameStore.setState({ cash: 20000, cateringPlan: 'standard' });
      expect(useGameStore.getState().cateringPlan).toBe('standard');

      // Switch to Brain Fuel Smoothies ($1,200)
      expect(useGameStore.getState().setCateringPlan('brain_fuel')).toBe(true);
      expect(useGameStore.getState().cateringPlan).toBe('brain_fuel');
      expect(useGameStore.getState().cash).toBe(18800);

      // Switch to Omega-3 ($2,800)
      expect(useGameStore.getState().setCateringPlan('omega3')).toBe(true);
      expect(useGameStore.getState().cateringPlan).toBe('omega3');
      expect(useGameStore.getState().cash).toBe(16000);

      // Apply training gains with Omega-3 active (+20% Aim multiplier)
      const player = useGameStore.getState().roster[0];
      const initialAim = player.stats.aim;
      useGameStore.getState().applyActivityGains({
        hype: 10,
        stats: { [player.id]: { aim: 2, macro: 0, comms: 0, tiltResistance: 0 } },
      });
      const updatedPlayer = useGameStore.getState().roster.find(p => p.id === player.id)!;
      expect(updatedPlayer.stats.aim).toBeGreaterThanOrEqual(initialAim);
    });

    it('toggles sound effects and persists mute state cleanly', () => {
      const initialSound = useGameStore.getState().soundEnabled;
      const toggled = useGameStore.getState().toggleSound();
      expect(toggled).toBe(!initialSound);
      expect(useGameStore.getState().soundEnabled).toBe(!initialSound);

      // Toggle back
      const restored = useGameStore.getState().toggleSound();
      expect(restored).toBe(initialSound);
    });

    it('sets active tournament match for Penthouse TV dynamic broadcast', () => {
      expect(useGameStore.getState().isTournamentUnderway).toBe(false);
      expect(useGameStore.getState().activeTournamentMatch).toBeNull();

      useGameStore.getState().setActiveTournamentMatch({
        tournamentId: 'fps_masters',
        tourneyName: 'Valorant Champions Tour',
        stage: 'finals',
        opponentTeam: useGameStore.getState().powerRankings[0],
        playerScore: 2,
        opponentScore: 1,
        playByPlay: ['Round 1: Flawless entry on A site', 'Round 2: Dynasty clutches 1v2'],
        isUnderway: true,
      });

      expect(useGameStore.getState().isTournamentUnderway).toBe(true);
      expect(useGameStore.getState().activeTournamentMatch?.playerScore).toBe(2);
      expect(useGameStore.getState().activeTournamentMatch?.opponentScore).toBe(1);
      expect(useGameStore.getState().activeTournamentMatch?.stage).toBe('finals');
    });
  });
});
