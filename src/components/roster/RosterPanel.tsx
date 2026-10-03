import React, { useState } from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { EsportsDiscipline, DISCIPLINE_INFO, ProPlayer, PlayerStats } from '../../core/types/player.types';
import { Crosshair, Shield, Flame, Swords, UserPlus, PlayCircle, Sparkles, Award } from 'lucide-react';
import { formatCash } from '../../utils/formatCurrency';
import confetti from 'canvas-confetti';
import { PlayerPortrait } from './PlayerPortrait';

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
  diamond: { border: 'border-cyan-400', bg: 'bg-cyan-500/20', text: 'text-cyan-300', badge: 'bg-cyan-400 text-slate-950 font-black' },
};

export const RosterPanel: React.FC = () => {
  const { roster, cash, scoutPlayer, trainPlayer, requestAd } = useGameStore();
  const [selectedDiscipline, setSelectedDiscipline] = useState<EsportsDiscipline | 'all'>('all');
  const [scoutedPlayerNotice, setScoutedPlayerNotice] = useState<ProPlayer | null>(null);

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

  return (
    <div className="w-full px-4 py-2 flex flex-col gap-4">
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

      {/* Player Cards List */}
      <div className="flex flex-col gap-3">
        {filteredRoster.map(player => {
          const rarityStyle = RARITY_COLORS[player.rarity] || RARITY_COLORS.bronze;
          const disciplineInfo = DISCIPLINE_INFO[player.discipline];

          return (
            <div
              key={player.id}
              className={`bg-slate-900 border ${rarityStyle.border} rounded-2xl p-4 flex flex-col gap-3 shadow-lg`}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-20 shrink-0 rounded-xl border ${rarityStyle.border} ${rarityStyle.bg} overflow-hidden`}>
                    <PlayerPortrait player={player} />
                  </div>
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
                      <span>{player.role}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Lv. {player.level}
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
                        disabled={!canAfford || statVal >= 100}
                        className={`w-full py-1 rounded text-[9px] font-bold mt-1 transition ${
                          statVal >= 100
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : canAfford
                            ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {statVal >= 100 ? 'MAX' : `+1 (${formatCash(trainCost)})`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
