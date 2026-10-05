import React, { useEffect, useState } from 'react';
import { getEquipmentModel, getEquipmentTier, nextEquipmentTier } from '../../core/facilities/equipmentProgression';
import {
  ArrowUp,
  Flame,
  LockKeyhole,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Users,
  X,
  Trophy,
  Briefcase,
  UserPlus,
  Home,
  Crosshair,
  Radio,
  Dumbbell,
  BookOpen,
  Coffee,
  Zap,
  Palette,
  Tv,
  Check,
  Building2,
  Layers,
} from 'lucide-react';
import { useGameStore, WallpaperStyle } from '../../core/store/useGameStore';
import { useHouseSimulationStore } from '../../core/house/useHouseSimulation';
import { HOUSE_ROOMS } from '../../core/engine/HouseLayout';
import { FormulaService } from '../../core/engine/FormulaService';
import { FacilityId } from '../../core/types/facility.types';
import { PlayerPortrait } from '../roster/PlayerPortrait';
import { HouseCanvas3D } from './3d/HouseCanvas3D';
import { formatCash } from '../../utils/formatCurrency';

interface GamingHouseProps {
  onOpenRoster: () => void;
  onOpenTournaments: () => void;
  onOpenSponsors: () => void;
  onOpenRecruit: () => void;
  onOpenEmpire: () => void;
}

const ACTIVITY_LABELS: Record<string, { label: string; icon: typeof Crosshair; color: string }> = {
  practice: { label: 'Scouting & Practice', icon: Crosshair, color: 'text-cyan-400' },
  stream: { label: 'Live Streaming', icon: Radio, color: 'text-purple-400' },
  exercise: { label: 'Gym Fitness & Tilt Control', icon: Dumbbell, color: 'text-amber-400' },
  review: { label: 'Tactical VOD Review', icon: BookOpen, color: 'text-sky-400' },
  break: { label: 'Break & Team Bonding', icon: Coffee, color: 'text-emerald-400' },
};

