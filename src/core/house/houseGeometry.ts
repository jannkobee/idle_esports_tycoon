import { FacilityId } from "../types/facility.types";
import {
  FurnitureItem,
  HouseArea,
  HouseStation,
  Rect,
  Vec,
  WallSegment,
} from "../types/house.types";

export const HALL_BOUNDS = {
  h1: { xMin: 0.4, xMax: 13.6, yMin: 6.2, yMax: 7.5 },
  h2: { xMin: 6.4, xMax: 7.4, yMin: 0.4, yMax: 14.2 },
};

export const FRONT_DOOR_SPAWN: Vec = { x: 6.9, y: 13.95 };

export const BLOCKED_STRIP: Rect = { x: 10.4, y: 7.5, w: 0.6, d: 6.1 };

export function getVisualTier(level: number): 1 | 2 | 3 | 4 {
  if (level >= 25) return 4;
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  return 1;
}

/**
 * Walls inside room edges (0.12 thick) with doorway gaps.
 */
export const HOUSE_WALLS: WallSegment[] = [
  // Scrim Lab: bottom y 6.08 [door x 4.4-5.6], right x 6.28 [door y 4.7-5.9]
  { area: "scrim_lab", rect: { x: 0.4, y: 6.08, w: 4.0, d: 0.12 }, axis: "x" },
  { area: "scrim_lab", rect: { x: 5.6, y: 6.08, w: 0.8, d: 0.12 }, axis: "x" },
  { area: "scrim_lab", rect: { x: 6.28, y: 0.4, w: 0.12, d: 4.3 }, axis: "y" },
  { area: "scrim_lab", rect: { x: 6.28, y: 5.9, w: 0.12, d: 0.3 }, axis: "y" },

  // Stream Studio: left x 7.4 [door y 2.9-4.1], bottom y 6.08 (no door)
  {
    area: "streaming_pod",
    rect: { x: 7.4, y: 0.4, w: 0.12, d: 2.5 },
    axis: "y",
  },
  {
    area: "streaming_pod",
    rect: { x: 7.4, y: 4.1, w: 0.12, d: 2.1 },
    axis: "y",
  },
  {
    area: "streaming_pod",
    rect: { x: 7.4, y: 6.08, w: 6.2, d: 0.12 },
    axis: "x",
  },

  // Strategy Room: top y 7.5 [door x 4.4-5.6], right x 6.28 [door y 8.0-9.2]
  {
    area: "analyst_room",
    rect: { x: 0.4, y: 7.5, w: 4.0, d: 0.12 },
    axis: "x",
  },
  {
    area: "analyst_room",
    rect: { x: 5.6, y: 7.5, w: 0.8, d: 0.12 },
    axis: "x",
  },
  {
    area: "analyst_room",
    rect: { x: 6.28, y: 7.5, w: 0.12, d: 0.5 },
    axis: "y",
  },
  {
    area: "analyst_room",
    rect: { x: 6.28, y: 9.2, w: 0.12, d: 4.4 },
    axis: "y",
  },

  // Team Gym: top y 7.5 [door x 8.3-9.5], left wall, right wall
  { area: "gym", rect: { x: 7.4, y: 7.5, w: 0.9, d: 0.12 }, axis: "x" },
  { area: "gym", rect: { x: 9.5, y: 7.5, w: 0.9, d: 0.12 }, axis: "x" },
  { area: "gym", rect: { x: 7.4, y: 7.5, w: 0.12, d: 6.1 }, axis: "y" },
  { area: "gym", rect: { x: 10.28, y: 7.5, w: 0.12, d: 6.1 }, axis: "y" },

  // Merch Shop: top y 7.5 [door x 11.9-13.1], left wall
  {
    area: "merch_store",
    rect: { x: 11.0, y: 7.5, w: 0.9, d: 0.12 },
    axis: "x",
  },
  {
    area: "merch_store",
    rect: { x: 13.1, y: 7.5, w: 0.5, d: 0.12 },
    axis: "x",
  },
  {
    area: "merch_store",
    rect: { x: 11.0, y: 7.5, w: 0.12, d: 6.1 },
    axis: "y",
  },
];

