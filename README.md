# ETCS — Engineering Team Chaos Simulator

> Your minions are AI software engineers with egos, quirks, and a shared hatred of standup.
> You don't write code — you manage the environment, assign Jira tickets, enforce
> architecture, and try to stop the system from collapsing before the end of the quarter.

ETCS is a real-time management sim where the gameplay *is* the corporate dashboard:
a live Jira board, a simulated team Slack, and a system-architecture health map.
Every second is one working hour. Every day ends with consequences.

## How to play

1. Pick your role:
   - **📋 Product Owner** — write precise specs (vague specs produce vague, broken outcomes), add tickets, cut scope.
   - **🧯 Engineering Manager** — run 1:1s, do hands-on code reviews, mediate review wars, enforce architectural guidelines.
   - **💼 CIO** — hire, fire, invest in infrastructure. OKRs are on by default.
2. **Assign work**: click a minion in the roster, then click a ticket (or use the dropdown on the ticket card).
3. **Spend Action Points** (3/day) on your role's tools.
4. **Watch the system**: modules rot with tech debt, bugs cascade to neighbors, and overdue tickets fester.
5. **Win**: survive 30 days with 50%+ system stability.
   **Lose**: stability hits ~0 (system collapse) or the budget dies (bankrupt).

Useful habits: keep bug tickets moving (they heal the system), rest tired engineers
before they burn out, and mediate review wars the moment they start.

### Seeds, saves, and achievements

- **Seeded runs** — the title screen shows an 8-character seed (re-roll with 🎲, or
  click to type your own). The same seed + same actions replays the same chaos,
  so you can share runs and retry a seed to beat it.
- **Autosave** — the quarter saves at the end of every day (plus safety-net saves
  when you switch tabs or close the page). A **▶ Continue** button appears on the
  title screen while a quarter is in flight.
- **Leaderboard** — your best quarters per role are kept locally (result, day,
  stability, tickets shipped, seed) and shown on the title screen.
- **Achievements** — 10 satirical honors ("Layoff Season", "The Purple Button",…)
  unlock across quarters and accumulate in your browser.

## The mechanics

- **12 engineer archetypes** — each with skill, ego, work rate, bug rate, and a
  behavioral quirk, plus its own satirical git-commit and Slack-rant text pools.
  When burnout exceeds 80, rants override everything.
- **Ticket pipeline** — Backlog → In Progress → Review/QA → Production.
  QA pass odds depend on spec clarity and tech debt; failures send tickets back with a regression.
- **⚔️ Code Review Trap** — a cowboy-type dev reviewing a perfectionist's merge request
  ignites a Slack flame war. Both burnouts spike and the ticket stalls in limbo
  until someone mediates.
- **🍝 Spaghetti Cascades** — pushing code into a high-tech-debt module can spawn
  hidden bugs in *adjacent* modules. Watch the health map in real time.
- **📢 PM Interruptions** — the Product Manager NPC periodically pings a developer to
  "just change this one quick thing", wiping out a chunk of their current progress.
- **Burnout cycles** — working drains energy and builds burnout; at 100 the engineer
  takes forced leave. Managing the roster's rhythm is half the game.
- **Random events** — breaking dependency releases, 3am on-call pages, compliance
  audits, hackathons, CEO tweets, competitor launches…
- **Seeded RNG** — all randomness flows through a mulberry32 `RngEngine` (8-char
  alphanumeric seeds), so seeded quarters are fully reproducible. Unseeded runs
  fall back to `Math.random()`.

## Tech

- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- The simulation is **pure TypeScript with zero React dependencies** — the UI just renders
  whatever the engines produce, and the game tick is a pure function safe for `setState` updaters.

### Project structure

```
src/
├── engine/                    # Pure TS simulation (no React)
│   ├── types.ts               # GameState, Engineer, Ticket, Module…
│   ├── data.ts                # Archetypes, ticket templates, modules
│   ├── flavor.ts              # Satirical text matrix + burnout-priority selection
│   ├── DeveloperEngine.ts     # Per-hour work ticks, quirks, burnout, cascades
│   ├── CodebaseEngine.ts      # Bug spawning, debt drift, cascading failures
│   ├── TicketEngine.ts        # Pipeline transitions + Code Review Trap
│   ├── GameEngine.ts          # newGame, runGameTick, events, player actions
│   ├── seeded-rng.ts          # mulberry32 RngEngine + 8-char seeds
│   ├── save.ts                # Autosave/load (validated, PRNG-aware)
│   ├── meta.ts                # Cross-quarter run records (leaderboard data)
│   ├── achievements.ts        # 10 satirical achievements, persisted unlocks
│   └── util.ts                # RNG-routed helpers, logging, stability
│   └── __tests__/engine.test.ts  # Vitest suite (24 tests)
├── components/                # React UI (the "corporate dashboard")
│   ├── StatusBar.tsx          # Clock, AP, stability/debt bars, pause, role actions
│   ├── ArchitectureGraph.tsx  # Module health map
│   ├── JiraBoard.tsx          # 4-column board, click-to-assign
│   ├── SlackClone.tsx         # Team chat feed + burnout meter
│   ├── EngineerRoster.tsx     # Minion cards with energy/morale/burnout
│   ├── OpsLog.tsx             # Recent events
│   ├── StartScreen.tsx        # Role select, seed input, continue, leaderboard
│   ├── TitleTerminal.tsx      # Satirical typewriter terminal on the title screen
│   ├── Leaderboard.tsx        # Best quarters per role
│   └── GameOverScreen.tsx     # Outcome + stats + new achievements
└── App.tsx                    # Game loop: 1s interval → runGameTick
scripts/
└── smoke.ts                   # Headless bot that plays full games (balance testing)
```

## Development

```bash
npm install
npm run dev        # start dev server
npm run build      # type-check + production build → dist/
npm run test       # run the Vitest suite once
npm run test:watch # run tests in watch mode
npm run simulate   # play 15 headless games and print outcomes (balance tuning)
```

## Deployment (GitHub Pages)

The build uses relative asset paths (`base: './'` in `vite.config.ts`), so `dist/`
works at any subpath — including `https://<user>.github.io/<repo>/`.
Two workflows run on every push/PR:

- **CI** (`.github/workflows/ci.yml`) — installs deps, runs the Vitest suite,
  type-checks, and builds.
- **Deploy** (`.github/workflows/deploy.yml`) — on `main`, builds and publishes
  `dist/` to GitHub Pages. `public/_headers` sends `Cache-Control: no-cache` so
  a deploy always wins over browser caches.

---

*No engineers (biological or artificial) were harmed during the making of this game.
Several were mildly demotivated.*
