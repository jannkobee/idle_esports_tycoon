import type { FacilityId } from '../types/facility.types';
import type { Rect, Vec } from '../types/house.types';

// Physical footprints, shared by scene geometry and pathfinding. Never scale
// a room independently from its stations or add decorative duplicate rooms.
export const CAMPUS = {
  arena: { x: 14.1, y: 0.4, w: 6.5, d: 5.8 },
  merch: { x: 11, y: 7.5, w: 6.2, d: 6.1 },
  dining: { x: -5.4, y: 7.5, w: 5.2, d: 6.1 },
  eastHall: { x: 13.6, y: 6.2, w: 7, d: 1.3 },
  westHall: { x: -5.4, y: 6.2, w: 5.8, d: 1.3 },
  garage: { x: 18.2, y: 8.2, w: 7.2, d: 6 },
} satisfies Record<string, Rect>;

export const arenaOpen = (unlocked: Set<FacilityId>, levels: Partial<Record<FacilityId, number>>) =>
  unlocked.has('scrim_lab') && (levels.scrim_lab ?? 0) >= 6;

// Ground-floor shell. Hall exits are the only breaks in its collision boundary.
export const CORE_SHELL_WALLS: Rect[] = [
  { x: 0.3, y: 0.28, w: 13.42, d: 0.12 },
  { x: 0.28, y: 0.4, w: 0.12, d: 5.8 },
  { x: 0.28, y: 7.5, w: 0.12, d: 6.1 },
  { x: 13.6, y: 0.4, w: 0.12, d: 5.8 },
  { x: 0.4, y: 13.6, w: 6, d: 0.12 },
  { x: 7.4, y: 13.6, w: 3.6, d: 0.12 },
];

// Ground-level furniture footprints include the full visible countertop.
export const DINING_OBSTACLES: Rect[] = [
  { x: -4.125, y: 8.14, w: 3.05, d: 0.72 },
  { x: -5.325, y: 8.14, w: 1.25, d: 0.72 },
  { x: -1.48, y: 9.07, w: 0.96, d: 1.66 },
  { x: -4.4, y: 10.95, w: 0.55, d: 1.6 },
  { x: -3.62, y: 10.98, w: 1.24, d: 1.24 },
  { x: -1.75, y: 11.05, w: 1.1, d: 1.1 },
  { x: -1.425, y: 12.375, w: 0.85, d: 0.65 },
  { x: -5.2, y: 12.35, w: 0.6, d: 0.7 },
];

export function campusWalls(unlocked: Set<FacilityId>, levels: Partial<Record<FacilityId, number>>): Rect[] {
  const walls: Rect[] = [];
  if (unlocked.has('merch_store')) walls.push(
    { x: 13.6, y: 7.5, w: 3.6, d: 0.12 },
    { x: 17.2, y: 7.5, w: 0.12, d: 6.1 },
    { x: 11.0, y: 13.6, w: 2.3, d: 0.12 },
    { x: 15.0, y: 13.6, w: 2.2, d: 0.12 },
  );
  if (unlocked.has('cafeteria')) walls.push(
    { x: -5.4, y: 7.5, w: 1.4, d: 0.12 },
    { x: -2.4, y: 7.5, w: 2.2, d: 0.12 },
    { x: -5.52, y: 7.5, w: 0.12, d: 2.5 },
    { x: -5.52, y: 11.6, w: 0.12, d: 2.0 },
    { x: -5.4, y: 13.6, w: 5.2, d: 0.12 },
    { x: -0.32, y: 7.5, w: 0.12, d: 6.1 },
  );
  if (arenaOpen(unlocked, levels)) walls.push(
    { x: 14.1, y: 0.28, w: 6.5, d: 0.12 },
    { x: 14.1, y: 0.4, w: 0.12, d: 5.8 },
    { x: 20.48, y: 0.4, w: 0.12, d: 5.8 },
    { x: 14.1, y: 6.08, w: 2.3, d: 0.12 },
    { x: 18.1, y: 6.08, w: 2.5, d: 0.12 },
  );
  return walls;
}

export function onCampusFloor(point: Vec, unlocked: Set<FacilityId>, levels: Partial<Record<FacilityId, number>>): boolean {
  const inside = (r: Rect) => point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.d;
  return (unlocked.has('merch_store') && inside(CAMPUS.merch))
    || (unlocked.has('cafeteria') && (inside(CAMPUS.dining) || inside(CAMPUS.westHall)))
    || (arenaOpen(unlocked, levels) && inside(CAMPUS.arena))
    || ((unlocked.has('merch_store') || arenaOpen(unlocked, levels)) && inside(CAMPUS.eastHall));
}
