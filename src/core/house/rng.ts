/** Small deterministic PRNG so the house simulation is reproducible in tests. */
export interface Rng {
  next(): number;
  range(min: number, max: number): number;
  readonly seed: number;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return {
    next() {
      // mulberry32
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(min: number, max: number) {
      return min + (max - min) * this.next();
    },
    get seed() {
      return state;
    },
  };
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
