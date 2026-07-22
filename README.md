# Sky Airline Tycoon

A browser-based airline management simulation inspired by Koei's
*Air Management 2*, built with React + TypeScript + Vite.

Found an airline, buy or lease aircraft, open routes, set fares and weekly
frequency, then advance month by month while keeping the P&L in the black.

## Quick start

```
npm install
npm run dev     # play at http://localhost:5173
npm test        # engine unit tests (vitest)
npm run build   # typecheck + production bundle
```

## Project layout

- `src/engine/` — framework-free simulation engine (demand model, route
  rules, company actions, monthly simulation), fully unit tested.
- `src/state/` — React game state (`useReducer` + context) bridging the
  engine to the UI.
- `src/components/` — start screen, dashboard, fleet, routes, finance panels.
- `docs/DESIGN.md` — current systems and the roadmap toward a full
  *Air Management 2*-style simulation (competitor AI, financing, crew,
  hubs, events).
