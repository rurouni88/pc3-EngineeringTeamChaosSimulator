import type { Archetype, Module, Ticket, TicketType } from './types';

export const ARCHETYPES: Archetype[] = [
  {
    id: 'rockstar',
    name: 'The Rockstar',
    emoji: '🤘',
    skill: 9,
    baseEnergy: 70,
    ego: 9,
    quirk: { name: 'Language hopper', desc: 'Rewrites modules in a new language' },
    workMod: 1.4,
    bugChance: 0.05,
    quirkChance: 0.25,
  },
  {
    id: 'grindset',
    name: 'The Grindset',
    emoji: '⚡',
    skill: 6,
    baseEnergy: 95,
    ego: 5,
    quirk: { name: '14-hour days', desc: 'Pulls brutal hours, burns out fast' },
    workMod: 1.2,
    bugChance: 0.15,
    quirkChance: 0.2,
  },
  {
    id: 'architect',
    name: 'The Architect',
    emoji: '🏛️',
    skill: 8,
    baseEnergy: 60,
    ego: 8,
    quirk: { name: 'Service sprawl', desc: 'Adds a microservice to everything' },
    workMod: 1.0,
    bugChance: 0.08,
    quirkChance: 0.35,
  },
  {
    id: 'zen',
    name: 'The Zen Monk',
    emoji: '🧘',
    skill: 7,
    baseEnergy: 80,
    ego: 3,
    quirk: { name: 'Anti-urgency', desc: 'Refuses all urgency with a smile' },
    workMod: 0.9,
    bugChance: 0.05,
    quirkChance: 0.1,
  },
  {
    id: 'imposter',
    name: 'The Imposter',
    emoji: '😰',
    skill: 4,
    baseEnergy: 50,
    ego: 2,
    quirk: { name: 'Panic deletes', desc: 'Deletes code when stressed' },
    workMod: 0.8,
    bugChance: 0.25,
    quirkChance: 0.3,
  },
  {
    id: 'slackwiz',
    name: 'The Slack Wizard',
    emoji: '🪄',
    skill: 8,
    baseEnergy: 40,
    ego: 6,
    quirk: { name: 'Deadline magic', desc: 'Does 90% of work in the last hour' },
    workMod: 1.3,
    bugChance: 0.1,
    quirkChance: 0.2,
  },
  {
    id: 'framework',
    name: 'The Framework Chaser',
    emoji: '📦',
    skill: 6,
    baseEnergy: 70,
    ego: 7,
    quirk: { name: 'Stack migration', desc: 'Migrates the stack mid-sprint' },
    workMod: 1.0,
    bugChance: 0.18,
    quirkChance: 0.4,
  },
  {
    id: 'intern',
    name: 'The Intern',
    emoji: '🐣',
    skill: 2,
    baseEnergy: 85,
    ego: 1,
    quirk: { name: 'Eager but wrong', desc: 'Breaks staging, learns nothing, asks everything' },
    workMod: 0.5,
    bugChance: 0.3,
    quirkChance: 0.2,
  },
  {
    id: 'vendor',
    name: 'The Vendor',
    emoji: '💍',
    skill: 5,
    baseEnergy: 60,
    ego: 8,
    quirk: { name: 'Upsells everything', desc: 'Ships fast, invoices faster' },
    workMod: 0.7,
    bugChance: 0.1,
    quirkChance: 0.35,
  },
  {
    id: 'security',
    name: 'The Security Engineer',
    emoji: '🛡️',
    skill: 7,
    baseEnergy: 65,
    ego: 6,
    quirk: { name: 'Rubber-stamp denial', desc: 'Blocks deploys, hardens modules, helps nobody' },
    workMod: 0.6,
    bugChance: 0.02,
    quirkChance: 0.3,
  },
  {
    id: 'devrel',
    name: 'The DevRel',
    emoji: '🎤',
    skill: 3,
    baseEnergy: 75,
    ego: 7,
    quirk: { name: 'Conference circuit', desc: 'Ships nothing, brings in sponsorship money' },
    workMod: 0.3,
    bugChance: 0.05,
    quirkChance: 0.3,
  },
  {
    id: 'zealot',
    name: 'The Test Zealot',
    emoji: '🧪',
    skill: 7,
    baseEnergy: 65,
    ego: 6,
    quirk: { name: 'Test tunnel vision', desc: 'Only writes tests, no features' },
    workMod: 0.85,
    bugChance: 0.03,
    quirkChance: 0.25,
  },
];

