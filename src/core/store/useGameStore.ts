import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Facility, FacilityId } from '../types/facility.types';
import { ProPlayer, PlayerStats, CardAttributes, EsportsDiscipline, DISCIPLINE_INFO, Coach, INITIAL_COACHES } from '../types/player.types';
import { ActivityGains } from '../types/house.types';
import { AdPlacement, AdBoostStatus } from '../types/ad.types';
import { FormulaService } from '../engine/FormulaService';
import { getPortraitIndex, PLAYER_IDENTITIES } from '../engine/PlayerAppearance';
import { CARD_PACK_COST, LINEUP_SLOTS, TeamLineups, autoFillLineup, developmentCost, developmentRate, duplicateKey, duplicateValue, generateCard, getCardAttributes, isMatchEligible, lineupPower, resolveLineup, trainingCeiling } from '../cards/CardService';
import { CircuitEvent, TOURNAMENTS, createCircuit, playCircuitRound } from '../tournaments/CircuitService';
import { StaffCandidate, coachPlan, coachSelectLineup, generateStaffMarket, managerDiscount, managerRatingBonus, nutritionBonus, staffDailySchedule, staffSlot } from '../staff/StaffService';
import { BRANCHES, BranchId, EsportsBranch, branchIncomePerSecond, branchUpgradeCost } from '../empire/BranchService';
import {
  DistrictTier, ExecutiveRole, ExecutiveStaff, FacilityTier, FleetTier, INITIAL_BRANDING,
  INITIAL_EXECUTIVES, INITIAL_SEASON, OrgBranding, PlayerPersonality, ScheduleBlock,
  SeasonCalendar, SportsTier, VipItemId, VIP_ITEMS, districtBonuses, nextSeasonStage,
  scheduleSynergy,
} from '../empire/EmpireService';

export type TimeOfDay = 'day' | 'sunset' | 'night';
export type WallpaperStyle = 'default' | 'cyberpunk' | 'carbon' | 'minimalist';
export type FlooringStyle = 'default' | 'oak' | 'marble' | 'neon';
export type FacadeStyle = 'default' | 'sandstone' | 'glass' | 'carbon';

export interface HouseInteriorState {
  wallpaperStyle: WallpaperStyle;
  flooringStyle?: FlooringStyle;
  facadeStyle?: FacadeStyle;
  loungeTvLevel: number;
}

export interface EmpireState {
  branches?: EsportsBranch[];
  districtTier: DistrictTier;
  fleetTier: FleetTier;
  facilityTier: FacilityTier;
  basketballTier: SportsTier;
  footballTier: SportsTier;
  branding: OrgBranding;
  schedule: ScheduleBlock[];
  executives: ExecutiveStaff[];
  seasonCalendar: SeasonCalendar;
  vipInventory: VipItemId[];
}

export const INITIAL_EMPIRE: EmpireState = {
  branches: [],
  districtTier: 1,
  fleetTier: 1,
  facilityTier: 1,
  basketballTier: 1,
  footballTier: 1,
  branding: INITIAL_BRANDING,
  schedule: ['scrim', 'vod', 'gym', 'outdoor', 'rest'],
  executives: INITIAL_EXECUTIVES,
  seasonCalendar: INITIAL_SEASON,
  vipInventory: [],
};

export const INITIAL_HOUSE_INTERIOR: HouseInteriorState = {
  wallpaperStyle: 'default',
  flooringStyle: 'default',
  facadeStyle: 'default',
  loungeTvLevel: 1,
};

const INITIAL_STAFF_SEED = Math.floor(Math.random() * 0xffffffff);

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


export interface PowerRankingTeam {
  id: string;
  name: string;
  tag: string;
  region: 'NA' | 'EMEA' | 'KR' | 'APAC' | 'BR';
  rank: number;
  rating: number; // Elo e.g. 1200 - 1900
  wins: number;
  losses: number;
  form: ('W' | 'L')[];
  trend: 'up' | 'down' | 'same';
  tier: 'S' | 'A' | 'B' | 'C';
  accentColor: string;
  isPlayerTeam?: boolean;
}

export interface ActiveTournamentMatch {
  tournamentId: string;
  tourneyName: string;
  stage: 'quarterfinals' | 'semifinals' | 'finals';
  opponentTeam: PowerRankingTeam;
  playerScore: number;
  opponentScore: number;
  playByPlay: string[];
  isUnderway: boolean;
}

