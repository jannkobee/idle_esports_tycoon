import { Facility, FacilityId } from './facility.types';
import { ProPlayer } from './player.types';
import { AdPlacement } from './ad.types';

export interface GameCurrencies {
  cash: number;
  hype: number;
  energyCans: number;
  legacyTrophies: number;
}

export interface EconomyState extends GameCurrencies {
  tapPower: number;
  lifetimeEarnings: number;
}

export interface AdSystemState {
  boostExpiresAt: number; // timestamp ms
  dailyAdsWatched: number;
  lastAdResetDate: string; // YYYY-MM-DD
  isSimulatedAdOpen: boolean;
  activeAdPlacement: AdPlacement | null;
}

export interface GameSaveState {
  version: number;
  currencies: EconomyState;
  facilities: Record<FacilityId, Facility>;
  roster: ProPlayer[];
  ads: AdSystemState;
  lastSavedTimestamp: number;
  season: number;
}
