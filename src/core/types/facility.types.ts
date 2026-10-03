export type FacilityId = 
  | 'scrim_lab'
  | 'streaming_pod'
  | 'gym'
  | 'analyst_room'
  | 'merch_store';

export interface Facility {
  id: FacilityId;
  name: string;
  category: 'training' | 'content' | 'wellness' | 'strategy' | 'commerce';
  description: string;
  level: number;
  baseCost: number;
  costMultiplier: number;
  baseIncomePerSec: number;
  icon: string;
  isUnlocked: boolean;
  unlockCost: number;
  requiredHype: number;
}
