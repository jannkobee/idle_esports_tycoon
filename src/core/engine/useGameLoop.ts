import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

export function useGameLoop() {
  const tick = useGameStore(state => state.tick);
  const checkOfflineCatchup = useGameStore(state => state.checkOfflineCatchup);
  const spawnDrone = useGameStore(state => state.spawnDrone);
  const activeDrone = useGameStore(state => state.activeDrone);

  const initialCheckRef = useRef(false);

  // Check offline progress on mount
  useEffect(() => {
    if (!initialCheckRef.current) {
      initialCheckRef.current = true;
      checkOfflineCatchup();
    }
  }, [checkOfflineCatchup]);

  // Main 1-second game tick
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) tick(Date.now());
    }, 1000);
    const onVisibilityChange = () => {
      if (document.hidden) tick(Date.now());
      else checkOfflineCatchup();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [tick, checkOfflineCatchup]);

  // Periodic Sponsor Drone spawner (every 120s if no drone currently active)
  useEffect(() => {
    const droneInterval = setInterval(() => {
      if (!activeDrone) {
        spawnDrone();
      }
    }, 90000); // 90 seconds for fun pacing

    return () => clearInterval(droneInterval);
  }, [spawnDrone, activeDrone]);
}
