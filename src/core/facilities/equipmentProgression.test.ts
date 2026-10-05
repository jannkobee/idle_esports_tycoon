import { describe, expect, it } from 'vitest';
import { EQUIPMENT_MODELS, EQUIPMENT_TIERS, equipmentTierIndex, getEquipmentModel, getEquipmentTier, nextEquipmentTier } from './equipmentProgression';
import type { FacilityId } from '../types/facility.types';
import { houseCameraView, HOUSE_CAMERA_LIMITS } from '../house/houseView';

describe('equipment model evolution', () => {
  it('switches at each exact milestone and never grows past the final model', () => {
    for (const [i, tier] of EQUIPMENT_TIERS.entries()) {
      expect(equipmentTierIndex(tier.level)).toBe(i);
      if (i) expect(equipmentTierIndex(tier.level - 1)).toBe(i - 1);
      expect(nextEquipmentTier(tier.level)).toEqual(EQUIPMENT_TIERS[i + 1] ?? null);
    }
    expect(getEquipmentTier(100000)).toBe(getEquipmentTier(250));
    for (const level of [NaN, Infinity, -1, 0]) expect(equipmentTierIndex(level)).toBe(0);
  });
  it('has six named equipment models for every room, including distinct level 10 and 100 PCs', () => {
    for (const id of Object.keys(EQUIPMENT_MODELS) as FacilityId[]) {
      expect(new Set(EQUIPMENT_MODELS[id]).size).toBe(EQUIPMENT_TIERS.length);
      for (const [i, tier] of EQUIPMENT_TIERS.entries()) expect(getEquipmentModel(id, tier.level)).toBe(EQUIPMENT_MODELS[id][i]);
    }
    expect(getEquipmentModel('scrim_lab', 10)).not.toBe(getEquipmentModel('scrim_lab', 100));
  });
});

describe('HQ reset framing', () => {
  it('fits portrait and landscape viewports within orbit limits on both floors', () => {
    for (const aspect of [390 / 380, 390 / 700, 844 / 300, NaN, 0]) {
      for (const floor of [1, 2] as const) {
        const { position, target } = houseCameraView(aspect, floor);
        expect(position.every(Number.isFinite)).toBe(true);
        const distance = Math.hypot(...position.map((n, i) => n - target[i]));
        expect(distance).toBeLessThanOrEqual(HOUSE_CAMERA_LIMITS.maxDistance + 0.001);
        expect(target[1]).toBe(floor === 2 ? 3.2 : 0);
      }
    }
  });
});
