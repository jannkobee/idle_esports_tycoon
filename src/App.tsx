import React, { useState } from 'react';
import { useGameLoop } from './core/engine/useGameLoop';
import { HeaderHUD } from './components/layout/HeaderHUD';
import { AdBoostBanner } from './components/ads/AdBoostBanner';
import { ScrimTapArea } from './components/facilities/ScrimTapArea';
import { FacilityList } from './components/facilities/FacilityList';
import { RosterPanel } from './components/roster/RosterPanel';
import { TournamentModal } from './components/tournaments/TournamentModal';
import { SponsorsPanel } from './components/sponsors/SponsorsPanel';
import { BottomNav, TabId } from './components/layout/BottomNav';
import { MockAdModal } from './components/ads/MockAdModal';
import { OfflineRewardModal } from './components/ads/OfflineRewardModal';
import { SponsorDrone } from './components/ads/SponsorDrone';

export const App: React.FC = () => {
  // Start the background tick engine, delta calculation & drone spawns
  useGameLoop();

  const [activeTab, setActiveTab] = useState<TabId>('headquarters');

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 flex justify-center selection:bg-cyan-500 selection:text-slate-950">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative pb-20 bg-slate-950/40 border-x border-slate-900 shadow-2xl overflow-x-hidden">
        
        {/* Top Header HUD (Cash, DPS, Hype, Gems, Trophies) */}
        <HeaderHUD />

        {/* 2X Rewarded Ad Boost Banner */}
        <AdBoostBanner />

        {/* Main Tab Content */}
        <main className="flex-1 flex flex-col">
          {activeTab === 'headquarters' && (
            <div className="flex flex-col animate-in fade-in duration-200">
              <ScrimTapArea />
              <FacilityList />
            </div>
          )}

          {activeTab === 'roster' && (
            <div className="animate-in fade-in duration-200">
              <RosterPanel />
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div className="animate-in fade-in duration-200">
              <TournamentModal />
            </div>
          )}

          {activeTab === 'sponsors' && (
            <div className="animate-in fade-in duration-200">
              <SponsorsPanel />
            </div>
          )}
        </main>

        {/* Floating Sponsor Drone */}
        <SponsorDrone />

        {/* Persistent Bottom Tab Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Interactive Rewarded Ad Simulated Player */}
        <MockAdModal />

        {/* Offline Return Welcome Dialog (3x Ad Multiplier) */}
        <OfflineRewardModal />
      </div>
    </div>
  );
};

export default App;
