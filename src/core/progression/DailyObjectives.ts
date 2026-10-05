export type DailyObjectiveId = 'train' | 'recruit' | 'match' | 'pulse';

export interface DailyObjectiveDefinition {
  id: DailyObjectiveId;
  label: string;
  detail: string;
  target: number;
  reward: { cash?: number; hype?: number; energyCans?: number };
}

export const DAILY_OBJECTIVES: DailyObjectiveDefinition[] = [
  { id: 'train', label: 'Invest in Potential', detail: 'Train or develop 3 card attributes.', target: 3, reward: { cash: 750, hype: 15 } },
  { id: 'recruit', label: 'Open the Scouting Desk', detail: 'Sign 1 new player card.', target: 1, reward: { energyCans: 1, hype: 25 } },
  { id: 'match', label: 'Show Up on Match Day', detail: 'Complete 1 tournament match.', target: 1, reward: { cash: 1250, energyCans: 1 } },
  { id: 'pulse', label: 'Check in at HQ', detail: 'Claim the HQ Pulse.', target: 1, reward: { cash: 500, hype: 10 } },
];

export interface DailyObjectivesState {
  date: string;
  progress: Record<DailyObjectiveId, number>;
  claimed: DailyObjectiveId[];
}

export function objectiveDay(now = new Date()): string {
  return now.toISOString().split('T')[0];
}

export function createDailyObjectives(date = objectiveDay()): DailyObjectivesState {
  return { date, progress: { train: 0, recruit: 0, match: 0, pulse: 0 }, claimed: [] };
}

export function currentDailyObjectives(state: DailyObjectivesState | undefined, date = objectiveDay()): DailyObjectivesState {
  return !state || state.date !== date ? createDailyObjectives(date) : state;
}
