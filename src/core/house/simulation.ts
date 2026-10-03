import { FacilityId } from '../types/facility.types';
import {
  ActivityGains,
  ActivityId,
  Facing,
  HouseStation,
  StationPose,
  Vec,
} from '../types/house.types';
import { ProPlayer } from '../types/player.types';
import {
  ACTIVITIES,
  calculateCapMultiplier,
  calculateEnergyDrainPerSec,
  calculateEnergyEfficiency,
  calculateRoomMultiplier,
} from './activities';
import {
  FRONT_DOOR_SPAWN,
  getStationById,
  HOUSE_STATIONS,
  isStationAvailable,
} from './houseGeometry';
import { createStationRoute, NavContext } from './navigation';
import { createRng, hashString, Rng } from './rng';

export interface SimAgent {
  id: string;
  name: string;
  handle: string;
  portraitIndex: number;
  x: number;
  y: number;
  facing: Facing;
  pose: StationPose;
  speed: number;
  energy: number;
  workStreak: number;
  lastWork: ActivityId | null;
  seed: number;
  mode: 'working' | 'walking' | 'waiting';
  stationId: string | null;
  targetStationId: string | null;
  path: Vec[];
  activity: ActivityId;
  timer: number;
  energizedTimer: number;
  waitTimer: number;
  speechBubble?: {
    text: string;
    expiresAt: number;
  };
}

export interface HouseSimState {
  agents: SimAgent[];
  unlockedFacilities: Set<FacilityId>;
  facilityLevels: Record<FacilityId, number>;
  pendingGains: ActivityGains;
  simTime: number;
  rng: Rng;
}

const REVIEW_CHATTER = [
  'Watch that flank!',
  'Reset for objective.',
  'Good trade there.',
  'Check their cooldowns.',
  'Clean rotation!',
  'Reviewing round 12.',
];

const BREAK_CHATTER = [
  'Good scrim block!',
  'Coffee break time.',
  'Refilling the tank.',
  'That clutch was crazy.',
  'Ready for next scrim.',
  'Hydration check.',
];

export function getFacingBetween(from: Vec, to: Vec, current: Facing): Facing {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) < 0.02 && Math.abs(dy) < 0.02) return current;

  // ne = -y (back-right), nw = -x (back-left), se = +x (front-right), sw = +y (front-left)
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'se' : 'nw';
  } else {
    return dy > 0 ? 'sw' : 'ne';
  }
}

export function pickActivityDuration(activity: ActivityId, rng: Rng): number {
  const meta = ACTIVITIES[activity];
  return rng.range(meta.minDuration, meta.maxDuration);
}

export function getOccupiedStationIds(agents: SimAgent[]): Set<string> {
  const occupied = new Set<string>();
  for (const a of agents) {
    if (a.stationId) occupied.add(a.stationId);
    if (a.targetStationId) occupied.add(a.targetStationId);
  }
  return occupied;
}

export function findBestStation(
  agent: SimAgent,
  activity: ActivityId,
  allAgents: SimAgent[],
  unlockedFacilities: Set<FacilityId>,
  facilityLevels: Record<FacilityId, number>
): HouseStation | null {
  const occupied = getOccupiedStationIds(allAgents);
  // Exclude current station so agent can re-pick it if valid
  if (agent.stationId) occupied.delete(agent.stationId);

  const candidates = HOUSE_STATIONS.filter(s => {
    if (s.activity !== activity) return false;
    if (occupied.has(s.id)) return false;
    return isStationAvailable(s, unlockedFacilities, facilityLevels);
  });

  if (!candidates.length) return null;

  // 1. If break activity and partner is chatting:
  if (activity === 'break') {
    const socialCandidates = candidates.filter(s => {
      if (!s.partnerId) return false;
      const partnerAgent = allAgents.find(
        a => a.id !== agent.id && (a.stationId === s.partnerId || a.targetStationId === s.partnerId)
      );
      return partnerAgent && partnerAgent.activity === 'break';
    });
    if (socialCandidates.length > 0) {
      return socialCandidates[Math.floor(agent.seed % socialCandidates.length)];
    }
  }

  // 2. Practice desk preference (starter rigs 0-5)
  if (activity === 'practice') {
    const starterDeskId = `scrim_station_${agent.portraitIndex % 6}`;
    const starterDesk = candidates.find(s => s.id === starterDeskId);
    if (starterDesk) return starterDesk;
  }

  // 3. Nearest free station
  let nearest = candidates[0];
  let minDistance = Infinity;
  for (const s of candidates) {
    const dist = Math.hypot(s.approach.x - agent.x, s.approach.y - agent.y);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = s;
    }
  }

  return nearest;
}

