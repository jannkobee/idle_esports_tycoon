import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { EsportsDiscipline, DISCIPLINE_INFO, ProPlayer, PlayerStats } from '../../core/types/player.types';
import { Crosshair, Shield, Flame, Swords, UserPlus, PlayCircle, Sparkles, Award } from 'lucide-react';
import { formatCash } from '../../utils/formatCurrency';
import confetti from 'canvas-confetti';
import { PlayerCard } from './PlayerCard';
import { LineupManager } from './LineupManager';
import { CARD_ODDS, CARD_PACK_COST, developmentCost, duplicateKey, duplicateValue, getCardAttributes, getOverall, getPotential, trainingCeiling } from '../../core/cards/CardService';
import { coachSelectLineup, managerDiscount } from '../../core/staff/StaffService';

const ICON_MAP = {
  Crosshair,
  Shield,
  Flame,
  Swords,
};

const RARITY_COLORS: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  bronze: { border: 'border-amber-800', bg: 'bg-amber-950/30', text: 'text-amber-500', badge: 'bg-amber-800/40 text-amber-300' },
  silver: { border: 'border-slate-400', bg: 'bg-slate-800/30', text: 'text-slate-300', badge: 'bg-slate-700 text-slate-200' },
  gold: { border: 'border-amber-400', bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-400 text-slate-950 font-black' },
  platinum: { border: 'border-sky-300', bg: 'bg-sky-500/10', text: 'text-sky-300', badge: 'bg-sky-400 text-slate-950 font-black' },
  diamond: { border: 'border-cyan-400', bg: 'bg-cyan-500/20', text: 'text-cyan-300', badge: 'bg-cyan-400 text-slate-950 font-black' },
  goat: { border: 'border-fuchsia-300', bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-200', badge: 'bg-fuchsia-400 text-slate-950 font-black' },
};

export const RosterPanel: React.FC = () => {
  const { roster, hiredStaff, cash, developmentPoints, convertDuplicateCard, developPlayer, scoutPlayer, buyCardPack, trainPlayer, trainCardAttribute, requestAd, empire } = useGameStore();
  const [selectedDiscipline, setSelectedDiscipline] = useState<EsportsDiscipline | 'all'>('all');
  const [scoutedPlayerNotice, setScoutedPlayerNotice] = useState<ProPlayer | null>(null);
  const [revealingCard, setRevealingCard] = useState<ProPlayer | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [progressNotice, setProgressNotice] = useState('');
  const packCost = Math.round(CARD_PACK_COST * (1 - Math.max(empire.executives.some(staff => staff.role === 'gm' && staff.hired) ? 0.2 : 0, managerDiscount(hiredStaff, 'gm'))));

  useEffect(() => {
    if (!revealingCard || revealed) return;
    const timer = window.setTimeout(() => {
      setRevealed(true);
      if (['platinum', 'diamond', 'goat'].includes(revealingCard.rarity)) confetti({ particleCount: 110, spread: 75 });
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [revealingCard, revealed]);

  const filteredRoster = selectedDiscipline === 'all' 
    ? roster 
    : roster.filter(p => p.discipline === selectedDiscipline);

  const handleStandardScout = () => {
    const player = scoutPlayer(false, selectedDiscipline === 'all' ? 'fps' : selectedDiscipline);
    if (player) {
      setScoutedPlayerNotice(player);
      confetti({ particleCount: 40, spread: 50 });
    }
  };

  const handleVipAdScout = () => {
    requestAd('scout_vip_pull', (success) => {
      if (success) {
        const player = scoutPlayer(true, selectedDiscipline === 'all' ? 'fps' : selectedDiscipline);
        if (player) {
          setScoutedPlayerNotice(player);
          confetti({ particleCount: 75, spread: 70 });
        }
      }
    });
  };

  const handleTrain = (playerId: string, stat: keyof PlayerStats) => {
    trainPlayer(playerId, stat);
  };

  const handlePack = () => {
    const card = buyCardPack(selectedDiscipline === 'all' ? 'fps' : selectedDiscipline);
    if (!card) return;
    setRevealed(false);
    setRevealingCard(card);
  };

  return (
    <div className="w-full px-4 py-2 flex flex-col gap-4">
      {/* Card packs: odds are shown before purchase, reveal is visual only. */}
      <div className="rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-950/60 to-slate-900 p-4">
        <div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-black text-amber-200">PLAYER CARD PACK</h3><p className="text-[11px] text-slate-300">One random {selectedDiscipline === 'all' ? 'FPS' : DISCIPLINE_INFO[selectedDiscipline].name} pro, with age, role and potential.</p></div><Sparkles className="shrink-0 text-amber-300" /></div>
        <div className="mt-3 flex flex-wrap gap-1">{CARD_ODDS.map(tier => <span key={tier.rarity} className="rounded bg-slate-950/70 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-300">{tier.rarity} {tier.weight}%</span>)}</div>
        <button onClick={handlePack} disabled={cash < packCost} className="mt-3 w-full rounded-xl bg-amber-400 py-2.5 text-xs font-black text-slate-950 disabled:bg-slate-700 disabled:text-slate-400">Open Random Card · {formatCash(packCost)}</button>
      </div>
      {/* Scouting Recruitment Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">TALENT SCOUTING AGENCY</h3>
              <p className="text-xs text-slate-400">Scouting: {DISCIPLINE_INFO[selectedDiscipline === 'all' ? 'fps' : selectedDiscipline].name}. Select a genre below.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          {/* Option A: Cash Scout */}
          <button
            onClick={handleStandardScout}
            disabled={cash < 500}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition active:scale-95 ${
              cash >= 500
                ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                : 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Standard Scout</span>
            <span className="font-mono text-[11px] text-emerald-400">{formatCash(500)}</span>
          </button>

          {/* Option B: Rewarded Ad VIP Scout */}
          <button
            onClick={handleVipAdScout}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs flex flex-col items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 border border-amber-300"
          >
            <div className="flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5 fill-slate-950 text-amber-400" />
              <span>VIP Scout Reel</span>
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold text-amber-950">Silver or Better (Ad)</span>
          </button>
        </div>
      </div>

      {/* Scouted Notification Banner */}
      {scoutedPlayerNotice && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between text-xs text-white animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Recruited <strong>{scoutedPlayerNotice.handle}</strong> ({scoutedPlayerNotice.rarity.toUpperCase()})!</span>
          </div>
          <button 
            onClick={() => setScoutedPlayerNotice(null)}
            className="text-slate-400 hover:text-white font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Discipline Genre Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedDiscipline('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            selectedDiscipline === 'all'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Genres ({roster.length})
        </button>

        {(Object.keys(DISCIPLINE_INFO) as EsportsDiscipline[]).map(disciplineKey => {
          const info = DISCIPLINE_INFO[disciplineKey];
          const Icon = ICON_MAP[info.icon as keyof typeof ICON_MAP] || Crosshair;
          const count = roster.filter(p => p.discipline === disciplineKey).length;

          return (
            <button
              key={disciplineKey}
              onClick={() => setSelectedDiscipline(disciplineKey)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedDiscipline === disciplineKey
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{info.name} ({count})</span>
            </button>
          );
        })}
      </div>

      <LineupManager discipline={selectedDiscipline === 'all' ? 'fps' : selectedDiscipline} />

      <div className="rounded-xl border border-violet-500/35 bg-violet-950/20 px-3 py-2 text-[11px]"><span className="font-black text-violet-200">Development points: {developmentPoints}</span><span className="ml-1 text-slate-400">Convert a duplicate bench card, then spend points to train below a player's potential.</span>{progressNotice && <div role="status" className="mt-1 font-bold text-emerald-300">{progressNotice}</div>}</div>

      {/* Player Cards List */}
      <div className="flex flex-col gap-3">
        {filteredRoster.map(player => {
          const rarityStyle = RARITY_COLORS[player.rarity] || RARITY_COLORS.bronze;
          const disciplineInfo = DISCIPLINE_INFO[player.discipline];
          const onLineup = Object.values(coachSelectLineup(roster, player.discipline, hiredStaff)).includes(player.id);
          const duplicateCount = roster.filter(candidate => duplicateKey(candidate) === duplicateKey(player)).length;

          return (
            <div
              key={player.id}
              className={`bg-slate-900 border ${rarityStyle.border} rounded-2xl p-4 flex flex-col gap-3 shadow-lg`}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center">
                  <PlayerCard player={player} compact />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white">{player.handle}</h4>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${rarityStyle.badge}`}>
                        {player.rarity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{disciplineInfo?.name}</span>
                      <span>•</span>
                      <span>{onLineup ? 'Lineup' : 'Bench'} · Age {player.age ?? 22}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {getOverall(player)} OVR / {getPotential(player)} POT
                  </span>
                </div>
              </div>

              {/* Stats & Training Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center">
                {(['aim', 'macro', 'comms', 'tiltResistance'] as (keyof PlayerStats)[]).map(statKey => {
                  const statVal = player.stats[statKey];
                  const trainCost = statVal * 5;
                  const canAfford = cash >= trainCost;

                  return (
                    <div key={statKey} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {statKey === 'tiltResistance' ? 'Mental' : statKey}
                      </span>
                      <span className="text-sm font-black text-white font-mono my-0.5">
                        {statVal}
                      </span>
                      <button
                        onClick={() => handleTrain(player.id, statKey)}
                        disabled={!canAfford || statVal >= trainingCeiling(player)}
                        className={`w-full py-1 rounded text-[9px] font-bold mt-1 transition ${
                          statVal >= trainingCeiling(player)
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : canAfford
                            ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {statVal >= trainingCeiling(player) ? 'MAX' : `+1 (${formatCash(trainCost)})`}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2">
                {(['adaptability', 'stamina'] as const).map(attribute => {
                  const value = getCardAttributes(player)[attribute];
                  return <button key={attribute} onClick={() => trainCardAttribute(player.id, attribute)} disabled={value >= trainingCeiling(player) || cash < value * 5} className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1.5 text-[10px] font-bold uppercase text-cyan-200 disabled:text-slate-500">{attribute} {value} · {value >= trainingCeiling(player) ? 'MAX' : `+1 ${formatCash(value * 5)}`}</button>;
                })}
              </div>
              <details className="rounded-xl border border-violet-500/25 bg-slate-950/50 p-2"><summary className="cursor-pointer text-[10px] font-black uppercase text-violet-200">Card development · {developmentPoints} points</summary><div className="mt-2 grid grid-cols-2 gap-1.5">{(Object.keys(getCardAttributes(player)) as (keyof ReturnType<typeof getCardAttributes>)[]).map(attribute => {
                const value = getCardAttributes(player)[attribute];
                const cost = developmentCost(value);
                return <button key={attribute} onClick={() => developPlayer(player.id, attribute)} disabled={value >= trainingCeiling(player) || developmentPoints < cost} className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2 py-1.5 text-left text-[9px] font-bold uppercase text-violet-200 disabled:opacity-40">{attribute} {value} · +1 / {cost} DP</button>;
              })}</div></details>
              {duplicateCount > 1 && !onLineup && <button onClick={() => {
                if (!window.confirm(`Convert ${player.handle} into ${duplicateValue(player)} development points? This removes the card.`)) return;
                const earned = convertDuplicateCard(player.id);
                if (earned) setProgressNotice(`Converted ${player.handle} for +${earned} development points.`);
              }} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-[10px] font-black text-rose-200">Convert duplicate bench card · +{duplicateValue(player)} DP</button>}
            </div>
          );
        })}
      </div>
      {revealingCard && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-5" role="dialog" aria-modal="true" aria-label="Player card reveal">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
          <div className="text-sm font-black uppercase tracking-[0.25em] text-amber-300">New signing</div>
          {revealed ? <div className="animate-in zoom-in-75 duration-500"><PlayerCard player={revealingCard} /></div> : <div className="flex h-[310px] w-[240px] animate-pulse items-center justify-center rounded-[24px] border-2 border-amber-300 bg-gradient-to-br from-amber-600 via-slate-800 to-slate-950 shadow-2xl shadow-amber-500/30"><Sparkles size={50} className="animate-spin text-amber-100" /></div>}
          {revealed && <button onClick={() => setRevealingCard(null)} className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-black text-slate-950">Add to Roster</button>}
        </div>
      </div>}
    </div>
  );
};