export const HOUSE_FURNITURE: FurnitureItem[] = [
  // --- Scrim Lab (6 Desks, Chairs, Plant) ---
  ...[0, 1].flatMap((row) =>
    [0, 1, 2].flatMap((col) => {
      const k = row * 3 + col;
      const dx = 0.9 + 1.6 * col;
      const dy = 0.9 + 2.2 * row;
      const minLevel = k < 4 ? 1 : 3;
      return [
        {
          id: `scrim_desk_${k}`,
          kind: "desk" as const,
          area: "scrim_lab" as HouseArea,
          rect: { x: dx, y: dy, w: 1.45, d: 0.95 },
          minLevel,
          obstacle: true,
          stationId: `scrim_station_${k}`,
        },
        {
          id: `scrim_chair_${k}`,
          kind: "chair" as const,
          area: "scrim_lab" as HouseArea,
          rect: { x: dx + 0.5, y: dy + 1.02, w: 0.48, d: 0.45 },
          minLevel,
          obstacle: true,
          stationId: `scrim_station_${k}`,
        },
      ];
    }),
  ),
  {
    id: "scrim_plant",
    kind: "plant",
    area: "scrim_lab",
    rect: { x: 5.75, y: 0.5, w: 0.55, d: 0.55 },
    minLevel: 1,
    obstacle: true,
  },

  // --- Stream Studio (Backdrop, 3 Pods, Sofa) ---
  {
    id: "stream_backdrop",
    kind: "backdrop",
    area: "streaming_pod",
    rect: { x: 7.9, y: 0.45, w: 5.3, d: 0.2 },
    minLevel: 1,
    obstacle: true,
  },
  ...[0, 1, 2].flatMap((k) => {
    const dx = 8.1 + 1.85 * k;
    const minLevel = [1, 3, 6][k];
    return [
      {
        id: `stream_desk_${k}`,
        kind: "streamDesk" as const,
        area: "streaming_pod" as HouseArea,
        rect: { x: dx, y: 1.0, w: 1.45, d: 0.95 },
        minLevel,
        obstacle: true,
        stationId: `stream_station_${k}`,
      },
      {
        id: `stream_chair_${k}`,
        kind: "chair" as const,
        area: "streaming_pod" as HouseArea,
        rect: { x: dx + 0.5, y: 2.02, w: 0.48, d: 0.45 },
        minLevel,
        obstacle: true,
        stationId: `stream_station_${k}`,
      },
    ];
  }),
  {
    id: "stream_sofa",
    kind: "sofa",
    area: "streaming_pod",
    rect: { x: 9.4, y: 4.55, w: 2.4, d: 0.8 },
    minLevel: 1,
    obstacle: true,
  },

  // --- Strategy / Analyst Room ---
  {
    id: "analyst_screen",
    kind: "wallScreen",
    area: "analyst_room",
    rect: { x: 0.42, y: 8.4, w: 0.18, d: 3.6 },
    minLevel: 1,
    obstacle: true,
  },
  {
    id: "analyst_table",
    kind: "table",
    area: "analyst_room",
    rect: { x: 2.0, y: 9.4, w: 2.7, d: 1.5 },
    minLevel: 1,
    obstacle: true,
  },
  ...[2.15, 3.05, 3.95].map((nearX, idx) => ({
    id: `analyst_chair_near_${idx}`,
    kind: "chair" as const,
    area: "analyst_room" as HouseArea,
    rect: { x: nearX, y: 11.1, w: 0.48, d: 0.45 },
    minLevel: 1,
    obstacle: true,
    stationId: `analyst_station_near_${idx}`,
  })),
  {
    id: "analyst_chair_right",
    kind: "chair",
    area: "analyst_room",
    rect: { x: 4.85, y: 9.9, w: 0.45, d: 0.48 },
    minLevel: 3,
    obstacle: true,
    stationId: "analyst_station_right",
  },
  {
    id: "analyst_chair_left",
    kind: "chair",
    area: "analyst_room",
    rect: { x: 1.45, y: 9.9, w: 0.45, d: 0.48 },
    minLevel: 5,
    obstacle: true,
    stationId: "analyst_station_left",
  },
  {
    id: "analyst_bookshelf",
    kind: "bookshelf",
    area: "analyst_room",
    rect: { x: 5.65, y: 12.75, w: 0.7, d: 0.8 },
    minLevel: 1,
    obstacle: true,
  },

  // --- Gym ---
  {
    id: "gym_treadmill",
    kind: "treadmill",
    area: "gym",
    rect: { x: 7.8, y: 8.2, w: 0.75, d: 1.6 },
    minLevel: 1,
    obstacle: true,
    stationId: "gym_station_treadmill",
  },
  {
    id: "gym_bench",
    kind: "bench",
    area: "gym",
    rect: { x: 9.3, y: 8.2, w: 0.8, d: 1.5 },
    minLevel: 2,
    obstacle: true,
    stationId: "gym_station_bench",
  },
  {
    id: "gym_bike",
    kind: "bike",
    area: "gym",
    rect: { x: 7.8, y: 11.2, w: 0.75, d: 1.4 },
    minLevel: 4,
    obstacle: true,
    stationId: "gym_station_bike",
  },
  {
    id: "gym_mat",
    kind: "mat",
    area: "gym",
    rect: { x: 9.0, y: 11.1, w: 1.1, d: 1.8 },
    minLevel: 1,
    obstacle: false, // Floor mat is not an obstacle
    stationId: "gym_station_mat",
  },

  // --- Merch Shop ---
  {
    id: "merch_rack_1",
    kind: "rack",
    area: "merch_store",
    rect: { x: 11.3, y: 8.0, w: 1.8, d: 0.8 },
    minLevel: 1,
    obstacle: true,
  },
  {
    id: "merch_rack_2",
    kind: "rack",
    area: "merch_store",
    rect: { x: 11.3, y: 9.8, w: 1.8, d: 0.8 },
    minLevel: 3,
    obstacle: true,
  },
  {
    id: "merch_rack_3",
    kind: "rack",
    area: "merch_store",
    rect: { x: 11.3, y: 11.6, w: 1.8, d: 0.8 },
    minLevel: 6,
    obstacle: true,
  },
  {
    id: "merch_counter",
    kind: "counter",
    area: "merch_store",
    rect: { x: 11.8, y: 12.6, w: 1.5, d: 0.7 },
    minLevel: 1,
    obstacle: true,
  },

  // --- Hall Break Items ---
  {
    id: "hall_cooler",
    kind: "cooler",
    area: "hall",
    rect: { x: 0.5, y: 6.32, w: 0.45, d: 0.45 },
    minLevel: 1,
    obstacle: true,
    stationId: "hall_spot_cooler",
  },
  {
    id: "hall_vending",
    kind: "vending",
    area: "hall",
    rect: { x: 13.15, y: 6.3, w: 0.45, d: 0.85 },
    minLevel: 1,
    obstacle: true,
    stationId: "hall_spot_vending",
  },
];

