export type CateringPlanId = 'standard' | 'brain_fuel' | 'omega3' | 'pre_scrim';

export interface CateringPlan {
  id: CateringPlanId;
  name: string;
  badge: string;
  cost: number;
  perk: string;
  description: string;
  aimMultiplier: number;
  macroMultiplier: number;
  tiltResistanceMultiplier: number;
  energyDrainReduction: number;
}

export const CATERING_PLANS: Record<CateringPlanId, CateringPlan> = {
  standard: {
    id: 'standard',
    name: 'Standard Dining',
    badge: 'Baseline',
    cost: 0,
    perk: 'Standard energy recovery',
    description: 'Fresh homecooked balanced meals cooked daily by the team chef.',
    aimMultiplier: 1.0,
    macroMultiplier: 1.0,
    tiltResistanceMultiplier: 1.0,
    energyDrainReduction: 0,
  },
  brain_fuel: {
    id: 'brain_fuel',
    name: 'Brain Fuel Smoothies',
    badge: '+25% Macro & VODs',
    cost: 1200,
    perk: '+25% Macro & tactical review efficiency',
    description: 'Organic blueberry nootropics, dark cacao & electrolyte smoothies.',
    aimMultiplier: 1.0,
    macroMultiplier: 1.25,
    tiltResistanceMultiplier: 1.1,
    energyDrainReduction: 0.15,
  },
  omega3: {
    id: 'omega3',
    name: 'Omega-3 Pro Athlete Diet',
    badge: '+20% Aim & Reaction',
    cost: 2800,
    perk: '+20% Aim training speed & reflex consistency',
    description: 'Wild Alaskan salmon poke bowls, avocado, and antioxidant matcha.',
    aimMultiplier: 1.20,
    macroMultiplier: 1.05,
    tiltResistanceMultiplier: 1.15,
    energyDrainReduction: 0.2,
  },
  pre_scrim: {
    id: 'pre_scrim',
    name: 'Tactical Pre-Scrim Buffet',
    badge: '+35% Tilt Resistance',
    cost: 6500,
    perk: '+35% Tilt Resistance & immunity to burnout',
    description: 'Gourmet warm buffet with customized nutrition macro-tracking for championship days.',
    aimMultiplier: 1.15,
    macroMultiplier: 1.15,
    tiltResistanceMultiplier: 1.35,
    energyDrainReduction: 0.3,
  },
};
