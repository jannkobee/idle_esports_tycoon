import type { FacilityId } from '../types/facility.types';

// Visual milestones are derived from existing facility levels: no extra save state,
// stat bonuses, or unbounded mesh growth. Level 250 is the final model tier.
export const EQUIPMENT_TIERS = [
  { level: 1, name: 'Starter', color: '#94a3b8', finish: '#854d0e' },
  { level: 10, name: 'Competitive', color: '#22d3ee', finish: '#334155' },
  { level: 25, name: 'Professional', color: '#60a5fa', finish: '#1e293b' },
  { level: 50, name: 'Elite', color: '#c084fc', finish: '#312e81' },
  { level: 100, name: 'World Class', color: '#fb7185', finish: '#e2e8f0' },
  { level: 250, name: 'Dynasty', color: '#fbbf24', finish: '#292524' },
] as const;

export function equipmentTierIndex(level: number): number {
  const safeLevel = Number.isFinite(level) ? Math.max(1, level) : 1;
  return EQUIPMENT_TIERS.reduce((tier, entry, index) => safeLevel >= entry.level ? index : tier, 0);
}

export const getEquipmentTier = (level: number) => EQUIPMENT_TIERS[equipmentTierIndex(level)];
export const nextEquipmentTier = (level: number) => EQUIPMENT_TIERS[equipmentTierIndex(level) + 1] ?? null;

export const EQUIPMENT_MODELS: Record<FacilityId, readonly string[]> = {
  scrim_lab: ['Single-screen PC', 'Dual-screen RGB PC', 'Ultrawide workstation', 'Triple-screen battlestation', 'Liquid-cooled panoramic PC', 'Gold championship rig'],
  streaming_pod: ['Webcam setup', 'Ring-light studio', 'Dual-camera studio', 'Broadcast switcher', 'Virtual production wall', 'Championship broadcast suite'],
  analyst_room: ['Tactics board', 'Replay display', 'Dual replay panels', 'Telemetry console', 'Panoramic analysis wall', 'Gold command center'],
  gym: ['Basic conditioning', 'Fitness console', 'Biometric sensors', 'Performance display', 'Sports science scanner', 'Elite recovery system'],
  merch_store: ['Counter checkout', 'Digital checkout', 'Dual product displays', 'Collector showcase', 'Interactive flagship display', 'Gold limited-edition boutique'],
  cafeteria: ['Meal service', 'Digital menu', 'Nutrition tracking', 'Heated service canopy', 'Smart nutrition kitchen', 'Championship chef station'],
};

export const getEquipmentModel = (id: FacilityId, level: number) => EQUIPMENT_MODELS[id][equipmentTierIndex(level)];
