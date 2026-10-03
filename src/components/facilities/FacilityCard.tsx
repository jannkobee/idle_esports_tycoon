import React from 'react';
import { Facility } from '../../core/types/facility.types';
import { useGameStore } from '../../core/store/useGameStore';
import { FormulaService } from '../../core/engine/FormulaService';
import { formatCash, formatNumber } from '../../utils/formatCurrency';
import { Monitor, Video, Dumbbell, Activity, ShoppingBag, Lock, ArrowUpCircle } from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Monitor,
  Video,
  Dumbbell,
  Activity,
  ShoppingBag,
};

interface Props {
  facility: Facility;
}

export const FacilityCard: React.FC<Props> = ({ facility }) => {
  const { cash, hype, upgradeFacility, unlockFacility, getBoostStatus } = useGameStore();
  const isBoosted = getBoostStatus().isActive;

  const IconComponent = ICON_MAP[facility.icon] || Monitor;
  const upgradeCost = FormulaService.calculateUpgradeCost(facility.baseCost, facility.level, facility.costMultiplier);
  const currentIncome = FormulaService.calculateFacilityIncome(facility) * (isBoosted ? 2 : 1);

  // Next milestone (25, 50, 100, 200)
  const nextMilestone = facility.level < 25 ? 25 : facility.level < 50 ? 50 : facility.level < 100 ? 100 : Math.ceil((facility.level + 1) / 50) * 50;
  const prevMilestone = facility.level < 25 ? 0 : facility.level < 50 ? 25 : facility.level < 100 ? 50 : nextMilestone - 50;
  const progressPercent = Math.min(100, Math.max(0, ((facility.level - prevMilestone) / (nextMilestone - prevMilestone)) * 100));

  const canAffordUpgrade = cash >= upgradeCost;
  const canAffordUnlock = cash >= facility.unlockCost && hype >= facility.requiredHype;

  const handleUpgrade = () => {
    upgradeFacility(facility.id);
  };

  const handleUnlock = () => {
    unlockFacility(facility.id);
  };

  if (!facility.isUnlocked) {
    return (
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-300">{facility.name}</h3>
            <p className="text-xs text-slate-500">{facility.description}</p>
            <div className="text-[11px] text-amber-400 font-medium mt-0.5">
              Requires {formatNumber(facility.requiredHype)} Hype 🔥
            </div>
          </div>
        </div>

        <button
          onClick={handleUnlock}
          disabled={!canAffordUnlock}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            canAffordUnlock
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          Unlock {formatCash(facility.unlockCost)}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 transition flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">{facility.name}</h3>
              <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                Lv. {facility.level}
              </span>
            </div>
            <div className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <span>+{formatCash(currentIncome)}/s</span>
              {isBoosted && (
                <span className="text-[10px] text-amber-400 font-bold">(2X)</span>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={handleUpgrade}
          disabled={!canAffordUpgrade}
          className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-xl font-bold text-xs transition active:scale-95 ${
            canAffordUpgrade
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-1 text-[11px] font-black uppercase">
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Upgrade</span>
          </div>
          <span className="font-mono text-[10px]">
            {formatCash(upgradeCost)}
          </span>
        </button>
      </div>

      {/* Milestone Progress Bar */}
      <div className="w-full flex items-center gap-2 text-[10px] text-slate-400">
        <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-cyan-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <span className="font-mono font-bold text-slate-300">
          {facility.level}/{nextMilestone}
        </span>
      </div>
    </div>
  );
};
