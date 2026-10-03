import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { Radio, Gift, PlayCircle, Sparkles, X } from 'lucide-react';
import { formatCash } from '../../utils/formatCurrency';

export const SponsorDrone: React.FC = () => {
  const { activeDrone, requestAd, claimDrone, dismissDrone } = useGameStore();
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  useEffect(() => {
    if (!activeDrone || isOpenDialog) return;
    const timeout = setTimeout(dismissDrone, Math.max(0, activeDrone.expiresAt - Date.now()));
    return () => clearTimeout(timeout);
  }, [activeDrone, isOpenDialog, dismissDrone]);

  if (!activeDrone) return null;

  const handleDroneClick = () => {
    setIsOpenDialog(true);
  };

  const handleClaimWithAd = () => {
    requestAd('sponsor_drone_drop', (success) => {
      if (success) {
        setIsOpenDialog(false);
      }
    });
  };

  const handleClaimStandard = () => {
    claimDrone(false);
    setIsOpenDialog(false);
  };

  const handleDismiss = () => {
    dismissDrone();
    setIsOpenDialog(false);
  };

  return (
    <>
      {/* Floating Animated Drone Button */}
      {!isOpenDialog && (
        <div 
          onClick={handleDroneClick}
          className="fixed top-28 right-4 z-40 cursor-pointer animate-float"
        >
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 opacity-75 blur group-hover:opacity-100 transition animate-pulse"></div>
            <div className="relative w-12 h-12 rounded-full bg-slate-950 border border-amber-400 flex items-center justify-center text-amber-400 shadow-xl">
              <Radio className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>
            <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 text-[10px] text-amber-300 font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-md">
              SPONSOR DROP!
            </div>
          </div>
        </div>
      )}

      {/* Sponsor Drop Dialog */}
      {isOpenDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-xs rounded-2xl border border-amber-500/50 bg-slate-900 shadow-2xl p-5 text-center">
            <button 
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-2">
              <Gift className="w-7 h-7 text-amber-400 animate-bounce" />
            </div>

            <h3 className="text-base font-black text-white uppercase">
              Tech Sponsor Delivery!
            </h3>
            <p className="text-xs text-slate-300 mt-1 mb-4">
              A sponsor drone just dropped a VIP care package.
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-4 text-center">
              <div className="text-[11px] text-slate-400 uppercase font-bold">
                Sponsored Bonus Cash
              </div>
              <div className="text-xl font-black text-amber-400 font-mono">
                {formatCash(activeDrone.cashReward * 2)}
              </div>
              <div className="text-[11px] text-cyan-400 font-semibold mt-0.5 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> +5 Energy Cans
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleClaimWithAd}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/30 active:scale-98"
              >
                <PlayCircle className="w-4 h-4 fill-slate-950 text-amber-400" />
                <span>Open via Sponsor Clip</span>
              </button>

              <button
                onClick={handleClaimStandard}
                className="w-full py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 text-xs"
              >
                Take Standard ({formatCash(Math.floor(activeDrone.cashReward * 0.2))})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
