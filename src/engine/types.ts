export type Role = 'PO' | 'EM' | 'CIO';

export type TicketStage = 'backlog' | 'inprogress' | 'qa' | 'production';
export type TicketType = 'feature' | 'bug' | 'epic';

export interface Quirk {
  name: string;
  desc: string;
}

export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  skill: number; // 1-10
  baseEnergy: number; // 0-100
  ego: number; // 0-10
  quirk: Quirk;
  workMod: number; // multiplier on work progress
  bugChance: number; // 0-1 per day while working
  quirkChance: number; // 0-1 per day while working
}

export type EngineerStatus =
  | 'working'
  | 'slacking'
  | 'arguing'
  | 'panicking'
  | 'on-leave'
  | 'ghosted';

export interface Engineer {
  id: number;
  name: string;
  archetypeId: string;
  skill: number;
  energy: number; // 0-100
  morale: number; // 0-100
  burnout: number; // 0-100, >= 100 forces leave
  assignedTicketId: number | null;
  status: EngineerStatus;
  lastAction: string;
}

export interface Ticket {
  id: number;
  title: string;
  type: TicketType;
  moduleId: string;
  effort: number; // work points needed
  progress: number;
  specClarity: number; // 0-100
  stage: TicketStage;
  stuckInReview: boolean; // code review trap: stalled until player mediates
  deadline: number; // day it should ship
  reward: { stability: number; revenue: number };
  done: boolean;
}

export interface Module {
  id: string;
  name: string;
  health: number; // 0-100
  debt: number; // 0-100
}

export interface SlackMessage {
  id: number;
  day: number;
  channel: string;
  author: string;
  text: string;
}

export interface LogEntry {
  day: number;
  text: string;
  kind: 'info' | 'good' | 'bad' | 'chaos';
}

export type GameOver = 'collapse' | 'bankrupt' | 'win' | null;

export interface RunStats {
  shipped: number;
  fired: number;
  mediated: number;
  interruptions: number; // PM interruptions survived
}

export interface GameState {
  day: number;
  hour: number; // 1-8 working hours per day
  role: Role;
  ap: number;
  budget: number; // $k
  guidelinesEnforced: boolean;
  okrActive: boolean;
  engineers: Engineer[];
  tickets: Ticket[];
  modules: Module[];
  slack: SlackMessage[];
  log: LogEntry[];
  gameOver: GameOver;
  nextId: number;
  stats: RunStats;
}
