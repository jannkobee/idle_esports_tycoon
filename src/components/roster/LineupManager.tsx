import React from 'react';
import { ArrowRightLeft, Users } from 'lucide-react';
import { useGameStore } from '../../core/store/useGameStore';
import { LINEUP_SLOTS, autoFillLineup, getOverall, getPosition, isMatchEligible, lineupPower, resolveLineup, slotRating } from '../../core/cards/CardService';
import { DISCIPLINE_INFO, type EsportsDiscipline } from '../../core/types/player.types';

export const LineupManager: React.FC<{ discipline: EsportsDiscipline }> = ({ discipline }) => {
  const roster = useGameStore(state => state.roster);
  const teamLineups = useGameStore(state => state.teamLineups);
  const assign = useGameStore(state => state.assignLineupSlot);
  const autoFill = useGameStore(state => state.autoFillTeamLineup);
  const slots = LINEUP_SLOTS[discipline];
  const assignments = resolveLineup(roster, discipline, teamLineups[discipline]);
  const eligible = roster.filter(player => isMatchEligible(player, discipline));
  const selectedIds = new Set(Object.values(assignments).filter(Boolean));
  const bench = eligible.filter(player => !selectedIds.has(player.id));
  const currentPower = lineupPower(roster, discipline, teamLineups[discipline]);
  const autoPower = lineupPower(roster, discipline, autoFillLineup(roster, discipline));
  const filled = Object.values(assignments).filter(Boolean).length;

  return <section className="rounded-2xl border border-cyan-500/40 bg-slate-950/80 p-3 text-slate-100">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2"><Users size={17} className="text-cyan-300" /><div><h3 className="text-sm font-black uppercase">{DISCIPLINE_INFO[discipline].name} Starting Lineup</h3><p className="text-[10px] text-slate-400">Assign roles before entering a match. Off-role cards lose 8 rating.</p></div></div>
      <div className="shrink-0 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-2 py-1 text-center"><span className="block text-lg font-black leading-none text-cyan-300">{currentPower}</span><span className="text-[8px] font-bold uppercase text-slate-400">Power</span></div>
    </div>
    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-400"><span>{filled}/{slots.length} slots · Auto lineup {autoPower} power</span><button onClick={() => autoFill(discipline)} className="flex items-center gap-1 rounded-lg bg-cyan-500/20 px-2 py-1 font-black text-cyan-200"><ArrowRightLeft size={11} /> Auto Fill Best</button></div>
    <div className="mt-2 space-y-1.5">{slots.map(slot => {
      const selected = eligible.find(player => player.id === assignments[slot.id]);
      const offRole = selected && getPosition(selected) !== slot.position;
      return <div key={slot.id} className="grid grid-cols-[76px_minmax(0,1fr)_42px] items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-1.5">
        <div><div className="text-[10px] font-black text-white">{slot.label}</div><div className="text-[8px] uppercase text-slate-500">{slot.position}</div></div>
        <select aria-label={`${slot.label} player`} value={selected?.id ?? ''} onChange={event => assign(discipline, slot.id, event.target.value || null)} className="min-w-0 w-full rounded-lg border border-slate-700 bg-slate-950 p-1.5 text-[11px] font-bold text-slate-100">
          <option value="">Empty slot</option>
          {[...eligible].sort((a, b) => slotRating(b, slot) - slotRating(a, slot)).map(player => <option key={player.id} value={player.id}>{player.handle} · {getOverall(player)} OVR · {getPosition(player)}{getPosition(player) === slot.position ? '' : ' (off-role)'}</option>)}
        </select>
        <span className={`text-right text-[11px] font-black ${offRole ? 'text-amber-300' : 'text-emerald-300'}`}>{selected ? slotRating(selected, slot) : '—'}</span>
      </div>;
    })}</div>
    <div className="mt-2 border-t border-slate-800 pt-2"><div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Bench · {bench.length}</div><div className="mt-1 flex gap-1 overflow-x-auto pb-1">{bench.length ? bench.map(player => <span key={player.id} className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[9px] font-bold text-slate-300">{player.handle} · {getOverall(player)} {getPosition(player)}</span>) : <span className="text-[9px] text-slate-500">No eligible bench cards. Open packs to add depth.</span>}</div></div>
  </section>;
};
