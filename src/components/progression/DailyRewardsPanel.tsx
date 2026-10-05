import React from 'react';
import { CheckCircle2, Gift, Target } from 'lucide-react';
import { DAILY_OBJECTIVES, createDailyObjectives, currentDailyObjectives } from '../../core/progression/DailyObjectives';
import { useGameStore } from '../../core/store/useGameStore';
import { formatCash } from '../../utils/formatCurrency';

export const DailyRewardsPanel: React.FC = () => {
  const saved = useGameStore(state => state.dailyObjectives);
  const claim = useGameStore(state => state.claimDailyObjective);
  const objectives = currentDailyObjectives(saved ?? createDailyObjectives());
  const claimedCount = objectives.claimed.length;
  return <section className="rounded-2xl border border-amber-400/35 bg-amber-950/15 p-3">
    <div className="flex items-center gap-2"><Gift size={17} className="text-amber-300" /><div><h3 className="text-sm font-black">Today’s Reward Board</h3><p className="text-[10px] text-slate-400">Complete actions you already take, then claim each crate.</p></div><span className="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-black text-amber-200">{claimedCount}/4</span></div>
    <div className="mt-3 space-y-2">{DAILY_OBJECTIVES.map(item => {
      const progress = objectives.progress[item.id];
      const ready = progress >= item.target && !objectives.claimed.includes(item.id);
      const claimed = objectives.claimed.includes(item.id);
      const rewards = [item.reward.cash && formatCash(item.reward.cash), item.reward.hype && `+${item.reward.hype} Hype`, item.reward.energyCans && `+${item.reward.energyCans} Can`].filter(Boolean).join(' · ');
      return <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-950/65 p-2"><div className="flex items-start gap-2"><Target size={14} className={claimed ? 'mt-0.5 text-emerald-300' : 'mt-0.5 text-amber-300'} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2 text-[11px] font-black"><span>{item.label}</span><span className="text-slate-400">{progress}/{item.target}</span></div><p className="text-[9px] text-slate-400">{item.detail}</p><p className="mt-0.5 text-[9px] font-bold text-amber-200">{rewards}</p></div><button onClick={() => claim(item.id)} disabled={!ready} className="shrink-0 rounded-lg bg-amber-400 px-2 py-1 text-[9px] font-black text-slate-950 disabled:bg-slate-800 disabled:text-slate-500">{claimed ? <CheckCircle2 size={13} /> : ready ? 'CLAIM' : 'LOCKED'}</button></div></div>;
    })}</div>
  </section>;
};
