import { beforeEach, describe, expect, it } from 'vitest';
import { HOUSE_ROOMS } from '../engine/HouseLayout';
import { useGameStore } from '../store/useGameStore';
import { Facility, FacilityId } from '../types/facility.types';
import { ActivityGains } from '../types/house.types';
import { ProPlayer } from '../types/player.types';
import {
  calculateCapMultiplier,
  calculateEnergyEfficiency,
  calculateRoomMultiplier,
} from './activities';
import { FRONT_DOOR_SPAWN, HOUSE_STATIONS } from './houseGeometry';
import { findAStarPath, getNavGrid, NavContext } from './navigation';
import { createRng } from './rng';
import {
  createHouseSim,
  findBestStation,
  getOccupiedStationIds,
  pickNextActivity,
  stepHouseSim,
  syncHouseSim,
  takeGains,
} from './simulation';

const TEST_FACILITIES: Record<FacilityId, Facility> = {
  scrim_lab: {
    id: 'scrim_lab',
    name: 'PC Scrim Lab',
    category: 'training',
    description: 'Basement rigs',
    level: 1,
    baseCost: 15,
    costMultiplier: 1.15,
    baseIncomePerSec: 1,
    icon: 'Monitor',
    isUnlocked: true,
    unlockCost: 0,
    requiredHype: 0,
  },
  streaming_pod: {
    id: 'streaming_pod',
    name: 'Streaming Pods',
    category: 'content',
    description: 'Acoustic booths',
    level: 1,
    baseCost: 120,
    costMultiplier: 1.16,
    baseIncomePerSec: 8,
    icon: 'Video',
    isUnlocked: false,
    unlockCost: 200,
    requiredHype: 25,
  },
  gym: {
    id: 'gym',
    name: 'Fitness Gym',
    category: 'wellness',
    description: 'Gym equipment',
    level: 1,
    baseCost: 800,
    costMultiplier: 1.17,
    baseIncomePerSec: 45,
    icon: 'Dumbbell',
    isUnlocked: false,
    unlockCost: 1500,
    requiredHype: 100,
  },
  analyst_room: {
    id: 'analyst_room',
    name: 'War Room',
    category: 'strategy',
    description: 'VOD analysis',
    level: 1,
    baseCost: 5000,
    costMultiplier: 1.18,
    baseIncomePerSec: 250,
    icon: 'Activity',
    isUnlocked: false,
    unlockCost: 8000,
    requiredHype: 500,
  },
  merch_store: {
    id: 'merch_store',
    name: 'Merchandise Studio',
    category: 'commerce',
    description: 'Team jerseys',
    level: 1,
    baseCost: 35000,
    costMultiplier: 1.2,
    baseIncomePerSec: 1500,
    icon: 'ShoppingBag',
    isUnlocked: false,
    unlockCost: 50000,
    requiredHype: 2000,
  },
  cafeteria: {
    id: 'cafeteria',
    name: 'Pro Dining & Nutrition Bar',
    category: 'wellness',
    description: 'Chef-prepared meals',
    level: 1,
    baseCost: 8000,
    costMultiplier: 1.18,
    baseIncomePerSec: 350,
    icon: 'Coffee',
    isUnlocked: false,
    unlockCost: 15000,
    requiredHype: 600,
  },
};

