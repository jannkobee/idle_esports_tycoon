import React, { useState } from 'react';
import { useGameLoop } from './core/engine/useGameLoop';
import { useHouseSimulationLoop } from './core/house/useHouseSimulation';
import { HeaderHUD } from './components/layout/HeaderHUD';
import { AdBoostBanner } from './components/ads/AdBoostBanner';
import { GamingHouse } from './components/facilities/GamingHouse';
import { RosterPanel } from './components/roster/RosterPanel';
import { TournamentModal } from './components/tournaments/TournamentModal';
import { SponsorsPanel } from './components/sponsors/SponsorsPanel';
import { MockAdModal } from './components/ads/MockAdModal';
import { OfflineRewardModal } from './components/ads/OfflineRewardModal';
import { SponsorDrone } from './components/ads/SponsorDrone';
import { X, Users, Trophy, Briefcase, UserPlus } from 'lucide-react';

export type SecondaryOverlay = 'roster' | 'tournaments' | 'sponsors' | 'recruit' | null;

export const App: React.FC = () => {
  // Start the background tick engine, delta calculation & drone spawns
  useGameLoop();
  // Start the living gaming house simulation loop (~30 fps requestAnimationFrame)
  useHouseSimulationLoop();

  const [activeOverlay, setActiveOverlay] = useState<SecondaryOverlay>(null);

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex justify-center selection:bg-cyan-500 selection:text-slate-950">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-slate-950 border-x border-slate-900 shadow-2xl overflow-hidden">
        {/* Top Header HUD (Cash, DPS, Hype, Gems, Trophies) */}
        <HeaderHUD />

        {/* 2X Rewarded Ad Boost Banner */}
        <AdBoostBanner />

        {/* 3D Living Gaming House Headquarters (Main Full-Screen Focal Point) */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <GamingHouse
            onOpenRoster={() => setActiveOverlay('roster')}
            onOpenTournaments={() => setActiveOverlay('tournaments')}
            onOpenSponsors={() => setActiveOverlay('sponsors')}
            onOpenRecruit={() => setActiveOverlay('recruit')}
          />
        </main>

        {/* Floating Sponsor Drone */}
        <SponsorDrone />

        {/* SECONDARY SCREEN MODAL OVERLAY (Roster, Tournaments, Sponsors, Recruit) */}
        {activeOverlay && (
          <div
            className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setActiveOverlay(null)}
          >
            <div
              className="w-full max-w-md mx-auto h-[90vh] bg-slate-900/95 border-t border-slate-700/80 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Drag Handle & Header */}
              <div className="w-full pt-2.5 pb-1 flex justify-center">
                <div className="w-10 h-1 bg-slate-700 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 border border-slate-700 text-cyan-400">
                    {activeOverlay === 'roster' && <Users size={18} />}
                    {activeOverlay === 'recruit' && <UserPlus size={18} className="text-indigo-400" />}
                    {activeOverlay === 'tournaments' && <Trophy size={18} className="text-amber-400" />}
                    {activeOverlay === 'sponsors' && <Briefcase size={18} className="text-emerald-400" />}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white uppercase tracking-tight">
                      {activeOverlay === 'roster' && 'Team Roster & Training'}
                      {activeOverlay === 'recruit' && 'Scout New Talent'}
                      {activeOverlay === 'tournaments' && 'Competitive Tournaments'}
                      {activeOverlay === 'sponsors' && 'Organization Sponsors'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {activeOverlay === 'roster' && 'Manage starting five, roles and player discipline stats'}
                      {activeOverlay === 'recruit' && 'Scout high-potential pro prospects with cash or VIP ads'}
                      {activeOverlay === 'tournaments' && 'Compete for championship trophies, cash, and hype'}
                      {activeOverlay === 'sponsors' && 'Unlock daily streak deals and brand partnerships'}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setActiveOverlay(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Panel Content */}
              <div className="flex-1 overflow-y-auto pb-6">
                {(activeOverlay === 'roster' || activeOverlay === 'recruit') && <RosterPanel />}
                {activeOverlay === 'tournaments' && <TournamentModal />}
                {activeOverlay === 'sponsors' && <SponsorsPanel />}
              </div>
            </div>
          </div>
        )}

        {/* Interactive Rewarded Ad Simulated Player */}
        <MockAdModal />

        {/* Offline Return Welcome Dialog (3x Ad Multiplier) */}
        <OfflineRewardModal />
      </div>
    </div>
  );
};

export default App;
