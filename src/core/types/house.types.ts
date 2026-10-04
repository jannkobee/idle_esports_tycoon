import { FacilityId } from './facility.types';
import { PlayerStats } from './player.types';

export interface Vec { x: number; y: number }
/** Axis-aligned footprint in house tile coordinates. */
export interface Rect { x: number; y: number; w: number; d: number }

export type ActivityId = 'practice' | 'stream' | 'exercise' | 'review' | 'break';

/**
 * Screen-facing direction in the isometric view.
 * ne = back view facing right (toward -y), nw = back view facing left (toward -x),
 * se = front view facing right (toward +x), sw = front view facing left (toward +y).
 */
export type Facing = 'ne' | 'nw' | 'se' | 'sw';

export type StationPose = 'sit' | 'stand' | 'run' | 'lift' | 'bike' | 'stretch' | 'lounge' | 'tv' | 'hoops';

export type HouseArea = FacilityId | 'hall';

export interface HouseStation {
  id: string;
  activity: ActivityId;
  area: HouseArea;
  /** Where the character sits or stands while doing the activity. */
  seat: Vec;
  /** Walkable point next to the seat; navigation paths start and end here. */
  approach: Vec;
  facing: Facing;
  pose: StationPose;
  minLevel: number;
  /** Chat partner spot: two players on break here talk to each other. */
  partnerId?: string;
  prop?: 'cup' | 'snack' | 'phone';
  label: string;
}

export type FurnitureKind =
  | 'desk' | 'chair' | 'streamDesk' | 'backdrop' | 'sofa' | 'table' | 'wallScreen' | 'bookshelf'
  | 'treadmill' | 'bench' | 'bike' | 'mat' | 'cooler' | 'vending' | 'rack' | 'plant' | 'waterStation' | 'counter'
  | 'patioSofa' | 'patioTv' | 'basketballHoop' | 'gardenBench' | 'carSeat';

export interface FurnitureItem {
  id: string;
  kind: FurnitureKind;
  area: HouseArea;
  rect: Rect;
  minLevel: number;
  /** Whether characters must walk around it. Floor mats are not obstacles. */
  obstacle: boolean;
  /** Station this furniture belongs to, used to light up occupied equipment. */
  stationId?: string;
}

export interface WallSegment { area: HouseArea; rect: Rect; axis: 'x' | 'y' }

export interface ActivityGains {
  hype: number;
  stats: Record<string, Partial<PlayerStats>>;
}
