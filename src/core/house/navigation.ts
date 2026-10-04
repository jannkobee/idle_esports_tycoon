import { HOUSE_ROOMS } from '../engine/HouseLayout';
import { FacilityId } from '../types/facility.types';
import { HouseStation, Rect, Vec } from '../types/house.types';
import {
  BLOCKED_STRIP,
  FRONT_DOOR_SPAWN,
  HOUSE_FURNITURE,
  HOUSE_WALLS,
} from './houseGeometry';

export interface NavContext {
  unlockedFacilities: Set<FacilityId>;
  facilityLevels: Record<FacilityId, number>;
  districtTier?: number;
}

const GRID_STEP = 0.25;
const INFLATE = 0.15;
const LOS_STEP = 0.05;

// Grid limits: house tile coordinates range from 0 to 14.5
const X_MIN = -12.5;
const X_MAX = 22.5;
const Y_MIN = -19.0;
const Y_MAX = 35.5;

const COLS = Math.ceil((X_MAX - X_MIN) / GRID_STEP) + 1;
const ROWS = Math.ceil((Y_MAX - Y_MIN) / GRID_STEP) + 1;

function toGridX(x: number): number {
  return Math.round((x - X_MIN) / GRID_STEP);
}

function toGridY(y: number): number {
  return Math.round((y - Y_MIN) / GRID_STEP);
}

function fromGridX(gx: number): number {
  return X_MIN + gx * GRID_STEP;
}

function fromGridY(gy: number): number {
  return Y_MIN + gy * GRID_STEP;
}

function pointInRect(px: number, py: number, r: Rect, inflate = 0): boolean {
  return (
    px >= r.x - inflate &&
    px <= r.x + r.w + inflate &&
    py >= r.y - inflate &&
    py <= r.y + r.d + inflate
  );
}

export class NavGrid {
  readonly key: string;
  private readonly walkable: Uint8Array;
  private readonly activeObstacles: Rect[];
  private readonly lockedRoomRects: Rect[];
  private readonly cafeteriaOpen: boolean;

  constructor(context: NavContext) {
    const { unlockedFacilities, facilityLevels } = context;
    this.cafeteriaOpen = unlockedFacilities.has('cafeteria');
    const sortedRooms = Array.from(unlockedFacilities).sort().join(',');
    const sortedLevels = Object.entries(facilityLevels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    this.key = `${sortedRooms}|${sortedLevels}`;

    this.walkable = new Uint8Array(COLS * ROWS);
    this.activeObstacles = [];
    this.lockedRoomRects = [];

    // 1. Walls are obstacles
    for (const w of HOUSE_WALLS) {
      this.activeObstacles.push(w.rect);
    }

    // 2. Active furniture obstacles
    for (const item of HOUSE_FURNITURE) {
      if (!item.obstacle) continue;
      if (item.area !== 'hall') {
        const facId = item.area as FacilityId;
        if (!unlockedFacilities.has(facId)) continue;
        const level = facilityLevels[facId] ?? 1;
        if (level < item.minLevel) continue;
      }
      this.activeObstacles.push(item.rect);
    }

    // 3. Blocked strip between gym and merch
    this.activeObstacles.push(BLOCKED_STRIP);

    // 4. Locked rooms
    for (const room of HOUSE_ROOMS) {
      if (!unlockedFacilities.has(room.id)) {
        this.lockedRoomRects.push({
          x: room.x,
          y: room.y,
          w: room.w,
          d: room.d,
        });
      }
    }

    // Populate walkable grid
    for (let gy = 0; gy < ROWS; gy++) {
      const py = fromGridY(gy);
      for (let gx = 0; gx < COLS; gx++) {
        const px = fromGridX(gx);
        const idx = gy * COLS + gx;
        this.walkable[idx] = this.checkPointWalkable(px, py) ? 1 : 0;
      }
    }
  }

  isPointWalkable(px: number, py: number): boolean {
    return this.checkPointWalkable(px, py);
  }

  private checkPointWalkable(px: number, py: number): boolean {
    // Check house perimeter bounds:
    // Regular bounds: x in [0.4, 13.6], y in [0.4, 13.6]
    // Or H2 entrance down to y = 14.2: x in [6.4, 7.4], y in [13.6, 14.15]
    const inRegularBounds = px >= 0.4 && px <= 13.6 && py >= 0.4 && py <= 13.6;
    const inEntrance = px >= 6.4 && px <= 7.4 && py > 13.6 && py <= 14.15;
    const inOutdoorWalk = (px >= -8 && px <= 22 && py >= 13.6 && py <= 16.0)
      || (px >= -8 && px <= 0.4 && py >= -18.5 && py <= 16)
      || (px >= 13.6 && px <= 22 && py >= -18.5 && py <= 16)
      || (px >= -8 && px <= 22 && py >= -18.5 && py <= 0.4);
    // Pedestrians use the marked crosswalk, then the opposite sidewalk and
    // open-front shop interiors. The traffic lanes remain non-walkable.
    const inCrosswalk = px >= -3.25 && px <= -0.75 && py >= 16 && py <= 27.6;
    const inShopSidewalk = px >= -12.0 && px <= 20 && py >= 26.5 && py <= 29.9;
    const inMart = px >= -11.7 && px <= -4.3 && py >= 29.5 && py <= 33.7;
    const inCafe = px >= -0.15 && px <= 6.55 && py >= 29.5 && py <= 33.7;
    const inCafeteria = px >= -5.4 && px <= -0.2 && py >= 7.5 && py <= 13.6 && this.cafeteriaOpen;
    if (!inRegularBounds && !inEntrance && !inOutdoorWalk && !inCafeteria && !inCrosswalk && !inShopSidewalk && !inMart && !inCafe) return false;

    // Check locked rooms
    for (const lr of this.lockedRoomRects) {
      if (pointInRect(px, py, lr, 0)) return false;
    }

    // Check inflated obstacles
    for (const obs of this.activeObstacles) {
      if (pointInRect(px, py, obs, INFLATE)) return false;
    }

    return true;
  }

  isGridWalkable(gx: number, gy: number): boolean {
    if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return false;
    return this.walkable[gy * COLS + gx] === 1;
  }

  findNearestWalkable(start: Vec): Vec {
    if (this.isPointWalkable(start.x, start.y)) {
      return { ...start };
    }

    const startGx = toGridX(start.x);
    const startGy = toGridY(start.y);

    let bestDist = Infinity;
    let bestPoint: Vec = FRONT_DOOR_SPAWN;

    // Search outwards in grid rings up to 30 cells (7.5 tiles)
    for (let r = 1; r <= 30; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const gx = startGx + dx;
          const gy = startGy + dy;
          if (this.isGridWalkable(gx, gy)) {
            const wx = fromGridX(gx);
            const wy = fromGridY(gy);
            const dist = (wx - start.x) ** 2 + (wy - start.y) ** 2;
            if (dist < bestDist) {
              bestDist = dist;
              bestPoint = { x: wx, y: wy };
            }
          }
        }
      }
      if (bestDist < Infinity) break;
    }

