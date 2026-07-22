# Sky Airline Tycoon

A browser-based airline management simulation inspired by Koei's
*Air Management 2*, built with React + TypeScript + Vite.

Found an airline, fly a **modern fleet** (A321neo, 787-9, A350-900, 777-9, …)
across a **real world map**, open routes as great-circle flight paths, hire and
train crew, borrow to expand, ride out market shocks — and outmanoeuvre three
AI carriers competing for the same passengers.

## Quick start

```
npm install
npm run dev     # play at http://localhost:5173
npm test        # engine unit tests (vitest)
npm run build   # typecheck + production bundle
```

The game opens fullscreen on the world map. Use **☰ Manage** to open the
Fleet / Routes / Crew / Finance / Rivals / Events panels, and **Advance month →**
to run the simulation forward. **⤢ Fullscreen** toggles true browser fullscreen.

## How to play

1. **Fleet** — buy or lease an aircraft (leasing needs no upfront cash).
2. **Crew** — hire crew (1-month training). Aircraft without crew stay grounded.
3. **Routes** — assign the aircraft to a city pair within its range, set weekly
   frequency and fare.
4. **Advance month** — see passengers, load factor, and profit in **Overview**.
5. Grow: cheaper fares / more frequency / higher reputation win market share
   from rivals; build feeder routes through hubs for connecting traffic; take
   **loans** to buy widebodies for dense long-haul markets.

## Deploying to Render

This is a static single-page app. Two ways:

**Blueprint (recommended):** the repo includes `render.yaml`. In Render, choose
**New + → Blueprint**, connect this repo, and it fills everything in.

**Manual static site:** New + → **Static Site**, then set:

| Setting | Value |
| --- | --- |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |
| Rewrite rule | `/*` → `/index.html` (Action: Rewrite) |
| Environment variable | `NODE_VERSION` = `22` |

No server or database is needed — the whole game runs in the browser.

## Project layout

- `src/engine/` — framework-free simulation (demand, competitive market,
  loans, crew, hub connections, events, competitor AI), fully unit tested.
- `src/map/` — pre-projected Natural Earth land + equirectangular projection.
- `src/components/` — HUD, world map, and the management panels.
- `src/state/` — React game state bridging engine ↔ UI.
- `docs/DESIGN.md` — architecture and systems overview.
