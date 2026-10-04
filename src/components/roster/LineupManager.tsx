import React from 'react';
import { Users } from 'lucide-react';
import { useGameStore } from '../../core/store/useGameStore';
import { LINEUP_SLOTS, getOverall, getPosition, isMatchEligible, lineupPower, slotRating } from '../../core/cards/CardService';
import { activeCoach, coachSelectLineup } from '../../core/staff/StaffService';
import { DISCIPLINE_INFO, type EsportsDiscipline } from '../../core/types/player.types';

export const LineupManager: React.FC<{ discipline: EsportsDiscipline }> = ({ discipline }) => {
  const roster = useGameStore(state => state.roster);
  const staff = useGameStore(state => state.hiredStaff);
  const slots = LINEUP_SLOTS[discipline];
  const lineup = coachSelectLineup(roster, discipline, staff);
  const coach = activeCoach(staff, discipline);
  const selected = new Set(Object.values(lineup));
  const bench = roster.filter(player => isMatchEligible(player, discipline) && !selected.has(player.id));

  return <section className="rounded-2xl border border-cyan-500/40 bg-slate-950/80 p-3 text-slate-100">
    <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><Users size={17} className="text-cyan-300" /><div><h3 className="text-sm font-black uppercase">{DISCIPLINE_INFO[discipline].name} Starting Lineup</h3><p className="text-[10px] text-slate-400">{coach ? `${coach.name} selects by ${coach.tactic} style, form, and role fit.` : 'Interim staff selects the best available cards.'} You invest in the roster; staff chooses who starts.</p></div></div><div className="shrink-0 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-2 py-1 text-center"><span className="block text-lg font-black leading-none text-cyan-300">{lineupPower(roster, discipline, lineup)}</span><span className="text-[8px] font-bold uppercase text-slate-400">Power</span></div></div>
    <div className="mt-2 space-y-1.5">{slots.map(slot => { const player = roster.find(card => card.id === lineup[slot.id]); return <div key={slot.id} className="grid grid-cols-[76px_minmax(0,1fr)_42px] items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-1.5"><div><div className="text-[10px] font-black text-white">{slot.label}</div><div className="text-[8px] uppercase text-slate-500">{slot.position}</div></div><span className="min-w-0 truncate text-[11px] font-bold text-slate-200">{player ? `${player.handle} · ${getOverall(player)} OVR · ${getPosition(player)}` : 'Open slot'}</span><span className="text-right text-[11px] font-black text-emerald-300">{player ? slotRating(player, slot) : '—'}</span></div>; })}</div>
    <div className="mt-2 border-t border-slate-800 pt-2 text-[9px] text-slate-400">Bench · {bench.length}: {bench.length ? bench.map(player => player.handle).join(', ') : 'Open packs to add depth.'}</div>
  </section>;
};
