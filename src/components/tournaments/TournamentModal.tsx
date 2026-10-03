import React, { useState } from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { Trophy, Swords, ShieldAlert, Award, PlayCircle, Sparkles } from 'lucide-react';
import { EsportsDiscipline, DISCIPLINE_INFO } from '../../core/types/player.types';
import { formatCash, formatNumber } from '../../utils/formatCurrency';
import confetti from 'canvas-confetti';

interface TournamentTier {
  id: string;
  name: string;
  discipline: EsportsDiscipline;
  entryFee: number;
  cashPrize: number;
  hypePrize: number;
  minTeamPower: number;
}

const TOURNAMENTS: TournamentTier[] = [
  {
    id: 'fps_grassroots',
    name: 'Grassroots LAN Cup',
    discipline: 'fps',
    entryFee: 100,
    cashPrize: 800,
    hypePrize: 25,
    minTeamPower: 35,
  },
  {
    id: 'moba_challenger',
    name: 'Continental Challenger',
    discipline: 'moba',
    entryFee: 1200,
    cashPrize: 10000,
    hypePrize: 150,
    minTeamPower: 55,
  },
  {
    id: 'br_trios_invitational',
    name: 'Apex Survival Showdown',
    discipline: 'br',
    entryFee: 8000,
    cashPrize: 75000,
    hypePrize: 600,
    minTeamPower: 70,
  },
  {
    id: 'fgc_world_clash',
    name: 'Fighter World Championship',
    discipline: 'fighting',
    entryFee: 35000,
    cashPrize: 350000,
    hypePrize: 2500,
    minTeamPower: 85,
  },
];

