import { FacilityId } from "../types/facility.types";
import {
  ActivityGains,
  ActivityId,
  Facing,
  HouseStation,
  StationPose,
  Vec,
} from "../types/house.types";
import { EsportsDiscipline, ProPlayer } from "../types/player.types";
import {
  ACTIVITIES,
  calculateCapMultiplier,
  calculateEnergyDrainPerSec,
  calculateEnergyEfficiency,
  calculateRoomMultiplier,
} from "./activities";
import {
  FRONT_DOOR_SPAWN,
  getStationById,
  HOUSE_STATIONS,
  isStationAvailable,
} from "./houseGeometry";
import { createStationRoute, NavContext } from "./navigation";
import { createRng, hashString, Rng } from "./rng";
import { playerSportsPreference } from '../empire/EmpireService';

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
  mode: "working" | "walking" | "waiting";
  stationId: string | null;
  targetStationId: string | null;
  path: Vec[];
  activity: ActivityId;
  timer: number;
  energizedTimer: number;
  waitTimer: number;
  discipline?: EsportsDiscipline;
  sportsPreference?: ProPlayer['sportsPreference'];
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
  districtTier: number;
  rng: Rng;
}

const REVIEW_CHATTER = [
  "Watch that flank!",
  "Reset for objective.",
  "Good trade there.",
  "Check their cooldowns.",
  "Clean rotation!",
  "Reviewing round 12.",
];

const BREAK_CHATTER = [
  "Good scrim block!",
  "Coffee break time.",
  "Refilling the tank.",
  "That clutch was crazy.",
  "Ready for next scrim.",
  "Hydration check.",
];

function getActivePlayers(roster: ProPlayer[]): ProPlayer[] {
  return roster
    .filter(player => player.role !== "inactive")
    .sort((first, second) => {
      if (first.role === "starter" && second.role !== "starter") return -1;
      if (second.role === "starter" && first.role !== "starter") return 1;
      return 0;
    });
}

function getRotationQueuePosition(index: number): Vec {
  const columns = 12;
  return {
    x: 1.1 + (index % columns) * 1.05,
    y: 14.25 + Math.floor(index / columns) * 0.55,
  };
}

