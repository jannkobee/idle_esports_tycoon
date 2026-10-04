import React, { useState } from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { staffSlot, type StaffKind } from '../../core/staff/StaffService';
import { DISCIPLINE_INFO } from '../../core/types/player.types';
import { formatCash } from '../../utils/formatCurrency';

const KINDS: StaffKind[] = ['coach', 'manager', 'nutritionist'];

export const StaffMarket: React.FC = () => {
  const market = useGameStore(state => state.staffMarket);
  const hired = useGameStore(state => state.hiredStaff);
  const cash = useGameStore(state => state.cash);
  const refresh = useGameStore(state => state.refreshStaffMarket);
  const hire = useGameStore(state => state.hireStaff);
  const [kind, setKind] = useState<StaffKind>('coach');
  const visible = market.filter(candidate => candidate.kind === kind);
  const description = (candidate: typeof visible[number]) => candidate.kind === 'coach'
    ? `${DISCIPLINE_INFO[candidate.discipline!].name} · ${candidate.tactic} strategy`
    : candidate.kind === 'manager' ? `${candidate.executiveRole?.toUpperCase()} · ${candidate.rating} management`
      : `${candidate.nutritionStyle} program`;

  return <section className="rounded-2xl border border-amber-500/25 bg-amber-950/15 p-3">
    <div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-black">Staff Recruitment</h3><p className="text-[10px] text-slate-400">Hire the style you want. Coaches independently call match tactics and veto maps.</p></div><button onClick={refresh} disabled={cash < 500} className="shrink-0 rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-black text-slate-950 disabled:opacity-40">Refresh $500</button></div>
    <div className="mt-2 grid grid-cols-3 gap-1">{KINDS.map(option => <button key={option} onClick={() => setKind(option)} className={`rounded-lg px-1 py-1.5 text-[10px] font-black capitalize ${kind === option ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>{option === 'nutritionist' ? 'Nutrition' : `${option}s`}</button>)}</div>
    <div className="mt-2 space-y-1.5">{visible.map(candidate => {
      const incumbent = hired.find(person => staffSlot(person) === staffSlot(candidate));
      return <div key={candidate.id} className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/65 p-2"><div className="min-w-0"><div className="truncate text-[11px] font-black text-white">{candidate.name} <span className="text-amber-300">{candidate.tier.replace('_', ' ')}</span></div><div className="text-[9px] text-slate-400">{description(candidate)} · Rating {candidate.rating}</div>{incumbent && <div className="text-[9px] text-rose-300">Replaces {incumbent.name}</div>}</div><button onClick={() => hire(candidate.id)} disabled={cash < candidate.hireCost} className="shrink-0 rounded-lg bg-cyan-500 px-2 py-1.5 text-[9px] font-black text-slate-950 disabled:opacity-40">Hire {formatCash(candidate.hireCost)}</button></div>;
    })}</div>
    <details className="mt-2 text-[10px] text-slate-400"><summary className="cursor-pointer font-black text-amber-200">Current staff ({hired.length})</summary><div className="mt-1 space-y-1">{hired.map(person => <div key={person.id}>{person.name} · {person.kind} · {person.tier.replace('_', ' ')} · {description(person)}</div>)}</div></details>
  </section>;
};
