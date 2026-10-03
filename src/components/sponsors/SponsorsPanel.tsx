import React from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { Gift, PlayCircle, CheckCircle2, Sparkles } from 'lucide-react';

export const SponsorsPanel: React.FC = () => {
  const { dailyAdsWatched, requestAd } = useGameStore();

  const handleWatchAdForStreak = () => {
    requestAd('boost_2x_income');
  };

  const STREAK_MILESTONES = [
    {
      target: 1,
      name: 'Tier 1 Sponsor Bag',
      reward: '+5 Energy Cans',
      unlocked: dailyAdsWatched >= 1,
    },
    {
      target: 3,
      name: 'Tier 2 Sponsor Deal',
      reward: '+$5,000 Cash + 2h Boost',
      unlocked: dailyAdsWatched >= 3,
    },
    {
      target: 5,
      name: 'Championship Crate',
      reward: '+$50,000 Cash',
      unlocked: dailyAdsWatched >= 5,
    },
  ];

  return (
    <div className="w-full px-4 py-2 flex flex-col gap-4">
      {/* Daily Ad Sponsor Pass */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
              <Gift className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">DAILY TITLE SPONSOR PASS</h3>
              <p className="text-xs text-slate-400">Watch sponsor clips to unlock tier rewards ({dailyAdsWatched}/5)</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 my-1">
          <div
            className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (dailyAdsWatched / 5) * 100)}%` }}
          ></div>
        </div>

        {/* Milestones list */}
        <div className="flex flex-col gap-2">
          {STREAK_MILESTONES.map(item => (
            <div
              key={item.target}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                item.unlocked
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.unlocked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center font-bold text-slate-400">
                    {item.target}
                  </span>
                )}
                <div>
                  <div className="font-bold text-slate-200">{item.name}</div>
                  <div className="text-[10px] text-amber-400">{item.reward}</div>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                item.unlocked ? 'bg-emerald-400/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {item.unlocked ? 'CLAIMED' : `${dailyAdsWatched}/${item.target}`}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleWatchAdForStreak}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 active:scale-95 mt-1"
        >
          <PlayCircle className="w-4 h-4 fill-slate-950 text-amber-400" />
          <span>Watch Sponsor Clip for Streak (+2h Boost)</span>
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Commercial Brand Partners */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Active Brand Partners
        </h4>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-xs font-mono">
              APEX
            </div>
            <div>
              <div className="text-xs font-bold text-white">Apex Titan Hardware</div>
              <div className="text-[11px] text-slate-400">Official Monitor & GPU Partner</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">Mock Ad Partner</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs font-mono">
              VOLT
            </div>
            <div>
              <div className="text-xs font-bold text-white">Hyper-Volt Energy</div>
              <div className="text-[11px] text-slate-400">Official Beverage Sponsor</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">2X Ad Boost Partner</span>
        </div>
      </div>
    </div>
  );
};