export function pickNextActivity(
  agent: SimAgent,
  unlockedFacilities: Set<FacilityId>,
  rng: Rng
): ActivityId {
  // Forced break conditions: energy < 40 or 2 consecutive work blocks
  if (agent.energy < 40 || agent.workStreak >= 2) {
    return 'break';
  }

  // Break probability roll: (80 - energy) / 60
  if (agent.activity !== 'break') {
    const breakProb = Math.max(0, (80 - agent.energy) / 60);
    if (rng.next() < breakProb) {
      return 'break';
    }
  }

  // Build candidate work activities
  const candidateWeights: { activity: ActivityId; weight: number }[] = [
    { activity: 'practice', weight: 1.0 },
  ];

  if (unlockedFacilities.has('streaming_pod')) {
    candidateWeights.push({ activity: 'stream', weight: 1.0 });
  }
  if (unlockedFacilities.has('analyst_room')) {
    candidateWeights.push({ activity: 'review', weight: 1.0 });
  }
  if (unlockedFacilities.has('gym')) {
    candidateWeights.push({ activity: 'exercise', weight: 1.0 });
  }

  // "After a break, the previous activity is weighted x2.5 (the 'return' step)"
  if (agent.activity === 'break' && agent.lastWork) {
    for (const cw of candidateWeights) {
      if (cw.activity === agent.lastWork) {
        cw.weight *= 2.5;
      }
    }
  }

  const totalWeight = candidateWeights.reduce((sum, cw) => sum + cw.weight, 0);
  let roll = rng.next() * totalWeight;
  for (const cw of candidateWeights) {
    if (roll < cw.weight) return cw.activity;
    roll -= cw.weight;
  }

  return 'practice';
}

export function assignAgentActivity(
  agent: SimAgent,
  activity: ActivityId,
  allAgents: SimAgent[],
  context: NavContext,
  rng: Rng
): void {
  const station = findBestStation(
    agent,
    activity,
    allAgents,
    context.unlockedFacilities,
    context.facilityLevels
  );

  if (!station) {
    // If no station available for this activity, fallback to break or practice
    if (activity !== 'break') {
      const fallbackStation = findBestStation(
        agent,
        'break',
        allAgents,
        context.unlockedFacilities,
        context.facilityLevels
      );
      if (fallbackStation) {
        assignAgentActivity(agent, 'break', allAgents, context, rng);
        return;
      }
    }
    // Waiting in place
    agent.mode = 'waiting';
    agent.waitTimer = 2.0;
    return;
  }

  const currentStation = agent.stationId ? getStationById(agent.stationId) ?? null : null;
  agent.activity = activity;
  agent.targetStationId = station.id;
  agent.stationId = null; // relinquish previous station so it becomes immediately free

  const route = createStationRoute(
    { x: agent.x, y: agent.y },
    station,
    currentStation,
    context
  );

  agent.path = route;
  agent.mode = 'walking';
  agent.waitTimer = 0;
}

export function createHouseSim(
  roster: ProPlayer[],
  facilities: Record<FacilityId, { isUnlocked: boolean; level: number }>,
  seed = 42
): HouseSimState {
  const rng = createRng(seed);
  const unlocked = new Set<FacilityId>(
    (Object.keys(facilities) as FacilityId[]).filter(id => facilities[id].isUnlocked)
  );
  const levels = Object.fromEntries(
    Object.entries(facilities).map(([k, v]) => [k, v.level])
  ) as Record<FacilityId, number>;

  const activePlayers = roster
    .filter(p => p.role !== 'inactive')
    .sort((a, b) => {
      if (a.role === 'starter' && b.role !== 'starter') return -1;
      if (b.role === 'starter' && a.role !== 'starter') return 1;
      return 0;
    })
    .slice(0, 8); // Holds up to 8 players

  const agents: SimAgent[] = [];
  const occupied = new Set<string>();

  activePlayers.forEach((player, idx) => {
    // Initial placement: spread across practice desks (or streaming if unlocked)
    let initialStation: HouseStation | undefined;
    const practiceStations = HOUSE_STATIONS.filter(
      s => s.activity === 'practice' && !occupied.has(s.id) && isStationAvailable(s, unlocked, levels)
    );

    if (practiceStations.length > 0) {
      initialStation = practiceStations[0];
    } else {
      initialStation = HOUSE_STATIONS.find(
        s => !occupied.has(s.id) && isStationAvailable(s, unlocked, levels)
      );
    }

    const pos = initialStation ? initialStation.seat : FRONT_DOOR_SPAWN;
    const facing = initialStation ? initialStation.facing : 'ne';
    const pose = initialStation ? initialStation.pose : 'sit';
    const stationId = initialStation ? initialStation.id : null;
    if (stationId) occupied.add(stationId);

    const agentSeed = hashString(player.id) ^ seed;
    const agentRng = createRng(agentSeed);

    agents.push({
      id: player.id,
      name: player.name,
      handle: player.handle,
      portraitIndex: player.portraitIndex,
      x: pos.x,
      y: pos.y,
      facing,
      pose,
      speed: 1.9 + (agentRng.next() - 0.5) * 0.3, // ~1.75 - 2.05
      energy: Math.floor(70 + agentRng.next() * 28),
      workStreak: idx % 2,
      lastWork: 'practice',
      seed: agentSeed,
      mode: 'working',
      stationId,
      targetStationId: null,
      path: [],
      activity: initialStation ? initialStation.activity : 'practice',
      timer: 20 + agentRng.next() * 35, // staggered timer
      energizedTimer: 0,
      waitTimer: 0,
    });
  });

  return {
    agents,
    unlockedFacilities: unlocked,
    facilityLevels: levels,
    pendingGains: { hype: 0, stats: {} },
    simTime: 0,
    rng,
  };
}