export const INITIAL_POWER_RANKINGS: PowerRankingTeam[] = [
  {
    id: 't1_apex',
    name: 'T1 Apex',
    tag: 'T1',
    region: 'KR',
    rank: 1,
    rating: 1840,
    wins: 18,
    losses: 3,
    form: ['W', 'W', 'W', 'W', 'L'],
    trend: 'same',
    tier: 'S',
    accentColor: '#e11d48',
  },
  {
    id: 'sentinels_prime',
    name: 'Sentinels Prime',
    tag: 'SEN',
    region: 'NA',
    rank: 2,
    rating: 1795,
    wins: 16,
    losses: 4,
    form: ['W', 'W', 'L', 'W', 'W'],
    trend: 'up',
    tier: 'S',
    accentColor: '#dc2626',
  },
  {
    id: 'fnatic_eclipse',
    name: 'Fnatic Eclipse',
    tag: 'FNC',
    region: 'EMEA',
    rank: 3,
    rating: 1740,
    wins: 15,
    losses: 5,
    form: ['W', 'L', 'W', 'W', 'W'],
    trend: 'same',
    tier: 'S',
    accentColor: '#f97316',
  },
  {
    id: 'gen_g_elite',
    name: 'Gen.G Dominance',
    tag: 'GEN',
    region: 'KR',
    rank: 4,
    rating: 1680,
    wins: 14,
    losses: 6,
    form: ['L', 'W', 'W', 'W', 'L'],
    trend: 'down',
    tier: 'A',
    accentColor: '#eab308',
  },
  {
    id: 'g2_invictus',
    name: 'G2 Invictus',
    tag: 'G2',
    region: 'EMEA',
    rank: 5,
    rating: 1635,
    wins: 13,
    losses: 7,
    form: ['W', 'W', 'W', 'L', 'W'],
    trend: 'up',
    tier: 'A',
    accentColor: '#64748b',
  },
  {
    id: 'paper_rex',
    name: 'Paper Rex Dynamics',
    tag: 'PRX',
    region: 'APAC',
    rank: 6,
    rating: 1590,
    wins: 12,
    losses: 8,
    form: ['W', 'L', 'L', 'W', 'W'],
    trend: 'same',
    tier: 'A',
    accentColor: '#a855f7',
  },
  {
    id: 'cloud9_horizon',
    name: 'Cloud9 Horizon',
    tag: 'C9',
    region: 'NA',
    rank: 7,
    rating: 1540,
    wins: 11,
    losses: 9,
    form: ['L', 'W', 'W', 'L', 'W'],
    trend: 'same',
    tier: 'B',
    accentColor: '#0284c7',
  },
  {
    id: 'dynasty_esports',
    name: 'Dynasty Esports',
    tag: 'DYN',
    region: 'NA',
    rank: 8,
    rating: 1485,
    wins: 10,
    losses: 10,
    form: ['W', 'L', 'W', 'W', 'L'],
    trend: 'up',
    tier: 'B',
    accentColor: '#06b6d4',
    isPlayerTeam: true,
  },
  {
    id: 'loud_phoenix',
    name: 'LOUD Phoenix',
    tag: 'LOUD',
    region: 'BR',
    rank: 9,
    rating: 1430,
    wins: 9,
    losses: 11,
    form: ['L', 'W', 'L', 'L', 'W'],
    trend: 'down',
    tier: 'B',
    accentColor: '#22c55e',
  },
  {
    id: 'liquid_velocity',
    name: 'Team Liquid Velocity',
    tag: 'TL',
    region: 'EMEA',
    rank: 10,
    rating: 1375,
    wins: 8,
    losses: 12,
    form: ['W', 'L', 'L', 'W', 'L'],
    trend: 'same',
    tier: 'C',
    accentColor: '#3b82f6',
  },
  {
    id: 'nrg_shockwave',
    name: 'NRG Shockwave',
    tag: 'NRG',
    region: 'NA',
    rank: 11,
    rating: 1320,
    wins: 7,
    losses: 13,
    form: ['L', 'L', 'W', 'L', 'W'],
    trend: 'down',
    tier: 'C',
    accentColor: '#ec4899',
  },
  {
    id: 'karmine_corp',
    name: 'Karmine Corp Elite',
    tag: 'KC',
    region: 'EMEA',
    rank: 12,
    rating: 1260,
    wins: 6,
    losses: 14,
    form: ['L', 'L', 'L', 'W', 'L'],
    trend: 'same',
    tier: 'C',
    accentColor: '#6366f1',
  },
];

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
  roomFunding: Partial<Record<FacilityId, number>>;

  // Roster
  roster: ProPlayer[];
  developmentPoints: number;
  convertDuplicateCard: (playerId: string) => number;
  developPlayer: (playerId: string, attribute: keyof CardAttributes) => boolean;
  teamLineups: TeamLineups;
  assignLineupSlot: (discipline: EsportsDiscipline, slotId: string, playerId: string | null) => boolean;
  autoFillTeamLineup: (discipline: EsportsDiscipline) => void;

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
  fundFacilityWithAd: (id: FacilityId) => boolean;
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
  buyCardPack: (discipline: EsportsDiscipline) => ProPlayer | null;
  trainPlayer: (playerId: string, stat: keyof PlayerStats) => void;
  trainCardAttribute: (playerId: string, attribute: keyof CardAttributes) => boolean;
  applyActivityGains: (gains: ActivityGains) => void;
  renewContract: (playerId: string, matches?: number) => boolean;

  // Coaches & Disciplines
  coaches: Coach[];
  hireCoach: (coachId: string) => boolean;
  staffMarket: StaffCandidate[];
  hiredStaff: StaffCandidate[];
  staffMarketSeed: number;
  refreshStaffMarket: () => boolean;
  hireStaff: (candidateId: string) => boolean;

  // Day & Night Simulation
  timeOfDay: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
  cycleTimeOfDay: () => void;

  // House Interior & Decor
  houseInterior: HouseInteriorState;
  setWallpaperStyle: (style: WallpaperStyle) => boolean;
  equipCosmetic: (itemId: VipItemId) => boolean;
  resetHouseFinish: (category: 'Wallpaper' | 'Flooring' | 'Facade') => void;
  grantVerifiedCosmetic: (itemId: VipItemId) => boolean;
  upgradeLoungeTv: () => boolean;

  // Empire & living world (optional defaults maintain v1 save compatibility)
  empire: EmpireState;
  upgradeDistrict: () => boolean;
  openBranch: (id: BranchId) => boolean;
  upgradeBranch: (id: BranchId) => boolean;
  upgradeFleet: () => boolean;
  upgradeFacilityTier: () => boolean;
  takeOutdoorBreak: (playerId: string) => void;
  setBranding: (branding: Partial<OrgBranding>) => void;
  hireExecutive: (role: ExecutiveRole) => boolean;
  advanceSeasonStage: (won?: boolean) => void;
  buyVipItem: (itemId: VipItemId) => boolean;
  
  // Drone Drops
  spawnDrone: () => void;
  claimDrone: (watchAd: boolean) => void;
  dismissDrone: () => void;

  // Power Rankings & Tournaments
  powerRankings: PowerRankingTeam[];
  isTournamentUnderway: boolean;
  activeTournamentMatch: ActiveTournamentMatch | null;
  circuitEvent: CircuitEvent | null;
  startCircuit: (discipline: EsportsDiscipline, now?: number, tournamentId?: string) => boolean;
  playNextCircuitRound: (now?: number) => boolean;
  recordTournamentOutcome: (won: boolean, tourneyId: string, opponentId?: string) => void;
  setTournamentUnderway: (underway: boolean) => void;
  setActiveTournamentMatch: (match: ActiveTournamentMatch | null) => void;
  // Prestige
  rebrandFranchise: () => boolean;
}

