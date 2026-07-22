import type { AcquisitionMode, Company, OwnedAircraft, Route } from "./types";
import { findAircraftType, findAirport } from "./data";
import { distanceKm } from "./geo";
import { isRouteDistanceValid, maxWeeklyFrequency } from "./rules";

const STARTING_CASH = 80_000_000;
const STARTING_REPUTATION = 50;

export function createCompany(name: string): Company {
  return {
    name,
    cash: STARTING_CASH,
    reputation: STARTING_REPUTATION,
    month: 0,
    fleet: [],
    routes: [],
    history: [],
  };
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function buyAircraft(
  company: Company,
  aircraftTypeId: string,
  mode: AcquisitionMode,
): Company {
  const type = findAircraftType(aircraftTypeId);
  if (mode === "owned" && company.cash < type.purchasePrice) {
    throw new Error("Not enough cash to purchase this aircraft.");
  }

  const aircraft: OwnedAircraft = {
    id: newId("ac"),
    aircraftTypeId,
    acquisitionMode: mode,
    purchaseMonth: company.month,
    condition: 100,
  };

  return {
    ...company,
    cash: mode === "owned" ? company.cash - type.purchasePrice : company.cash,
    fleet: [...company.fleet, aircraft],
  };
}

export function sellAircraft(company: Company, aircraftId: string): Company {
  const aircraft = company.fleet.find((a) => a.id === aircraftId);
  if (!aircraft) throw new Error("Aircraft not found in fleet.");
  if (company.routes.some((r) => r.assignedAircraftId === aircraftId)) {
    throw new Error("Aircraft is assigned to a route; close the route first.");
  }

  const type = findAircraftType(aircraft.aircraftTypeId);
  const salvageValue =
    aircraft.acquisitionMode === "owned"
      ? type.purchasePrice * 0.5 * (aircraft.condition / 100)
      : 0;

  return {
    ...company,
    cash: company.cash + salvageValue,
    fleet: company.fleet.filter((a) => a.id !== aircraftId),
  };
}

export interface OpenRouteInput {
  originCode: string;
  destCode: string;
  assignedAircraftId: string;
  weeklyFrequency: number;
  fare: number;
}

export function openRoute(company: Company, input: OpenRouteInput): Company {
  const { originCode, destCode, assignedAircraftId, weeklyFrequency, fare } = input;

  if (originCode === destCode) {
    throw new Error("Origin and destination must differ.");
  }
  const aircraft = company.fleet.find((a) => a.id === assignedAircraftId);
  if (!aircraft) throw new Error("Aircraft not found in fleet.");
  if (company.routes.some((r) => r.assignedAircraftId === assignedAircraftId)) {
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
    openedMonth: company.month,
  };

  return { ...company, routes: [...company.routes, route] };
}

export function closeRoute(company: Company, routeId: string): Company {
  return { ...company, routes: company.routes.filter((r) => r.id !== routeId) };
}

export function setFare(company: Company, routeId: string, fare: number): Company {
  if (fare <= 0) throw new Error("Fare must be positive.");
  return {
    ...company,
    routes: company.routes.map((r) => (r.id === routeId ? { ...r, fare } : r)),
  };
}

export function setFrequency(
  company: Company,
  routeId: string,
  weeklyFrequency: number,
): Company {
  const route = company.routes.find((r) => r.id === routeId);
  if (!route) throw new Error("Route not found.");
  const aircraft = company.fleet.find((a) => a.id === route.assignedAircraftId);
  if (!aircraft) throw new Error("Assigned aircraft not found.");

  const type = findAircraftType(aircraft.aircraftTypeId);
  const distance = distanceKm(findAirport(route.originCode), findAirport(route.destCode));
  const maxFreq = maxWeeklyFrequency(type, distance);
  if (weeklyFrequency < 1 || weeklyFrequency > maxFreq) {
    throw new Error(`Weekly frequency must be between 1 and ${maxFreq} for this aircraft/route.`);
  }

  return {
    ...company,
    routes: company.routes.map((r) => (r.id === routeId ? { ...r, weeklyFrequency } : r)),
  };
}
