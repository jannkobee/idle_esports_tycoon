import { ActivityId } from '../types/house.types';
import { PlayerRarity, RARITY_CAPS } from '../types/player.types';

export interface ActivityMeta {
  id: ActivityId;
  label: string;
  verb: string;
  icon: string;
  color: string;
  description: string;
  benefitText: string;
  minDuration: number;
  maxDuration: number;
}

export const ACTIVITIES: Record<ActivityId, ActivityMeta> = {
  practice: {
    id: 'practice',
    label: 'Practice',
    verb: 'Aim Drills & Scrims',
    icon: 'Crosshair',
    color: '#06b6b4',
    description: 'Drills mechanics, aim routines, and situational team macro in the Scrim Lab.',
    benefitText: '+0.30 Aim & +0.20 Macro / min (scales with room level & energy)',
    minDuration: 45,
    maxDuration: 75,
  },
  stream: {
    id: 'stream',
    label: 'Streaming',
    verb: 'Broadcast & Fan Hub',
    icon: 'Video',
    color: '#ac67cc',
    description: 'Broadcasts gameplay in the acoustic studio to entertain fans and expand hype.',
    benefitText: '+1.2 Hype / min (boosted by player Comms) & passive Comms growth',
    minDuration: 40,
    maxDuration: 65,
  },
  review: {
    id: 'review',
    label: 'VOD Review',
    verb: 'Strategy War Room',
    icon: 'Activity',
    color: '#618dd2',
    description: 'Analyzes match replays, enemy tendencies, and macro playbook adjustments.',
    benefitText: '+0.25 Macro & +0.12 Comms / min (+20% per reviewing teammate, max +60%)',
    minDuration: 35,
    maxDuration: 55,
  },
  exercise: {
    id: 'exercise',
    label: 'Workout',
    verb: 'Gym & Cardio',
    icon: 'Dumbbell',
    color: '#d8a949',
    description: 'Maintains physical conditioning, reaction resilience, and tilt resistance.',
    benefitText: '+0.25 Tilt Resistance / min + 3 min "Energized" buff (30% less energy drain)',
    minDuration: 25,
    maxDuration: 40,
  },
  break: {
    id: 'break',
    label: 'Break',
    verb: 'Resting & Chatting',
    icon: 'Coffee',
    color: '#77aa50',
    description: 'Recharges player energy at water stations, vending spots, or social lounge couches.',
    benefitText: '+2.5 to +3.5 Energy / sec (chatting teammates build Comms)',
    minDuration: 14,
    maxDuration: 22,
  },
};

export function calculateRoomMultiplier(level: number): number {
  return Math.min(4, 1 + 0.1 * Math.max(0, level - 1));
}

export function calculateEnergyEfficiency(energy: number): number {
  return 0.6 + 0.4 * (Math.max(0, Math.min(100, energy)) / 100);
}

export function calculateCapMultiplier(currentStat: number, rarity: PlayerRarity, potential?: number): number {
  const cap = potential ?? RARITY_CAPS[rarity] ?? 100;
  if (currentStat >= cap) return 0;
  return Math.max(0.15, Math.min(1, (cap - currentStat) / 40));
}

export function calculateEnergyDrainPerSec(
  activity: ActivityId,
  tiltResistance: number,
  isEnergized: boolean
): number {
  const baseDrains: Record<ActivityId, number> = {
    practice: 0.45,
    stream: 0.35,
    review: 0.30,
    exercise: 0.55,
    break: 0,
  };
  const base = baseDrains[activity] ?? 0;
  if (base === 0) return 0;
  const tiltFactor = Math.max(0.65, 1.15 - tiltResistance / 200);
  const energizedFactor = isEnergized ? 0.7 : 1.0;
  return base * tiltFactor * energizedFactor;
}
