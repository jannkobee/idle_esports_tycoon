import { afterEach, describe, expect, it } from 'vitest';
import { useHouseSimulationStore } from './useHouseSimulation';
import { useGameStore } from '../store/useGameStore';
import { findAStarPath, type NavGrid } from './navigation';

afterEach(() => useHouseSimulationStore.setState({ paused: false, sim: null, agents: [] }));

describe('HQ controls and blocked routes', () => {
  it('pauses the simulation clock, then resumes without a catch-up jump', () => {
    const { roster, facilities } = useGameStore.getState();
    const store = useHouseSimulationStore.getState();
    store.initialize(roster, facilities);
    store.setPaused(true);
    const before = useHouseSimulationStore.getState().sim!.simTime;
    store.step(1, roster);
    expect(useHouseSimulationStore.getState().sim!.simTime).toBe(before);
    store.setPaused(false);
    store.step(0.05, roster);
    expect(useHouseSimulationStore.getState().sim!.simTime).toBeCloseTo(before + 0.05);
  });
  it('does not return a straight path through a completely blocked grid', () => {
    const grid = {
      key: 'blocked-test', findNearestWalkable: (point: { x: number; y: number }) => point,
      isGridWalkable: () => false,
    } as unknown as NavGrid;
    expect(findAStarPath(grid, { x: 1, y: 1 }, { x: 5, y: 5 })).toEqual([]);
  });
});
