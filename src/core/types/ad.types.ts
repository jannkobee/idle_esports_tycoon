export type AdPlacement =
  | 'boost_2x_income'
  | 'offline_multiplier'
  | 'scout_vip_pull'
  | 'sponsor_drone_drop'
  | 'tournament_clutch_buff'
  | 'fast_track_training';

export interface AdRewardResult {
  completed: boolean;
  placement: AdPlacement;
  timestamp: number;
}

export interface AdBoostStatus {
  isActive: boolean;
  remainingSeconds: number;
  multiplier: number;
}
