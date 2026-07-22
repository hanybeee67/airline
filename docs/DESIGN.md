# Sky Airline Tycoon — Design & Roadmap

A browser-based airline management simulation inspired by Koei's *Air
Management 2*. The player founds an airline, buys or leases aircraft, opens
routes between airports, sets fares and frequency, and advances month by
month while competing for passengers and staying solvent.

## Current state (v0)

**Engine** (`src/engine/`, framework-free, unit tested):

- `types.ts` — domain model: `Airport`, `AircraftType`, `OwnedAircraft`,
  `Route`, `Company`, `MonthlyReport`.
- `data.ts` — seed data: 10 airports, 3 aircraft types (regional, narrowbody,
  widebody).
- `geo.ts` — haversine distance between airports.
- `demand.ts` — gravity-model demand: market size of both endpoints, distance,
  fare (elasticity around a reference fare/km), frequency (diminishing
  returns), and company reputation.
- `rules.ts` — per-aircraft route feasibility: max sustainable weekly
  frequency from cruise speed and a weekly utilization-hours budget; range
  checks.
- `company.ts` — pure state transitions: buy/sell/lease aircraft, open/close
  routes, set fare/frequency. Each aircraft is dedicated to at most one route.
- `simulation.ts` — advances one month: computes passengers (capped by
  capacity), revenue, fuel + crew operating cost, lease cost, condition-
  adjusted maintenance, net income, and nudges reputation from load factor and
  profitability.

**UI** (`src/components/`, React + TypeScript, state via `useReducer` in
`state/GameContext.tsx`): start screen, dashboard (KPIs + last month by
route), fleet market + owned fleet, route editor, and financial history.

This is a real, playable loop — not a mockup: found an airline, buy a plane,
open a route, advance the month, watch the P&L. But it is a fraction of what
*Air Management 2* actually simulated. The rest is roadmap.

## Roadmap toward the full simulation

Roughly in the order that adds the most gameplay depth per unit of effort:

1. **Competitor airlines.** AI-controlled companies that also open routes,
   compete for the same demand pool, and adjust fares. Requires splitting
   `estimateMonthlyDemand`'s captured share by relative frequency/fare/
   reputation across all operators on a route, not just one.
2. **Financing.** Loans and aircraft financing (down payment + monthly
   payments + interest) instead of only cash-or-lease. Bankruptcy / game-over
   condition when cash goes negative and stays there.
3. **Crew & training.** Hiring pools, training costs/time, crew shortages
   capping how many aircraft can fly, morale affecting reputation.
4. **Multi-leg routing & hubs.** Aircraft assigned to a chain of city pairs
   (today: one aircraft = one direct route) with connecting-passenger demand
   through hub airports.
5. **Random events.** Fuel price shocks, recessions, strikes, weather delays,
   PR incidents — modeled as temporary multipliers on demand/cost feeding
   into the monthly simulation.
6. **Alliances & codeshares, stock market / IPO, world map UI with real
   flight paths** — later-stage systems, once the above core loop is proven
   fun.

Each item should land as: engine functions + unit tests first, UI wiring
second — the same pattern used for v0.

## Running it

```
npm install
npm run dev     # http://localhost:5173
npm test        # vitest, engine unit tests
npm run build   # typecheck + production bundle
```