export const TournamentModal: React.FC = () => {
  const { roster, cash, requestAd } = useGameStore();
  const [selectedTournament, setSelectedTournament] = useState<TournamentTier | null>(null);
  const [matchState, setMatchState] = useState<'idle' | 'simulating' | 'halftime_crisis' | 'victory' | 'defeat'>('idle');
  const [simulatedScore, setSimulatedScore] = useState<{ player: number; opponent: number }>({ player: 0, opponent: 0 });

  const calculateTeamPower = (discipline: EsportsDiscipline): number => {
    const disciplinePlayers = roster.filter(p => p.discipline === discipline);
    if (disciplinePlayers.length === 0) return 0;

    const totalStat = disciplinePlayers.reduce((sum, p) => {
      return sum + ((p.stats.aim + p.stats.macro + p.stats.comms + p.stats.tiltResistance) / 4);
    }, 0);

    return Math.floor(totalStat / disciplinePlayers.length);
  };

  const handleStartTournament = (tourney: TournamentTier) => {
    if (useGameStore.getState().cash < tourney.entryFee || calculateTeamPower(tourney.discipline) === 0 || matchState !== 'idle') return;

    useGameStore.setState(state => ({ cash: state.cash - tourney.entryFee }));
    setSelectedTournament(tourney);
    setMatchState('simulating');
    setSimulatedScore({ player: 0, opponent: 0 });

    const power = calculateTeamPower(tourney.discipline);
    const target = tourney.minTeamPower;

    // Simulate match round 1 & 2
    setTimeout(() => {
      const winFirst = power >= target || Math.random() > 0.4;
      if (winFirst) {
        setSimulatedScore({ player: 1, opponent: 0 });
      } else {
        setSimulatedScore({ player: 0, opponent: 1 });
      }

      setTimeout(() => {
        // Round 2
        if (winFirst) {
          // If won round 1, chance to win or go to decider
          const winSecond = power >= target || Math.random() > 0.45;
          if (winSecond) {
            handleVictory(tourney);
          } else {
            // Decider game 3!
            triggerHalftimeCrisis();
          }
        } else {
          // Lost round 1: Halftime crisis (can watch ad to revive and win!)
          triggerHalftimeCrisis();
        }
      }, 1500);
    }, 1500);
  };

  const triggerHalftimeCrisis = () => {
    setMatchState('halftime_crisis');
    setSimulatedScore({ player: 1, opponent: 1 });
  };

  const handleWatchCoachPepTalkAd = () => {
    requestAd('tournament_clutch_buff', (success) => {
      if (success) {
        setMatchState('simulating');
        // Ad guaranteed win boost
        setTimeout(() => {
          if (selectedTournament) {
            handleVictory(selectedTournament);
          }
        }, 1500);
      }
    });
  };

  const handleForfeit = () => {
    setMatchState('defeat');
  };

  const handleVictory = (tourney: TournamentTier) => {
    setSimulatedScore({ player: 2, opponent: 1 });
    setMatchState('victory');
    useGameStore.setState(state => ({
      cash: state.cash + tourney.cashPrize,
      hype: state.hype + tourney.hypePrize,
      lifetimeEarnings: state.lifetimeEarnings + tourney.cashPrize,
    }));
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  };

  const handleClose = () => {
    setSelectedTournament(null);
    setMatchState('idle');
  };

  return (
    <div className="w-full px-4 py-2 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
        <span>Competitive Tournament Circuit</span>
        <span className="text-[11px] text-amber-400 font-mono">Win Cash & Hype</span>
      </div>

      {/* Tournament Cards */}
      <div className="flex flex-col gap-3">
        {TOURNAMENTS.map(tourney => {
          const power = calculateTeamPower(tourney.discipline);
          const disciplineInfo = DISCIPLINE_INFO[tourney.discipline];
          const canAfford = cash >= tourney.entryFee && power > 0 && matchState === 'idle';
          const isReady = power >= tourney.minTeamPower;

          return (
            <div
              key={tourney.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white">{tourney.name}</h4>
                      <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded">
                        {disciplineInfo.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Team Rating: <strong className={isReady ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>{power}/{tourney.minTeamPower}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartTournament(tourney)}
                  disabled={!canAfford}
                  className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition active:scale-95 ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Enter ({formatCash(tourney.entryFee)})
                </button>
              </div>

              {/* Prize pool banner */}
              <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-1.5 text-xs font-mono">
                <span className="text-slate-400">1st Place Prize:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400">{formatCash(tourney.cashPrize)}</span>
                  <span className="font-bold text-rose-400">+{formatNumber(tourney.hypePrize)} 🔥</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Match Simulation & Halftime Ad Crisis Modal */}
      {selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-center flex flex-col items-center">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
              {selectedTournament.name}
            </h3>

            {/* Scoreboard */}
            <div className="flex items-center justify-center gap-6 my-6">
              <div className="text-center">
                <div className="text-xs font-bold text-cyan-400 uppercase">Your Org</div>
                <div className="text-4xl font-black text-white font-mono mt-1">{simulatedScore.player}</div>
              </div>
              <div className="text-xl font-black text-slate-600 font-mono">VS</div>
              <div className="text-center">
                <div className="text-xs font-bold text-rose-400 uppercase">Rival Org</div>
                <div className="text-4xl font-black text-white font-mono mt-1">{simulatedScore.opponent}</div>
              </div>
            </div>

            {/* Simulating Animation */}
            {matchState === 'simulating' && (
              <div className="flex flex-col items-center gap-3">
                <Swords className="w-10 h-10 text-cyan-400 animate-spin" />
                <p className="text-xs text-slate-300 font-medium animate-pulse">
                  Match in progress... executing team tactical play!
                </p>
              </div>
            )}

            {/* The Ad Hook: Halftime Crisis Coach Timeout */}
            {matchState === 'halftime_crisis' && (
              <div className="flex flex-col items-center gap-3 w-full animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white uppercase">
                    MATCH POINT CRISIS!
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Your team is feeling tilted! Trigger Coach's Halftime Timeout for +25% aim & tactical counter-pick to clutch Game 3.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-2 mt-2">
                  <button
                    onClick={handleWatchCoachPepTalkAd}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95"
                  >
                    <PlayCircle className="w-4 h-4 fill-slate-950 text-emerald-400" />
                    <span>Watch Coach Pep Talk (+25% Clutch)</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleForfeit}
                    className="w-full py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Accept Defeat
                  </button>
                </div>
              </div>
            )}

            {/* Victory Screen */}
            {matchState === 'victory' && (
              <div className="flex flex-col items-center gap-3 w-full animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                  <Award className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="text-xl font-black text-white uppercase tracking-wide">
                  CHAMPIONS!
                </h4>
                <p className="text-xs text-emerald-400 font-mono font-bold">
                  +{formatCash(selectedTournament.cashPrize)} Cash & +{formatNumber(selectedTournament.hypePrize)} Fans!
                </p>
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase mt-2 shadow-lg transition active:scale-95"
                >
                  Collect Trophy
                </button>
              </div>
            )}

            {/* Defeat Screen */}
            {matchState === 'defeat' && (
              <div className="flex flex-col items-center gap-3 w-full">
                <h4 className="text-lg font-black text-rose-400 uppercase">Eliminated</h4>
                <p className="text-xs text-slate-400">
                  Train your pro players' stats in the Roster tab to increase your rating.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full py-2 rounded-xl bg-slate-800 text-white text-xs font-bold mt-2"
                >
                  Return to Base
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
