import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { X, Award, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const SPONSORS = [
  {
    brand: 'HYPER-VOLT ENERGY',
    tagline: 'Fueling Champions Since 2026',
    bgColor: 'from-amber-600 to-rose-900',
    accent: '#ffb703',
  },
  {
    brand: 'APEX TITAN HARDWARE',
    tagline: '540Hz Refresh Rate. Instant Reflexes.',
    bgColor: 'from-cyan-700 to-blue-950',
    accent: '#00d2ff',
  },
  {
    brand: 'CYBER-PRO CHAIRS',
    tagline: 'Ergonomic Domination for 14-Hour Scrims',
    bgColor: 'from-purple-800 to-indigo-950',
    accent: '#a855f7',
  }
];

export const MockAdModal: React.FC = () => {
  const { isSimulatedAdOpen, pendingPlacement, closeAdModal } = useGameStore();
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [isRewarded, setIsRewarded] = useState(false);
  const [currentSponsor, setCurrentSponsor] = useState(SPONSORS[0]);

  useEffect(() => {
    if (isSimulatedAdOpen) {
      setSecondsRemaining(5);
      setCanSkip(false);
      setIsRewarded(false);
      setCurrentSponsor(SPONSORS[Math.floor(Math.random() * SPONSORS.length)]);
    }
  }, [isSimulatedAdOpen]);

  useEffect(() => {
    if (!isSimulatedAdOpen || isRewarded) return;

    if (secondsRemaining > 0) {
      const timer = setTimeout(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsRewarded(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [isSimulatedAdOpen, secondsRemaining, isRewarded]);

  if (!isSimulatedAdOpen) return null;

  const handleClaim = () => {
    closeAdModal(true);
  };

  const handleCloseEarly = () => {
    if (canSkip || isRewarded) {
      closeAdModal(isRewarded);
    } else {
      if (confirm('Skipping now will forfeit your reward! Skip anyway?')) {
        closeAdModal(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl flex flex-col">
        {/* Top Ad Info Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono font-bold text-[10px] tracking-wider">
              SPONSOR SPOTLIGHT
            </span>
            <span className="truncate max-w-[140px] text-slate-400">
              {pendingPlacement?.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isRewarded ? (
              <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Reward in {secondsRemaining}s
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> REWARD READY
              </span>
            )}
            <button 
              onClick={handleCloseEarly}
              className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Canvas Simulation Area */}
        <div className={`relative h-64 bg-gradient-to-br ${currentSponsor.bgColor} flex flex-col items-center justify-center p-6 text-center overflow-hidden`}>
          {/* Animated Background Rings */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-4 border-dashed border-white animate-spin duration-1000"></div>
          </div>

          {!isRewarded ? (
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-3 shadow-lg">
                <Zap className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-wide uppercase drop-shadow">
                {currentSponsor.brand}
              </h2>
              <p className="text-xs text-white/80 mt-1 max-w-[220px]">
                {currentSponsor.tagline}
              </p>

              {/* Progress Bar */}
              <div className="w-48 bg-black/40 h-2 rounded-full mt-6 overflow-hidden border border-white/10">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${((5 - secondsRemaining) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-2 shadow-emerald-500/50 shadow-lg">
                <Sparkles className="w-8 h-8 text-emerald-300 animate-pulse" />
              </div>
              <h2 className="text-xl font-black text-white">SPONSOR PAID!</h2>
              <p className="text-xs text-emerald-300 mt-0.5">Your boost has been unlocked</p>
            </div>
          )}
        </div>

        {/* Bottom Action Area */}
        <div className="p-4 bg-slate-950 flex flex-col gap-2">
          {isRewarded ? (
            <button
              onClick={handleClaim}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Award className="w-4 h-4" /> Claim Boost Reward
            </button>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-500 py-1">
              <span>Watching sponsor clip...</span>
              <button 
                onClick={handleCloseEarly}
                className="hover:text-slate-300 underline underline-offset-2"
              >
                Skip Video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
