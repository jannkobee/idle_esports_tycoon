import { describe, expect, it } from 'vitest';
import { getHousePlayerPosition, HOUSE_ROOMS } from './HouseLayout';

describe('house character routes', () => {
  it('keeps all six player paths in the open scrim lab or common corridors', () => {
    for (let player = 0; player < 6; player++) {
      for (let seconds = 0; seconds < 48; seconds += .125) {
        const p = getHousePlayerPosition(seconds, player);
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(14);
        for (const room of HOUSE_ROOMS.filter(r => r.id !== 'scrim_lab')) {
          const inside = p.x > room.x && p.x < room.x + room.w && p.y > room.y && p.y < room.y + room.d;
          expect(inside).toBe(false);
        }
      }
    }
  });

  it('walks continuously when leaving and returning to every desk', () => {
    for (let player = 0; player < 6; player++) {
      for (let time = .01; time < 96; time += .05) {
        const before = getHousePlayerPosition(time - .01, player);
        const after = getHousePlayerPosition(time, player);
        expect(Math.hypot(before.x - after.x, before.y - after.y)).toBeLessThan(.05);
      }
    }
  });
});
