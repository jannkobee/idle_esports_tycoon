import { FacilityId } from '../types/facility.types';

export interface HouseRoom {
  id: FacilityId;
  label: string;
  x: number;
  y: number;
  w: number;
  d: number;
  floor: string;
  accent: string;
}

export const HOUSE_ROOMS: HouseRoom[] = [
  { id: 'scrim_lab', label: 'SCRIM LAB', x: .4, y: .4, w: 6, d: 5.8, floor: '#bfdedc', accent: '#06b6b4' },
  { id: 'streaming_pod', label: 'STREAM STUDIO', x: 7.4, y: .4, w: 6.2, d: 5.8, floor: '#dfcce8', accent: '#ac67cc' },
  { id: 'analyst_room', label: 'STRATEGY ROOM', x: .4, y: 7.5, w: 6, d: 6.1, floor: '#cad8eb', accent: '#618dd2' },
  { id: 'gym', label: 'TEAM GYM', x: 7.4, y: 7.5, w: 3, d: 6.1, floor: '#e7d8b0', accent: '#d8a949' },
  { id: 'merch_store', label: 'MERCH SHOP', x: 11, y: 7.5, w: 2.6, d: 6.1, floor: '#d0e5bf', accent: '#77aa50' },
  { id: 'cafeteria', label: 'CAFETERIA', x: -5.4, y: 7.5, w: 5.2, d: 6.1, floor: '#fed7aa', accent: '#f97316' },
];

export const iso = (x: number, y: number, z = 0) => ({ x: 430 + (x - y) * 26, y: 176 + (x + y) * 13 - z });
export const point = (x: number, y: number, z = 0) => { const p = iso(x, y, z); return `${p.x},${p.y}`; };
export const floorPoints = (x: number, y: number, w: number, d: number, z = 0) =>
  [point(x, y, z), point(x + w, y, z), point(x + w, y + d, z), point(x, y + d, z)].join(' ');

// Walk only through the scrim lab and the cross-shaped common hallway.
// The route never enters a locked room or crosses furniture.
export const PLAYER_ROUTE = [
  { x: 5.5, y: 4.9 }, { x: 5.5, y: 6.8 },
  { x: 6.9, y: 6.8 }, { x: 6.9, y: 12.7 },
  { x: 6.9, y: 6.8 }, { x: 5.5, y: 6.8 }, { x: 5.5, y: 4.9 },
];

export function getHousePlayerPosition(seconds: number, index: number) {
  const cycle = ((seconds + index * 7) % 48 + 48) % 48;
  const seat = { x: 1.7 + (index % 3) * 1.6, y: 2.4 + Math.floor((index % 6) / 3) * 2.2 };
  if (cycle < 24) return { ...seat, activity: 'Practicing' };
  const doorway = { x: 5.95, y: seat.y };
  const route = [seat, doorway, { x: 5.95, y: 6.8 }, ...PLAYER_ROUTE.slice(2, 5), { x: 5.95, y: 6.8 }, doorway, seat];
  const progress = (cycle - 24) / 24 * (route.length - 1);
  const segment = Math.min(Math.floor(progress), route.length - 2);
  const from = route[segment];
  const to = route[segment + 1];
  const fraction = progress - segment;
  return { x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction, activity: 'Taking a break' };
}
