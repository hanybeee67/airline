import type { Airline } from "./types";
import { AIRCRAFT_TYPES, AIRPORTS, findAircraftType, findAirport } from "./data";
import { distanceKm } from "./geo";
import { isRouteDistanceValid, maxWeeklyFrequency } from "./rules";
import { buyAircraft, crewRequiredForRoutes, openRoute } from "./airline";
import { hireCrew } from "./crew";
import { REFERENCE_FARE_PER_KM } from "./constants";

interface Rng {
  (): number;
}

function pick<T>(rng: Rng, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/**
 * One month of competitor decision-making: keep enough crew, deploy idle
 * aircraft onto plausible hub routes, and expand the fleet when flush with cash.
 * Deliberately modest so the player can out-manage the AI.
 */
export function runAiTurn(airline: Airline, month: number, rng: Rng): Airline {
  let next = airline;

  // Deploy any idle aircraft onto a new route.
  const idle = next.fleet.filter(
    (a) => !next.routes.some((r) => r.assignedAircraftId === a.id),
  );
  for (const aircraft of idle) {
    const route = planRoute(next, aircraft.id, rng);
    if (route) {
      try {
        next = openRoute(next, route);
      } catch {
        // Skip infeasible plans.
      }
    }
  }

  // Keep crew ahead of what the network needs.
  const needed = crewRequiredForRoutes(next);
  const have = next.crew.employed + next.crew.inTraining.reduce((s, b) => s + b.count, 0);
  if (needed > have) {
    try {
      next = hireCrew(next, needed - have + 4, month);
    } catch {
      // Can't afford crew right now.
    }
  }

  // Expand the fleet when there is comfortable cash and no idle metal.
  const stillIdle = next.fleet.some(
    (a) => !next.routes.some((r) => r.assignedAircraftId === a.id),
  );
  if (!stillIdle && rng() < 0.5) {
    const affordable = AIRCRAFT_TYPES.filter((t) => t.purchasePrice < next.cash * 0.6);
    if (affordable.length > 0) {
      try {
        next = buyAircraft(next, pick(rng, affordable).id, "owned");
      } catch {
        // Ignore.
      }
    } else if (rng() < 0.5) {
      try {
        next = buyAircraft(next, pick(rng, AIRCRAFT_TYPES).id, "leased");
      } catch {
        // Ignore.
      }
    }
  }

  return next;
}

function planRoute(
  airline: Airline,
  aircraftId: string,
  rng: Rng,
): { originCode: string; destCode: string; assignedAircraftId: string; weeklyFrequency: number; fare: number } | null {
  const aircraft = airline.fleet.find((a) => a.id === aircraftId);
  if (!aircraft) return null;
  const type = findAircraftType(aircraft.aircraftTypeId);

  const hubs = AIRPORTS.filter((a) => a.hub);
  for (let attempt = 0; attempt < 12; attempt++) {
    const origin = pick(rng, hubs);
    const dest = pick(rng, AIRPORTS);
    if (origin.code === dest.code) continue;

    const distance = distanceKm(findAirport(origin.code), findAirport(dest.code));
    if (!isRouteDistanceValid(type, distance)) continue;

    const maxFreq = maxWeeklyFrequency(type, distance);
    if (maxFreq < 1) continue;

    const freq = Math.max(1, Math.min(maxFreq, Math.round(maxFreq * (0.4 + rng() * 0.4))));
    const fare = Math.round(distance * REFERENCE_FARE_PER_KM * (0.9 + rng() * 0.3));
    return { originCode: origin.code, destCode: dest.code, assignedAircraftId: aircraftId, weeklyFrequency: freq, fare };
  }
  return null;
}