export function syncHouseSim(
  sim: HouseSimState,
  roster: ProPlayer[],
  facilities: Record<FacilityId, { isUnlocked: boolean; level: number }>
): void {
  sim.unlockedFacilities = new Set<FacilityId>(
    (Object.keys(facilities) as FacilityId[]).filter(id => facilities[id].isUnlocked)
  );
  sim.facilityLevels = Object.fromEntries(
    Object.entries(facilities).map(([k, v]) => [k, v.level])
  ) as Record<FacilityId, number>;

  const context: NavContext = {
    unlockedFacilities: sim.unlockedFacilities,
    facilityLevels: sim.facilityLevels,
  };

  const activePlayers = roster
    .filter(p => p.role !== 'inactive')
    .sort((a, b) => {
      if (a.role === 'starter' && b.role !== 'starter') return -1;
      if (b.role === 'starter' && a.role !== 'starter') return 1;
      return 0;
    })
    .slice(0, 8);

  const activeMap = new Map(activePlayers.map(p => [p.id, p]));

  // 1. Remove agents no longer in active top 8
  sim.agents = sim.agents.filter(a => activeMap.has(a.id));

  // 2. Update existing agents & check if current station is still valid
  for (const agent of sim.agents) {
    const player = activeMap.get(agent.id)!;
    agent.handle = player.handle;
    agent.name = player.name;
    agent.portraitIndex = player.portraitIndex;

    // Check station validity
    if (agent.stationId) {
      const station = getStationById(agent.stationId);
      if (!station || !isStationAvailable(station, sim.unlockedFacilities, sim.facilityLevels)) {
        // Evacuate from locked station
        agent.stationId = null;
        assignAgentActivity(agent, 'break', sim.agents, context, sim.rng);
      }
    }
  }

  // 3. Add new recruits: spawn at front door and walk in
  const existingIds = new Set(sim.agents.map(a => a.id));
  for (const player of activePlayers) {
    if (!existingIds.has(player.id)) {
      const agentSeed = hashString(player.id) ^ Math.floor(sim.simTime);
      const agentRng = createRng(agentSeed);

      const newAgent: SimAgent = {
        id: player.id,
        name: player.name,
        handle: player.handle,
        portraitIndex: player.portraitIndex,
        x: FRONT_DOOR_SPAWN.x,
        y: FRONT_DOOR_SPAWN.y,
        facing: 'ne',
        pose: 'stand',
        speed: 1.9 + (agentRng.next() - 0.5) * 0.3,
        energy: 85,
        workStreak: 0,
        lastWork: null,
        seed: agentSeed,
        mode: 'waiting',
        stationId: null,
        targetStationId: null,
        path: [],
        activity: 'practice',
        timer: 1.0,
        energizedTimer: 0,
        waitTimer: 0,
      };

      // Assign activity and walk in
      assignAgentActivity(newAgent, 'practice', sim.agents, context, agentRng);
      sim.agents.push(newAgent);
    }
  }
}

