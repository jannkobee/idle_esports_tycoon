import type { EsportsDiscipline } from '../types/player.types';

export type BranchId = 'west_coast' | 'seoul' | 'berlin';
export interface EsportsBranch { id: BranchId; tier: 1 | 2 | 3; }
export interface BranchDefinition {
  id: BranchId;
  city: string;
  discipline: EsportsDiscipline;
  unlockCost: number;
  baseIncome: number;
  color: string;
}

export const BRANCHES: BranchDefinition[] = [
  { id: 'west_coast', city: 'Los Angeles Academy', discipline: 'fps', unlockCost: 18000, baseIncome: 1.5, color: '#06b6d4' },
  { id: 'seoul', city: 'Seoul MOBA Studio', discipline: 'moba', unlockCost: 60000, baseIncome: 4, color: '#a78bfa' },
  { id: 'berlin', city: 'Berlin Arena Lab', discipline: 'br', unlockCost: 150000, baseIncome: 10, color: '#f59e0b' },
];

export function branchUpgradeCost(branch: EsportsBranch): number {
  const definition = BRANCHES.find(item => item.id === branch.id);
  return branch.tier >= 3 || !definition ? Infinity : Math.round(definition.unlockCost * (branch.tier === 1 ? 1.8 : 3.8));
}

export function branchIncomePerSecond(branches: EsportsBranch[] = []): number {
  return branches.reduce((total, branch) => {
    const definition = BRANCHES.find(item => item.id === branch.id);
    return total + (definition ? definition.baseIncome * Math.max(1, Math.min(3, branch.tier)) : 0);
  }, 0);
}
