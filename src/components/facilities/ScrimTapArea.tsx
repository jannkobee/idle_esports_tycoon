import React, { useState } from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { Monitor, Sparkles } from 'lucide-react';
import { formatCash } from '../../utils/formatCurrency';

interface FloatingText {
  id: number;
  x: number;
  y: number;
  amount: number;
}

export const ScrimTapArea: React.FC = () => {
  const { tapScrim, getBoostStatus } = useGameStore();
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const isBoosted = getBoostStatus().isActive;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const earned = tapScrim();

    const newId = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev.slice(-10), { id: newId, x, y, amount: earned }]);

    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newId));
    }, 700);
  };

  return (
    <div className="relative w-full px-4 py-3 flex flex-col items-center">
      <button
        onClick={handleClick}
        className="relative group w-full max-w-sm py-4 px-6 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700/80 hover:border-cyan-500/80 active:scale-95 transition-all duration-150 shadow-xl overflow-hidden flex items-center justify-between"
      >
        {/* Ambient neon backdrop */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-100 transition"></div>

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:scale-105 transition">
            <Monitor className="w-7 h-7" />
          </div>
          <div className="text-left">
            <div className="text-sm font-black text-white flex items-center gap-1.5">
              <span>RUN LIVE SCRIM</span>
              {isBoosted && (
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" /> 2X
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              Tap to practice & collect stream donations
            </div>
          </div>
        </div>

        <div className="relative z-10 text-right">
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-1 rounded-lg">
            TAP
          </span>
        </div>

        {/* Floating animated click damage/cash numbers */}
        {floatingTexts.map(item => (
          <span
            key={item.id}
            style={{ left: item.x, top: item.y }}
            className="absolute pointer-events-none -translate-x-1/2 font-black font-mono text-emerald-400 text-sm animate-out fade-out slide-out-to-top duration-700 select-none z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            +{formatCash(item.amount)}
          </span>
        ))}
      </button>
    </div>
  );
};