export const ARCHETYPE_MAP: Record<string, Archetype> = Object.fromEntries(
  ARCHETYPES.map((a) => [a.id, a]),
);

export const NAMES = [
  'Priya', 'Marcus', 'Yuki', 'Derek', 'Sofia', 'Tunde', 'Alex', 'Nina',
  'Viktor', 'Hana', 'Omar', 'Jess', 'Chen', 'Ravi', 'Lena', 'Kofi',
];

export const MODULE_DEFS: Module[] = [
  { id: 'gateway', name: 'API Gateway', health: 80, debt: 20 },
  { id: 'auth', name: 'Auth Service', health: 75, debt: 25 },
  { id: 'payments', name: 'Payments', health: 70, debt: 35 },
  { id: 'pipeline', name: 'Data Pipeline', health: 65, debt: 40 },
  { id: 'mobile', name: 'Mobile App', health: 78, debt: 15 },
  { id: 'monolith', name: 'Legacy Monolith', health: 55, debt: 65 },
];

export const TICKET_TEMPLATES: Record<
  TicketType,
  { title: string; moduleId: string; effort: number }[]
> = {
  feature: [
    { title: 'Implement SSO', moduleId: 'auth', effort: 18 },
    { title: 'Dark mode toggle', moduleId: 'mobile', effort: 10 },
    { title: 'Usage-based billing', moduleId: 'payments', effort: 22 },
    { title: 'Push notifications', moduleId: 'mobile', effort: 14 },
    { title: 'AI-powered search', moduleId: 'gateway', effort: 25 },
    { title: 'CSV export', moduleId: 'pipeline', effort: 8 },
  ],
  bug: [
    { title: 'NPE in checkout flow', moduleId: 'payments', effort: 10 },
    { title: 'Race condition in webhooks', moduleId: 'gateway', effort: 14 },
    { title: 'Memory leak in report job', moduleId: 'pipeline', effort: 12 },
    { title: 'CORS errors on staging', moduleId: 'gateway', effort: 7 },
    { title: 'Double charge in payments', moduleId: 'payments', effort: 15 },
    { title: 'Session expiry loop', moduleId: 'auth', effort: 9 },
  ],
  epic: [
    { title: 'Migrate to Kubernetes', moduleId: 'gateway', effort: 35 },
    { title: 'Multi-tenant refactor', moduleId: 'monolith', effort: 42 },
    { title: 'Replatform data warehouse', moduleId: 'pipeline', effort: 38 },
  ],
};

export const SLACK_CHANNELS = ['#dev-team', '#random', '#incidents', '#announcements'];

export const SLACK_IDLE = [
  'anyone else seeing CI be weird or is it just me',
  'lunch? 🍜',
  'hot take: the roadmap is a vibe',
  'I have not touched the codebase since 2019 and I am FINE',
  'standup could have been a calendar invite',
  'who renamed the staging env again',
  'deploying on friday is a lifestyle',
  'my IDE just said something unkind about my code',
];

export const SLACK_ARGUMENTS = [
  'we need to talk about the architecture. again.',
  'this PR is a crime against humanity',
  'can we PLEASE stop debating naming conventions',
  'I will not be reviewing another 4k-line diff',
  'someone put a TODO in PRODUCTION',
  'the monolith is not "a strategic choice", it is a hostage',
];

export const SLACK_PANIC = [
  'STAGING IS DOWN. I repeat. STAGING IS DOWN.',
  'the pager is not a toy',
  'I am deleting my branch. everything is fine.',
  'why is prod talking to the sandbox db',
];

export interface GameEvent {
  name: string;
  weight: number;
  apply: (state: import('./types').GameState) => void;
}
