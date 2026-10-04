import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { Facility, FacilityId } from '../types/facility.types';
import { ProPlayer } from '../types/player.types';
import { useGameStore } from '../store/useGameStore';
import {
  createHouseSim,
  HouseSimState,
  SimAgent,
  stepHouseSim,
  syncHouseSim,
  takeGains,
} from './simulation';

interface HouseSimulationStore {
  sim: HouseSimState | null;
  agents: SimAgent[];
  selectedPlayerId: string | null;
  setSelectedPlayerId: (id: string | null) => void;
  initialize: (roster: ProPlayer[], facilities: Record<FacilityId, Facility>, districtTier?: number) => void;
  sync: (roster: ProPlayer[], facilities: Record<FacilityId, Facility>, districtTier?: number) => void;
  step: (dt: number, roster: ProPlayer[]) => void;
}

export const useHouseSimulationStore = create<HouseSimulationStore>((set, get) => ({
  sim: null,
  agents: [],
  selectedPlayerId: null,

  setSelectedPlayerId: (id: string | null) => {
    set({ selectedPlayerId: id });
  },

  initialize: (roster: ProPlayer[], facilities: Record<FacilityId, Facility>, districtTier = 1) => {
    const sim = createHouseSim(roster, facilities, 42, districtTier);
    set({
      sim,
      agents: [...sim.agents],
    });
  },

  sync: (roster: ProPlayer[], facilities: Record<FacilityId, Facility>, districtTier = 1) => {
    const { sim } = get();
    if (!sim) {
      get().initialize(roster, facilities, districtTier);
      return;
    }
    syncHouseSim(sim, roster, facilities, districtTier);
    set({ agents: [...sim.agents] });
  },

  step: (dt: number, roster: ProPlayer[]) => {
    const { sim } = get();
    if (!sim) return;
    stepHouseSim(sim, dt, roster);
    // Update agents in store for reactive rendering
    set({ agents: [...sim.agents] });
  },
}));

/**
 * Main simulation runner hook.
 *
 * Runs via requestAnimationFrame (~30-60 fps, paused while document is hidden).
 * Flushes activity gains once per second into useGameStore.applyActivityGains.
 *
 * NOTE: Activities and character training only progress while the game is open in
 * the browser. Offline income remains exclusively handled by facility economy ticks.
 */
export function useHouseSimulationLoop() {
  const roster = useGameStore(s => s.roster);
  const facilities = useGameStore(s => s.facilities);
  const districtTier = useGameStore(s => s.empire.districtTier);
  const applyActivityGains = useGameStore(s => s.applyActivityGains);

  const initialize = useHouseSimulationStore(s => s.initialize);
  const sync = useHouseSimulationStore(s => s.sync);
  const step = useHouseSimulationStore(s => s.step);

  const lastTimeRef = useRef<number>(0);
  const gainAccumulatorRef = useRef<number>(0);
  const initializedRef = useRef<boolean>(false);

  // Initialize once
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      initialize(roster, facilities, districtTier);
    }
  }, [initialize, roster, facilities, districtTier]);

  // Sync when roster or facilities change
  useEffect(() => {
    if (initializedRef.current) {
      sync(roster, facilities, districtTier);
    }
  }, [roster, facilities, districtTier, sync]);

  // requestAnimationFrame runner loop
  useEffect(() => {
    let animId: number;

    const frame = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const elapsedMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Throttle if tab hidden or excessive delta
      if (!document.hidden && elapsedMs > 0) {
        const dt = Math.min(elapsedMs / 1000, 0.1); // clamp to 100ms max

        step(dt, roster);

        gainAccumulatorRef.current += dt;
        if (gainAccumulatorRef.current >= 1.0) {
          const sim = useHouseSimulationStore.getState().sim;
          if (sim) {
            const gains = takeGains(sim);
            applyActivityGains(gains);
          }
          gainAccumulatorRef.current = 0;
        }
      }

      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [step, roster, applyActivityGains]);
}
