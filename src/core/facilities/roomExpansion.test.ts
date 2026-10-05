import { describe, expect, it } from 'vitest';
import { getNextRoomExpansion, getRoomStationSummary } from './roomExpansion';

describe('room expansion information', () => {
  it('reports active room station capacity and counts assigned or targeted stations once', () => {
    const occupied = new Set(['scrim_station_0', 'scrim_station_4', 'not_a_station']);

    expect(getRoomStationSummary('scrim_lab', 1, true, occupied)).toEqual({
      capacity: 18,
      active: 4,
      occupied: 1,
    });
    expect(getRoomStationSummary('scrim_lab', 1, false, occupied)).toEqual({
      capacity: 18,
      active: 0,
      occupied: 0,
    });
  });

  it('previews the next physical station change before the next equipment model', () => {
    const expansion = getNextRoomExpansion('scrim_lab', 1);

    expect(expansion?.level).toBe(3);
    expect(expansion?.addedStations.map((station) => station.label)).toEqual([
      'FPS Practice Rig 5',
      'MOBA Practice Rig 6',
    ]);
    expect(expansion?.nextModel).toBeNull();
  });

  it('previews the full twelve-rig arena wing when the room reaches level six', () => {
    const expansion = getNextRoomExpansion('scrim_lab', 3);
    const stationSummary = getRoomStationSummary('scrim_lab', 6, true, new Set());

    expect(expansion?.level).toBe(6);
    expect(expansion?.addedStations).toHaveLength(12);
    expect(stationSummary).toEqual({ capacity: 18, active: 18, occupied: 0 });
  });

  it('previews the model transition when the next milestone changes equipment', () => {
    const expansion = getNextRoomExpansion('gym', 6);

    expect(expansion?.level).toBe(10);
    expect(expansion?.currentModel).toBe('Basic conditioning');
    expect(expansion?.nextModel).toBe('Fitness console');
  });

  it('returns no physical preview once stations and model tiers are exhausted', () => {
    expect(getNextRoomExpansion('scrim_lab', 250)).toBeNull();
  });
});