export const HOUSE_STATIONS: HouseStation[] = [
  // --- Scrim Lab (6 Practice Stations) ---
  ...[0, 1].flatMap((row) =>
    [0, 1, 2].map((col) => {
      const k = row * 3 + col;
      const dx = 0.9 + 1.6 * col;
      const dy = 0.9 + 2.2 * row;
      return {
        id: `scrim_station_${k}`,
        activity: "practice" as const,
        area: "scrim_lab" as HouseArea,
        seat: { x: dx + 0.74, y: dy + 1.22 },
        approach: { x: dx + 0.74, y: dy + 1.8 },
        facing: "ne" as const,
        pose: "sit" as const,
        minLevel: k < 4 ? 1 : 3,
        label: `Practice Rig ${k + 1}`,
      };
    }),
  ),

  // --- Stream Studio (3 Stream Pods + 2 Sofa Break Spots) ---
  ...[0, 1, 2].map((k) => {
    const dx = 8.1 + 1.85 * k;
    return {
      id: `stream_station_${k}`,
      activity: "stream" as const,
      area: "streaming_pod" as HouseArea,
      seat: { x: dx + 0.74, y: 2.22 },
      approach: { x: dx + 0.74, y: 2.8 },
      facing: "ne" as const,
      pose: "sit" as const,
      minLevel: [1, 3, 6][k],
      label: `Stream Pod ${k + 1}`,
    };
  }),
  {
    id: "stream_sofa_left",
    activity: "break",
    area: "streaming_pod",
    seat: { x: 10.0, y: 4.95 },
    approach: { x: 10.0, y: 5.75 },
    facing: "sw",
    pose: "lounge",
    minLevel: 1,
    partnerId: "stream_sofa_right",
    label: "Studio Lounge Left",
  },
  {
    id: "stream_sofa_right",
    activity: "break",
    area: "streaming_pod",
    seat: { x: 11.2, y: 4.95 },
    approach: { x: 11.2, y: 5.75 },
    facing: "sw",
    pose: "lounge",
    minLevel: 1,
    partnerId: "stream_sofa_left",
    label: "Studio Lounge Right",
  },

  // --- Strategy / Analyst Room (5 Review Stations) ---
  ...[2.15, 3.05, 3.95].map((nearX, idx) => ({
    id: `analyst_station_near_${idx}`,
    activity: "review" as const,
    area: "analyst_room" as HouseArea,
    seat: { x: nearX + 0.24, y: 11.3 },
    approach: { x: nearX + 0.24, y: 11.95 },
    facing: "ne" as const,
    pose: "sit" as const,
    minLevel: 1,
    label: `Strategy Desk ${idx + 1}`,
  })),
  {
    id: "analyst_station_right",
    activity: "review",
    area: "analyst_room",
    seat: { x: 5.07, y: 10.12 },
    approach: { x: 5.6, y: 10.12 },
    facing: "nw",
    pose: "sit",
    minLevel: 3,
    label: "Strategy Head East",
  },
  {
    id: "analyst_station_left",
    activity: "review",
    area: "analyst_room",
    seat: { x: 1.67, y: 10.12 },
    approach: { x: 1.1, y: 10.12 },
    facing: "se",
    pose: "sit",
    minLevel: 5,
    label: "Strategy Head West",
  },

  // --- Gym (4 Exercise Stations) ---
  {
    id: "gym_station_treadmill",
    activity: "exercise",
    area: "gym",
    seat: { x: 8.17, y: 9.05 },
    approach: { x: 8.17, y: 10.25 },
    facing: "ne",
    pose: "run",
    minLevel: 1,
    label: "Cardio Treadmill",
  },
  {
    id: "gym_station_bench",
    activity: "exercise",
    area: "gym",
    seat: { x: 9.7, y: 8.95 },
    approach: { x: 9.7, y: 10.25 },
    facing: "ne",
    pose: "lift",
    minLevel: 2,
    label: "Weight Bench",
  },
  {
    id: "gym_station_bike",
    activity: "exercise",
    area: "gym",
    seat: { x: 8.17, y: 11.9 },
    approach: { x: 8.17, y: 10.7 },
    facing: "ne",
    pose: "bike",
    minLevel: 4,
    label: "Stationary Bike",
  },
  {
    id: "gym_station_mat",
    activity: "exercise",
    area: "gym",
    seat: { x: 9.55, y: 12.0 },
    approach: { x: 9.55, y: 10.7 },
    facing: "nw",
    pose: "stretch",
    minLevel: 1,
    label: "Warmup Mat",
  },

  // --- Hall Break Spots (Water Cooler, Vending, Chat Pairs) ---
  {
    id: "hall_spot_cooler",
    activity: "break",
    area: "hall",
    seat: { x: 1.2, y: 6.6 },
    approach: { x: 1.2, y: 6.9 },
    facing: "nw",
    pose: "stand",
    prop: "cup",
    minLevel: 1,
    label: "Water Cooler",
  },
  {
    id: "hall_chat_1a",
    activity: "break",
    area: "hall",
    seat: { x: 1.7, y: 7.1 },
    approach: { x: 1.7, y: 6.7 },
    facing: "se",
    pose: "stand",
    minLevel: 1,
    partnerId: "hall_chat_1b",
    label: "West Hall Chat A",
  },
  {
    id: "hall_chat_1b",
    activity: "break",
    area: "hall",
    seat: { x: 2.35, y: 7.1 },
    approach: { x: 2.35, y: 6.7 },
    facing: "nw",
    pose: "stand",
    minLevel: 1,
    partnerId: "hall_chat_1a",
    label: "West Hall Chat B",
  },
  {
    id: "hall_chat_2a",
    activity: "break",
    area: "hall",
    seat: { x: 2.9, y: 6.6 },
    approach: { x: 2.9, y: 7.0 },
    facing: "se",
    pose: "stand",
    minLevel: 1,
    partnerId: "hall_chat_2b",
    label: "Mid Hall Chat A",
  },
  {
    id: "hall_chat_2b",
    activity: "break",
    area: "hall",
    seat: { x: 3.55, y: 6.6 },
    approach: { x: 3.55, y: 7.0 },
    facing: "nw",
    pose: "stand",
    minLevel: 1,
    partnerId: "hall_chat_2a",
    label: "Mid Hall Chat B",
  },
  {
    id: "hall_spot_vending",
    activity: "break",
    area: "hall",
    seat: { x: 12.75, y: 6.6 },
    approach: { x: 12.4, y: 6.6 },
    facing: "se",
    pose: "stand",
    prop: "snack",
    minLevel: 1,
    label: "Snack Vending",
  },
  {
    id: "hall_chat_3a",
    activity: "break",
    area: "hall",
    seat: { x: 11.4, y: 6.95 },
    approach: { x: 11.4, y: 6.55 },
    facing: "se",
    pose: "stand",
    minLevel: 1,
    partnerId: "hall_chat_3b",
    label: "East Hall Chat A",
  },
  {
    id: "hall_chat_3b",
    activity: "break",
    area: "hall",
    seat: { x: 12.05, y: 6.95 },
    approach: { x: 12.05, y: 6.55 },
    facing: "nw",
    pose: "stand",
    minLevel: 1,
    partnerId: "hall_chat_3a",
    label: "East Hall Chat B",
  },

  // --- Outdoor Living Simulation & Patio Break Stations ---
  {
    id: 'cafeteria_meal_table',
    activity: 'break',
    area: 'cafeteria',
    seat: { x: -3.0, y: 11.6 },
    approach: { x: -2.7, y: 12.1 },
    facing: 'nw',
    pose: 'sit',
    minLevel: 1,
    prop: 'snack',
    label: 'Team Cafeteria Meal',
  },
  {
    id: "patio_watch_tv",
    activity: "break",
    area: "hall",
    seat: { x: 2.2, y: 15.1 },
    approach: { x: 2.8, y: 14.6 },
    facing: "nw",
    pose: "sit",
    minLevel: 1,
    label: "Patio TV Match Broadcast",
  },
  {
    id: "patio_sofa_chill",
    activity: "break",
    area: "hall",
    seat: { x: 3.3, y: 15.1 },
    approach: { x: 3.3, y: 14.6 },
    facing: "sw",
    pose: "lounge",
    minLevel: 1,
    label: "Patio Lounge Sofa",
  },
  {
    id: "patio_basketball_hoop",
    activity: "break",
    area: "hall",
    seat: { x: -2.5, y: -13.0 },
    approach: { x: -2.5, y: -11.7 },
    facing: "ne",
    pose: "hoops",
    minLevel: 1,
    label: "Driveway Basketball Hoop",
  },
  {
    id: 'outside_football_drills',
    activity: 'break',
    area: 'hall',
    seat: { x: 14.5, y: -13.0 },
    approach: { x: 14.5, y: -11.7 },
    facing: 'se',
    pose: 'run',
    minLevel: 1,
    label: 'Football Agility Drills',
  },
  {
    id: "outside_garden_bench",
    activity: "break",
    area: "hall",
    seat: { x: 5.5, y: 15.2 },
    approach: { x: 5.5, y: 14.6 },
    facing: "se",
    pose: "sit",
    minLevel: 1,
    label: "Garden Planter Bench",
  },
  {
    id: "tournament_car_seat",
    activity: "break",
    area: "hall",
    seat: { x: 13.2, y: 15.6 },
    approach: { x: 12.6, y: 14.8 },
    facing: "se",
    pose: "sit",
    minLevel: 1,
    label: "Team Sports Car",
  },
  {
    id: 'dynasty_mart_inside', activity: 'break', area: 'hall',
    seat: { x: -8.2, y: 31.25 }, approach: { x: -8.2, y: 30.4 },
    facing: 'sw', pose: 'stand', minLevel: 1, minDistrictTier: 1,
    prop: 'snack', label: 'Inside Dynasty Mart',
  },
  {
    id: 'boba_cafe_inside', activity: 'break', area: 'hall',
    seat: { x: 3.2, y: 31.25 }, approach: { x: 3.2, y: 30.35 },
    facing: 'nw', pose: 'stand', minLevel: 1, minDistrictTier: 2,
    prop: 'cup', label: 'Inside GG Boba Cafe',
  },
];

export function getStationById(stationId: string): HouseStation | undefined {
  return HOUSE_STATIONS.find((s) => s.id === stationId);
}

export function isStationAvailable(
  station: HouseStation,
  unlockedFacilities:
    | Set<FacilityId>
    | Record<FacilityId, { isUnlocked: boolean; level: number }>,
  facilityLevels?: Record<FacilityId, number>,
  districtTier = 1,
): boolean {
  if ((station.minDistrictTier ?? 1) > districtTier) return false;
  if (station.area !== "hall") {
    const isUnlocked =
      unlockedFacilities instanceof Set
        ? unlockedFacilities.has(station.area as FacilityId)
        : (unlockedFacilities as Record<FacilityId, { isUnlocked: boolean }>)[
            station.area as FacilityId
          ]?.isUnlocked;
    if (!isUnlocked) return false;

    const level = facilityLevels
      ? facilityLevels[station.area as FacilityId] ?? 1
      : !(unlockedFacilities instanceof Set)
        ? (unlockedFacilities as Record<FacilityId, { level: number }>)[
            station.area as FacilityId
          ]?.level ?? 1
        : 1;

    if (level < station.minLevel) return false;
  }
  return true;
}
