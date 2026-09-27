# ETCS — Gameplay Guide

## How to Play

1. **Pick your role** (swipeable carousel):
   - **📋 Product Owner** — write precise specs (vague specs produce vague, broken outcomes), add tickets, cut scope.
   - **🧯 Engineering Manager** — run 1:1s, do hands-on code reviews, mediate review wars, enforce architectural guidelines.
   - **💼 CIO** — hire, fire, invest in infrastructure. OKRs are on by default.

2. **Assign work**: tap a minion in the Roster, then tap a ticket on the JIRA board.
3. **Spend Action Points** (3/day) on your role's tools.
4. **Watch the system**: modules rot with tech debt, bugs cascade to neighbors, and overdue tickets fester.
5. **Win**: survive 30 days with 50%+ system stability.
   **Lose**: stability hits ~0 (system collapse) or the budget dies (bankrupt).

### Useful Habits

- Keep bug tickets moving (they heal the system)
- Rest tired engineers before they burn out
- Mediate review wars the moment they start
- Watch the Grafana dashboard for cascading module failures

---

## The Mechanics

### Engineers

- **12 archetypes** — each with skill, ego, work rate, bug rate, and a behavioral quirk, plus its own satirical git-commit and Teams-rant text pools.
- **Burnout cycles** — working drains energy and builds burnout; at 100 the engineer takes forced leave. At 80+, rants override everything.
- **55-name pool** — randomly assigned per run.

### Ticket Pipeline

Backlog → In Progress → Review/QA → Production (DONE)

- QA pass odds depend on spec clarity and tech debt
- Failures send tickets back with a regression
- Overdue tickets fester and drain stability

### Special Events

- **⚔️ Code Review Trap** — a cowboy-type dev reviewing a perfectionist's MR ignites a Teams flame war. Both burnouts spike, ticket stalls until mediated.
- **🍝 Spaghetti Cascades** — pushing code into a high-tech-debt module can spawn hidden bugs in *adjacent* modules.
- **📢 PM Interruptions** — the PM NPC pings a dev to "just change this one quick thing", wiping out progress.
- **Random events** — breaking dependency releases, 3am on-call pages, compliance audits, hackathons, CEO tweets, competitor launches…

### 🤖 AI & Overreliance

- Random AI events fire during the game (AI-generated commits, AI hallucinations, etc.)
- AI overreliance builds up over time, debuffing team progress and morale
- The overreliance meter decays when you stop relying on AI

### Seeded RNG

All randomness flows through a mulberry32 `RngEngine` (8-char alphanumeric seeds), so seeded runs are fully reproducible. Unseeded runs fall back to `Math.random()`.

---

## Seeds, Saves & Progression

- **Seeded runs** — the title screen shows an 8-character seed (re-roll with 🎲, or click to type your own). Same seed + same actions = same chaos.
- **Autosave** — saves at end of every day (plus safety-net saves on tab switch/page close). A **▶ Continue** button appears while a quarter is in flight.
- **Leaderboard** — best quarters per role kept locally (result, day, stability, tickets shipped, seed).
- **Achievements** — 10 satirical honors ("Layoff Season", "The Purple Button"…) unlock across quarters.
- **3 Themes** — Normal (default dark), Deep Dark, and Light mode. Set in Options → Settings.
