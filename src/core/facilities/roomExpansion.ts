import type { FacilityId } from '../types/facility.types';
import type { HouseStation } from '../types/house.types';
import { HOUSE_STATIONS } from '../house/houseGeometry';
import { getEquipmentModel, nextEquipmentTier } from './equipmentProgression';

export interface RoomStationSummary {
  capacity: number;
  active: number;
  occupied: number;
}

export interface RoomExpansionPreview {
  level: number;
  addedStations: HouseStation[];
  currentModel: string;
  nextModel: string | null;
}

export function getRoomStationSummary(
  roomId: FacilityId,
  level: number,
  isUnlocked: boolean,
  occupiedStationIds: ReadonlySet<string>,
): RoomStationSummary {
  const roomStations = HOUSE_STATIONS.filter((station) => station.area === roomId);
  const activeStations = isUnlocked
    ? roomStations.filter((station) => station.minLevel <= level)
    : [];

  return {
    capacity: roomStations.length,
    active: activeStations.length,
    occupied: activeStations.filter((station) => occupiedStationIds.has(station.id)).length,
  };
}

export function getNextRoomExpansion(
  roomId: FacilityId,
  currentLevel: number,
): RoomExpansionPreview | null {
  const nextModelTier = nextEquipmentTier(currentLevel);
  const futureStationLevels = HOUSE_STATIONS
    .filter((station) => station.area === roomId && station.minLevel > currentLevel)
    .map((station) => station.minLevel);
  const milestones = [
    ...futureStationLevels,
    ...(nextModelTier ? [nextModelTier.level] : []),
  ];

  if (milestones.length === 0) return null;

  const level = Math.min(...milestones);
  const currentModel = getEquipmentModel(roomId, currentLevel);
  const nextModel = level === nextModelTier?.level
    ? getEquipmentModel(roomId, level)
    : null;

  return {
    level,
    addedStations: HOUSE_STATIONS.filter(
      (station) => station.area === roomId && station.minLevel === level,
    ),
    currentModel,
    nextModel,
  };
}
