import React, { useState } from 'react';
import { Building2, CarFront, Crown, Palette, Sunrise, UsersRound } from 'lucide-react';
import { useGameStore } from '../../core/store/useGameStore';
import { CRESTS, facilityTierName, PERSONALITY_DETAILS, playerSportsPreference, SCHEDULE_LABELS } from '../../core/empire/EmpireService';
import { formatCash } from '../../utils/formatCurrency';
import { StaffMarket } from './StaffMarket';
import { CosmeticStore } from './CosmeticStore';
import { BRANCHES, branchIncomePerSecond, branchUpgradeCost } from '../../core/empire/BranchService';
import { DailyRewardsPanel } from '../progression/DailyRewardsPanel';
import { staffDailySchedule } from '../../core/staff/StaffService';
import { DISCIPLINE_INFO, EsportsDiscipline } from '../../core/types/player.types';

const FLEET_NAMES = ['Crimson Sports Coupe', 'Executive Sprinter Van', 'Luxury Team Tour Bus'];
const DISTRICT_NAMES = ['Suburban Street / Dynasty Mart', 'Esports Plaza & Park', 'Metropolis Tech Promenade'];

export const EmpirePanel: React.FC = () => {
  const store = useGameStore();
  const empire = store.empire;
  const active = store.roster.filter(player => player.role !== 'inactive');
  const nextDistrictCost = empire.districtTier === 1 ? 12000 : 65000;
  const nextFleetCost = empire.fleetTier === 1 ? 7500 : 40000;
  const nextTowerCost = empire.facilityTier === 1 ? 100000 : 750000;
  const [celebration, setCelebration] = useState('');
  const buy = (action: () => boolean, message: string) => { if (action()) setCelebration(`🎉 ${message}`); };

  return <div className="p-4 space-y-4 text-slate-200">
    {celebration && <button onClick={() => setCelebration('')} className="w-full rounded-xl border border-amber-300 bg-amber-500/20 px-3 py-2 text-left text-[11px] font-black text-amber-100 animate-pulse">{celebration} <span className="float-right text-amber-300">×</span></button>}
    <DailyRewardsPanel />
    <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-3"><h3 className="text-sm font-black text-emerald-200">Next Upgrade Preview</h3><div className="mt-2 grid gap-1 text-[10px] text-slate-300"><p><b className="text-cyan-300">District:</b> {empire.districtTier === 1 ? 'Esports Plaza, boba cafe, fountain, recovery boost.' : empire.districtTier === 2 ? 'Tech Promenade, flagship merch, higher sponsor multiplier.' : 'All district content unlocked.'}</p><p><b className="text-rose-300">Garage:</b> {empire.fleetTier === 1 ? 'Executive Sprinter Van with more team travel presence.' : empire.fleetTier === 2 ? 'Luxury Tour Bus fleet visual.' : 'Fleet fully upgraded.'}</p><p><b className="text-amber-300">HQ:</b> {empire.facilityTier === 1 ? 'Regional facility, staff offices and extra space.' : empire.facilityTier === 2 ? 'Dynasty Tower floors, fan cafe, discipline wings.' : 'Dynasty Tower complete.'}</p></div></section>
    <section className="rounded-2xl border border-cyan-500/30 bg-cyan-950/25 p-3">
      <div className="flex items-center gap-2"><Building2 size={17} className="text-cyan-400" /><div><h3 className="font-black text-sm">Living World District</h3><p className="text-[11px] text-slate-400">Fans, sponsors, and recovery scale together.</p></div></div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
        {DISTRICT_NAMES.map((name, index) => <div key={name} className={`rounded-lg p-2 border ${index + 1 === empire.districtTier ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'bg-slate-950/50 border-slate-800 text-slate-500'}`}>T{index + 1}<br /><span className="font-medium">{name.split('/')[0]}</span></div>)}
      </div>
      <button onClick={() => buy(store.upgradeDistrict, empire.districtTier === 1 ? 'Esports Plaza unlocked!' : 'Tech Promenade unlocked!')} disabled={empire.districtTier === 3 || store.cash < nextDistrictCost} className="mt-3 w-full rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-slate-950 disabled:bg-slate-800 disabled:text-slate-500">
        {empire.districtTier === 3 ? 'District Complete' : `Upgrade District · ${formatCash(nextDistrictCost)}`}
      </button>
    </section>

    <section className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3"><div className="flex gap-2"><CarFront size={16} className="text-rose-400" /><div><h3 className="text-xs font-black">Team Garage</h3><p className="text-[10px] text-slate-400">{FLEET_NAMES[empire.fleetTier - 1]}</p></div></div><button onClick={() => buy(store.upgradeFleet, empire.fleetTier === 1 ? 'Executive Sprinter acquired!' : 'Luxury Tour Bus acquired!')} disabled={empire.fleetTier === 3 || store.cash < nextFleetCost} className="mt-3 w-full rounded-lg bg-rose-500/90 py-1.5 text-[10px] font-black text-white disabled:bg-slate-800 disabled:text-slate-500">{empire.fleetTier === 3 ? 'Fleet Maxed' : `Upgrade ${formatCash(nextFleetCost)}`}</button></div>
      <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3"><div className="flex gap-2"><Crown size={16} className="text-amber-400" /><div><h3 className="text-xs font-black">HQ Evolution</h3><p className="text-[10px] text-slate-400">{facilityTierName(empire.facilityTier)}</p></div></div><button onClick={store.upgradeFacilityTier} disabled={empire.facilityTier === 3 || store.cash < nextTowerCost || store.legacyTrophies < empire.facilityTier} className="mt-3 w-full rounded-lg bg-amber-500 py-1.5 text-[10px] font-black text-slate-950 disabled:bg-slate-800 disabled:text-slate-500">{empire.facilityTier === 3 ? 'Tower Complete' : `Evolve ${formatCash(nextTowerCost)}`}</button></div>
    </section>

    <section className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-3">
      <h3 className="text-sm font-black">Global Esports Branches</h3>
      <p className="text-[10px] text-slate-400">Build specialist academies beyond the main HQ. Branches earn while the game is open or offline.</p>
      <p className="mt-1 text-[10px] font-bold text-sky-300">Network income: {formatCash(branchIncomePerSecond(empire.branches))}/sec</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">{BRANCHES.map(definition => {
        const branch = empire.branches?.find(candidate => candidate.id === definition.id);
        const cost = branch ? branchUpgradeCost(branch) : definition.unlockCost;
        return <div key={definition.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-2">
          <div className="text-[11px] font-black" style={{ color: definition.color }}>{definition.city}</div>
          <div className="text-[9px] text-slate-400">{definition.discipline.toUpperCase()} · {branch ? `Tier ${branch.tier}/3` : 'Not opened'}</div>
          <button onClick={() => branch ? store.upgradeBranch(definition.id) : store.openBranch(definition.id)} disabled={branch?.tier === 3 || store.cash < cost} className="mt-2 w-full rounded-lg bg-sky-600 px-2 py-1.5 text-[10px] font-black disabled:bg-slate-800 disabled:text-slate-500">{branch?.tier === 3 ? 'Fully Built' : `${branch ? 'Upgrade' : 'Open'} · ${formatCash(cost)}`}</button>
        </div>;
      })}</div>
    </section>

    <section className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-3"><div className="flex gap-2"><Sunrise size={17} className="text-indigo-300" /><div><h3 className="text-sm font-black">Staff-Designed Routine</h3><p className="text-[10px] text-slate-400">Coaches and operations managers set priorities. Pros can rest, roam, or play sports when they need to.</p></div></div><div className="mt-3 grid grid-cols-5 gap-1">{empire.schedule.map((block, slot) => <div key={slot} className="min-w-0 rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-center text-[9px] font-bold text-slate-200">{SCHEDULE_LABELS[block]}</div>)}</div><div className="mt-2 grid grid-cols-2 gap-1">{(Object.keys(DISCIPLINE_INFO) as EsportsDiscipline[]).map(discipline => { const coach = store.hiredStaff.find(person => person.kind === 'coach' && person.discipline === discipline); const rotation = staffDailySchedule(store.hiredStaff, discipline); return <div key={discipline} className="rounded-lg bg-slate-950/70 p-1.5"><div className="text-[9px] font-black text-indigo-200">{DISCIPLINE_INFO[discipline].name} · {coach?.name ?? 'Standard rotation'}</div><div className="mt-0.5 text-[8px] text-slate-400">{rotation.map(block => SCHEDULE_LABELS[block]).join(' · ')}</div></div>; })}</div></section>

    <section className="rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-3"><div className="flex gap-2"><UsersRound size={17} className="text-emerald-400" /><div><h3 className="text-sm font-black">Player Freedom & Sports</h3><p className="text-[10px] text-slate-400">Players choose breaks and sports around staff priorities. Outdoor time restores mood and energy.</p></div></div><div className="mt-2 space-y-1.5">{active.map(player => <div key={player.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/60 px-2 py-1.5"><span className="text-[11px] font-bold">{player.handle}</span><span className="text-[9px] text-emerald-300">{PERSONALITY_DETAILS[player.personality ?? 'grinder'].label} · {playerSportsPreference(player)}</span></div>)}</div></section>

    <section className="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-950/15 p-3"><div className="flex gap-2"><Palette size={17} className="text-fuchsia-300" /><div><h3 className="text-sm font-black">Organization Branding Studio</h3><p className="text-[10px] text-slate-400">Changes live player jerseys and district colors.</p></div></div><input value={empire.branding.name} onChange={e => store.setBranding({ name: e.target.value.slice(0, 28) })} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs font-bold" aria-label="Organization name" /><div className="mt-2 grid grid-cols-6 gap-1">{CRESTS.map((crest, index) => <button key={crest} onClick={() => store.setBranding({ crestId: index })} className={`rounded-md py-1 text-[8px] font-bold ${empire.branding.crestId === index ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{crest}</button>)}</div><div className="mt-2 flex gap-3 text-[10px] font-bold">Primary <input aria-label="Primary jersey color" type="color" value={empire.branding.primaryColor} onChange={e => store.setBranding({ primaryColor: e.target.value })} /> Accent <input aria-label="Accent jersey color" type="color" value={empire.branding.accentColor} onChange={e => store.setBranding({ accentColor: e.target.value })} /></div></section>

    <StaffMarket />

    <section className="rounded-2xl border border-violet-500/25 bg-violet-950/15 p-3">
      <h3 className="text-sm font-black">Competitive Season</h3>
      <p className="text-[10px] text-slate-400">Year {empire.seasonCalendar.year} · {empire.seasonCalendar.stage.toUpperCase()} · {empire.seasonCalendar.trophies} World trophies</p>
      <div className="mt-2 grid grid-cols-4 gap-1">
        {(['spring', 'msi', 'summer', 'worlds'] as const).map(stage => <div key={stage} className={`rounded-lg border px-1 py-1.5 text-center text-[8px] font-black ${empire.seasonCalendar.stage === stage ? 'border-violet-300 bg-violet-500/25 text-violet-100' : 'border-slate-700 bg-slate-950/50 text-slate-400'}`}>
          {stage.toUpperCase()}<br /><span className="text-[10px]">{empire.seasonCalendar.stageWins[stage]}W</span>
        </div>)}
      </div>
      <div className="mt-3 rounded-lg bg-slate-950/60 p-2">
        <div className="flex items-center justify-between text-[9px] font-black text-violet-200"><span>LIVE LEADERBOARD</span><span>RATING</span></div>
        {store.powerRankings.filter((team, index) => index < 5 || team.isPlayerTeam).map(team => <div key={team.id} className={`mt-1 flex items-center justify-between text-[10px] ${team.isPlayerTeam ? 'font-black text-cyan-300' : 'text-slate-300'}`}><span>#{team.rank} {team.tag}</span><span>{team.rating}</span></div>)}
      </div>
      {empire.seasonHistory?.[0] && <p className="mt-2 text-[9px] text-slate-400">Last year: #{empire.seasonHistory[0].finalRank} finish · {empire.seasonHistory[0].worldChampion ? 'World Champion' : 'Worlds qualified'}</p>}
      <p className="mt-2 text-[9px] text-violet-200">Win a tournament to advance the calendar; Worlds records the season result and ages the roster.</p>
    </section>

    <CosmeticStore />
  </div>;
};
