import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useGameStore } from '../../core/store/useGameStore';
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
}

const ACTIVITY_LABELS: Record<string, { label: string; icon: typeof Crosshair; color: string }> = {
  practice: { label: 'Scouting & Practice', icon: Crosshair, color: 'text-cyan-400' },
  stream: { label: 'Live Streaming', icon: Radio, color: 'text-purple-400' },
  exercise: { label: 'Gym Fitness & Tilt Control', icon: Dumbbell, color: 'text-amber-400' },
  review: { label: 'Tactical VOD Review', icon: BookOpen, color: 'text-sky-400' },
  break: { label: 'Break & Team Bonding', icon: Coffee, color: 'text-emerald-400' },
};

export const GamingHouse: React.FC<GamingHouseProps> = ({
  onOpenRoster,
  onOpenTournaments,
  onOpenSponsors,
  onOpenRecruit,
}) => {
  const {
    facilities,
    roster,
    cash,
    hype,
    boostExpiresAt,
    upgradeFacility,
    unlockFacility,
  } = useGameStore();

  const agents = useHouseSimulationStore((s) => s.agents);
  const selectedPlayerId = useHouseSimulationStore((s) => s.selectedPlayerId);
  const setSelectedPlayerId = useHouseSimulationStore((s) => s.setSelectedPlayerId);

  const [roomId, setRoomId] = useState<FacilityId>('scrim_lab');
  const [showRoomDrawer, setShowRoomDrawer] = useState(false);
  const [zoomStep, setZoomStep] = useState(0);
  const [resetView, setResetView] = useState(0);
  const [paused, setPaused] = useState(false);
  const [notice, setNotice] = useState('');

  const facility = facilities[roomId];
  const roomMeta = HOUSE_ROOMS.find((r) => r.id === roomId)!;
  const activeRoster = roster.filter((p) => p.role !== 'inactive');
  const selectedPlayer = roster.find((p) => p.id === selectedPlayerId);
  const selectedAgent = agents.find((a) => a.id === selectedPlayerId);

  const cost = facility.isUnlocked
    ? FormulaService.calculateUpgradeCost(facility.baseCost, facility.level, facility.costMultiplier)
    : facility.unlockCost;

  const affordable = cash >= cost && (facility.isUnlocked || hype >= facility.requiredHype);

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

  const selectRoom = (id: FacilityId) => {
    setRoomId(id);
    setSelectedPlayerId(null);
  };

  const handleUpgradeOrUnlock = () => {
    const success = facility.isUnlocked
      ? upgradeFacility(roomId)
      : unlockFacility(roomId);
    if (success) {
      setNotice(
        facility.isUnlocked
          ? `🎉 ${facility.name} upgraded to Level ${facility.level + 1}!`
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
    <div className="relative w-full h-[calc(100vh-8.5rem)] min-h-[580px] flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* 3D React Three Fiber Headquarters Scene (Main Focal Point) */}
      <div className="absolute inset-0 z-0">
        <HouseCanvas3D
          facilities={facilities}
          roomId={roomId}
          agents={agents}
          players={activeRoster}
          selectedPlayerId={selectedPlayerId}
          paused={paused}
          zoomStep={zoomStep}
          resetView={resetView}
          onSelectRoom={selectRoom}
          onSelectPlayer={(id) => {
            setSelectedPlayerId(id);
          }}
        />
      </div>

      {/* FLOATING TOP-BAR HUD (Status Caption & Camera Controls) */}
      <div className="relative z-10 w-full px-3 pt-2.5 flex items-start justify-between pointer-events-none">
        {/* Organization HQ Status Badge */}
        <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl px-3 py-1.5 shadow-xl flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-slate-200 uppercase">
              DYNASTY HQ
            </span>
          </div>
          <div className="text-[9px] font-medium text-slate-400">
            {unlockedRoomsCount}/5 Rooms Open · {activeRoster.length} Pros Active
          </div>
        </div>

        {/* Camera & Simulation Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-1 shadow-xl">
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
          <button
            onClick={() => setPaused((p) => !p)}
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
              const isSelected = roomId === r.id && !selectedPlayer;
              return (
                <button
                  key={r.id}
                  onClick={() => selectRoom(r.id)}
                  className={`flex-1 min-w-[80px] py-1.5 px-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 whitespace-nowrap border transition-all ${
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
        ) : (
          /* 2. SELECTED ROOM INSPECTOR CARD */
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
                    ? `${roomPros.length} Pros inside · Automatic revenue generation`
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

            {/* Upgrade & Unlock Action Row */}
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                {!facility.isUnlocked ? (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Flame size={12} /> {hype} / {facility.requiredHype} Hype
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Next Level: <strong>+{formatCash(facility.baseIncomePerSec)}/s</strong> revenue
                  </span>
                )}
              </div>

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
