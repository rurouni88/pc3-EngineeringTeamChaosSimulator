# ETCS — Contributing

## Setup

```bash
npm install
npm run dev        # start dev server
npm run build      # type-check + production build → dist/
npm run test       # run the Vitest suite once (24 tests, <1s)
npm run test:watch # run tests in watch mode
npm run simulate   # play 15 headless games and print outcomes (balance tuning)
```

## Tech Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite 8](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- The simulation is **pure TypeScript with zero React dependencies** — the UI just renders whatever the engines produce, and the game tick is a pure function safe for `setState` updaters.

## Project Structure

```
src/
├── engine/                    # Pure TS simulation (no React)
│   ├── types.ts               # GameState, Engineer, Ticket, Module…
│   ├── data.ts                # Archetypes (12), ticket templates, modules (6), names (55)
│   ├── flavor.ts              # Satirical text matrix + burnout-priority selection
│   ├── DeveloperEngine.ts     # Per-hour work ticks, quirks, burnout, cascades
│   ├── CodebaseEngine.ts      # Bug spawning, debt drift, cascading failures
│   ├── TicketEngine.ts        # Pipeline transitions + Code Review Trap
│   ├── GameEngine.ts          # newGame, runGameTick, events, player actions
│   ├── AiEngine.ts            # AI events, overreliance mechanic
│   ├── seeded-rng.ts          # mulberry32 RngEngine + 8-char seeds
│   ├── save.ts                # Autosave/load (validated, PRNG-aware)
│   ├── meta.ts                # Cross-quarter run records (leaderboard data)
│   ├── achievements.ts        # 10 satirical achievements, persisted unlocks
│   └── util.ts                # RNG-routed helpers, logging, stability
│   └── __tests__/engine.test.ts  # Vitest suite (24 tests)
├── components/                # React UI (the "corporate dashboard")
│   ├── StatusBar.tsx          # Clock, AP, stability/debt bars, pause, role actions
│   ├── ChaosBoard.tsx         # Animated dashboard preview on title screen
│   ├── ChaosBoardLive.tsx     # Live Grafana-style module health (mobile System tab)
│   ├── JiraBoard.tsx          # Vertical ticket list + custom AssigneePicker
│   ├── TeamsClone.tsx         # Microsoft Teams chat feed + burnout meter
│   ├── EngineerRoster.tsx     # Minion cards with energy/morale/burnout
│   ├── OpsLog.tsx             # Recent events (3 entries)
│   ├── StartScreen.tsx        # Role carousel, seed input, continue, modals
│   ├── RoleSelector.tsx       # Swipeable/draggable role carousel (PO/EM/CIO)
│   ├── AchievementModal.tsx   # Unlocked/locked achievements
│   ├── HelpModal.tsx          # How to play guide
│   ├── OptionsModal.tsx       # Tabbed: Settings (inline) | Stats | Reset
│   ├── LeaderboardModal.tsx   # Best quarters per role
│   ├── GameOverScreen.tsx     # Outcome + stats + new achievements
│   ├── ReorderableTabs.tsx    # Long-press drag-and-drop tab reordering (mobile)
│   └── Tooltip.tsx            # Reusable tooltip component
└── App.tsx                    # Game loop: 1s interval → runGameTick
scripts/
└── smoke.ts                   # Headless bot that plays full games (balance testing)
```

## Coding Standards

See [CODING_STANDARDS.md](CODING_STANDARDS.md) for naming conventions, security rules, and patterns.

Key rules:
- All randomness in game logic goes through `RngEngine` (seeded) — no raw `Math.random()`
- Engine functions mutate state in place; caller is responsible for `structuredClone`
- Use `rand(min, max)` from `util.ts` for all game logic randomness
- Theme-aware colors via CSS variables (`--bg-primary`, `--text-secondary`, etc.)
- Mobile-first: touch targets ≥44px, no browser-native dropdowns in game UI

## Deployment (GitHub Pages)

The build uses relative asset paths (`base: './'` in `vite.config.ts`), so `dist/`
works at any subpath — including `https://<user>.github.io/<repo>/`.

Two workflows run on every push/PR:

- **CI** (`.github/workflows/pr-checks.yml`) — installs deps, runs the Vitest suite,
  type-checks, and builds.
- **Deploy** (`.github/workflows/deploy-pages.yml`) — on `main`, builds and publishes
  `dist/` to GitHub Pages.

Play: [https://rurouni88.github.io/pc3-EngineeringTeamChaosSimulator](https://rurouni88.github.io/pc3-EngineeringTeamChaosSimulator)
