import React, { useEffect, useState } from 'react';
import { Crown, Swords, Trophy } from 'lucide-react';
import { useGameStore } from '../../core/store/useGameStore';
import { LINEUP_SLOTS, lineupPower } from '../../core/cards/CardService';
import { DISCIPLINE_INFO, type EsportsDiscipline } from '../../core/types/player.types';
import { TOURNAMENTS } from '../../core/tournaments/CircuitService';
import { activeCoach, coachPlan, coachSelectLineup } from '../../core/staff/StaffService';
import { formatCash, formatNumber } from '../../utils/formatCurrency';

export const TournamentModal: React.FC = () => {
  const roster = useGameStore(state => state.roster);
  const cash = useGameStore(state => state.cash);
  const rankings = useGameStore(state => state.powerRankings);
  const event = useGameStore(state => state.circuitEvent);
  const staff = useGameStore(state => state.hiredStaff);
  const brand = useGameStore(state => state.empire.branding);
  const startCircuit = useGameStore(state => state.startCircuit);
  const playRound = useGameStore(state => state.playNextCircuitRound);
  const [tab, setTab] = useState<'events' | 'rankings'>('events');
  const [preview, setPreview] = useState<EsportsDiscipline>('fps');
  const [clock, setClock] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setClock(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const power = (discipline: EsportsDiscipline) => lineupPower(roster, discipline, coachSelectLineup(roster, discipline, staff));
  const lineup = coachSelectLineup(roster, preview, staff);
  const nextRound = event?.status === 'active' ? event.rounds[event.currentRound] : undefined;
  const coach = event ? activeCoach(staff, event.discipline) : undefined;
  const plan = event && nextRound ? coachPlan(staff, event.discipline, nextRound.opponent.id) : undefined;
  const playerTeam = rankings.find(team => team.isPlayerTeam);

  return <div className="space-y-3 px-4 py-3 text-slate-100">
    <section className="rounded-2xl border border-cyan-500/35 bg-slate-950/75 p-3">
      <div className="flex items-start justify-between gap-2"><div><h3 className="text-xs font-black uppercase tracking-wider">Coach's starting five</h3><p className="text-[10px] text-slate-400">Your coach picks eligible starters by form, fit, and strategy. Invest in cards to improve selection.</p></div><span className="shrink-0 rounded-lg bg-cyan-500/20 px-2 py-1 text-sm font-black text-cyan-300">{power(preview)} PWR</span></div>
      <select aria-label="Lineup discipline" value={preview} onChange={change => setPreview(change.target.value as EsportsDiscipline)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-[11px] font-bold">{(Object.keys(DISCIPLINE_INFO) as EsportsDiscipline[]).map(discipline => <option key={discipline} value={discipline}>{DISCIPLINE_INFO[discipline].name}</option>)}</select>
      <div className="mt-2 grid grid-cols-2 gap-1.5">{LINEUP_SLOTS[preview].map(slot => { const player = roster.find(candidate => candidate.id === lineup[slot.id]); return <div key={slot.id} className="min-w-0 rounded-lg bg-slate-900 px-2 py-1 text-[9px]"><span className="font-black text-cyan-300">{slot.label}</span><span className="ml-1 truncate text-slate-200">{player?.handle ?? 'Empty'}</span></div>; })}</div>
    </section>
    <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs font-black"><button onClick={() => setTab('events')} className={`flex-1 rounded-lg py-2 ${tab === 'events' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}>Tournaments</button><button onClick={() => setTab('rankings')} className={`flex-1 rounded-lg py-2 ${tab === 'rankings' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>Rankings</button></div>

    {tab === 'events' && <div className="space-y-3">
      {event && <section className="rounded-2xl border border-amber-500/45 bg-slate-950/85 p-3">
        <div className="flex items-start justify-between gap-2"><div><div className="flex items-center gap-1.5 text-amber-300"><Trophy size={16} /><h3 className="text-sm font-black">{event.name}</h3></div><p className="text-[10px] text-slate-400">{DISCIPLINE_INFO[event.discipline].name} · {event.status === 'active' ? 'Bracket underway' : event.status === 'won' ? 'Champions' : 'Eliminated'}</p></div><span className="rounded-lg bg-amber-500/15 px-2 py-1 text-[10px] font-black text-amber-300">{event.status.toUpperCase()}</span></div>
        <div className="mt-3 space-y-1.5">{event.rounds.map((round, index) => <div key={round.name} className="rounded-xl border border-slate-800 bg-slate-900/75 p-2 text-[10px]"><div className="flex items-center justify-between gap-2"><div><span className="font-black text-white">{round.name} · BO{round.bestOf}</span><span className="ml-1 text-slate-400">vs {round.opponent.name}</span></div><span className={`shrink-0 font-black ${round.result?.won ? 'text-emerald-300' : round.result ? 'text-rose-300' : 'text-slate-500'}`}>{round.result ? `${round.result.playerMaps}-${round.result.opponentMaps}` : index === event.currentRound && event.status === 'active' ? 'NEXT' : '—'}</span></div><div className="text-[9px] text-slate-500">{new Date(round.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{round.bannedMap ? ` · Coach banned ${round.bannedMap}` : ''}{round.tactic ? ` · ${round.tactic} tactic` : ''}</div>{round.result?.maps && <div className="mt-1 flex flex-wrap gap-1">{round.result.maps.map(map => <span key={map.name} className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${map.winner === 'player' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>{map.name} {map.playerRounds}-{map.opponentRounds}</span>)}</div>}</div>)}</div>
        {(event.otherMatches?.length ?? 0) > 0 && <details className="mt-2 rounded-xl border border-slate-800 bg-slate-900/50 p-2"><summary className="cursor-pointer text-[10px] font-black text-slate-300">Other bracket results</summary><div className="mt-1 space-y-1">{event.otherMatches!.map((fixture, index) => <div key={index} className="text-[9px] text-slate-400">{fixture.round}: {fixture.teamA} vs {fixture.teamB} · <span className="text-cyan-300">{fixture.winner} advances</span></div>)}</div></details>}
        {nextRound && plan && <div className="mt-3 space-y-2 border-t border-slate-800 pt-3"><div className="text-[10px] font-black uppercase text-slate-300">{nextRound.name} vs {nextRound.opponent.name}</div><p className="rounded-lg bg-cyan-500/10 p-2 text-[10px] text-cyan-200">{coach ? `${coach.name} (${coach.tier.replace('_', ' ')})` : 'Interim staff'} sets the strategy: {plan.tactic} play, ban {plan.bannedMap}. Hire a different coach in Empire to change the approach.</p><button onClick={() => playRound()} disabled={clock < nextRound.scheduledAt || power(event.discipline) <= 0} className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-black text-slate-950 disabled:bg-slate-700 disabled:text-slate-400">{clock < nextRound.scheduledAt ? `Match starts in ${Math.ceil((nextRound.scheduledAt - clock) / 1000)}s` : `Play ${nextRound.name} · ${power(event.discipline)} Power`}</button></div>}
        {event.status === 'won' && <p className="mt-2 text-[11px] font-black text-emerald-300">Champions: +{formatCash(event.prize)} and +{formatNumber(event.hypePrize ?? 100)} Hype</p>}
      </section>}
      <div className="px-1 text-[10px] font-black uppercase tracking-wider text-slate-400">Enter a bracket · BO3 quarterfinal and semifinal · BO5 final</div>
      {TOURNAMENTS.map(tournament => <section key={tournament.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-3"><div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><Swords size={17} className="shrink-0 text-amber-400" /><div><h3 className="text-xs font-black text-white">{tournament.name}</h3><p className="text-[10px] text-slate-400">{DISCIPLINE_INFO[tournament.discipline].name} · Power {power(tournament.discipline)} / suggested {tournament.minTeamPower}</p></div></div><button onClick={() => { if (startCircuit(tournament.discipline, Date.now(), tournament.id)) setPreview(tournament.discipline); }} disabled={Boolean(event?.status === 'active') || cash < tournament.entryFee || power(tournament.discipline) <= 0} className="shrink-0 rounded-lg bg-amber-500 px-2 py-1.5 text-[10px] font-black text-slate-950 disabled:bg-slate-700 disabled:text-slate-400">Enter {formatCash(tournament.entryFee)}</button></div><div className="mt-2 flex items-center justify-between rounded-lg bg-slate-950/70 px-2 py-1 text-[10px]"><span className="text-slate-400">Champion prize</span><span className="font-black text-emerald-300">{formatCash(tournament.cashPrize)} · +{formatNumber(tournament.hypePrize)} Hype</span></div></section>)}
    </div>}
    {tab === 'rankings' && <section className="rounded-2xl border border-slate-800 bg-slate-900 p-3"><div className="flex items-center gap-2"><Crown size={18} className="text-amber-400" /><div><h3 className="text-sm font-black">Global Power Rankings</h3><p className="text-[10px] text-slate-400">{brand.name} is #{playerTeam?.rank ?? '—'} in the circuit.</p></div></div><div className="mt-3 space-y-1">{rankings.map(team => <div key={team.id} className={`grid grid-cols-[25px_minmax(0,1fr)_70px_48px] items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] ${team.isPlayerTeam ? 'bg-cyan-500/15 text-cyan-200' : 'bg-slate-950/60 text-slate-300'}`}><span className="font-black">#{team.rank}</span><span className="truncate font-bold">{team.isPlayerTeam ? brand.name : team.name}</span><span className="text-right">{team.wins}W-{team.losses}L</span><span className="text-right font-mono">{team.rating}</span></div>)}</div></section>}
  </div>;
};
