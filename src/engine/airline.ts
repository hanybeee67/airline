import type { AcquisitionMode, Airline, OwnedAircraft, Route } from "./types";
import { findAircraftType, findAirport } from "./data";
import { distanceKm } from "./geo";
import { isRouteDistanceValid, maxWeeklyFrequency } from "./rules";

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/** Crew members needed to staff every aircraft currently assigned to a route. */
export function crewRequiredForRoutes(airline: Airline): number {
  return airline.routes.reduce((sum, route) => {
    const aircraft = airline.fleet.find((a) => a.id === route.assignedAircraftId);
    if (!aircraft) return sum;
    return sum + findAircraftType(aircraft.aircraftTypeId).crewRequired;
  }, 0);
}

export function buyAircraft(
  airline: Airline,
  aircraftTypeId: string,
  mode: AcquisitionMode,
): Airline {
  const type = findAircraftType(aircraftTypeId);
  if (mode === "owned" && airline.cash < type.purchasePrice) {
    throw new Error("Not enough cash to purchase this aircraft.");
  }

  const aircraft: OwnedAircraft = {
    id: newId("ac"),
    aircraftTypeId,
    acquisitionMode: mode,
    purchaseMonth: -1,
    condition: 100,
  };

  return {
    ...airline,
    cash: mode === "owned" ? airline.cash - type.purchasePrice : airline.cash,
    fleet: [...airline.fleet, aircraft],
  };
}

export function sellAircraft(airline: Airline, aircraftId: string): Airline {
  const aircraft = airline.fleet.find((a) => a.id === aircraftId);
  if (!aircraft) throw new Error("Aircraft not found in fleet.");
  if (airline.routes.some((r) => r.assignedAircraftId === aircraftId)) {
    throw new Error("Aircraft is assigned to a route; close the route first.");
  }

  const type = findAircraftType(aircraft.aircraftTypeId);
  const salvageValue =
    aircraft.acquisitionMode === "owned"
      ? type.purchasePrice * 0.55 * (aircraft.condition / 100)
      : 0;

  return {
    ...airline,
    cash: airline.cash + salvageValue,
    fleet: airline.fleet.filter((a) => a.id !== aircraftId),
  };
}

export interface OpenRouteInput {
  originCode: string;
  destCode: string;
  assignedAircraftId: string;
  weeklyFrequency: number;
  fare: number;
}

export function openRoute(airline: Airline, input: OpenRouteInput): Airline {
  const { originCode, destCode, assignedAircraftId, weeklyFrequency, fare } = input;

  if (originCode === destCode) throw new Error("Origin and destination must differ.");
  if (fare <= 0) throw new Error("Fare must be positive.");

  const aircraft = airline.fleet.find((a) => a.id === assignedAircraftId);
  if (!aircraft) throw new Error("Aircraft not found in fleet.");
  if (airline.routes.some((r) => r.assignedAircraftId === assignedAircraftId)) {
    throw new Error("Aircraft is already assigned to a route.");
  }

  const origin = findAirport(originCode);
  const dest = findAirport(destCode);
  const type = findAircraftType(aircraft.aircraftTypeId);
  const distance = distanceKm(origin, dest);

  if (!isRouteDistanceValid(type, distance)) {
    throw new Error(`${type.name} cannot reach ${destCode} from ${originCode} (out of range).`);
  }
  const maxFreq = maxWeeklyFrequency(type, distance);
  if (weeklyFrequency < 1 || weeklyFrequency > maxFreq) {
    throw new Error(`Weekly frequency must be between 1 and ${maxFreq} for this aircraft/route.`);
  }

  const route: Route = {
    id: newId("route"),
    originCode,
    destCode,
    assignedAircraftId,
    weeklyFrequency,
    fare,
    openedMonth: -1,
  };

  return { ...airline, routes: [...airline.routes, route] };
}

export function closeRoute(airline: Airline, routeId: string): Airline {
  return { ...airline, routes: airline.routes.filter((r) => r.id !== routeId) };
}

export function setFare(airline: Airline, routeId: string, fare: number): Airline {
  if (fare <= 0) throw new Error("Fare must be positive.");
  return {
    ...airline,
    routes: airline.routes.map((r) => (r.id === routeId ? { ...r, fare } : r)),
  };
}

export function setFrequency(
  airline: Airline,
  routeId: string,
  weeklyFrequency: number,
): Airline {
  const route = airline.routes.find((r) => r.id === routeId);
  if (!route) throw new Error("Route not found.");
  const aircraft = airline.fleet.find((a) => a.id === route.assignedAircraftId);
  if (!aircraft) throw new Error("Assigned aircraft not found.");

  const type = findAircraftType(aircraft.aircraftTypeId);
  const distance = distanceKm(findAirport(route.originCode), findAirport(route.destCode));
  const maxFreq = maxWeeklyFrequency(type, distance);
  if (weeklyFrequency < 1 || weeklyFrequency > maxFreq) {
    throw new Error(`Weekly frequency must be between 1 and ${maxFreq} for this aircraft/route.`);
  }

  return {
    ...airline,
    routes: airline.routes.map((r) => (r.id === routeId ? { ...r, weeklyFrequency } : r)),
  };
}
