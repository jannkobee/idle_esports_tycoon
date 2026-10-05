import { describe, expect, it } from 'vitest';
import { CAMPUS, campusWalls, onCampusFloor, CORE_SHELL_WALLS } from './campusLayout';
import { HOUSE_STATIONS, FRONT_DOOR_SPAWN, isStationAvailable } from './houseGeometry';
import { findAStarPath, getNavGrid } from './navigation';
import type { FacilityId } from '../types/facility.types';

describe('connected campus layout', () => {
  const unlocked = new Set<FacilityId>(['scrim_lab', 'streaming_pod', 'gym', 'analyst_room', 'merch_store', 'cafeteria']);
  const levels = Object.fromEntries([...unlocked].map(id => [id, 6])) as Record<FacilityId, number>;

  it('keeps the physical extensions and garage in separate plots, south of sports', () => {
    const plots = [CAMPUS.arena, CAMPUS.merch, CAMPUS.dining, CAMPUS.garage];
    for (let i = 0; i < plots.length; i++) {
      expect(plots[i].y).toBeGreaterThanOrEqual(0);
      for (const other of plots.slice(i + 1)) {
        const a = plots[i];
        expect(a.x < other.x + other.w && a.x + a.w > other.x && a.y < other.y + other.d && a.y + a.d > other.y).toBe(false);
      }
    }
  });

  it('reserves locked room plots and exposes the arena only at level six', () => {
    const starter = new Set<FacilityId>(['scrim_lab']);
    const grid = getNavGrid({ unlockedFacilities: starter, facilityLevels: { ...levels, scrim_lab: 1 } });
    expect(grid.isPointWalkable(15, 3)).toBe(false);
    expect(grid.isPointWalkable(15, 10)).toBe(false);
    expect(onCampusFloor({ x: 15, y: 3 }, starter, { scrim_lab: 1 })).toBe(false);
    expect(onCampusFloor({ x: 15, y: 3 }, starter, { scrim_lab: 6 })).toBe(true);
  });

  it('routes through visible entrances to every arena rig, the showroom, and dining', () => {
    const grid = getNavGrid({ unlockedFacilities: unlocked, facilityLevels: levels });
    const stations = HOUSE_STATIONS.filter(s => s.id.startsWith('arena_station_') || s.id === 'merch_browse' || s.id === 'cafeteria_meal_table');
    expect(stations).toHaveLength(14);
    for (const station of stations) {
      expect(isStationAvailable(station, unlocked, levels)).toBe(true);
      expect(grid.isPointWalkable(station.approach.x, station.approach.y), station.id).toBe(true);
      const path = findAStarPath(grid, FRONT_DOOR_SPAWN, station.approach);
      expect(Math.hypot(path.at(-1)!.x - station.approach.x, path.at(-1)!.y - station.approach.y)).toBeLessThan(0.2);
      for (let i = 1; i < path.length; i++) expect(grid.hasLineOfSight(path[i - 1], path[i]), station.id).toBe(true);
    }
    for (const wall of campusWalls(unlocked, levels)) expect(grid.isPointWalkable(wall.x + wall.w / 2, wall.y + wall.d / 2)).toBe(false);
  });

  it('keeps every active station approach reachable through doors at all model milestones', () => {
    for (const level of [1, 10, 25, 50, 100, 250, 1000]) {
      const currentLevels = Object.fromEntries([...unlocked].map(id => [id, level])) as Record<FacilityId, number>;
      const grid = getNavGrid({ unlockedFacilities: unlocked, facilityLevels: currentLevels, districtTier: 3 });
      for (const wall of CORE_SHELL_WALLS) expect(grid.isPointWalkable(wall.x + wall.w / 2, wall.y + wall.d / 2)).toBe(false);
      for (const station of HOUSE_STATIONS.filter(s => isStationAvailable(s, unlocked, currentLevels, 3))) {
        const path = findAStarPath(grid, FRONT_DOOR_SPAWN, station.approach);
        expect(grid.isPointWalkable(station.approach.x, station.approach.y), `${station.id} level ${level}`).toBe(true);
        expect(path.length, station.id).toBeGreaterThan(0);
        for (let i = 1; i < path.length; i++) expect(grid.hasLineOfSight(path[i - 1], path[i]), station.id).toBe(true);
      }
    }
  });
});