export function getFacingBetween(from: Vec, to: Vec, current: Facing): Facing {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) < 0.02 && Math.abs(dy) < 0.02) return current;

  // ne = -y (back-right), nw = -x (back-left), se = +x (front-right), sw = +y (front-left)
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "se" : "nw";
  } else {
    return dy > 0 ? "sw" : "ne";
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
  facilityLevels: Record<FacilityId, number>,
  preferredSport?: ProPlayer['sportsPreference'],
  districtTier = 1,
  preferShop = false,
): HouseStation | null {
  const occupied = getOccupiedStationIds(allAgents);
  // Exclude current station so agent can re-pick it if valid
  if (agent.stationId) occupied.delete(agent.stationId);

  const candidates = HOUSE_STATIONS.filter((s) => {
    if (s.activity !== activity) return false;
    if (activity === "practice" && agent.discipline && s.discipline !== agent.discipline) return false;
    if (s.id === 'patio_basketball_hoop' && preferredSport !== 'basketball') return false;
    if (s.id === 'outside_football_drills' && preferredSport !== 'football') return false;
    if (occupied.has(s.id)) return false;
    return isStationAvailable(s, unlockedFacilities, facilityLevels, districtTier);
  });

  if (!candidates.length) return null;

  if (activity === 'break' && preferShop) {
    const shops = candidates.filter(station => station.id === 'dynasty_mart_inside' || station.id === 'boba_cafe_inside');
    if (shops.length) return shops[Math.abs(agent.seed) % shops.length];
  }

  if (activity === 'break' && preferredSport) {
    const stationId = preferredSport === 'basketball' ? 'patio_basketball_hoop' : preferredSport === 'football' ? 'outside_football_drills' : '';
    const sportStation = candidates.find(station => station.id === stationId);
    if (sportStation) return sportStation;
  }

  // Cafeteria dining preference when unlocked
  if (activity === 'break' && unlockedFacilities.has('cafeteria')) {
    const cafeStations = candidates.filter(station => station.area === 'cafeteria');
    if (cafeStations.length > 0 && Math.abs(agent.seed) % 2 === 0) {
      return cafeStations[Math.abs(agent.seed) % cafeStations.length];
    }
  }

  // 1. If break activity and partner is chatting:
  if (activity === "break") {
    const socialCandidates = candidates.filter((s) => {
      if (!s.partnerId) return false;
      const partnerAgent = allAgents.find(
        (a) =>
          a.id !== agent.id &&
          (a.stationId === s.partnerId || a.targetStationId === s.partnerId),
      );
      return partnerAgent && partnerAgent.activity === "break";
    });
    if (socialCandidates.length > 0) {
      return socialCandidates[Math.floor(agent.seed % socialCandidates.length)];
    }
  }

  // 2. Practice desk preference (starter rigs 0-5)
  if (activity === "practice") {
    const starterDeskId = `scrim_station_${agent.portraitIndex % 6}`;
    const starterDesk = candidates.find((s) => s.id === starterDeskId);
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
  rng: Rng,
  player?: ProPlayer,
  blockIndex = 0,
): ActivityId {
  // Forced break conditions: energy < 40 or 2 consecutive work blocks
  if (agent.energy < 40 || agent.workStreak >= 2) {
    return "break";
  }

  // Break probability roll: (80 - energy) / 60
  if (agent.activity !== "break") {
    const breakProb = Math.max(0, (80 - agent.energy) / 60);
    if (rng.next() < breakProb) {
      return "break";
    }
  }

  // Build candidate work activities
  const candidateWeights: { activity: ActivityId; weight: number }[] = [];
  if (unlockedFacilities.has('scrim_lab')) candidateWeights.push({ activity: 'practice', weight: 1 });

  if (unlockedFacilities.has("streaming_pod")) {
    candidateWeights.push({ activity: "stream", weight: 1.0 });
  }
  if (unlockedFacilities.has("analyst_room")) {
    candidateWeights.push({ activity: "review", weight: 1.0 });
  }
  if (unlockedFacilities.has("gym")) {
    candidateWeights.push({ activity: "exercise", weight: 1.0 });
  }
  const schedule = player?.dailySchedule;
  const block = schedule?.[blockIndex % schedule.length];
  const priority: ActivityId | undefined = block === 'scrim' ? 'practice' : block === 'vod' ? 'review' : block === 'gym' ? 'exercise' : block === 'outdoor' || block === 'rest' ? 'break' : undefined;
  if (priority === 'break' && rng.next() < (block === 'rest' ? 0.7 : 0.45)) return 'break';
  const scheduled = candidateWeights.find(candidate => candidate.activity === priority);
  if (scheduled) scheduled.weight *= 2.2;
  if (candidateWeights.length === 0) return 'break';

  // "After a break, the previous activity is weighted x2.5 (the 'return' step)"
  if (agent.activity === "break" && agent.lastWork) {
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

  return candidateWeights[0].activity;
}

export function assignAgentActivity(
  agent: SimAgent,
  activity: ActivityId,
  allAgents: SimAgent[],
  context: NavContext,
  rng: Rng,
): void {
  const station = findBestStation(
    agent,
    activity,
    allAgents,
    context.unlockedFacilities,
    context.facilityLevels,
    activity === 'break' && rng.next() < 0.45 ? agent.sportsPreference : undefined,
    context.districtTier ?? 1,
    activity === 'break' && agent.energy >= 55 && rng.next() < 0.35,
  );

  if (!station) {
    // If no station available for this activity, fallback to break or practice
    if (activity !== "break") {
      const fallbackStation = findBestStation(
        agent,
        "break",
        allAgents,
        context.unlockedFacilities,
        context.facilityLevels,
      );
      if (fallbackStation) {
        assignAgentActivity(agent, "break", allAgents, context, rng);
        return;
      }
    }
    agent.stationId = null;
    agent.targetStationId = null;
    agent.path = [];
    const agentIndex = allAgents.findIndex(candidate => candidate.id === agent.id);
    const queuePosition = getRotationQueuePosition(agentIndex >= 0 ? agentIndex : allAgents.length);
    agent.x = queuePosition.x;
    agent.y = queuePosition.y;
    agent.pose = "stand";
    agent.mode = "waiting";
    agent.waitTimer = 2.0;
    return;
  }

  const currentStation = agent.stationId
    ? getStationById(agent.stationId) ?? null
    : null;
  agent.activity = activity;
  agent.targetStationId = station.id;
  agent.stationId = null; // relinquish previous station so it becomes immediately free

  const route = createStationRoute(
    { x: agent.x, y: agent.y },
    station,
    currentStation,
    context,
  );

  agent.path = route;
  if (!route.length) {
    agent.targetStationId = null;
    agent.mode = "waiting";
    agent.waitTimer = 2;
    return;
  }
  agent.mode = "walking";
  agent.waitTimer = 0;
}

export function createHouseSim(
  roster: ProPlayer[],
  facilities: Record<FacilityId, { isUnlocked: boolean; level: number }>,
  seed = 42,
  districtTier = 1,
): HouseSimState {
  const rng = createRng(seed);
  const unlocked = new Set<FacilityId>(
    (Object.keys(facilities) as FacilityId[]).filter(
      (id) => facilities[id].isUnlocked,
    ),
  );
  const levels = Object.fromEntries(
    Object.entries(facilities).map(([k, v]) => [k, v.level]),
  ) as Record<FacilityId, number>;

  const activePlayers = getActivePlayers(roster);

  const agents: SimAgent[] = [];
  const occupied = new Set<string>();

  activePlayers.forEach((player, idx) => {
    const availableStations = HOUSE_STATIONS.filter(station =>
      !occupied.has(station.id) && isStationAvailable(station, unlocked, levels),
    );
    const initialStation = availableStations.find(station =>
      station.activity === "practice" && station.discipline === player.discipline,
    ) ?? availableStations.find(station => station.activity !== "practice");

    const queuePosition = getRotationQueuePosition(idx);
    const pos = initialStation ? initialStation.seat : queuePosition;
    const facing = initialStation ? initialStation.facing : "ne";
    const pose = initialStation ? initialStation.pose : "sit";
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
      lastWork: "practice",
      seed: agentSeed,
      mode: "working",
      stationId,
      targetStationId: null,
      path: [],
      activity: initialStation ? initialStation.activity : "practice",
      timer: 20 + agentRng.next() * 35, // staggered timer
      energizedTimer: 0,
      waitTimer: initialStation ? 0 : (idx % 4) * 0.5,
      discipline: player.discipline,
      sportsPreference: playerSportsPreference(player),
    });
    if (!initialStation) {
      agents[agents.length - 1].mode = "waiting";
      agents[agents.length - 1].pose = "stand";
    }
  });

  return {
    agents,
    unlockedFacilities: unlocked,
    facilityLevels: levels,
    pendingGains: { hype: 0, stats: {}, inspiredPlayers: [] },
    simTime: 0,
    districtTier,
    rng,
  };
}