function createTestRoster(count = 6): ProPlayer[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player_${i}`,
    name: `Player ${i}`,
    handle: `P${i}`,
    portraitIndex: i % 6,
    discipline: 'fps',
    rarity: i === 0 ? 'silver' : 'bronze',
    role: i < 5 ? 'starter' : 'sub',
    level: 1,
    salaryPerSec: 0.5,
    stats: {
      aim: 50,
      macro: 40,
      comms: 45,
      tiltResistance: 50,
    },
  }));
}

describe('House Simulation Engine', () => {
  let roster: ProPlayer[];

  beforeEach(() => {
    roster = createTestRoster(6);
    useGameStore.setState(useGameStore.getInitialState(), true);
  });

  describe('Station Occupancy', () => {
    it('ensures each station holds at most one agent at any time', () => {
      const sim = createHouseSim(roster, TEST_FACILITIES, 12345);
      const occupied = getOccupiedStationIds(sim.agents);
      expect(occupied.size).toBe(sim.agents.filter(a => a.stationId || a.targetStationId).length);

      // Step simulation for 60 seconds (600 steps of 0.1s)
      for (let step = 0; step < 600; step++) {
        stepHouseSim(sim, 0.1, roster);
        const currentStations = sim.agents
          .map(a => a.stationId)
          .filter((id): id is string => Boolean(id));
        const uniqueStations = new Set(currentStations);
        expect(currentStations.length).toBe(uniqueStations.size);
      }
    });

    it('assigns available stations respecting room lock state and minLevel', () => {
      const sim = createHouseSim(roster, TEST_FACILITIES, 12345);
      for (const agent of sim.agents) {
        if (agent.stationId) {
          const station = HOUSE_STATIONS.find(s => s.id === agent.stationId)!;
          if (station.area !== 'hall') {
            expect(station.area).toBe('scrim_lab');
          }
        }
      }
    });
  });

  describe('Activity Transitions', () => {
    it('treats staff blocks as weighted guidance and offers optional sports', () => {
      const player: ProPlayer = { ...roster[0], dailySchedule: ['vod', 'scrim', 'gym', 'outdoor', 'rest'],
        sportsPreference: 'basketball' };
      const sim = createHouseSim([player], TEST_FACILITIES, 42);
      const agent = { ...sim.agents[0], energy: 90, workStreak: 0, activity: 'practice' as const };
      const unlocked = new Set<FacilityId>(['scrim_lab', 'analyst_room']);
      let reviewCount = 0, practiceCount = 0;
      for (let seed = 0; seed < 200; seed++) {
        const activity = pickNextActivity(agent, unlocked, createRng(seed), player, 0);
        if (activity === 'review') reviewCount++;
        if (activity === 'practice') practiceCount++;
      }
      expect(reviewCount).toBeGreaterThan(practiceCount);
      expect(practiceCount).toBeGreaterThan(0);
      expect(findBestStation(agent, 'break', [], unlocked, sim.facilityLevels, 'basketball')?.id).toBe('patio_basketball_hoop');
      expect(findBestStation(agent, 'break', [], unlocked, sim.facilityLevels, 'football')?.id).toBe('outside_football_drills');
      expect(['patio_basketball_hoop', 'outside_football_drills']).not.toContain(findBestStation(agent, 'break', [], unlocked, sim.facilityLevels)?.id);
      expect(getNavGrid({ unlockedFacilities: unlocked, facilityLevels: sim.facilityLevels }).isPointWalkable(8.1, 14.6)).toBe(true);
      const outdoorGrid = getNavGrid({ unlockedFacilities: unlocked, facilityLevels: sim.facilityLevels });
      for (const stationId of ['patio_basketball_hoop', 'outside_football_drills']) {
        const station = HOUSE_STATIONS.find(candidate => candidate.id === stationId)!;
        const path = findAStarPath(outdoorGrid, FRONT_DOOR_SPAWN, station.approach);
        expect(path.length).toBeGreaterThan(2);
        expect(path.at(-1)?.x).toBeCloseTo(station.approach.x, 0);
      }
      expect(getNavGrid({ unlockedFacilities: unlocked, facilityLevels: sim.facilityLevels }).isPointWalkable(-2.7, 12.1)).toBe(false);
      const withCafe = new Set<FacilityId>([...unlocked, 'cafeteria']);
      expect(findBestStation(agent, 'break', [], withCafe, { ...sim.facilityLevels, cafeteria: 1 })?.id).toBeDefined();
      expect(getNavGrid({ unlockedFacilities: withCafe, facilityLevels: { ...sim.facilityLevels, cafeteria: 1 } }).isPointWalkable(-2.7, 12.1)).toBe(true);
    });
    it('forces a break when energy drops below 40 or workStreak >= 2', () => {
      const rng = createRng(42);
      const agent = {
        id: 'p1',
        name: 'P1',
        handle: 'P1',
        portraitIndex: 0,
        x: 0,
        y: 0,
        facing: 'ne' as const,
        pose: 'sit' as const,
        speed: 2,
        energy: 35, // Below 40
        workStreak: 0,
        lastWork: 'practice' as const,
        seed: 1,
        mode: 'working' as const,
        stationId: 'scrim_station_0',
        targetStationId: null,
        path: [],
        activity: 'practice' as const,
        timer: 10,
        energizedTimer: 0,
        waitTimer: 0,
      };

      const unlocked = new Set<FacilityId>(['scrim_lab']);
      expect(pickNextActivity(agent, unlocked, rng)).toBe('break');

      agent.energy = 80;
      agent.workStreak = 2; // 2 consecutive work blocks
      expect(pickNextActivity(agent, unlocked, rng)).toBe('break');
    });

    it('weights previous activity by 2.5x after returning from a break', () => {
      const agent = {
        id: 'p1',
        name: 'P1',
        handle: 'P1',
        portraitIndex: 0,
        x: 0,
        y: 0,
        facing: 'ne' as const,
        pose: 'sit' as const,
        speed: 2,
        energy: 90,
        workStreak: 0,
        lastWork: 'stream' as const,
        seed: 1,
        mode: 'working' as const,
        stationId: null,
        targetStationId: null,
        path: [],
        activity: 'break' as const,
        timer: 0,
        energizedTimer: 0,
        waitTimer: 0,
      };

      const unlocked = new Set<FacilityId>(['scrim_lab', 'streaming_pod']);
      let streamCount = 0;
      const trials = 1000;
      for (let i = 0; i < trials; i++) {
        const rng = createRng(i);
        const act = pickNextActivity(agent, unlocked, rng);
        if (act === 'stream') streamCount++;
      }
      // Stream weight is 2.5, practice is 1.0 -> stream probability should be ~2.5 / 3.5 ≈ 71%
      expect(streamCount / trials).toBeGreaterThan(0.6);
    });
  });

  describe('Locked-Room Routing and Stuck Recovery', () => {
    it('prevents navigation through or into locked rooms', () => {
      const context: NavContext = {
        unlockedFacilities: new Set<FacilityId>(['scrim_lab']),
        facilityLevels: { scrim_lab: 1, streaming_pod: 0, gym: 0, analyst_room: 0, merch_store: 0, cafeteria: 0 },
      };
      const grid = getNavGrid(context);

      // Verify that center points inside locked rooms are strictly non-walkable
      for (const room of HOUSE_ROOMS) {
        if (room.id !== 'scrim_lab') {
          const centerX = room.x + room.w / 2;
          const centerY = room.y + room.d / 2;
          expect(grid.isPointWalkable(centerX, centerY)).toBe(false);
        }
      }
    });

    it('recovers stuck agents placed in obstacles or newly locked rooms', () => {
      const context: NavContext = {
        unlockedFacilities: new Set<FacilityId>(['scrim_lab']),
        facilityLevels: { scrim_lab: 1, streaming_pod: 0, gym: 0, analyst_room: 0, merch_store: 0, cafeteria: 0 },
      };
      const grid = getNavGrid(context);

      // Place a point inside the locked gym: (x: 8.5, y: 10.0)
      const stuckPos = { x: 8.5, y: 10.0 };
      expect(grid.isPointWalkable(stuckPos.x, stuckPos.y)).toBe(false);

      const escapePoint = grid.findNearestWalkable(stuckPos);
      expect(grid.isPointWalkable(escapePoint.x, escapePoint.y)).toBe(true);

      // Escape point must not be in any locked room
      for (const room of HOUSE_ROOMS) {
        if (room.id !== 'scrim_lab') {
          const inLocked =
            escapePoint.x >= room.x &&
            escapePoint.x <= room.x + room.w &&
            escapePoint.y >= room.y &&
            escapePoint.y <= room.y + room.d;
          expect(inLocked).toBe(false);
        }
      }
    });

    it('evacuates agents if their current station is locked after rebrand', () => {
      const facilities = {
        ...TEST_FACILITIES,
        streaming_pod: { ...TEST_FACILITIES.streaming_pod, isUnlocked: true, level: 1 },
      };
      const sim = createHouseSim(roster, facilities, 42);

      // Put an agent at stream pod station
      sim.agents[0].stationId = 'stream_station_0';
      sim.agents[0].activity = 'stream';

      // Now lock streaming pod (simulating season rebrand)
      const rebrandedFacilities = {
        ...facilities,
        streaming_pod: { ...facilities.streaming_pod, isUnlocked: false, level: 0 },
      };

      syncHouseSim(sim, roster, rebrandedFacilities);

      // Agent 0 should have evacuated from stream_station_0
      expect(sim.agents[0].stationId).toBeNull();
      expect(sim.agents[0].targetStationId).not.toBe('stream_station_0');
    });
  });

  describe('Gains Accumulation & Store Application', () => {
    it('accumulates activity gains and respects the rarity cap', () => {
      // Starter 1 is silver: cap is 80
      const gains: ActivityGains = {
        hype: 5,
        stats: {
          [roster[0].id]: { aim: 2.4, macro: 0.6 },
        },
      };

      const initialAim = roster[0].stats.aim; // 50
      useGameStore.setState({ roster: [roster[0]], hype: 10 });
      useGameStore.getState().applyActivityGains(gains);

      const updated = useGameStore.getState().roster[0];
      // Whole points: floor(2.4) = 2 points added to aim (50 -> 52)
      expect(updated.stats.aim).toBe(initialAim + 2);
      expect(updated.trainingProgress?.aim).toBeCloseTo(0.4);
      expect(updated.trainingProgress?.macro).toBeCloseTo(0.6);
      expect(useGameStore.getState().hype).toBe(15);
    });

    it('clamps stat growth when at or exceeding rarity cap', () => {
      const silverPlayer: ProPlayer = {
        ...roster[0],
        rarity: 'silver',
        stats: { ...roster[0].stats, aim: 79 },
      };
      useGameStore.setState({ roster: [silverPlayer] });

      // Apply 3.0 whole points
      const gains: ActivityGains = {
        hype: 0,
        stats: {
          [silverPlayer.id]: { aim: 3.0 },
        },
      };

      useGameStore.getState().applyActivityGains(gains);

      const updated = useGameStore.getState().roster[0];
      // Silver cap is 80, so 79 + 3 is capped at 80!
      expect(updated.stats.aim).toBe(80);
    });

    it('calculates cap multiplier slowdown correctly', () => {
      // Bronze cap: 70
      expect(calculateCapMultiplier(30, 'bronze')).toBe(1.0);
      expect(calculateCapMultiplier(60, 'bronze')).toBeCloseTo(10 / 40); // 0.25
      expect(calculateCapMultiplier(69, 'bronze')).toBe(0.15); // minimum clamp
      expect(calculateCapMultiplier(70, 'bronze')).toBe(0.0); // reached cap
    });

    it('flushes pending gains via takeGains and resets buffer', () => {
      const sim = createHouseSim(roster, TEST_FACILITIES, 1);
      stepHouseSim(sim, 2.0, roster);

      const gains = takeGains(sim);
      expect(gains).toBeDefined();
      expect(sim.pendingGains.hype).toBe(0);
      expect(Object.keys(sim.pendingGains.stats).length).toBe(0);

      expect(calculateRoomMultiplier(1)).toBe(1);
      expect(calculateRoomMultiplier(10)).toBeCloseTo(1.9);
      expect(calculateRoomMultiplier(50)).toBe(4); // capped at 4
      expect(calculateEnergyEfficiency(100)).toBe(1.0);
      expect(calculateEnergyEfficiency(0)).toBe(0.6);
    });
  });

  describe('Save Compatibility', () => {
    it('hydrates legacy saves cleanly without trainingProgress', async () => {
      const legacySave = {
        version: 1,
        state: {
          cash: 500,
          hype: 20,
          roster: [
            {
              id: 'p_legacy_1',
              name: 'Legacy Player',
              handle: 'Leg1',
              portraitIndex: 0,
              discipline: 'fps',
              rarity: 'bronze',
              role: 'starter',
              level: 1,
              salaryPerSec: 0.5,
              stats: { aim: 40, macro: 40, comms: 40, tiltResistance: 40 },
              // trainingProgress is omitted
            },
          ],
        },
      };

      localStorage.setItem('esports_dynasty_save_v1', JSON.stringify(legacySave));
      await useGameStore.persist.rehydrate();

      const hydrated = useGameStore.getState();
      expect(hydrated.cash).toBe(500);
      expect(hydrated.roster[0].handle).toBe('Leg1');
      expect(hydrated.roster[0].trainingProgress).toBeUndefined();
    });

    it('preserves trainingProgress across save rehydration', async () => {
      const saveWithProgress = {
        version: 1,
        state: {
          cash: 800,
          roster: [
            {
              id: 'p_prog_1',
              name: 'Progress Player',
              handle: 'Prog1',
              portraitIndex: 1,
              discipline: 'fps',
              rarity: 'silver',
              role: 'starter',
              level: 1,
              salaryPerSec: 0.5,
              stats: { aim: 60, macro: 50, comms: 50, tiltResistance: 50 },
              trainingProgress: { aim: 0.75, macro: 0.3 },
            },
          ],
        },
      };

      localStorage.setItem('esports_dynasty_save_v1', JSON.stringify(saveWithProgress));
      await useGameStore.persist.rehydrate();

      const hydrated = useGameStore.getState();
      expect(hydrated.roster[0].trainingProgress).toEqual({ aim: 0.75, macro: 0.3 });
    });
  });

  describe('8-Player Squad Support and Front-Door Spawning', () => {
    it('accommodates up to 8 active players in the house', () => {
      const largeRoster = createTestRoster(10);
      const sim = createHouseSim(largeRoster, TEST_FACILITIES, 999);
      expect(sim.agents.length).toBe(8);
      // Starters are prioritized
      const starters = sim.agents.filter(a =>
        largeRoster.find(p => p.id === a.id)?.role === 'starter'
      );
      expect(starters.length).toBe(5);
    });

    it('spawns new recruits at the front door and paths them into the house', () => {
      const sim = createHouseSim(roster.slice(0, 3), TEST_FACILITIES, 100);
      expect(sim.agents.length).toBe(3);

      // Add recruit
      const recruit = createTestRoster(4)[3];
      syncHouseSim(sim, [...roster.slice(0, 3), recruit], TEST_FACILITIES);

      expect(sim.agents.length).toBe(4);
      const recruitAgent = sim.agents.find(a => a.id === recruit.id)!;
      expect(recruitAgent).toBeDefined();
      // Should have started near front door
      expect(Math.hypot(recruitAgent.x - FRONT_DOOR_SPAWN.x, recruitAgent.y - FRONT_DOOR_SPAWN.y)).toBeLessThan(0.1);
      expect(recruitAgent.mode).toBe('walking');
      expect(recruitAgent.path.length).toBeGreaterThan(0);
    });
  });

  describe('Outdoor Living Simulation and Patio Break Stations', () => {
    it('defines accessible outdoor stations for TV watching, hoops, patio lounge, and team car', () => {
      const outdoorStationIds = [
        'patio_watch_tv',
        'patio_sofa_chill',
        'patio_basketball_hoop',
        'outside_garden_bench',
        'tournament_car_seat',
      ];
      for (const id of outdoorStationIds) {
        const station = HOUSE_STATIONS.find(s => s.id === id);
        expect(station).toBeDefined();
        expect(station?.area).toBe('hall');
        expect((station?.seat.y ?? 0) > 14.0 || (station?.seat.y ?? 0) < 0).toBe(true);
      }
    });

    it('accrues outdoor training benefits when at outdoor TV or hoops stations', () => {
      const sim = createHouseSim(roster, TEST_FACILITIES, 42);
      const testPlayer = roster[0];
      const agent = sim.agents[0];

      // Simulate being at the patio TV station
      agent.stationId = 'patio_watch_tv';
      agent.mode = 'working';
      agent.activity = 'break';

      stepHouseSim(sim, 10.0, roster);

      expect(sim.pendingGains.stats[testPlayer.id]?.macro).toBeGreaterThan(0);

      // Simulate being at hoops station
      agent.stationId = 'patio_basketball_hoop';
      stepHouseSim(sim, 10.0, roster);
      expect(sim.pendingGains.stats[testPlayer.id]?.tiltResistance).toBeGreaterThan(0);
    });
  });
});
