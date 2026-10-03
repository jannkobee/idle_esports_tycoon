import React from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { Zap, Clock, PlayCircle } from 'lucide-react';
import { formatTimeRemaining } from '../../utils/formatCurrency';

export const AdBoostBanner: React.FC = () => {
  const { getBoostStatus, requestAd } = useGameStore();
  const status = getBoostStatus();

  const handleWatchBoostAd = () => {
    requestAd('boost_2x_income');
  };

  return (
    <div className="w-full px-4 py-2">
      {status.isActive ? (
        <div className="w-full bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between shadow-lg shadow-amber-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center animate-pulse">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-300 tracking-wider">
                  2X REVENUE SURGE
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 rounded">
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-300 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatTimeRemaining(status.remainingSeconds)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleWatchBoostAd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>+2h (Ad)</span>
          </button>
        </div>
      ) : (
        <div 
          onClick={handleWatchBoostAd}
          className="w-full cursor-pointer bg-gradient-to-r from-cyan-950/60 via-slate-900 to-cyan-950/60 hover:from-cyan-900/60 hover:to-cyan-900/60 border border-cyan-500/40 rounded-xl p-2.5 flex items-center justify-between shadow-lg shadow-cyan-500/10 group transition active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center group-hover:scale-105 transition">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-black text-cyan-300 tracking-wide">
                ACTIVATE 2X SPONSOR BOOST
              </div>
              <div className="text-[11px] text-slate-400">
                Doubles all facility & stream income for 2 hours
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs shadow-md group-hover:bg-cyan-400 transition">
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Watch</span>
          </div>
        </div>
      )}
    </div>
  );
};