export function syncHouseSim(
  sim: HouseSimState,
  roster: ProPlayer[],
  facilities: Record<FacilityId, { isUnlocked: boolean; level: number }>,
  districtTier = 1,
): void {
  sim.districtTier = districtTier;
  sim.unlockedFacilities = new Set<FacilityId>(
    (Object.keys(facilities) as FacilityId[]).filter(
      (id) => facilities[id].isUnlocked,
    ),
  );
  sim.facilityLevels = Object.fromEntries(
    Object.entries(facilities).map(([k, v]) => [k, v.level]),
  ) as Record<FacilityId, number>;

  const context: NavContext = {
    unlockedFacilities: sim.unlockedFacilities,
    facilityLevels: sim.facilityLevels,
    districtTier,
  };

  const activePlayers = getActivePlayers(roster);

  const activeMap = new Map(activePlayers.map((p) => [p.id, p]));

  // 1. Remove only players who are inactive or no longer on the roster.
  sim.agents = sim.agents.filter((a) => activeMap.has(a.id));

  // 2. Update existing agents & check if current station is still valid
  for (const agent of sim.agents) {
    const player = activeMap.get(agent.id)!;
    agent.handle = player.handle;
    agent.name = player.name;
    agent.portraitIndex = player.portraitIndex;
    agent.discipline = player.discipline;
    agent.sportsPreference = playerSportsPreference(player);

    // Check the occupied or reserved station after facility/discipline changes.
    const assignedStationId = agent.stationId ?? agent.targetStationId;
    if (assignedStationId) {
      const station = getStationById(assignedStationId);
      const changedPracticeDiscipline = station?.activity === "practice" && station.discipline !== player.discipline;
      if (
        !station ||
        !isStationAvailable(station, sim.unlockedFacilities, sim.facilityLevels, districtTier) ||
        changedPracticeDiscipline
      ) {
        agent.stationId = null;
        agent.targetStationId = null;
        agent.path = [];
        assignAgentActivity(agent, changedPracticeDiscipline ? "practice" : "break", sim.agents, context, sim.rng);
      }
    }
  }

  // 3. Add new recruits: spawn at front door and walk in
  const existingIds = new Set(sim.agents.map((a) => a.id));
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
        facing: "ne",
        pose: "stand",
        speed: 1.9 + (agentRng.next() - 0.5) * 0.3,
        energy: 85,
        workStreak: 0,
        lastWork: null,
        seed: agentSeed,
        mode: "waiting",
        stationId: null,
        targetStationId: null,
        path: [],
        activity: "practice",
        timer: 1.0,
        energizedTimer: 0,
        waitTimer: 0,
        discipline: player.discipline,
        sportsPreference: playerSportsPreference(player),
      };

      // Assign activity and walk in
      assignAgentActivity(newAgent, "practice", sim.agents, context, agentRng);
      sim.agents.push(newAgent);
    }
  }
}

