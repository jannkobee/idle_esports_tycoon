import React from 'react';
import { Building2, CarFront, Crown, Palette, Sparkles, Sunrise, UsersRound } from 'lucide-react';
import { useGameStore } from '../../core/store/useGameStore';
import { CRESTS, facilityTierName, PERSONALITY_DETAILS, SCHEDULE_LABELS, VIP_ITEMS, type ScheduleBlock } from '../../core/empire/EmpireService';
import { formatCash } from '../../utils/formatCurrency';

const BLOCKS: ScheduleBlock[] = ['scrim', 'vod', 'gym', 'outdoor', 'rest'];
const FLEET_NAMES = ['Crimson Sports Coupe', 'Executive Sprinter Van', 'Luxury Team Tour Bus'];
const DISTRICT_NAMES = ['Suburban Street / Dynasty Mart', 'Esports Plaza & Park', 'Metropolis Tech Promenade'];

export const EmpirePanel: React.FC = () => {
  const store = useGameStore();
  const empire = store.empire;
  const active = store.roster.filter(player => player.role !== 'inactive');
  const nextDistrictCost = empire.districtTier === 1 ? 12000 : 65000;
  const nextFleetCost = empire.fleetTier === 1 ? 7500 : 40000;
  const nextTowerCost = empire.facilityTier === 1 ? 100000 : 750000;

  return <div className="p-4 space-y-4 text-slate-200">
    <section className="rounded-2xl border border-cyan-500/30 bg-cyan-950/25 p-3">
      <div className="flex items-center gap-2"><Building2 size={17} className="text-cyan-400" /><div><h3 className="font-black text-sm">Living World District</h3><p className="text-[11px] text-slate-400">Fans, sponsors, and recovery scale together.</p></div></div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
        {DISTRICT_NAMES.map((name, index) => <div key={name} className={`rounded-lg p-2 border ${index + 1 === empire.districtTier ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>T{index + 1}<br /><span className="font-medium">{name.split('/')[0]}</span></div>)}
      </div>
      <button onClick={store.upgradeDistrict} disabled={empire.districtTier === 3 || store.cash < nextDistrictCost} className="mt-3 w-full rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-slate-950 disabled:bg-slate-800 disabled:text-slate-500">
        {empire.districtTier === 3 ? 'District Complete' : `Upgrade District · ${formatCash(nextDistrictCost)}`}
      </button>
    </section>

    <section className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3"><div className="flex gap-2"><CarFront size={16} className="text-rose-400" /><div><h3 className="text-xs font-black">Team Garage</h3><p className="text-[10px] text-slate-400">{FLEET_NAMES[empire.fleetTier - 1]}</p></div></div><button onClick={store.upgradeFleet} disabled={empire.fleetTier === 3 || store.cash < nextFleetCost} className="mt-3 w-full rounded-lg bg-rose-500/90 py-1.5 text-[10px] font-black text-white disabled:bg-slate-800 disabled:text-slate-500">{empire.fleetTier === 3 ? 'Fleet Maxed' : `Upgrade ${formatCash(nextFleetCost)}`}</button></div>
      <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3"><div className="flex gap-2"><Crown size={16} className="text-amber-400" /><div><h3 className="text-xs font-black">HQ Evolution</h3><p className="text-[10px] text-slate-400">{facilityTierName(empire.facilityTier)}</p></div></div><button onClick={store.upgradeFacilityTier} disabled={empire.facilityTier === 3 || store.cash < nextTowerCost || store.legacyTrophies < empire.facilityTier} className="mt-3 w-full rounded-lg bg-amber-500 py-1.5 text-[10px] font-black text-slate-950 disabled:bg-slate-800 disabled:text-slate-500">{empire.facilityTier === 3 ? 'Tower Complete' : `Evolve ${formatCash(nextTowerCost)}`}</button></div>
    </section>

    <section className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-3"><div className="flex gap-2"><Sunrise size={17} className="text-indigo-300" /><div><h3 className="text-sm font-black">Synchronized Daily Routine</h3><p className="text-[10px] text-slate-400">All active pros: +{Math.min(30, active.length * 5)}% block synergy.</p></div></div><div className="mt-3 grid grid-cols-5 gap-1">{empire.schedule.map((selected, slot) => <select aria-label={`Schedule slot ${slot + 1}`} key={slot} value={selected} onChange={e => store.setScheduleBlock(slot, e.target.value as ScheduleBlock)} className="min-w-0 rounded-lg border border-slate-700 bg-slate-900 p-1 text-[9px] font-bold text-slate-200">{BLOCKS.map(block => <option key={block} value={block}>{SCHEDULE_LABELS[block]}</option>)}</select>)}</div></section>

    <section className="rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-3"><div className="flex gap-2"><UsersRound size={17} className="text-emerald-400" /><div><h3 className="text-sm font-black">Roster Personalities & Outdoor Reset</h3><p className="text-[10px] text-slate-400">Treat runs clear tilt and grant 10 min Inspired.</p></div></div><div className="mt-2 space-y-1.5">{active.map(player => <div key={player.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/60 px-2 py-1.5"><div className="min-w-0"><span className="text-[11px] font-bold">{player.handle}</span><span className="ml-1 text-[9px] text-emerald-300">{PERSONALITY_DETAILS[player.personality ?? 'grinder'].label}</span></div><button onClick={() => store.takeOutdoorBreak(player.id)} className="shrink-0 rounded-md bg-emerald-500/15 px-2 py-1 text-[9px] font-black text-emerald-300">Treat Run</button></div>)}</div></section>

    <section className="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-950/15 p-3"><div className="flex gap-2"><Palette size={17} className="text-fuchsia-300" /><div><h3 className="text-sm font-black">Organization Branding Studio</h3><p className="text-[10px] text-slate-400">Changes live player jerseys and district colors.</p></div></div><input value={empire.branding.name} onChange={e => store.setBranding({ name: e.target.value.slice(0, 28) })} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs font-bold" aria-label="Organization name" /><div className="mt-2 grid grid-cols-6 gap-1">{CRESTS.map((crest, index) => <button key={crest} onClick={() => store.setBranding({ crestId: index })} className={`rounded-md py-1 text-[8px] font-bold ${empire.branding.crestId === index ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{crest}</button>)}</div><div className="mt-2 flex gap-3 text-[10px] font-bold">Primary <input aria-label="Primary jersey color" type="color" value={empire.branding.primaryColor} onChange={e => store.setBranding({ primaryColor: e.target.value })} /> Accent <input aria-label="Accent jersey color" type="color" value={empire.branding.accentColor} onChange={e => store.setBranding({ accentColor: e.target.value })} /></div></section>

    <section className="rounded-2xl border border-amber-500/25 bg-amber-950/15 p-3"><h3 className="text-sm font-black">Corporate Leadership</h3><div className="mt-2 grid grid-cols-2 gap-1.5">{empire.executives.map(staff => <button key={staff.role} onClick={() => store.hireExecutive(staff.role)} disabled={staff.hired || store.cash < staff.cost} className="rounded-xl border border-slate-700 bg-slate-950/65 p-2 text-left disabled:opacity-55"><span className="block text-[10px] font-black">{staff.title}</span><span className="block text-[9px] text-slate-400">{staff.hired ? 'Hired' : `${formatCash(staff.cost)} · ${staff.perk}`}</span></button>)}</div></section>

    <section className="rounded-2xl border border-violet-500/25 bg-violet-950/15 p-3"><div className="flex items-center justify-between"><div><h3 className="text-sm font-black">Competitive Season</h3><p className="text-[10px] text-slate-400">Year {empire.seasonCalendar.year} · {empire.seasonCalendar.stage.toUpperCase()} · {empire.seasonCalendar.trophies} World trophies</p></div><button onClick={() => store.advanceSeasonStage(true)} className="rounded-lg bg-violet-500 px-2 py-1.5 text-[10px] font-black">Record Win / Advance</button></div></section>

    <section className="rounded-2xl border border-pink-500/25 bg-pink-950/15 p-3"><div className="flex gap-2"><Sparkles size={17} className="text-pink-300" /><div><h3 className="text-sm font-black">VIP Vanity Store</h3><p className="text-[10px] text-slate-400">Spend Energy Cans · {store.energyCans} available</p></div></div><div className="mt-2 grid grid-cols-2 gap-1.5">{VIP_ITEMS.map(item => <button key={item.id} onClick={() => store.buyVipItem(item.id)} disabled={empire.vipInventory.includes(item.id) || store.energyCans < item.cost} className="rounded-xl border border-slate-700 bg-slate-950/60 p-2 text-left disabled:opacity-45"><span className="block text-[10px] font-black">{item.name}</span><span className="block text-[9px] text-slate-400">{empire.vipInventory.includes(item.id) ? 'Owned' : `${item.cost} cans · ${item.description}`}</span></button>)}</div></section>
  </div>;
};
