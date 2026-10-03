import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Facility, FacilityId } from '../types/facility.types';
import { ProPlayer, PlayerStats, EsportsDiscipline, RARITY_CAPS } from '../types/player.types';
import { ActivityGains } from '../types/house.types';
import { AdPlacement, AdBoostStatus } from '../types/ad.types';
import { FormulaService } from '../engine/FormulaService';
import { getPortraitIndex, PLAYER_IDENTITIES } from '../engine/PlayerAppearance';

export interface OfflineModalData {
  isOpen: boolean;
  offlineSeconds: number;
  baseCash: number;
  boostedCash: number;
}

export interface DroneDropData {
  id: string;
  cashReward: number;
  gemsReward: number;
  expiresAt: number;
}

interface GameStoreState {
  // Economy
  cash: number;
  hype: number;
  energyCans: number;
  legacyTrophies: number;
  lifetimeEarnings: number;
  season: number;
  lastSavedTimestamp: number;

  // Facilities
  facilities: Record<FacilityId, Facility>;

  // Roster
  roster: ProPlayer[];

  // Ads & Boosts
  boostExpiresAt: number;
  dailyAdsWatched: number;
  lastAdResetDate: string;
  isSimulatedAdOpen: boolean;
  pendingPlacement: AdPlacement | null;
  pendingCallback: ((success: boolean) => void) | null;
  offlineModal: OfflineModalData | null;
  activeDrone: DroneDropData | null;

  // Actions
  upgradeFacility: (id: FacilityId) => boolean;
  unlockFacility: (id: FacilityId) => boolean;
  tick: (currentTimestamp: number) => void;
  checkOfflineCatchup: () => void;
  claimOfflineReward: (tripleWithAd: boolean) => void;
  
  // Ad Management
  requestAd: (placement: AdPlacement, onCompleted?: (success: boolean) => void) => void;
  closeAdModal: (completed: boolean) => void;
  addBoostHours: (hours: number) => void;
  getBoostStatus: () => AdBoostStatus;
  
  // Roster Management
  scoutPlayer: (isVipAd: boolean, discipline?: EsportsDiscipline) => ProPlayer | null;
  trainPlayer: (playerId: string, stat: keyof PlayerStats) => void;
  applyActivityGains: (gains: ActivityGains) => void;
  
  // Drone Drops
  spawnDrone: () => void;
  claimDrone: (watchAd: boolean) => void;
  dismissDrone: () => void;

  // Prestige
  rebrandFranchise: () => boolean;
}

const INITIAL_FACILITIES: Record<FacilityId, Facility> = {
  scrim_lab: {
    id: 'scrim_lab',
    name: 'PC Scrim Lab',
    category: 'training',
    description: 'Basement practice rigs for team aim routines and scrims.',
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
    description: 'Acoustic pods where players stream to build fan hype & donations.',
    level: 0,
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
    name: 'Fitness & Nutrition Gym',
    category: 'wellness',
    description: 'Keeps team reflexes sharp and prevents burnout.',
    level: 0,
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
    name: 'VOD & Analyst War Room',
    category: 'strategy',
    description: 'Data analysts dissect opponent playbooks for big tournament wins.',
    level: 0,
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
    description: 'Custom team jerseys, artisan mousepads, and apparel.',
    level: 0,
    baseCost: 35000,
    costMultiplier: 1.20,
    baseIncomePerSec: 1500,
    icon: 'ShoppingBag',
    isUnlocked: false,
    unlockCost: 50000,
    requiredHype: 2000,
  },
};

