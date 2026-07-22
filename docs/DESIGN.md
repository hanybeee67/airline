# Sky Airline Tycoon — Design

A browser-based airline management simulation inspired by Koei's *Air
Management 2*. You found an airline, fly a modern fleet across a real world
map, and compete with three AI carriers for passengers while managing crew,
debt, and the shocks of a live market.

## Architecture

The **engine** (`src/engine/`) is pure, framework-free TypeScript with unit
tests. The **UI** (`src/components/`, `src/map/`) is React and only reads
engine state + dispatches engine actions via `src/state/GameContext.tsx`.

### World model

Everything lives in a `World`: an array of `Airline`s (index 0 is the player),
active `GameEvent`s, the player's monthly report `history`, and an event log.
Each turn is one month, advanced by `advanceMonth(world)` in `world.ts`.

### Systems (all implemented)

- **Modern fleet** (`data.ts`) — real current-gen aircraft: Embraer E195-E2,
  Airbus A220-300 / A321neo / A350-900, Boeing 737 MAX 8 / 787-9 / 777-9, with
  realistic seats, range, cruise speed, fuel burn, and prices.
- **Real airports** (`data.ts`) — 22 airports with true coordinates and
  `marketSize` set from recent annual passenger throughput; major hubs flagged.
- **Demand & competition** (`demand.ts`, `market.ts`) — a gravity model sets
  each city pair's total monthly demand; `resolveMarket` splits it across every
  competing operator by fare, frequency, and reputation, capped by capacity.
- **Competitor AI** (`ai.ts`) — three rival carriers deploy idle aircraft,
  keep crew staffed, and expand their fleets each month.
- **Loans & financing** (`loans.ts`) — amortizing loans capped by net-worth
  leverage; monthly interest + principal; bankruptcy after sustained insolvency.
- **Crew & training** (`crew.ts`) — hiring costs money and takes a month to
  train; aircraft without crew are grounded (still costing lease + maintenance).
- **Hub connections** (`market.ts`) — passengers routing A→hub→B add connecting
  traffic to an airline's own feeder + onward legs through hub airports.
- **Random events** (`events.ts`) — fuel spikes/drops, recessions, booms, and
  targeted strikes/incidents apply temporary demand and fuel modifiers.

### Map rendering

`src/map/worldPaths.ts` is pre-projected Natural Earth 110m land (public
domain) as equirectangular SVG paths. `WorldMap.tsx` draws the ocean, land,
graticule, market-sized airport nodes, and each route as a real great-circle
arc (`geo.greatCirclePath`) — the player's routes glow, competitors' are
dashed. The map is the fullscreen backdrop; a Fullscreen API toggle lives in
the HUD.

## Possible future work

Multi-leg aircraft rotations, alliances/codeshares, an IPO/stock market,
seasonal demand curves, and per-airport slot limits.

## Commands

```
npm install
npm run dev     # http://localhost:5173
npm test        # vitest engine tests
npm run build   # typecheck + production bundle
```