    return bestPoint;
  }

  hasLineOfSight(a: Vec, b: Vec): boolean {
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    if (dist < LOS_STEP) return true;
    const steps = Math.ceil(dist / LOS_STEP);
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      if (!this.checkPointWalkable(x, y)) {
        return false;
      }
    }
    return true;
  }
}

// Caches
const gridCache = new Map<string, NavGrid>();
const pathCache = new Map<string, Vec[]>();
const MAX_PATH_CACHE = 500;

export function getNavGrid(context: NavContext): NavGrid {
  const sortedRooms = Array.from(context.unlockedFacilities).sort().join(',');
  const sortedLevels = Object.entries(context.facilityLevels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(',');
  const key = `${sortedRooms}|${sortedLevels}`;

  let grid = gridCache.get(key);
  if (!grid) {
    grid = new NavGrid(context);
    gridCache.set(key, grid);
  }
  return grid;
}

interface Node {
  gx: number;
  gy: number;
  g: number;
  f: number;
  parent?: Node;
}

export function findAStarPath(grid: NavGrid, start: Vec, goal: Vec): Vec[] {
  const startWalkable = grid.findNearestWalkable(start);
  const goalWalkable = grid.findNearestWalkable(goal);

  const startGx = toGridX(startWalkable.x);
  const startGy = toGridY(startWalkable.y);
  const goalGx = toGridX(goalWalkable.x);
  const goalGy = toGridY(goalWalkable.y);

  if (startGx === goalGx && startGy === goalGy) {
    return [startWalkable, goalWalkable];
  }

  const cacheKey = `${grid.key}|${startGx},${startGy}->${goalGx},${goalGy}`;
  const cached = pathCache.get(cacheKey);
  if (cached) {
    return cached.map(p => ({ ...p }));
  }

  const openList: Node[] = [];
  const openMap = new Map<number, Node>();
  const closedSet = new Uint8Array(COLS * ROWS);

  const heuristic = (gx: number, gy: number): number => {
    const dx = Math.abs(gx - goalGx);
    const dy = Math.abs(gy - goalGy);
    // Octile distance
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  };

  const startNode: Node = {
    gx: startGx,
    gy: startGy,
    g: 0,
    f: heuristic(startGx, startGy),
  };

  openList.push(startNode);
  openMap.set(startGy * COLS + startGx, startNode);

  // 8 directions: [dx, dy, cost]
  const DIRS: [number, number, number][] = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, Math.SQRT2],
    [1, -1, Math.SQRT2],
    [-1, 1, Math.SQRT2],
    [-1, -1, Math.SQRT2],
  ];

  let foundNode: Node | undefined;

  while (openList.length > 0) {
    // Pick node with lowest f
    let bestIdx = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[bestIdx].f) {
        bestIdx = i;
      }
    }
    const current = openList.splice(bestIdx, 1)[0];
    const currentIdx = current.gy * COLS + current.gx;
    openMap.delete(currentIdx);
    closedSet[currentIdx] = 1;

    if (current.gx === goalGx && current.gy === goalGy) {
      foundNode = current;
      break;
    }

    for (const [dx, dy, cost] of DIRS) {
      const ngx = current.gx + dx;
      const ngy = current.gy + dy;
      const nIdx = ngy * COLS + ngx;

      if (!grid.isGridWalkable(ngx, ngy)) continue;
      if (closedSet[nIdx] === 1) continue;

      // No corner cutting check for diagonal movements:
      if (dx !== 0 && dy !== 0) {
        if (
          !grid.isGridWalkable(current.gx + dx, current.gy) ||
          !grid.isGridWalkable(current.gx, current.gy + dy)
        ) {
          continue;
        }
      }

      const tentativeG = current.g + cost;
      const existing = openMap.get(nIdx);

      if (!existing) {
        const neighborNode: Node = {
          gx: ngx,
          gy: ngy,
          g: tentativeG,
          f: tentativeG + heuristic(ngx, ngy),
          parent: current,
        };
        openList.push(neighborNode);
        openMap.set(nIdx, neighborNode);
      } else if (tentativeG < existing.g) {
        existing.g = tentativeG;
        existing.f = tentativeG + heuristic(ngx, ngy);
        existing.parent = current;
      }
    }
  }

  let rawPoints: Vec[] = [];
  if (foundNode) {
    let curr: Node | undefined = foundNode;
    while (curr) {
      rawPoints.push({ x: fromGridX(curr.gx), y: fromGridY(curr.gy) });
      curr = curr.parent;
    }
    rawPoints.reverse();
  } else {
    // Fallback: direct line to goalWalkable if path not found
    rawPoints = [startWalkable, goalWalkable];
  }

  // Smooth path with line-of-sight checks
  const smoothed = smoothPath(grid, rawPoints);

  if (pathCache.size >= MAX_PATH_CACHE) {
    pathCache.clear();
  }
  pathCache.set(cacheKey, smoothed);

  return smoothed.map(p => ({ ...p }));
}