export function stepHouseSim(
  sim: HouseSimState,
  dt: number,
  roster: ProPlayer[]
): void {
  sim.simTime += dt;
  const context: NavContext = {
    unlockedFacilities: sim.unlockedFacilities,
    facilityLevels: sim.facilityLevels,
  };
  const rosterMap = new Map(roster.map(p => [p.id, p]));

  // Count active reviewers for synergy bonus
  const reviewingCount = sim.agents.filter(
    a => a.activity === 'review' && a.mode === 'working'
  ).length;

  for (let i = 0; i < sim.agents.length; i++) {
    const agent = sim.agents[i];
    const player = rosterMap.get(agent.id);
    if (!player) continue;

    if (agent.energizedTimer > 0) {
      agent.energizedTimer = Math.max(0, agent.energizedTimer - dt);
    }

    // Clear expired speech bubbles
    if (agent.speechBubble && sim.simTime > agent.speechBubble.expiresAt) {
      agent.speechBubble = undefined;
    }

    // ----------------------------------------------------
    // MODE: WAITING (collision give-way or transition pause)
    // ----------------------------------------------------
    if (agent.mode === 'waiting') {
      agent.waitTimer -= dt;
      if (agent.waitTimer <= 0) {
        if (agent.path.length > 0) {
          agent.mode = 'walking';
        } else {
          // Re-pick next activity
          const nextAct = pickNextActivity(agent, sim.unlockedFacilities, sim.rng);
          assignAgentActivity(agent, nextAct, sim.agents, context, sim.rng);
        }
      }
      continue;
    }

    // ----------------------------------------------------
    // MODE: WALKING
    // ----------------------------------------------------
    if (agent.mode === 'walking') {
      // Walker give-way check: if another walking agent is nearby and has priority
      let shouldYield = false;
      for (let j = 0; j < sim.agents.length; j++) {
        if (i === j) continue;
        const other = sim.agents[j];
        if (other.mode === 'walking') {
          const dist = Math.hypot(agent.x - other.x, agent.y - other.y);
          if (dist < 0.45 && agent.id < other.id) {
            shouldYield = true;
            break;
          }
        }
      }

      if (shouldYield) {
        agent.mode = 'waiting';
        agent.waitTimer = 0.3 + sim.rng.next() * 0.5; // up to 0.8s yield
        continue;
      }

      // Advance along path
      if (agent.path.length > 0) {
        let remainingMove = agent.speed * dt;
        agent.pose = 'stand';

        while (remainingMove > 0 && agent.path.length > 0) {
          const target = agent.path[0];
          const dist = Math.hypot(target.x - agent.x, target.y - agent.y);

          agent.facing = getFacingBetween(
            { x: agent.x, y: agent.y },
            target,
            agent.facing
          );

          if (dist <= remainingMove) {
            agent.x = target.x;
            agent.y = target.y;
            remainingMove -= dist;
            agent.path.shift();
          } else {
            const ratio = remainingMove / dist;
            agent.x += (target.x - agent.x) * ratio;
            agent.y += (target.y - agent.y) * ratio;
            remainingMove = 0;
          }
        }

        // Arrived at destination station!
        if (agent.path.length === 0 && agent.targetStationId) {
          const station = getStationById(agent.targetStationId);
          if (station) {
            agent.stationId = station.id;
            agent.targetStationId = null;
            agent.x = station.seat.x;
            agent.y = station.seat.y;
            agent.facing = station.facing;
            agent.pose = station.pose;
            agent.mode = 'working';
            agent.timer = pickActivityDuration(agent.activity, sim.rng);

            if (agent.activity !== 'break') {
              agent.workStreak += 1;
              agent.lastWork = agent.activity;
            } else {
              agent.workStreak = 0;
            }
          }
        }
      } else {
        // Fallback: arrived
        agent.mode = 'working';
      }
      continue;
    }

    // ----------------------------------------------------
    // MODE: WORKING / AT STATION
    // ----------------------------------------------------
    if (agent.mode === 'working') {
      const station = agent.stationId ? getStationById(agent.stationId) : null;
      if (station) {
        agent.pose = station.pose;
        agent.facing = station.facing;
      }

      const roomLevel = station && station.area !== 'hall'
        ? sim.facilityLevels[station.area as FacilityId] ?? 1
        : 1;

      const roomMult = calculateRoomMultiplier(roomLevel);
      const energyEff = calculateEnergyEfficiency(agent.energy);

      if (!sim.pendingGains.stats[player.id]) {
        sim.pendingGains.stats[player.id] = {};
      }
      const playerGains = sim.pendingGains.stats[player.id];

      // Handle activities & gains
      if (agent.activity === 'break') {
        const isPartnered =
          station &&
          station.partnerId &&
          sim.agents.some(
            other =>
              other.id !== agent.id &&
              other.stationId === station.partnerId &&
              other.activity === 'break' &&
              other.mode === 'working'
          );

        const hasSnackOrDrink = station?.prop === 'cup' || station?.prop === 'snack';
        const recoveryRate = isPartnered || hasSnackOrDrink ? 3.5 : 2.5;

        agent.energy = Math.min(100, agent.energy + recoveryRate * dt);

        if (isPartnered) {
          // Chatting adds a little comms
          const capMult = calculateCapMultiplier(player.stats.comms, player.rarity);
          const commsDelta = (0.08 / 60) * capMult * dt;
          playerGains.comms = (playerGains.comms || 0) + commsDelta;

          // Occasional chatter bubble
          if (!agent.speechBubble && sim.rng.next() < 0.04) {
            agent.speechBubble = {
              text: BREAK_CHATTER[Math.floor(sim.rng.next() * BREAK_CHATTER.length)],
              expiresAt: sim.simTime + 3.0,
            };
          }
        }
      } else {
        // Energy drain
        const isEnergized = agent.energizedTimer > 0;
        const drain =
          calculateEnergyDrainPerSec(agent.activity, player.stats.tiltResistance, isEnergized) *
          dt;
        agent.energy = Math.max(0, agent.energy - drain);

        if (agent.activity === 'practice') {
          // +0.30 Aim and +0.20 Macro per minute
          const aimCap = calculateCapMultiplier(player.stats.aim, player.rarity);
          const macroCap = calculateCapMultiplier(player.stats.macro, player.rarity);

          const aimDelta = (0.3 / 60) * roomMult * energyEff * aimCap * dt;
          const macroDelta = (0.2 / 60) * roomMult * energyEff * macroCap * dt;

          playerGains.aim = (playerGains.aim || 0) + aimDelta;
          playerGains.macro = (playerGains.macro || 0) + macroDelta;
        } else if (agent.activity === 'stream') {
          // +1.2 Hype per minute * (0.5 + comms/100); small Comms gain
          const hypeRate = (1.2 / 60) * (0.5 + player.stats.comms / 100);
          const hypeDelta = hypeRate * roomMult * energyEff * dt;
          sim.pendingGains.hype += hypeDelta;

          const commsCap = calculateCapMultiplier(player.stats.comms, player.rarity);
          const commsDelta = (0.1 / 60) * roomMult * energyEff * commsCap * dt;
          playerGains.comms = (playerGains.comms || 0) + commsDelta;
        } else if (agent.activity === 'review') {
          // +0.25 Macro and +0.12 Comms per minute, plus 20% per teammate reviewing (max 3)
          const teammatesReviewing = Math.max(0, reviewingCount - 1);
          const synergyMult = 1 + 0.2 * Math.min(3, teammatesReviewing);

          const macroCap = calculateCapMultiplier(player.stats.macro, player.rarity);
          const commsCap = calculateCapMultiplier(player.stats.comms, player.rarity);

          const macroDelta = (0.25 / 60) * synergyMult * roomMult * energyEff * macroCap * dt;
          const commsDelta = (0.12 / 60) * synergyMult * roomMult * energyEff * commsCap * dt;

          playerGains.macro = (playerGains.macro || 0) + macroDelta;
          playerGains.comms = (playerGains.comms || 0) + commsDelta;

          // Occasional strategy review chatter
          if (teammatesReviewing > 0 && !agent.speechBubble && sim.rng.next() < 0.04) {
            agent.speechBubble = {
              text: REVIEW_CHATTER[Math.floor(sim.rng.next() * REVIEW_CHATTER.length)],
              expiresAt: sim.simTime + 3.0,
            };
          }
        } else if (agent.activity === 'exercise') {
          // +0.25 Mental (tiltResistance) per minute
          const tiltCap = calculateCapMultiplier(player.stats.tiltResistance, player.rarity);
          const tiltDelta = (0.25 / 60) * roomMult * energyEff * tiltCap * dt;
          playerGains.tiltResistance = (playerGains.tiltResistance || 0) + tiltDelta;
        }
      }

      // Check activity timer
      agent.timer -= dt;
      if (agent.timer <= 0) {
        if (agent.activity === 'exercise') {
          // 180s "Energized" buff
          agent.energizedTimer = 180;
        }
        // Transition to next activity
        const nextAct = pickNextActivity(agent, sim.unlockedFacilities, sim.rng);
        assignAgentActivity(agent, nextAct, sim.agents, context, sim.rng);
      }
    }
  }
}

export function takeGains(sim: HouseSimState): ActivityGains {
  const gains: ActivityGains = {
    hype: sim.pendingGains.hype,
    stats: { ...sim.pendingGains.stats },
  };

  sim.pendingGains = {
    hype: 0,
    stats: {},
  };

  return gains;
}