export function stepHouseSim(
  sim: HouseSimState,
  dt: number,
  roster: ProPlayer[],
): void {
  sim.simTime += dt;
  const context: NavContext = {
    unlockedFacilities: sim.unlockedFacilities,
    facilityLevels: sim.facilityLevels,
    districtTier: sim.districtTier,
  };
  const rosterMap = new Map(roster.map((p) => [p.id, p]));

  // Count active reviewers for synergy bonus
  const reviewingCount = sim.agents.filter(
    (a) => a.activity === "review" && a.mode === "working",
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
    if (agent.mode === "waiting") {
      agent.waitTimer -= dt;
      if (agent.waitTimer <= 0) {
        if (agent.path.length > 0) {
          agent.mode = "walking";
        } else {
          // Re-pick next activity
          const nextAct = pickNextActivity(
            agent,
            sim.unlockedFacilities,
            sim.rng,
            rosterMap.get(agent.id),
            Math.floor(sim.simTime / 120),
          );
          assignAgentActivity(agent, nextAct, sim.agents, context, sim.rng);
        }
      }
      continue;
    }

    // ----------------------------------------------------
    // MODE: WALKING
    // ----------------------------------------------------
    if (agent.mode === "walking") {
      // Walker give-way check: if another walking agent is nearby and has priority
      let shouldYield = false;
      for (let j = 0; j < sim.agents.length; j++) {
        if (i === j) continue;
        const other = sim.agents[j];
        if (other.mode === "walking") {
          const dist = Math.hypot(agent.x - other.x, agent.y - other.y);
          if (dist < 0.45 && agent.id < other.id) {
            shouldYield = true;
            break;
          }
        }
      }

      if (shouldYield) {
        agent.mode = "waiting";
        agent.waitTimer = 0.3 + sim.rng.next() * 0.5; // up to 0.8s yield
        continue;
      }

      // Advance along path
      if (agent.path.length > 0) {
        let remainingMove = agent.speed * dt;
        agent.pose = "stand";

        while (remainingMove > 0 && agent.path.length > 0) {
          const target = agent.path[0];
          const dist = Math.hypot(target.x - agent.x, target.y - agent.y);

          agent.facing = getFacingBetween(
            { x: agent.x, y: agent.y },
            target,
            agent.facing,
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
            agent.mode = "working";
            agent.timer = pickActivityDuration(agent.activity, sim.rng);

            if (station.id === 'dynasty_mart_inside' || station.id === 'boba_cafe_inside' || station.area === 'cafeteria') {
              agent.energizedTimer = Math.max(agent.energizedTimer, 180);
              agent.speechBubble = { text: station.area === 'cafeteria' ? "Chef's meal!" : station.id === 'boba_cafe_inside' ? 'Boba run!' : 'Snack break!', expiresAt: sim.simTime + 4 };
            }
            if (['dynasty_mart_inside', 'boba_cafe_inside', 'outside_garden_bench', 'patio_sofa_chill', 'patio_basketball_hoop', 'outside_football_drills', 'cafeteria_meal_table', 'cafeteria_table_partner', 'cafeteria_booth_seat'].includes(station.id)) {
              const inspired = sim.pendingGains.inspiredPlayers ?? (sim.pendingGains.inspiredPlayers = []);
              if (!inspired.includes(agent.id)) inspired.push(agent.id);
            }

            if (agent.activity !== "break") {
              agent.workStreak += 1;
              agent.lastWork = agent.activity;
            } else {
              agent.workStreak = 0;
            }
          }
        }
      } else {
        // Fallback: arrived
        agent.mode = "working";
      }
      continue;
    }

    // ----------------------------------------------------
    // MODE: WORKING / AT STATION
    // ----------------------------------------------------
    if (agent.mode === "working") {
      const station = agent.stationId ? getStationById(agent.stationId) : null;
      if (station) {
        agent.pose = station.pose;
        agent.facing = station.facing;
      }

      const roomLevel =
        station && station.area !== "hall"
          ? sim.facilityLevels[station.area as FacilityId] ?? 1
          : 1;

      const roomMult = calculateRoomMultiplier(roomLevel);
      const energyEff = calculateEnergyEfficiency(agent.energy);

      if (!sim.pendingGains.stats[player.id]) {
        sim.pendingGains.stats[player.id] = {};
      }
      const playerGains = sim.pendingGains.stats[player.id];

      // Handle activities & gains
      if (agent.activity === "break") {
        const isPartnered =
          station &&
          station.partnerId &&
          sim.agents.some(
            (other) =>
              other.id !== agent.id &&
              other.stationId === station.partnerId &&
              other.activity === "break" &&
              other.mode === "working",
          );

        const hasSnackOrDrink =
          station?.prop === "cup" || station?.prop === "snack";
        const recoveryRate = isPartnered || hasSnackOrDrink ? 3.5 : 2.5;

        agent.energy = Math.min(100, agent.energy + recoveryRate * dt);

        if (isPartnered) {
          // Chatting adds a little comms
          const capMult = calculateCapMultiplier(
            player.stats.comms,
            player.rarity, player.potential,
          );
          const commsDelta = (0.08 / 60) * capMult * dt;
          playerGains.comms = (playerGains.comms || 0) + commsDelta;

          // Occasional chatter bubble
          if (!agent.speechBubble && sim.rng.next() < 0.04) {
            agent.speechBubble = {
              text: BREAK_CHATTER[
                Math.floor(sim.rng.next() * BREAK_CHATTER.length)
              ],
              expiresAt: sim.simTime + 3.0,
            };
          }
        }

        if (agent.stationId === "patio_watch_tv") {
          // Watching VODs / match broadcast outside on patio TV accrues Macro
          const macroCap = calculateCapMultiplier(
            player.stats.macro,
            player.rarity, player.potential,
          );
          const macroDelta = (0.15 / 60) * macroCap * dt;
          playerGains.macro = (playerGains.macro || 0) + macroDelta;
        } else if (agent.stationId === "patio_basketball_hoop") {
          // Shooting driveway hoops relieves stress and builds tilt resistance
          const tiltCap = calculateCapMultiplier(
            player.stats.tiltResistance,
            player.rarity, player.potential,
          );
          const tiltDelta = (0.2 / 60) * tiltCap * dt;
          playerGains.tiltResistance =
            (playerGains.tiltResistance || 0) + tiltDelta;
        } else if (agent.stationId === 'outside_football_drills') {
          const tiltCap = calculateCapMultiplier(player.stats.tiltResistance, player.rarity, player.potential);
          playerGains.tiltResistance = (playerGains.tiltResistance || 0) + (0.22 / 60) * tiltCap * dt;
          const commsCap = calculateCapMultiplier(player.stats.comms, player.rarity, player.potential);
          playerGains.comms = (playerGains.comms || 0) + (0.08 / 60) * commsCap * dt;
        } else if (agent.stationId === 'dynasty_mart_inside' || agent.stationId === 'boba_cafe_inside') {
          const tiltCap = calculateCapMultiplier(player.stats.tiltResistance, player.rarity, player.potential);
          playerGains.tiltResistance = (playerGains.tiltResistance || 0) + (0.18 / 60) * tiltCap * dt;
        }
      } else {
        // Energy drain
        const isEnergized = agent.energizedTimer > 0;
        const drain =
          calculateEnergyDrainPerSec(
            agent.activity,
            player.stats.tiltResistance,
            isEnergized,
          ) * dt;
        agent.energy = Math.max(0, agent.energy - drain);

        if (agent.activity === "practice") {
          // +0.30 Aim and +0.20 Macro per minute
          const aimCap = calculateCapMultiplier(
            player.stats.aim,
            player.rarity, player.potential,
          );
          const macroCap = calculateCapMultiplier(
            player.stats.macro,
            player.rarity, player.potential,
          );

          const aimDelta = (0.3 / 60) * roomMult * energyEff * aimCap * dt;
          const macroDelta = (0.2 / 60) * roomMult * energyEff * macroCap * dt;

          playerGains.aim = (playerGains.aim || 0) + aimDelta;
          playerGains.macro = (playerGains.macro || 0) + macroDelta;
        } else if (agent.activity === "stream") {
          // +1.2 Hype per minute * (0.5 + comms/100); small Comms gain
          const hypeRate = (1.2 / 60) * (0.5 + player.stats.comms / 100);
          const hypeDelta = hypeRate * roomMult * energyEff * dt;
          sim.pendingGains.hype += hypeDelta;

          const commsCap = calculateCapMultiplier(
            player.stats.comms,
            player.rarity, player.potential,
          );
          const commsDelta = (0.1 / 60) * roomMult * energyEff * commsCap * dt;
          playerGains.comms = (playerGains.comms || 0) + commsDelta;
        } else if (agent.activity === "review") {
          // +0.25 Macro and +0.12 Comms per minute, plus 20% per teammate reviewing (max 3)
          const teammatesReviewing = Math.max(0, reviewingCount - 1);
          const synergyMult = 1 + 0.2 * Math.min(3, teammatesReviewing);

          const macroCap = calculateCapMultiplier(
            player.stats.macro,
            player.rarity, player.potential,
          );
          const commsCap = calculateCapMultiplier(
            player.stats.comms,
            player.rarity, player.potential,
          );

          const macroDelta =
            (0.25 / 60) * synergyMult * roomMult * energyEff * macroCap * dt;
          const commsDelta =
            (0.12 / 60) * synergyMult * roomMult * energyEff * commsCap * dt;

          playerGains.macro = (playerGains.macro || 0) + macroDelta;
          playerGains.comms = (playerGains.comms || 0) + commsDelta;

          // Occasional strategy review chatter
          if (
            teammatesReviewing > 0 &&
            !agent.speechBubble &&
            sim.rng.next() < 0.04
          ) {
            agent.speechBubble = {
              text: REVIEW_CHATTER[
                Math.floor(sim.rng.next() * REVIEW_CHATTER.length)
              ],
              expiresAt: sim.simTime + 3.0,
            };
          }
        } else if (agent.activity === "exercise") {
          // +0.25 Mental (tiltResistance) per minute
          const tiltCap = calculateCapMultiplier(
            player.stats.tiltResistance,
            player.rarity, player.potential,
          );
          const tiltDelta = (0.25 / 60) * roomMult * energyEff * tiltCap * dt;
          playerGains.tiltResistance =
            (playerGains.tiltResistance || 0) + tiltDelta;
        }
      }

      // Check activity timer
      agent.timer -= dt;
      if (agent.timer <= 0) {
        if (agent.activity === "exercise") {
          // 180s "Energized" buff
          agent.energizedTimer = 180;
        }
        // Transition to next activity
        const nextAct = pickNextActivity(
          agent,
          sim.unlockedFacilities,
          sim.rng,
          player,
          Math.floor(sim.simTime / 120),
        );
        assignAgentActivity(agent, nextAct, sim.agents, context, sim.rng);
      }
    }
  }
}

export function takeGains(sim: HouseSimState): ActivityGains {
  const gains: ActivityGains = {
    hype: sim.pendingGains.hype,
    stats: { ...sim.pendingGains.stats },
    inspiredPlayers: [...(sim.pendingGains.inspiredPlayers ?? [])],
  };

  sim.pendingGains = {
    hype: 0,
    stats: {},
    inspiredPlayers: [],
  };

  return gains;
}