const INITIAL_ROSTER: ProPlayer[] = [
  {
    id: 'p_starter_1',
    name: 'Alex Vance',
    handle: 'K1netic',
    portraitIndex: 0,
    discipline: 'fps',
    rarity: 'silver',
    role: 'starter',
    level: 1,
    salaryPerSec: 0.2,
    stats: {
      aim: 45,
      macro: 38,
      comms: 40,
      tiltResistance: 55,
    },
  },
];

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      cash: 50,
      hype: 10,
      energyCans: 5,
      legacyTrophies: 0,
      lifetimeEarnings: 50,
      season: 1,
      lastSavedTimestamp: Date.now(),

      facilities: INITIAL_FACILITIES,
      roster: INITIAL_ROSTER,

      boostExpiresAt: 0,
      dailyAdsWatched: 0,
      lastAdResetDate: new Date().toISOString().split('T')[0],
      isSimulatedAdOpen: false,
      pendingPlacement: null,
      pendingCallback: null,
      offlineModal: null,
      activeDrone: null,

      upgradeFacility: (id: FacilityId) => {
        const { facilities, cash } = get();
        const facility = facilities[id];
        if (!facility || !facility.isUnlocked) return false;

        const cost = FormulaService.calculateUpgradeCost(facility.baseCost, facility.level, facility.costMultiplier);
        if (cash < cost) return false;

        set({
          cash: cash - cost,
          facilities: {
            ...facilities,
            [id]: {
              ...facility,
              level: facility.level + 1,
            },
          },
        });
        return true;
      },

      unlockFacility: (id: FacilityId) => {
        const { facilities, cash, hype } = get();
        const facility = facilities[id];
        if (!facility || facility.isUnlocked) return false;
        if (cash < facility.unlockCost || hype < facility.requiredHype) return false;

        set({
          cash: cash - facility.unlockCost,
          facilities: {
            ...facilities,
            [id]: {
              ...facility,
              isUnlocked: true,
              level: 1,
            },
          },
        });
        return true;
      },

      tick: (currentTimestamp: number) => {
        const { facilities, boostExpiresAt, hype, lastSavedTimestamp, cash, lifetimeEarnings } = get();
        
        // Reset daily ad counters if new day
        const todayStr = new Date().toISOString().split('T')[0];
        if (get().lastAdResetDate !== todayStr) {
          set({ dailyAdsWatched: 0, lastAdResetDate: todayStr });
        }

        const deltaSeconds = Math.max(0, (currentTimestamp - lastSavedTimestamp) / 1000);
        if (deltaSeconds <= 0) return;

        const incomePerSec = FormulaService.calculateTotalIncomePerSec(
          Object.values(facilities),
          false,
          hype
        );

        const earned = FormulaService.calculateIntervalIncome(lastSavedTimestamp, currentTimestamp, incomePerSec, boostExpiresAt);

        set({
          cash: cash + earned,
          lifetimeEarnings: lifetimeEarnings + earned,
          lastSavedTimestamp: currentTimestamp,
        });
      },

      checkOfflineCatchup: () => {
        const { lastSavedTimestamp, facilities, hype, boostExpiresAt } = get();
        const now = Date.now();
        const incomePerSec = FormulaService.calculateTotalIncomePerSec(
          Object.values(facilities),
          false,
          hype
        );

        const offline = FormulaService.calculateOfflineEarnings(lastSavedTimestamp, now, incomePerSec);
        offline.baseCashEarned = FormulaService.calculateIntervalIncome(
          lastSavedTimestamp, lastSavedTimestamp + offline.offlineSeconds * 1000, incomePerSec, boostExpiresAt
        );
        offline.boostedCashEarned = offline.baseCashEarned * 3;

        if (offline.baseCashEarned > 10) {
          set({
            offlineModal: {
              isOpen: true,
              offlineSeconds: (get().offlineModal?.offlineSeconds ?? 0) + offline.offlineSeconds,
              baseCash: (get().offlineModal?.baseCash ?? 0) + offline.baseCashEarned,
              boostedCash: (get().offlineModal?.boostedCash ?? 0) + offline.boostedCashEarned,
            },
            lastSavedTimestamp: now,
          });
        } else {
          get().tick(now);
        }
      },

      claimOfflineReward: (tripleWithAd: boolean) => {
        const { offlineModal, cash, lifetimeEarnings } = get();
        if (!offlineModal) return;

        const toAdd = tripleWithAd ? offlineModal.boostedCash : offlineModal.baseCash;
        set({
          cash: cash + toAdd,
          lifetimeEarnings: lifetimeEarnings + toAdd,
          offlineModal: null,
        });
      },

      requestAd: (placement: AdPlacement, onCompleted?: (success: boolean) => void) => {
        if (get().isSimulatedAdOpen) return;
        set({
          isSimulatedAdOpen: true,
          pendingPlacement: placement,
          pendingCallback: onCompleted || null,
        });
      },

      closeAdModal: (completed: boolean) => {
        const { pendingPlacement, pendingCallback, isSimulatedAdOpen } = get();
        if (!isSimulatedAdOpen) return;
        // Clear first so callbacks cannot claim the same completion twice.
        set({ isSimulatedAdOpen: false, pendingPlacement: null, pendingCallback: null });

        if (completed && pendingPlacement) {
          const today = new Date().toISOString().split('T')[0];
          const watched = (get().lastAdResetDate === today ? get().dailyAdsWatched : 0) + 1;
          const cashReward = watched === 3 ? 5000 : watched === 5 ? 50000 : 0;
          set(state => ({
            dailyAdsWatched: watched,
            lastAdResetDate: today,
            energyCans: state.energyCans + (watched === 1 ? 5 : 0),
            cash: state.cash + cashReward,
            lifetimeEarnings: state.lifetimeEarnings + cashReward,
          }));
          if (watched === 3) get().addBoostHours(2);

          // Apply specific rewards
          if (pendingPlacement === 'boost_2x_income') {
            get().addBoostHours(2);
          } else if (pendingPlacement === 'sponsor_drone_drop') {
            get().claimDrone(true);
          }
        }

        if (pendingCallback) {
          pendingCallback(completed);
        }

      },

      addBoostHours: (hours: number) => {
        const { boostExpiresAt } = get();
        const now = Date.now();
        const currentActiveUntil = Math.max(now, boostExpiresAt);
        const maxBoostMs = 8 * 3600 * 1000; // Cap at 8 hours stored
        const addedMs = hours * 3600 * 1000;
        const newExpiry = Math.min(now + maxBoostMs, currentActiveUntil + addedMs);

        set({ boostExpiresAt: newExpiry });
      },

      getBoostStatus: () => {
        const { boostExpiresAt } = get();
        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.floor((boostExpiresAt - now) / 1000));
        return {
          isActive: remainingSeconds > 0,
          remainingSeconds,
          multiplier: remainingSeconds > 0 ? 2 : 1,
        };
      },

      scoutPlayer: (isVipAd: boolean, discipline: EsportsDiscipline = 'fps') => {
        const { cash, roster } = get();
        const scoutCost = isVipAd ? 0 : 500;
        if (!isVipAd && cash < scoutCost) return null;

        const usedPortraits = new Set(roster.map(p => p.portraitIndex));
        const available = PLAYER_IDENTITIES.map((_, i) => i).filter(i => !usedPortraits.has(i));
        const pool = available.length ? available : PLAYER_IDENTITIES.map((_, i) => i);
        const portraitIndex = pool[Math.floor(Math.random() * pool.length)];
        const identity = PLAYER_IDENTITIES[portraitIndex];
        const randomHandle = `${identity.handle}_${roster.length + 1}`;
        const rarityRoll = Math.random();
        
        let rarity: ProPlayer['rarity'] = 'bronze';
        let baseStatMin = 30;
        let baseStatMax = 55;

        if (isVipAd) {
          // VIP Ad roll guarantees Silver or Gold
          if (rarityRoll > 0.4) {
            rarity = 'gold';
            baseStatMin = 70;
            baseStatMax = 92;
          } else {
            rarity = 'silver';
            baseStatMin = 50;
            baseStatMax = 75;
          }
        } else {
          if (rarityRoll > 0.92) {
            rarity = 'gold';
            baseStatMin = 70;
            baseStatMax = 90;
          } else if (rarityRoll > 0.60) {
            rarity = 'silver';
            baseStatMin = 48;
            baseStatMax = 68;
          }
        }

        const newPlayer: ProPlayer = {
          id: crypto.randomUUID(),
          name: identity.name,
          handle: randomHandle,
          portraitIndex,
          discipline,
          rarity,
          role: roster.length < 5 ? 'starter' : 'sub',
          level: 1,
          salaryPerSec: rarity === 'gold' ? 5 : rarity === 'silver' ? 2 : 0.5,
          stats: {
            aim: Math.floor(Math.random() * (baseStatMax - baseStatMin) + baseStatMin),
            macro: Math.floor(Math.random() * (baseStatMax - baseStatMin) + baseStatMin),
            comms: Math.floor(Math.random() * (baseStatMax - baseStatMin) + baseStatMin),
            tiltResistance: Math.floor(Math.random() * (baseStatMax - baseStatMin) + baseStatMin),
          },
        };

        set({
          cash: cash - scoutCost,
          roster: [...roster, newPlayer],
        });

        return newPlayer;
      },

      trainPlayer: (playerId: string, stat: keyof PlayerStats) => {
        const { roster, cash } = get();
        const player = roster.find(p => p.id === playerId);
        if (!player || player.stats[stat] >= 100) return;

        const trainingCost = player.stats[stat] * 5;
        if (cash < trainingCost) return;

        set({
          cash: cash - trainingCost,
          roster: roster.map(p => {
            if (p.id === playerId) {
              return {
                ...p,
                stats: {
                  ...p.stats,
                  [stat]: Math.min(100, p.stats[stat] + 1),
                },
              };
            }
            return p;
          }),
        });
      },

      applyActivityGains: (gains: ActivityGains) => {
        set(state => ({
          hype: state.hype + gains.hype,
          roster: state.roster.map(player => {
            const statGains = gains.stats[player.id];
            if (!statGains) return player;
            const stats = { ...player.stats };
            const trainingProgress = { ...player.trainingProgress };
            const cap = RARITY_CAPS[player.rarity];
            for (const stat of Object.keys(statGains) as (keyof PlayerStats)[]) {
              const total = (trainingProgress[stat] ?? 0) + (statGains[stat] ?? 0);
              stats[stat] = Math.min(cap, stats[stat] + Math.floor(total));
              trainingProgress[stat] = stats[stat] >= cap ? 0 : total % 1;
            }
            return { ...player, stats, trainingProgress };
          }),
        }));
      },

      spawnDrone: () => {
        const { cash } = get();
        const rewardCash = Math.max(100, Math.floor(cash * 0.25));
        set({
          activeDrone: {
            id: `drone_${Date.now()}`,
            cashReward: rewardCash,
            gemsReward: 5,
            expiresAt: Date.now() + 25000, // 25s life
          },
        });
      },

      claimDrone: (watchAd: boolean) => {
        const { activeDrone, cash, energyCans, lifetimeEarnings } = get();
        if (!activeDrone) return;

        const cashEarned = watchAd ? activeDrone.cashReward * 2 : Math.floor(activeDrone.cashReward * 0.2);
        const gemsEarned = watchAd ? activeDrone.gemsReward : 0;

        set({
          cash: cash + cashEarned,
          lifetimeEarnings: lifetimeEarnings + cashEarned,
          energyCans: energyCans + gemsEarned,
          activeDrone: null,
        });
      },

      dismissDrone: () => {
        set({ activeDrone: null });
      },

      rebrandFranchise: () => {
        const { lifetimeEarnings, legacyTrophies, season } = get();
        const earnedTrophies = FormulaService.calculatePrestigeTrophies(lifetimeEarnings);
        if (earnedTrophies <= 0) return false;

        set({
          cash: 100,
          hype: 15,
          energyCans: 10,
          legacyTrophies: legacyTrophies + earnedTrophies,
          season: season + 1,
          facilities: INITIAL_FACILITIES,
          boostExpiresAt: 0,
          lifetimeEarnings: 100,
          lastSavedTimestamp: Date.now(),
        });
        return true;
      },
    }),
    {
      name: 'esports_dynasty_save_v1',
      version: 1,
      partialize: (state) => {
        const { isSimulatedAdOpen, pendingPlacement, pendingCallback, activeDrone, ...save } = state;
        return save;
      },
      // Old v1 saves included modal flags but could not serialize callbacks.
      merge: (saved, current) => {
        const { tapPower: _tapPower, tapScrim: _tapScrim, ...previous } = saved as Partial<GameStoreState> & { tapPower?: number; tapScrim?: unknown };
        return ({
        ...current,
        ...previous,
        roster: (previous.roster ?? current.roster).map(player => {
          const { avatar: _avatar, ...rest } = player as ProPlayer & { avatar?: string };
          return { ...rest, portraitIndex: getPortraitIndex(player.id, player.portraitIndex) };
        }),
        isSimulatedAdOpen: false,
        pendingPlacement: null,
        pendingCallback: null,
        activeDrone: null,
      });
      },
    }
  )
);