const WALLPAPERS: { id: WallpaperStyle; label: string; desc: string }[] = [
  { id: 'default', label: 'Pro Modern', desc: 'Ash wood & clean slate' },
  { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon cyan & purple' },
  { id: 'carbon', label: 'Carbon Stealth', desc: 'Dark carbon & cobalt' },
  { id: 'minimalist', label: 'Scandinavian', desc: 'Warm cream & honey' },
];

export const GamingHouse: React.FC<GamingHouseProps> = ({
  onOpenRoster,
  onOpenTournaments,
  onOpenSponsors,
  onOpenRecruit,
  onOpenEmpire,
}) => {
  const {
    facilities,
    roomFunding,
    roster,
    cash,
    hype,
    boostExpiresAt,
    upgradeFacility,
    unlockFacility,
    fundFacilityWithAd,
    requestAd,
    empire,
    houseInterior,
    setWallpaperStyle,
    upgradeLoungeTv,
    claimHqPulse,
    lastHqPulseAt,
    hqPulseStreak,
  } = useGameStore();

  const agents = useHouseSimulationStore((s) => s.agents);
  const selectedPlayerId = useHouseSimulationStore((s) => s.selectedPlayerId);
  const setSelectedPlayerId = useHouseSimulationStore((s) => s.setSelectedPlayerId);

  const [roomId, setRoomId] = useState<FacilityId>('scrim_lab');
  const [inspectorMode, setInspectorMode] = useState<'room' | 'decor'>('room');
  const [showRoomDrawer, setShowRoomDrawer] = useState(false);
  const [zoomStep, setZoomStep] = useState(0);
  const [resetView, setResetView] = useState(0);
  const [showRoof, setShowRoof] = useState(false);
  const [activeFloor, setActiveFloor] = useState<1 | 2>(1);
  const paused = useHouseSimulationStore(s => s.paused);
  const setPaused = useHouseSimulationStore(s => s.setPaused);
  const [notice, setNotice] = useState('');
  const [clock, setClock] = useState(() => Date.now());

  const facility = facilities[roomId];
  const equipment = getEquipmentTier(facility.level);
  const nextEquipment = nextEquipmentTier(facility.level);
  const roomMeta = HOUSE_ROOMS.find((r) => r.id === roomId)!;
  const activeRoster = roster.filter((p) => p.role !== 'inactive');
  const selectedPlayer = roster.find((p) => p.id === selectedPlayerId);
  const selectedAgent = agents.find((a) => a.id === selectedPlayerId);
  const houseCapacity = (facilities.scrim_lab?.level ?? 0) >= 6 ? 18 : 8;
  const pulseReady = clock - lastHqPulseAt >= 90_000;
  const pulseSeconds = Math.max(0, Math.ceil((90_000 - (clock - lastHqPulseAt)) / 1000));

  const cost = facility.isUnlocked
    ? FormulaService.calculateUpgradeCost(facility.baseCost, facility.level, facility.costMultiplier)
    : Math.max(0, facility.unlockCost - (roomFunding[roomId] ?? 0));

  const affordable = cash >= cost && (facility.isUnlocked || hype >= facility.requiredHype || cost === 0);

  const income =
    FormulaService.calculateFacilityIncome(facility) *
    (1 + hype * 0.001) *
    (Date.now() < boostExpiresAt ? 2 : 1);

  // Clear notice after 3.5s
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectRoom = (id: FacilityId) => {
    setRoomId(id);
    setInspectorMode('room');
    setSelectedPlayerId(null);
  };

  const handleUpgradeOrUnlock = () => {
    const success = facility.isUnlocked
      ? upgradeFacility(roomId)
      : unlockFacility(roomId);
    if (success) {
      setNotice(
        facility.isUnlocked
          ? `🎉 ${facility.name} upgraded to Level ${facility.level + 1}!${getEquipmentTier(facility.level + 1).level !== equipment.level ? ` New model: ${getEquipmentModel(roomId, facility.level + 1)}` : ''}`
          : `🚀 ${facility.name} is now open for business!`
      );
    }
  };

  const unlockedRoomsCount = Object.values(facilities).filter((f) => f.isUnlocked).length;
  const roomPros = agents.filter((a) => {
    const r = HOUSE_ROOMS.find((rm) => rm.id === roomId);
    if (!r) return false;
    return a.x >= r.x && a.x <= r.x + r.w && a.y >= r.y && a.y <= r.y + r.d;
  });

  return (
    <div className="relative w-full h-[calc(100dvh-10rem)] min-h-[640px] flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* 3D React Three Fiber Headquarters Scene (Main Focal Point) */}
      <div className="absolute inset-x-0 top-[156px] bottom-[180px] z-0">
        <HouseCanvas3D
          facilities={facilities}
          roomId={roomId}
          agents={agents}
          players={activeRoster}
          selectedPlayerId={selectedPlayerId}
          paused={paused}
          zoomStep={zoomStep}
          resetView={resetView}
          showRoof={showRoof}
          onSelectRoom={selectRoom}
          onSelectPlayer={(id) => {
            setSelectedPlayerId(id);
          }}
          empire={empire}
          activeFloor={activeFloor}
        />
      </div>

      {/* FLOATING TOP-BAR HUD (Status Caption & Camera Controls) */}
      <div className="relative z-10 w-full px-3 pt-2.5 grid grid-cols-2 gap-2 pointer-events-none">
        {/* Organization HQ Status Badge */}
        <div className="col-span-2 pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl px-3 py-1.5 shadow-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-slate-200 uppercase">
              DYNASTY HQ
            </span>
          </div>
          <div className="text-[9px] font-medium text-slate-400">
            {unlockedRoomsCount}/{Object.keys(facilities).length} Rooms Open · {activeRoster.length}/{houseCapacity} HQ Pros
          </div>
          <button
            onClick={() => { const reward = claimHqPulse(); if (reward) setNotice(`HQ Pulse claimed: ${formatCash(reward)} + Energy Can${(hqPulseStreak + 1) % 5 === 0 ? 's ×3' : ''}`); }}
            disabled={!pulseReady}
            className={`mt-1 rounded-lg px-2 py-1 text-[9px] font-black transition-all ${pulseReady ? 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25 animate-pulse' : 'bg-slate-800 text-slate-500'}`}
          >
            {pulseReady ? 'CLAIM HQ PULSE' : `NEXT HQ PULSE · ${pulseSeconds}s`}
          </button>
        </div>

        {/* Floor Switcher: 1F Ground vs 2F Upper Dorms & Comfort Rooms */}
        <div className="pointer-events-auto flex items-center bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-1 shadow-2xl">
          <button
            onClick={() => setActiveFloor(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wide transition-all ${
              activeFloor === 1
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
            title="Switch to 1F Ground Training Floor"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1F</span>
          </button>
          <button
            onClick={() => {
              setActiveFloor(2);
              setShowRoof(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wide transition-all ${
              activeFloor === 2
                ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
            title="Switch to 2F Penthouse Dorms, Comfort Rooms & Balcony"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2F</span>
          </button>
        </div>

        {/* Camera & Simulation Controls */}
        <div className="pointer-events-auto flex items-center justify-between gap-0.5 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-1 shadow-xl">
          <button
            onClick={() => setZoomStep((z) => z + 1)}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <Plus size={15} />
          </button>
          <button
            onClick={() => setZoomStep((z) => z - 1)}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <Minus size={15} />
          </button>
          <button
            onClick={() => setResetView((v) => v + 1)}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
            title="Reset House Camera"
            aria-label="Reset Camera"
          >
            <RotateCcw size={13} />
          </button>
          <button onClick={() => setShowRoof(value => !value)} className={`w-7 h-7 rounded-xl flex items-center justify-center active:scale-95 transition-all ${showRoof ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`} title={showRoof ? 'Hide Roof' : 'Show Roof'} aria-label={showRoof ? 'Hide Roof' : 'Show Roof'}>
            <Layers size={14} />
          </button>
          <button
            onClick={() => setPaused(!paused)}
            className={`w-7 h-7 rounded-xl flex items-center justify-center active:scale-95 transition-all ${
              paused
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={paused ? 'Resume Simulation' : 'Pause Simulation'}
            aria-label={paused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        </div>
      </div>

      {/* FLOATING ACTION DOCK (Roster, Tournaments, Sponsors, Recruit, Rooms) */}
      <div className="relative z-10 w-full px-3 mt-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-1.5 shadow-2xl overflow-x-auto scrollbar-none">
          {/* Roster Button */}
          <button
            onClick={onOpenRoster}
            className="flex-1 min-w-[62px] flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-700/60 text-slate-200 transition-all"
          >
            <Users size={15} className="text-cyan-400" />
            <span className="text-[10px] font-black tracking-tight">Roster</span>
            <span className="text-[8px] text-slate-400 font-bold">{activeRoster.length} Pros</span>
          </button>

          {/* Tournaments Button */}
          <button
            onClick={onOpenTournaments}
            className="flex-1 min-w-[62px] flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-700/60 text-slate-200 transition-all"
          >
            <Trophy size={15} className="text-amber-400" />
            <span className="text-[10px] font-black tracking-tight">Tourneys</span>
            <span className="text-[8px] text-amber-400/90 font-bold">Prize LAN</span>
          </button>

          {/* Sponsors Button */}
          <button
            onClick={onOpenSponsors}
            className="flex-1 min-w-[62px] flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-700/60 text-slate-200 transition-all"
          >
            <Briefcase size={15} className="text-emerald-400" />
            <span className="text-[10px] font-black tracking-tight">Sponsors</span>
            <span className="text-[8px] text-emerald-400/90 font-bold">Pass Deals</span>
          </button>

          {/* Scout / Recruit Button */}
          <button
            onClick={onOpenRecruit}
            className="flex-1 min-w-[62px] flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl bg-gradient-to-b from-indigo-900/80 to-slate-900 hover:from-indigo-800 active:scale-95 border border-indigo-500/50 text-indigo-200 transition-all"
          >
            <UserPlus size={15} className="text-indigo-400" />
            <span className="text-[10px] font-black tracking-tight">Recruit</span>
            <span className="text-[8px] text-indigo-300 font-bold">Scout VIP</span>
          </button>

          {/* Room Manager Drawer Button */}
          <button
            onClick={() => setShowRoomDrawer((v) => !v)}
            className={`flex-1 min-w-[62px] flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl active:scale-95 border transition-all ${
              showRoomDrawer
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/60 text-slate-200'
            }`}
          >
            <Home size={15} className={showRoomDrawer ? 'text-slate-950' : 'text-amber-400'} />
            <span className="text-[10px] font-black tracking-tight">Rooms</span>
            <span className={`text-[8px] font-bold ${showRoomDrawer ? 'text-slate-950' : 'text-slate-400'}`}>
              5 Areas
            </span>
          </button>
          <button
            onClick={onOpenEmpire}
            className="flex-1 min-w-[62px] flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 active:scale-95 border border-cyan-700/60 text-cyan-100 transition-all"
          >
            <Building2 size={15} className="text-cyan-300" />
            <span className="text-[10px] font-black tracking-tight">Empire</span>
            <span className="text-[8px] text-cyan-300 font-bold">Living World</span>
          </button>
        </div>
      </div>

      {/* Floating System Notice Pill (when upgraded or action occurs) */}
      {notice && (
        <div className="relative z-10 w-full px-4 mt-2 flex justify-center pointer-events-none">
          <div className="bg-slate-900/95 border border-cyan-500/60 text-cyan-300 text-xs font-bold px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
            {notice}
          </div>
        </div>
      )}

      {/* Spacer to push inspectors to the bottom */}
      <div className="flex-1" />

      {/* BOTTOM DRAWER / INSPECTOR LAYER */}
      <div className="relative z-20 w-full px-3 pb-2 flex flex-col gap-2">
        {/* Quick Room Switching Pill Bar (shown when Rooms drawer is toggled or when inspecting room) */}
        {showRoomDrawer && (
          <div className="w-full flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-1.5 shadow-xl animate-in slide-in-from-bottom-2 duration-150">
            {HOUSE_ROOMS.map((r) => {
              const fac = facilities[r.id];
              const isSelected = inspectorMode === 'room' && roomId === r.id && !selectedPlayer;
              return (
                <button
                  key={r.id}
                  onClick={() => selectRoom(r.id)}
                  className={`flex-1 min-w-[76px] py-1.5 px-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 whitespace-nowrap border transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {!fac.isUnlocked && <LockKeyhole size={11} />}
                  <span>{r.label.replace(' ROOM', '').replace(' STUDIO', '').replace('TEAM ', '')}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                setInspectorMode('decor');
                setSelectedPlayerId(null);
              }}
              className={`flex-1 min-w-[84px] py-1.5 px-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 whitespace-nowrap border transition-all ${
                inspectorMode === 'decor' && !selectedPlayer
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md'
                  : 'bg-slate-900/80 text-cyan-300 border-cyan-800/60 hover:bg-slate-800'
              }`}
            >
              <Palette size={11} />
              <span>Decor & TV</span>
            </button>
          </div>
        )}

        {/* 1. SELECTED PLAYER INSPECTOR CARD */}
        {selectedPlayer && selectedAgent ? (
          <div className="w-full bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                  <PlayerPortrait player={selectedPlayer} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {selectedPlayer.rarity}
                    </span>
                    <h3 className="text-sm font-black text-white">{selectedPlayer.handle}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400">{selectedPlayer.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayerId(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                aria-label="Close player inspection"
              >
                <X size={16} />
              </button>
            </div>

            {/* Current Real-Time Activity & Energy Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-slate-300 font-bold">
                  {React.createElement(
                    ACTIVITY_LABELS[selectedAgent.activity]?.icon ?? Crosshair,
                    { size: 13, className: ACTIVITY_LABELS[selectedAgent.activity]?.color }
                  )}
                  <span>{ACTIVITY_LABELS[selectedAgent.activity]?.label}</span>
                </div>
                <div className="flex items-center gap-1 font-extrabold text-amber-400">
                  <Zap size={11} />
                  <span>{Math.round(selectedAgent.energy)}% Energy</span>
                </div>
              </div>

              {/* Energy progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${selectedAgent.energy}%` }}
                />
              </div>

              {/* Live Stat Gain Explanation */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5 border-t border-slate-800/80">
                <span>
                  Aim: <strong className="text-slate-200">{selectedPlayer.stats.aim}</strong> · Macro:{' '}
                  <strong className="text-slate-200">{selectedPlayer.stats.macro}</strong> · Comms:{' '}
                  <strong className="text-slate-200">{selectedPlayer.stats.comms}</strong>
                </span>
                <span className="text-cyan-400 font-semibold">
                  {selectedAgent.mode === 'working' ? '🟢 Training active' : '🚶 Heading to station'}
                </span>
              </div>
            </div>
          </div>
        ) : inspectorMode === 'decor' ? (
          /* 2. HQ DECOR & LOUNGE TV INSPECTOR CARD */
          <div className="w-full bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-black text-white">Interior Decor & Entertainment</h3>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Customize wall designs & upgrade the Team Lounge TV to boost player mood & sleep
                </p>
              </div>
              <button
                onClick={() => setInspectorMode('room')}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                aria-label="Back to room inspector"
              >
                <X size={15} />
              </button>
            </div>

            {/* Section 1: Wallpaper Aesthetic Theme */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800/80">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                Wall Aesthetic Theme
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {WALLPAPERS.map((wp) => {
                  const isActive = houseInterior.wallpaperStyle === wp.id;
                  const isOwned = wp.id === 'default' || empire.vipInventory.includes(`wall_${wp.id}` as const);
                  return (
                    <button
                      key={wp.id}
                      onClick={() => isOwned ? setWallpaperStyle(wp.id) : onOpenEmpire()}
                      className={`p-2 rounded-xl border text-left flex flex-col gap-0.5 transition-all active:scale-95 ${
                        isActive
                          ? 'bg-slate-800/90 border-cyan-400 ring-1 ring-cyan-400/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-white">{wp.label}</span>
                        {isActive && <Check size={11} className="text-cyan-400" />}
                      </div>
                      <span className="text-[8px] text-slate-400 leading-tight">{isOwned ? wp.desc : 'Locked · open Cosmetic Store'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Upgradable Team Lounge TV */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-white">
                        {houseInterior.loungeTvLevel === 3
                          ? '100" Stadium Jumbotron & Trophy Shelf'
                          : houseInterior.loungeTvLevel === 2
                          ? '75" Dual-Screen Esports Lounge'
                          : '55" OLED Tactical Review Screen'}
                      </span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        TV LVL {houseInterior.loungeTvLevel}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 block">
                      {houseInterior.loungeTvLevel === 3
                        ? 'Max tier: +30 Team Mood · +20 Sleep Recovery'
                        : houseInterior.loungeTvLevel === 2
                        ? 'Tier 2: +15 Team Mood · +10 Sleep Recovery'
                        : 'Base screen: Upgrading restores team morale'}
                    </span>
                  </div>
                </div>

                {houseInterior.loungeTvLevel < 3 ? (
                  <button
                    onClick={() => {
                      const ok = upgradeLoungeTv();
                      if (ok) {
                        setNotice(
                          `📺 Lounge TV upgraded to Level ${houseInterior.loungeTvLevel + 1}! Roster mood boosted!`
                        );
                      }
                    }}
                    disabled={cash < (houseInterior.loungeTvLevel === 1 ? 3500 : 12000)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0 ${
                      cash >= (houseInterior.loungeTvLevel === 1 ? 3500 : 12000)
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp size={12} />
                    <span>Upgrade</span>
                    <strong>{formatCash(houseInterior.loungeTvLevel === 1 ? 3500 : 12000)}</strong>
                  </button>
                ) : (
                  <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg">
                    MAX LEVEL
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* 3. SELECTED ROOM INSPECTOR CARD */
          <div className="w-full bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: roomMeta.accent }}
                  />
                  <h3 className="text-sm font-black text-white">{facility.name}</h3>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {facility.isUnlocked ? `LVL ${facility.level}` : 'LOCKED'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {facility.isUnlocked
                    ? `${roomPros.length} Pros inside · Automatic revenue generation${roomId === 'scrim_lab' ? ` · ${facility.level >= 6 ? 'Arena wing open: 18 rig capacity' : 'Arena wing unlocks at Level 6'}` : ''}`
                    : `Requires ${facility.requiredHype} Organization Hype to open`}
                </p>
              </div>

              {/* Automated Income */}
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-bold block">INCOME</span>
                <span className="text-sm font-black text-emerald-400">
                  {facility.isUnlocked ? `${formatCash(income)}/s` : '$0/s'}
                </span>
              </div>
            </div>

            {facility.isUnlocked && <div className="text-[10px] leading-tight" data-testid="equipment-tier">
              <p className="font-bold" style={{ color: equipment.color }}>{equipment.name} · {getEquipmentModel(roomId, facility.level)}</p>
              <p className="mt-1 text-slate-400">{nextEquipment ? `Next model at Lv ${nextEquipment.level}: ${getEquipmentModel(roomId, nextEquipment.level)}` : 'Maximum visual tier · Income upgrades continue'}</p>
            </div>}

            {/* Upgrade & Unlock Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                {!facility.isUnlocked ? (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Flame size={12} /> {Math.floor(hype).toLocaleString()} / {facility.requiredHype.toLocaleString()} Hype
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Next Level: <strong>+{formatCash(facility.baseIncomePerSec)}/s</strong> revenue
                  </span>
                )}
              </div>

              {!facility.isUnlocked && <button onClick={() => requestAd('room_funding', completed => { if (completed) fundFacilityWithAd(roomId); })} className="rounded-xl border border-amber-500/50 bg-amber-500/15 px-2 py-2 text-[10px] font-black text-amber-200">Watch Ad · Fund {Math.min(100, Math.floor((roomFunding[roomId] ?? 0) / facility.unlockCost * 100))}%</button>}
              <button
                onClick={handleUpgradeOrUnlock}
                disabled={!affordable}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-all ${
                  affordable
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <ArrowUp size={13} />
                <span>{facility.isUnlocked ? 'Upgrade' : 'Unlock Room'}</span>
                <strong className="ml-1">{formatCash(cost)}</strong>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