export function smoothPath(grid: NavGrid, path: Vec[]): Vec[] {
  if (path.length <= 2) return path;

  const smoothed: Vec[] = [path[0]];
  let currentIdx = 0;

  while (currentIdx < path.length - 1) {
    let furthest = currentIdx + 1;
    for (let testIdx = path.length - 1; testIdx > currentIdx + 1; testIdx--) {
      if (grid.hasLineOfSight(path[currentIdx], path[testIdx])) {
        furthest = testIdx;
        break;
      }
    }
    smoothed.push(path[furthest]);
    currentIdx = furthest;
  }

  return smoothed;
}

/**
 * Complete route from character's current position to a target station:
 * seat -> approach -> nav path -> approach -> seat
 */
export function createStationRoute(
  startPos: Vec,
  targetStation: HouseStation,
  currentStation: HouseStation | null,
  context: NavContext
): Vec[] {
  const grid = getNavGrid(context);
  const route: Vec[] = [];

  // 1. If currently at a seat, walk to current station's approach first
  if (currentStation && Math.hypot(startPos.x - currentStation.seat.x, startPos.y - currentStation.seat.y) < 0.2) {
    route.push({ ...currentStation.seat });
    route.push({ ...currentStation.approach });
  } else {
    route.push({ ...startPos });
  }

  const navStart = route[route.length - 1];
  const navGoal = targetStation.approach;

  // 2. Middle leg: A* path from navStart to target approach
  const navPath = findAStarPath(grid, navStart, navGoal);
  for (let i = 1; i < navPath.length; i++) {
    route.push(navPath[i]);
  }

  // 3. Final leg: target approach to target seat
  const lastPoint = route[route.length - 1];
  if (Math.hypot(lastPoint.x - targetStation.approach.x, lastPoint.y - targetStation.approach.y) > 0.05) {
    route.push({ ...targetStation.approach });
  }
  if (Math.hypot(targetStation.approach.x - targetStation.seat.x, targetStation.approach.y - targetStation.seat.y) > 0.05) {
    route.push({ ...targetStation.seat });
  }

  // Deduplicate consecutive close points (< 0.02)
  const cleaned: Vec[] = [];
  for (const pt of route) {
    if (cleaned.length === 0) {
      cleaned.push(pt);
    } else {
      const prev = cleaned[cleaned.length - 1];
      if (Math.hypot(pt.x - prev.x, pt.y - prev.y) > 0.02) {
        cleaned.push(pt);
      }
    }
  }

  return cleaned;
}
