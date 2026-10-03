import React from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { PlayCircle, DollarSign, Clock, Sparkles } from 'lucide-react';
import { formatCash, formatTimeRemaining } from '../../utils/formatCurrency';

export const OfflineRewardModal: React.FC = () => {
  const { offlineModal, claimOfflineReward, requestAd } = useGameStore();

  if (!offlineModal || !offlineModal.isOpen) return null;

  const handleClaimStandard = () => {
    claimOfflineReward(false);
  };

  const handleClaim3xWithAd = () => {
    requestAd('offline_multiplier', (success) => {
      if (success) {
        claimOfflineReward(true);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl p-6 text-center">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-emerald-500/20 blur-2xl pointer-events-none"></div>

        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
          <DollarSign className="w-8 h-8 text-emerald-400" />
        </div>

        <h2 className="text-xl font-black text-white uppercase tracking-wide">
          Welcome Back, CEO!
        </h2>
        
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-1 mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span>Away for {formatTimeRemaining(offlineModal.offlineSeconds)}</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-5">
          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
            Offline Streaming & Merch Revenue
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {formatCash(offlineModal.baseCash)}
          </div>
        </div>

        {/* Buttons: 3X Rewarded Ad Option (Hero) vs Standard */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleClaim3xWithAd}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition active:scale-98 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <PlayCircle className="w-5 h-5 fill-slate-950 text-emerald-400" />
            <span>Claim 3X ({formatCash(offlineModal.boostedCash)}) with Ad</span>
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={handleClaimStandard}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white font-medium text-xs transition"
          >
            Collect Standard ({formatCash(offlineModal.baseCash)})
          </button>
        </div>
      </div>
    </div>
  );
};
