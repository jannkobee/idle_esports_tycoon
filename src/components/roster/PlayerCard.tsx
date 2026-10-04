import React from 'react';
import type { ProPlayer } from '../../core/types/player.types';
import { getCardAttributes, getOverall, getPosition, getPotential } from '../../core/cards/CardService';
import { PlayerPortrait } from './PlayerPortrait';

const cardTheme: Record<ProPlayer['rarity'], string> = {
  bronze: 'from-amber-950 via-amber-900 to-stone-950 border-amber-700 text-amber-200',
  silver: 'from-slate-600 via-slate-800 to-slate-950 border-slate-300 text-slate-100',
  gold: 'from-amber-500 via-amber-800 to-slate-950 border-yellow-300 text-yellow-100',
  platinum: 'from-sky-400 via-indigo-700 to-slate-950 border-sky-200 text-sky-100',
  diamond: 'from-cyan-300 via-blue-700 to-slate-950 border-cyan-100 text-cyan-50',
  goat: 'from-fuchsia-400 via-amber-500 to-slate-950 border-amber-200 text-white',
};

export const PlayerCard: React.FC<{ player: ProPlayer; compact?: boolean }> = ({ player, compact = false }) => {
  const attributes = getCardAttributes(player);
  const labels = [
    ['MEC', attributes.mechanics], ['SEN', attributes.gameSense], ['TMW', attributes.teamwork],
    ['CLT', attributes.clutch], ['ADP', attributes.adaptability], ['STA', attributes.stamina],
  ] as const;
  return <div className={`relative overflow-hidden rounded-[22px] border-2 bg-gradient-to-br p-3 shadow-xl ${cardTheme[player.rarity]} ${compact ? 'w-36 shrink-0' : 'w-full max-w-[260px]'}`}>
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border-[10px] border-white/10" />
    <div className="relative flex items-start justify-between"><div><div className="text-3xl font-black leading-none">{getOverall(player)}</div><div className="text-[10px] font-black uppercase tracking-wider">{getPosition(player)}</div></div><div className="text-right text-[9px] font-black uppercase tracking-widest">{player.rarity}<div className="mt-1 text-[8px] opacity-80">AGE {player.age ?? 22}</div></div></div>
    <div className={`${compact ? 'h-24' : 'h-36'} mx-auto mt-1 w-4/5 overflow-hidden rounded-t-xl bg-black/20`}><PlayerPortrait player={player} /></div>
    <div className="relative border-t border-white/30 pt-2 text-center"><div className="truncate text-sm font-black uppercase tracking-wide">{player.handle}</div><div className="text-[9px] font-bold uppercase opacity-90">{player.discipline} · POT {getPotential(player)}</div><div className="mt-2 grid grid-cols-3 gap-x-2 gap-y-1 border-t border-white/25 pt-2">{labels.map(([label, value]) => <div key={label} className="text-[10px] font-black"><span className="opacity-70">{label}</span> {value}</div>)}</div></div>
  </div>;
};