const INITIAL_FACILITIES: Record<FacilityId, Facility> = {
  scrim_lab: {
    id: 'scrim_lab',
    name: 'PC Scrim Lab',
    category: 'training',
    description: 'Basement practice rigs for team aim routines and scrims.',
    level: 0,
    baseCost: 15,
    costMultiplier: 1.15,
    baseIncomePerSec: 1,
    icon: 'Monitor',
    isUnlocked: false,
    unlockCost: 50,
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
  cafeteria: {
    id: 'cafeteria', name: 'Pro Dining & Nutrition Bar', category: 'wellness',
    description: 'Chef-prepared meals for the whole roster.', level: 0,
    baseCost: 8000, costMultiplier: 1.18, baseIncomePerSec: 350,
    icon: 'Coffee', isUnlocked: false, unlockCost: 15000, requiredHype: 600,
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
    personality: 'grinder',
    dailySchedule: INITIAL_EMPIRE.schedule,
    sportsPreference: 'basketball',
    age: 20,
    potential: 88,
    position: 'rifler',
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
      roomFunding: {},
      roster: INITIAL_ROSTER,
      developmentPoints: 0,
      teamLineups: {},

      boostExpiresAt: 0,
      dailyAdsWatched: 0,
      lastAdResetDate: new Date().toISOString().split('T')[0],
      isSimulatedAdOpen: false,
      pendingPlacement: null,
      pendingCallback: null,
      offlineModal: null,
      activeDrone: null,
      powerRankings: INITIAL_POWER_RANKINGS,
      isTournamentUnderway: false,
      activeTournamentMatch: null,
      circuitEvent: null,
      coaches: INITIAL_COACHES,
      staffMarket: generateStaffMarket(INITIAL_STAFF_SEED),
      hiredStaff: [],
      staffMarketSeed: INITIAL_STAFF_SEED,
      timeOfDay: 'day',
      houseInterior: INITIAL_HOUSE_INTERIOR,
      empire: INITIAL_EMPIRE,

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
        const { facilities, cash, hype, roomFunding } = get();
        const facility = facilities[id];
        if (!facility || facility.isUnlocked) return false;
        const cost = Math.max(0, facility.unlockCost - (roomFunding[id] ?? 0));
        if (cash < cost || (hype < facility.requiredHype && cost > 0)) return false;

        set({
          cash: cash - cost,
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

      fundFacilityWithAd: id => {
        const state = get();
        const facility = state.facilities[id];
        if (!facility || facility.isUnlocked) return false;
        const funded = Math.min(facility.unlockCost, (state.roomFunding[id] ?? 0) + Math.ceil(facility.unlockCost / 4));
        set({ roomFunding: { ...state.roomFunding, [id]: funded } });
        if (funded >= facility.unlockCost) return get().unlockFacility(id);
        return true;
      },

      tick: (currentTimestamp: number) => {
        const { facilities, boostExpiresAt, hype, lastSavedTimestamp, cash, lifetimeEarnings, empire } = get();
        
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
        ) + branchIncomePerSecond(empire?.branches);

        const activeEmpire = empire ?? INITIAL_EMPIRE;
        const marketingMultiplier = activeEmpire.executives.some(staff => staff.role === 'cmo' && staff.hired) ? 1.06 + managerRatingBonus(get().hiredStaff, 'cmo') : 1;
        const earned = FormulaService.calculateIntervalIncome(lastSavedTimestamp, currentTimestamp, incomePerSec, boostExpiresAt)
          * districtBonuses(activeEmpire.districtTier).incomeMultiplier * marketingMultiplier;

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
        ) + branchIncomePerSecond(get().empire?.branches);

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
          const rawCashReward = watched === 3 ? 5000 : watched === 5 ? 50000 : 0;
          const empire = get().empire ?? INITIAL_EMPIRE;
          const ceoBonus = empire.executives.some(staff => staff.role === 'ceo' && staff.hired) ? 1.2 + managerRatingBonus(get().hiredStaff, 'ceo') : 1;
          const cashReward = rawCashReward * districtBonuses(empire.districtTier).sponsorMultiplier * ceoBonus;
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
        const { cash, roster, empire } = get();
        const gmHired = (empire ?? INITIAL_EMPIRE).executives.some(staff => staff.role === 'gm' && staff.hired);
        const scoutCost = isVipAd ? 0 : Math.round(500 * (1 - Math.max(gmHired ? 0.2 : 0, managerDiscount(get().hiredStaff, 'gm'))));
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
        let fans = Math.floor(Math.random() * 300 + 200);
        let isClutch = Math.random() < 0.08;
        let contractMatches = 10;
        let hypeSurge = 0;

        if (isVipAd) {
          // VIP Ad roll guarantees Silver or Gold or Diamond
          if (rarityRoll > 0.70) {
            rarity = 'diamond';
            baseStatMin = 85;
            baseStatMax = 98;
            fans = Math.floor(Math.random() * 25000 + 35000);
            isClutch = true;
            contractMatches = 25;
            hypeSurge = 500;
          } else if (rarityRoll > 0.25) {
            rarity = 'gold';
            baseStatMin = 72;
            baseStatMax = 89;
            fans = Math.floor(Math.random() * 6500 + 8500);
            isClutch = Math.random() < 0.45;
            contractMatches = 20;
            hypeSurge = 150;
          } else {
            rarity = 'silver';
            baseStatMin = 52;
            baseStatMax = 74;
            fans = Math.floor(Math.random() * 1500 + 1500);
            isClutch = Math.random() < 0.2;
            contractMatches = 15;
            hypeSurge = 30;
          }
        } else {
          if (rarityRoll > 0.98) {
            rarity = 'diamond';
            baseStatMin = 85;
            baseStatMax = 96;
            fans = Math.floor(Math.random() * 20000 + 30000);
            isClutch = true;
            contractMatches = 25;
            hypeSurge = 400;
          } else if (rarityRoll > 0.88) {
            rarity = 'gold';
            baseStatMin = 70;
            baseStatMax = 88;
            fans = Math.floor(Math.random() * 5000 + 7000);
            isClutch = Math.random() < 0.4;
            contractMatches = 20;
            hypeSurge = 120;
          } else if (rarityRoll > 0.55) {
            rarity = 'silver';
            baseStatMin = 48;
            baseStatMax = 68;
            fans = Math.floor(Math.random() * 1200 + 1200);
            isClutch = Math.random() < 0.15;
            contractMatches = 15;
            hypeSurge = 20;
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
          salaryPerSec: rarity === 'diamond' ? 12 : rarity === 'gold' ? 5 : rarity === 'silver' ? 2 : 0.5,
          stats: {
            aim: Math.floor(Math.random() * (baseStatMax - baseStatMin) + baseStatMin),
            macro: Math.floor(Math.random() * (baseStatMax - baseStatMin) + baseStatMin),
            comms: Math.floor(Math.random() * (baseStatMax - baseStatMin) + baseStatMin),
            tiltResistance: Math.floor(Math.random() * (baseStatMax - baseStatMin) + baseStatMin),
          },
          fans,
          isClutch,
          contractMatchesRemaining: contractMatches,
          sleepQuality: 90,
          mood: 100,
          energy: 100,
          personality: (['grinder', 'showman', 'tactician', 'socialite', 'night_owl'] as PlayerPersonality[])[Math.floor(Math.random() * 5)],
          age: 18 + Math.floor(Math.random() * 15),
          potential: rarity === 'diamond' ? 96 : rarity === 'gold' ? 88 : rarity === 'silver' ? 78 : 69,
          position: discipline === 'fps' ? 'rifler' : discipline === 'moba' ? 'mid' : discipline === 'br' ? 'fragger' : 'fighter',
          dailySchedule: staffDailySchedule(get().hiredStaff),
          sportsPreference: Math.random() < 0.4 ? 'basketball' : Math.random() < 0.75 ? 'football' : 'none',
        };
        newPlayer.potential = Math.max(newPlayer.potential ?? 70, ...Object.values(newPlayer.stats));

        set({
          cash: cash - scoutCost,
          hype: get().hype + hypeSurge,
          roster: [...roster, newPlayer],
        });

        return newPlayer;
      },

      buyCardPack: (discipline) => {
        const state = get();
        const gmHired = (state.empire ?? INITIAL_EMPIRE).executives.some(staff => staff.role === 'gm' && staff.hired);
        const cost = Math.round(CARD_PACK_COST * (1 - Math.max(gmHired ? 0.2 : 0, managerDiscount(state.hiredStaff, 'gm'))));
        if (state.cash < cost) return null;
        const card = generateCard(discipline, state.roster.length);
        const signed = { ...card, dailySchedule: staffDailySchedule(state.hiredStaff) };
        set({ cash: state.cash - cost, roster: [...state.roster, signed] });
        return signed;
      },

      assignLineupSlot: (discipline, slotId, playerId) => {
        if (!LINEUP_SLOTS[discipline].some(slot => slot.id === slotId)) return false;
        const state = get();
        if (playerId !== null && !state.roster.some(player => player.id === playerId && isMatchEligible(player, discipline))) return false;
        const assigned = { ...resolveLineup(state.roster, discipline, state.teamLineups[discipline]) };
        const previousSlot = playerId === null ? undefined : LINEUP_SLOTS[discipline].find(slot => assigned[slot.id] === playerId)?.id;
        const replaced = assigned[slotId] ?? null;
        if (previousSlot && previousSlot !== slotId) assigned[previousSlot] = replaced;
        assigned[slotId] = playerId;
        set({ teamLineups: { ...state.teamLineups, [discipline]: assigned } });
        return true;
      },

      autoFillTeamLineup: discipline => set(state => ({
        teamLineups: { ...state.teamLineups, [discipline]: autoFillLineup(state.roster, discipline) },
      })),

      convertDuplicateCard: playerId => {
        const state = get();
        const card = state.roster.find(player => player.id === playerId);
        if (!card || state.roster.filter(player => duplicateKey(player) === duplicateKey(card)).length < 2) return 0;
        const activeIds = new Set((Object.keys(DISCIPLINE_INFO) as EsportsDiscipline[])
          .flatMap(discipline => Object.values(coachSelectLineup(state.roster, discipline, state.hiredStaff))));
        if (activeIds.has(playerId)) return 0;
        const earned = duplicateValue(card);
        set({ roster: state.roster.filter(player => player.id !== playerId), developmentPoints: state.developmentPoints + earned });
        return earned;
      },

      developPlayer: (playerId, attribute) => {
        const state = get();
        const player = state.roster.find(card => card.id === playerId);
        if (!player) return false;
        const current = getCardAttributes(player)[attribute];
        const cost = developmentCost(current);
        if (current >= trainingCeiling(player) || state.developmentPoints < cost) return false;
        const linkedStats: Partial<Record<keyof CardAttributes, keyof PlayerStats>> = { mechanics: 'aim', gameSense: 'macro', teamwork: 'comms', clutch: 'tiltResistance' };
        const linked = linkedStats[attribute];
        set({ developmentPoints: state.developmentPoints - cost, roster: state.roster.map(card => card.id === playerId ? {
          ...card,
          cardAttributes: { ...getCardAttributes(card), [attribute]: current + 1 },
          stats: linked ? { ...card.stats, [linked]: current + 1 } : card.stats,
        } : card) });
        return true;
      },

      renewContract: (playerId: string, matches = 20) => {
        const { roster, cash } = get();
        const player = roster.find(p => p.id === playerId);
        if (!player) return false;

        const baseRenewalCost =
          player.rarity === 'diamond'
            ? 5000
            : player.rarity === 'gold'
            ? 2200
            : player.rarity === 'silver'
            ? 800
            : 300;

        const renewalCost = Math.round(baseRenewalCost * (1 - managerDiscount(get().hiredStaff, 'gm')));
        if (cash < renewalCost) return false;

        set({
          cash: cash - renewalCost,
          roster: roster.map(p =>
            p.id === playerId
              ? {
                  ...p,
                  contractMatchesRemaining: (p.contractMatchesRemaining ?? 0) + matches,
                  mood: 100,
                }
              : p
          ),
        });
        return true;
      },

      hireCoach: (coachId: string) => {
        const { coaches, cash, roster, facilities } = get();
        const coach = coaches.find(c => c.id === coachId);
        if (!coach || coach.hired) return false;
        if (cash < coach.hireCost) return false;

        const disciplinePros =
          coach.discipline === 'wellness'
            ? roster.length
            : roster.filter(p => p.discipline === coach.discipline).length;

        if (disciplinePros < coach.minProsRequired) return false;

        const facility = facilities[coach.facilityId as FacilityId];
        if (!facility || !facility.isUnlocked || facility.level < coach.minFacilityLevel) {
          return false;
        }

        set({
          cash: cash - coach.hireCost,
          coaches: coaches.map(c => (c.id === coachId ? { ...c, hired: true } : c)),
        });
        return true;
      },

      refreshStaffMarket: () => {
        const state = get();
        if (state.cash < 500) return false;
        const seed = state.staffMarketSeed + 1;
        set({ cash: state.cash - 500, staffMarketSeed: seed, staffMarket: generateStaffMarket(seed) });
        return true;
      },

      hireStaff: candidateId => {
        const state = get();
        const candidate = state.staffMarket.find(person => person.id === candidateId);
        if (!candidate || state.cash < candidate.hireCost) return false;
        const slot = staffSlot(candidate);
        const hiredStaff = [...state.hiredStaff.filter(person => staffSlot(person) !== slot), candidate];
        const empire = state.empire ?? INITIAL_EMPIRE;
        set({ cash: state.cash - candidate.hireCost,
          hiredStaff,
          roster: state.roster.map(player => ({ ...player, dailySchedule: staffDailySchedule(hiredStaff) })),
          staffMarket: state.staffMarket.filter(person => person.id !== candidateId),
          empire: { ...empire, schedule: staffDailySchedule(hiredStaff),
            executives: candidate.kind === 'manager' ? empire.executives.map(person => person.role === candidate.executiveRole ? { ...person, name: candidate.name, hired: true } : person) : empire.executives },
        });
        return true;
      },

      setTimeOfDay: (time: TimeOfDay) => {
        set({ timeOfDay: time });
      },

      cycleTimeOfDay: () => {
        const order: TimeOfDay[] = ['day', 'sunset', 'night'];
        const current = get().timeOfDay ?? 'day';
        const nextIdx = (order.indexOf(current) + 1) % order.length;
        set({ timeOfDay: order[nextIdx] });
      },

      setWallpaperStyle: (wallpaperStyle: WallpaperStyle) => {
        if (wallpaperStyle !== 'default' && !get().empire.vipInventory.includes(`wall_${wallpaperStyle}` as VipItemId)) return false;
        set(state => ({
          houseInterior: {
            ...(state.houseInterior ?? INITIAL_HOUSE_INTERIOR),
            wallpaperStyle,
          },
        }));
        return true;
      },

      equipCosmetic: (itemId) => {
        const state = get();
        if (!state.empire.vipInventory.includes(itemId)) return false;
        const [category, style] = itemId.split('_');
        if (category === 'wall') return state.setWallpaperStyle(style as WallpaperStyle);
        if (category === 'floor') set({ houseInterior: { ...state.houseInterior, flooringStyle: style as FlooringStyle } });
        else if (category === 'facade') set({ houseInterior: { ...state.houseInterior, facadeStyle: style as FacadeStyle } });
        else return false;
        return true;
      },

      resetHouseFinish: (category) => set(state => ({ houseInterior: {
        ...state.houseInterior,
        ...(category === 'Wallpaper' ? { wallpaperStyle: 'default' as const } : {}),
        ...(category === 'Flooring' ? { flooringStyle: 'default' as const } : {}),
        ...(category === 'Facade' ? { facadeStyle: 'default' as const } : {}),
      } })),

      grantVerifiedCosmetic: (itemId) => {
        if (!VIP_ITEMS.some(item => item.id === itemId)) return false;
        const state = get();
        if (state.empire.vipInventory.includes(itemId)) return true;
        set({ empire: { ...state.empire, vipInventory: [...state.empire.vipInventory, itemId] } });
        return true;
      },

      upgradeLoungeTv: () => {
        const { houseInterior, cash, roster } = get();
        const currentInterior = houseInterior ?? INITIAL_HOUSE_INTERIOR;
        const nextLevel = currentInterior.loungeTvLevel + 1;
        if (nextLevel > 3) return false;
        const cost = nextLevel === 2 ? 3500 : 12000;
        if (cash < cost) return false;

        set({
          cash: cash - cost,
          houseInterior: {
            ...currentInterior,
            loungeTvLevel: nextLevel,
          },
          roster: roster.map(p => ({
            ...p,
            mood: Math.min(100, (p.mood ?? 85) + 15),
            sleepQuality: Math.min(100, (p.sleepQuality ?? 85) + 10),
          })),
        });
        return true;
      },

      upgradeDistrict: () => {
        const empire = get().empire ?? INITIAL_EMPIRE;
        if (empire.districtTier >= 3) return false;
        const cost = empire.districtTier === 1 ? 12000 : 65000;
        if (get().cash < cost) return false;
        set(state => ({
          cash: state.cash - cost,
          empire: { ...(state.empire ?? INITIAL_EMPIRE), districtTier: (empire.districtTier + 1) as DistrictTier },
        }));
        return true;
      },

      openBranch: (id) => {
        const definition = BRANCHES.find(branch => branch.id === id);
        const state = get();
        if (!definition || state.empire.branches?.some(branch => branch.id === id) || state.cash < definition.unlockCost) return false;
        set({ cash: state.cash - definition.unlockCost, empire: { ...state.empire, branches: [...(state.empire.branches ?? []), { id, tier: 1 }] } });
        return true;
      },

      upgradeBranch: (id) => {
        const state = get();
        const branch = state.empire.branches?.find(candidate => candidate.id === id);
        if (!branch || branch.tier >= 3) return false;
        const cost = branchUpgradeCost(branch);
        if (state.cash < cost) return false;
        set({ cash: state.cash - cost, empire: { ...state.empire, branches: state.empire.branches!.map(candidate => candidate.id === id ? { ...candidate, tier: (candidate.tier + 1) as 1 | 2 | 3 } : candidate) } });
        return true;
      },

      upgradeFleet: () => {
        const empire = get().empire ?? INITIAL_EMPIRE;
        if (empire.fleetTier >= 3) return false;
        const cost = empire.fleetTier === 1 ? 7500 : 40000;
        if (get().cash < cost) return false;
        set(state => ({ cash: state.cash - cost, empire: { ...(state.empire ?? INITIAL_EMPIRE), fleetTier: (empire.fleetTier + 1) as FleetTier } }));
        return true;
      },

      upgradeFacilityTier: () => {
        const empire = get().empire ?? INITIAL_EMPIRE;
        if (empire.facilityTier >= 3) return false;
        const cost = empire.facilityTier === 1 ? 100000 : 750000;
        if (get().cash < cost || get().legacyTrophies < empire.facilityTier) return false;
        set(state => ({ cash: state.cash - cost, empire: { ...(state.empire ?? INITIAL_EMPIRE), facilityTier: (empire.facilityTier + 1) as FacilityTier } }));
        return true;
      },

      takeOutdoorBreak: (playerId) => {
        const empire = get().empire ?? INITIAL_EMPIRE;
        const bonus = districtBonuses(empire.districtTier);
        const nutrition = nutritionBonus(get().hiredStaff);
        const isSocialLead = get().roster.find(player => player.id === playerId)?.personality === 'socialite';
        set(state => ({
          roster: state.roster.map(player => player.id === playerId ? {
            ...player,
            mood: Math.min(100, (player.mood ?? 75) + bonus.moodRecovery + 8 + nutrition.mood),
            energy: Math.min(100, (player.energy ?? 70) + 15 + nutrition.energy),
            inspiredUntil: Date.now() + 10 * 60 * 1000,
          } : isSocialLead && player.role !== 'inactive' ? { ...player, mood: Math.min(100, (player.mood ?? 75) + 4) } : player),
        }));
      },

      setBranding: (branding) => set(state => ({ empire: { ...(state.empire ?? INITIAL_EMPIRE), branding: { ...(state.empire ?? INITIAL_EMPIRE).branding, ...branding } } })),

      hireExecutive: (role) => {
        const empire = get().empire ?? INITIAL_EMPIRE;
        const staff = empire.executives.find(member => member.role === role);
        if (!staff || staff.hired || get().cash < staff.cost) return false;
        set(state => ({
          cash: state.cash - staff.cost,
          empire: { ...(state.empire ?? INITIAL_EMPIRE), executives: empire.executives.map(member => member.role === role ? { ...member, hired: true } : member) },
        }));
        return true;
      },

      advanceSeasonStage: (won = false) => set(state => {
        const empire = state.empire ?? INITIAL_EMPIRE;
        const calendar = empire.seasonCalendar;
        const stageWins = { ...calendar.stageWins, [calendar.stage]: calendar.stageWins[calendar.stage] + (won ? 1 : 0) };
        const next = nextSeasonStage(calendar.stage);
        return {
          empire: {
            ...empire,
            seasonCalendar: { year: calendar.year + (calendar.stage === 'worlds' ? 1 : 0), stage: next, stageWins, trophies: calendar.trophies + (won && calendar.stage === 'worlds' ? 1 : 0) },
          },
          legacyTrophies: state.legacyTrophies + (won && calendar.stage === 'worlds' ? 1 : 0),
          roster: calendar.stage === 'worlds' ? state.roster.map(player => ({ ...player, age: Math.min(40, (player.age ?? 22) + 1) })) : state.roster,
        };
      }),

      trainCardAttribute: (playerId, attribute) => {
        const state = get();
        const player = state.roster.find(candidate => candidate.id === playerId);
        if (!player) return false;
        const current = getCardAttributes(player)[attribute];
        const cost = current * 5;
        if (current >= trainingCeiling(player) || state.cash < cost) return false;
        const statKey = { mechanics: 'aim', gameSense: 'macro', teamwork: 'comms', clutch: 'tiltResistance' } as const;
        const linked = statKey[attribute as keyof typeof statKey];
        set({ cash: state.cash - cost, roster: state.roster.map(candidate => candidate.id === playerId ? {
          ...candidate,
          cardAttributes: { ...getCardAttributes(candidate), [attribute]: current + 1 },
          stats: linked ? { ...candidate.stats, [linked]: current + 1 } : candidate.stats,
        } : candidate) });
        return true;
      },

      buyVipItem: (itemId) => {
        const item = VIP_ITEMS.find(candidate => candidate.id === itemId);
        const empire = get().empire ?? INITIAL_EMPIRE;
        if (!item || empire.vipInventory.includes(itemId) || get().energyCans < item.cost) return false;
        set(state => ({ energyCans: state.energyCans - item.cost, empire: { ...(state.empire ?? INITIAL_EMPIRE), vipInventory: [...empire.vipInventory, itemId] } }));
        return true;
      },

      trainPlayer: (playerId: string, stat: keyof PlayerStats) => {
        const { roster, cash } = get();
        const player = roster.find(p => p.id === playerId);
        if (!player || player.stats[stat] >= trainingCeiling(player)) return;

        const trainingCost = player.stats[stat] * 5;
        if (cash < trainingCost) return;

        set({
          cash: cash - trainingCost,
          roster: roster.map(p => {
            if (p.id === playerId) {
              const nextStat = Math.min(trainingCeiling(p), p.stats[stat] + 1);
              const attributeKey = { aim: 'mechanics', macro: 'gameSense', comms: 'teamwork', tiltResistance: 'clutch' } as const;
              return {
                ...p,
                stats: {
                  ...p.stats,
                  [stat]: nextStat,
                },
                cardAttributes: { ...getCardAttributes(p), [attributeKey[stat]]: nextStat },
              };
            }
            return p;
          }),
        });
      },

      applyActivityGains: (gains: ActivityGains) => {
        set(state => {
          const empire = state.empire ?? INITIAL_EMPIRE;
          const activePlayers = state.roster.filter(player => player.role !== 'inactive');
          const synergy = scheduleSynergy(activePlayers, empire.schedule[0]);
          const showmanCount = activePlayers.filter(player => player.personality === 'showman').length;
          const opsHired = empire.executives.some(staff => staff.role === 'ops' && staff.hired);
          return ({
          hype: state.hype + gains.hype * (1 + synergy + (showmanCount ? 0.5 : 0)),
          roster: state.roster.map(player => {
            const statGains = gains.stats[player.id];
            if (!statGains) return player;
            const stats = { ...player.stats };
            const trainingProgress = { ...player.trainingProgress };
            const cap = trainingCeiling(player);
            for (const stat of Object.keys(statGains) as (keyof PlayerStats)[]) {
              let multiplier = 1 + synergy;
              if (player.personality === 'grinder' && (stat === 'aim' || stat === 'macro')) multiplier *= 1.25;
              if (player.personality === 'tactician' && stat === 'macro') multiplier *= 1.35;
              if (player.personality === 'scaling') multiplier *= (player.age ?? 22) <= 22 ? 1.5 : 1.15;
              multiplier *= developmentRate(player) * (1 + nutritionBonus(state.hiredStaff).training);
              if ((player.inspiredUntil ?? 0) > Date.now()) multiplier *= 1.15;
              const total = (trainingProgress[stat] ?? 0) + (statGains[stat] ?? 0) * multiplier;
              stats[stat] = Math.min(cap, stats[stat] + Math.floor(total));
              trainingProgress[stat] = stats[stat] >= cap ? 0 : total % 1;
            }
            const attributes = getCardAttributes(player);
            return { ...player, stats, trainingProgress,
              cardAttributes: { ...attributes, mechanics: stats.aim, gameSense: stats.macro, teamwork: stats.comms, clutch: stats.tiltResistance },
              energy: opsHired ? Math.max(25 + Math.round(managerRatingBonus(state.hiredStaff, 'ops') * 100), player.energy ?? 80) : player.energy };
          }),
        });
        });
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
          roomFunding: {},
          boostExpiresAt: 0,
          lifetimeEarnings: 100,
          lastSavedTimestamp: Date.now(),
          powerRankings: INITIAL_POWER_RANKINGS,
          isTournamentUnderway: false,
          activeTournamentMatch: null,
          circuitEvent: null,
          coaches: INITIAL_COACHES,
          staffMarket: generateStaffMarket(season + 1),
          staffMarketSeed: season + 1,
          hiredStaff: [],
          timeOfDay: 'day',
          houseInterior: INITIAL_HOUSE_INTERIOR,
          empire: INITIAL_EMPIRE,
        });
        return true;
      },

      setTournamentUnderway: (underway: boolean) => {
        set({ isTournamentUnderway: underway });
      },

      startCircuit: (discipline, now = Date.now(), tournamentId) => {
        const state = get();
        if (state.circuitEvent?.status === 'active') return false;
        const config = tournamentId ? TOURNAMENTS.find(item => item.id === tournamentId && item.discipline === discipline) : undefined;
        if (tournamentId && !config) return false;
        const ranked = state.powerRankings.filter(team => !team.isPlayerTeam).sort((a, b) => a.rating - b.rating);
        const opponents = Array.from({ length: 7 }, (_, index) => ranked[Math.floor(index * (ranked.length - 1) / 6)])
          .map(team => ({ id: team.id, name: team.name, rating: team.rating }));
        const circuit = createCircuit(discipline, opponents, now, config);
        if (state.cash < circuit.entryFee) return false;
        if (lineupPower(state.roster, discipline, coachSelectLineup(state.roster, discipline, state.hiredStaff)) <= 0) return false;
        set({ cash: state.cash - circuit.entryFee, circuitEvent: circuit });
        return true;
      },

      playNextCircuitRound: (now = Date.now()) => {
        const state = get();
        if (!state.circuitEvent) return false;
        const index = state.circuitEvent.currentRound;
        const round = state.circuitEvent.rounds[index];
        if (!round || now < round.scheduledAt) return false;
        const plan = coachPlan(state.hiredStaff, state.circuitEvent.discipline, round.opponent.id);
        const prepared = { ...state.circuitEvent, rounds: state.circuitEvent.rounds.map((item, itemIndex) => itemIndex === index ? { ...item, tactic: plan.tactic, bannedMap: plan.bannedMap } : item) };
        const next = playCircuitRound(prepared, state.roster, now, Math.random, coachSelectLineup(state.roster, state.circuitEvent.discipline, state.hiredStaff), plan.bonus);
        if (!next) return false;
        const resultRound = next.rounds[index];
        set({ circuitEvent: next });
        get().recordTournamentOutcome(resultRound.result!.won, next.id, resultRound.opponent.id);
        if (next.status === 'won') {
          set(current => ({ cash: current.cash + next.prize, lifetimeEarnings: current.lifetimeEarnings + next.prize, hype: current.hype + (next.hypePrize ?? 100) }));
          get().advanceSeasonStage(true);
        }
        return true;
      },

      setActiveTournamentMatch: (match: ActiveTournamentMatch | null) => {
        set({
          activeTournamentMatch: match,
          isTournamentUnderway: Boolean(match?.isUnderway),
        });
      },

      recordTournamentOutcome: (won: boolean, _tourneyId: string, opponentId?: string) => {
        const { powerRankings, roster } = get();
        const updatedRoster = roster.map(p => {
          if (p.role === 'inactive') return p;
          const currentContract = p.contractMatchesRemaining ?? 20;
          const fanGain = won ? Math.floor(Math.random() * 600 + 600) : 150;
          return {
            ...p,
            contractMatchesRemaining: Math.max(0, currentContract - 1),
            fans: (p.fans ?? 500) + fanGain,
            mood: Math.max(10, Math.min(100, (p.mood ?? 85) + (won ? 10 : -10))),
          };
        });

        const list = powerRankings.map(t => ({ ...t, form: [...t.form] }));
        const playerTeam = list.find(t => t.isPlayerTeam) ?? list[7];
        const opponentTeam = opponentId ? list.find(t => t.id === opponentId) : null;

        if (won) {
          playerTeam.rating += 38;
          playerTeam.wins += 1;
          playerTeam.form.push('W');
          if (playerTeam.form.length > 5) playerTeam.form.shift();

          if (opponentTeam) {
            opponentTeam.rating = Math.max(1000, opponentTeam.rating - 24);
            opponentTeam.losses += 1;
            opponentTeam.form.push('L');
            if (opponentTeam.form.length > 5) opponentTeam.form.shift();
          }
        } else {
          playerTeam.rating = Math.max(1000, playerTeam.rating - 26);
          playerTeam.losses += 1;
          playerTeam.form.push('L');
          if (playerTeam.form.length > 5) playerTeam.form.shift();

          if (opponentTeam) {
            opponentTeam.rating += 26;
            opponentTeam.wins += 1;
            opponentTeam.form.push('W');
            if (opponentTeam.form.length > 5) opponentTeam.form.shift();
          }
        }

        // Simulate minor shifts among two other non-player teams for dynamic realism
        const otherTeams = list.filter(t => !t.isPlayerTeam && t.id !== opponentId);
        if (otherTeams.length >= 2) {
          const idxA = Math.floor(Math.random() * otherTeams.length);
          let idxB = Math.floor(Math.random() * (otherTeams.length - 1));
          if (idxB >= idxA) idxB++;
          const teamA = otherTeams[idxA];
          const teamB = otherTeams[idxB];
          if (Math.random() > 0.5) {
            teamA.rating += 15;
            teamA.wins += 1;
            teamA.form.push('W');
            if (teamA.form.length > 5) teamA.form.shift();
            teamB.rating = Math.max(1000, teamB.rating - 15);
            teamB.losses += 1;
            teamB.form.push('L');
            if (teamB.form.length > 5) teamB.form.shift();
          } else {
            teamB.rating += 15;
            teamB.wins += 1;
            teamB.form.push('W');
            if (teamB.form.length > 5) teamB.form.shift();
            teamA.rating = Math.max(1000, teamA.rating - 15);
            teamA.losses += 1;
            teamA.form.push('L');
            if (teamA.form.length > 5) teamA.form.shift();
          }
        }

        // Store old ranks before sorting
        const oldRanks = new Map<string, number>();
        for (const t of list) {
          oldRanks.set(t.id, t.rank);
        }

        // Sort descending by rating
        list.sort((a, b) => b.rating - a.rating);

        // Update ranks and trends
        list.forEach((t, i) => {
          const newRank = i + 1;
          const oldRank = oldRanks.get(t.id) ?? newRank;
          t.rank = newRank;
          if (newRank < oldRank) t.trend = 'up';
          else if (newRank > oldRank) t.trend = 'down';
          else t.trend = 'same';

          // Tier assignments
          if (newRank <= 3) t.tier = 'S';
          else if (newRank <= 6) t.tier = 'A';
          else if (newRank <= 9) t.tier = 'B';
          else t.tier = 'C';
        });

        set({
          roster: updatedRoster,
          powerRankings: list,
          isTournamentUnderway: false,
          activeTournamentMatch: null,
        });
      },
    }),
    {
      name: 'esports_dynasty_save_v1',
      version: 1,
      partialize: (state) => {
        const { isSimulatedAdOpen, pendingPlacement, pendingCallback, activeDrone, isTournamentUnderway, activeTournamentMatch, ...save } = state;
        return save;
      },
      // Old v1 saves included modal flags but could not serialize callbacks.
      merge: (saved, current) => {
        const { tapPower: _tapPower, tapScrim: _tapScrim, ...previous } = saved as Partial<GameStoreState> & { tapPower?: number; tapScrim?: unknown };
        const migratedStaff: StaffCandidate[] = previous.hiredStaff ?? [
          ...(previous.coaches ?? []).filter(coach => coach.hired && coach.discipline !== 'wellness').map(coach => ({
            id: coach.id, name: coach.name, kind: 'coach' as const, tier: 'regional' as const, rating: 65,
            hireCost: coach.hireCost, discipline: coach.discipline as EsportsDiscipline,
            tactic: coach.discipline === 'moba' ? 'macro' as const : 'aggressive' as const,
          })),
          ...(previous.coaches ?? []).filter(coach => coach.hired && coach.discipline === 'wellness').map(coach => ({
            id: coach.id, name: coach.name, kind: 'nutritionist' as const, tier: 'regional' as const, rating: 65,
            hireCost: coach.hireCost, nutritionStyle: 'recovery' as const,
          })),
          ...(previous.empire?.executives ?? []).filter(person => person.hired).map(person => ({
            id: `legacy_${person.role}`, name: person.name, kind: 'manager' as const, tier: 'regional' as const,
            rating: 65, hireCost: person.cost, executiveRole: person.role,
          })),
        ];
        const managedSchedule = staffDailySchedule(migratedStaff);
        return ({
        ...current,
        ...previous,
        roster: (previous.roster ?? current.roster).map(player => {
          const { avatar: _avatar, ...rest } = player as ProPlayer & { avatar?: string };
          return { ...rest, portraitIndex: getPortraitIndex(player.id, player.portraitIndex),
            dailySchedule: managedSchedule };
        }),
        facilities: { ...INITIAL_FACILITIES, ...(previous.facilities ?? {}) },
        roomFunding: previous.roomFunding ?? {},
        teamLineups: previous.teamLineups ?? {},
        developmentPoints: previous.developmentPoints ?? 0,
        powerRankings: previous.powerRankings ?? current.powerRankings ?? INITIAL_POWER_RANKINGS,
        coaches: previous.coaches ?? current.coaches ?? INITIAL_COACHES,
        staffMarketSeed: previous.staffMarketSeed ?? INITIAL_STAFF_SEED,
        staffMarket: previous.staffMarket ?? generateStaffMarket(previous.staffMarketSeed ?? INITIAL_STAFF_SEED),
        hiredStaff: migratedStaff,
        timeOfDay: previous.timeOfDay ?? current.timeOfDay ?? 'day',
        houseInterior: { ...INITIAL_HOUSE_INTERIOR, ...(current.houseInterior ?? {}), ...(previous.houseInterior ?? {}) },
        empire: {
          ...INITIAL_EMPIRE,
          ...(current.empire ?? INITIAL_EMPIRE),
          ...(previous.empire ?? {}),
          basketballTier: previous.empire?.basketballTier ?? 1,
          footballTier: previous.empire?.footballTier ?? 1,
          branding: { ...INITIAL_EMPIRE.branding, ...(previous.empire?.branding ?? {}) },
          schedule: managedSchedule,
          executives: previous.empire?.executives ?? INITIAL_EMPIRE.executives,
          seasonCalendar: {
            ...INITIAL_EMPIRE.seasonCalendar,
            ...(previous.empire?.seasonCalendar ?? {}),
            stageWins: { ...INITIAL_EMPIRE.seasonCalendar.stageWins, ...(previous.empire?.seasonCalendar?.stageWins ?? {}) },
          },
          vipInventory: Array.from(new Set([
            ...(previous.empire?.vipInventory ?? []),
            ...(previous.houseInterior?.wallpaperStyle && previous.houseInterior.wallpaperStyle !== 'default'
              ? [`wall_${previous.houseInterior.wallpaperStyle}` as VipItemId] : []),
          ])),
          branches: previous.empire?.branches ?? [],
        },
        isTournamentUnderway: false,
        activeTournamentMatch: null,
        circuitEvent: previous.circuitEvent ?? null,
        isSimulatedAdOpen: false,
        pendingPlacement: null,
        pendingCallback: null,
        activeDrone: null,
      });
      },
    }
  )
);
