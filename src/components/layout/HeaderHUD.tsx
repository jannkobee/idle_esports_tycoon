import React from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { DollarSign, Flame, Zap, Trophy, TrendingUp, RefreshCw } from 'lucide-react';
import { formatCash, formatNumber } from '../../utils/formatCurrency';
import { FormulaService } from '../../core/engine/FormulaService';

export const HeaderHUD: React.FC = () => {
  const { 
    cash, 
    hype, 
    energyCans, 
    legacyTrophies, 
    facilities, 
    boostExpiresAt,
    lifetimeEarnings,
    season,
    rebrandFranchise
  } = useGameStore();

  const isBoostActive = Date.now() < boostExpiresAt;
  const incomePerSec = FormulaService.calculateTotalIncomePerSec(
    Object.values(facilities),
    isBoostActive,
    hype
  );

  const potentialTrophies = FormulaService.calculatePrestigeTrophies(lifetimeEarnings);

  const handlePrestige = () => {
    if (potentialTrophies > 0) {
      if (confirm(`Rebrand franchise for Season ${season + 1}? You will earn +${potentialTrophies} Legacy Trophies!`)) {
        rebrandFranchise();
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 select-none">
      <div className="flex items-center justify-between gap-2">
        {/* Cash & DPS */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-white font-mono tracking-tight flex items-center">
              <DollarSign className="w-5 h-5 text-emerald-400 -mr-0.5" />
              {formatNumber(cash)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400/90 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>+{formatCash(incomePerSec)}/s</span>
            {isBoostActive && (
              <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1 rounded font-bold">
                2X
              </span>
            )}
          </div>
        </div>

        {/* Currencies Pill Group */}
        <div className="flex items-center gap-2">
          {/* Hype */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-xs" title="Fan Hype increases global earnings">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="font-bold text-slate-200 font-mono">{formatNumber(hype)}</span>
          </div>

          {/* Energy Cans */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-xs" title="Energy Cans for speed-ups & scouts">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-slate-200 font-mono">{formatNumber(energyCans)}</span>
          </div>

          {/* Trophies / Prestige */}
          {legacyTrophies > 0 || potentialTrophies > 0 ? (
            <button 
              onClick={handlePrestige}
              disabled={potentialTrophies === 0}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition ${
                potentialTrophies > 0 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 animate-pulse'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400'
              }`}
              title={potentialTrophies > 0 ? `Rebrand Season (+${potentialTrophies} 🏆)` : 'Trophies'}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold font-mono">{formatNumber(legacyTrophies)}</span>
              {potentialTrophies > 0 && (
                <RefreshCw className="w-2.5 h-2.5 text-amber-400 animate-spin" />
              )}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
