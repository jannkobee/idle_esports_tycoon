export const HOUSE_CAMERA_LIMITS = { minDistance: 5, maxDistance: 115 } as const;

// Frame all HQ plots at Reset; upgrades never move the player's camera.
export function houseCameraView(aspect: number, floor: 1 | 2) {
  const target: [number, number, number] = floor === 2 ? [7, 3.2, 7] : [9.9, 0, 6.8];
  const halfWidth = floor === 2 ? 13 : 18;
  const halfDepth = floor === 2 ? 11 : 13;
  const safeAspect = Math.max(0.35, Number.isFinite(aspect) ? aspect : 1);
  const tangent = Math.tan(42 * Math.PI / 360);
  const distance = Math.min(HOUSE_CAMERA_LIMITS.maxDistance, Math.max(halfDepth / tangent, halfWidth / (tangent * safeAspect)) + 12);
  const length = Math.hypot(0.35, 0.9, 0.7);
  const position: [number, number, number] = [target[0] + distance * 0.35 / length, target[1] + distance * 0.9 / length, target[2] + distance * 0.7 / length];
  return { target, position };
}
