import type { Airline, Airport, Route, World } from "./types";
import { findAircraftType, findAirport } from "./data";
import { distanceKm } from "./geo";
import { serviceAttractiveness, fareFactor, totalMarketDemand } from "./demand";
import { CONNECTION_DEMAND_SHARE, WEEKS_PER_MONTH } from "./constants";

export interface ServiceOutcome {
  routeId: string;
  airlineId: string;
  directPassengers: number;
  connectingPassengers: number;
  capacity: number;
}

interface ServiceContext {
  route: Route;
  airline: Airline;
  origin: Airport;
  dest: Airport;
  distance: number;
  capacity: number;
  attractiveness: number;
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("-");
}

function buildServices(world: World): ServiceContext[] {
  const services: ServiceContext[] = [];
  for (const airline of world.airlines) {
    if (airline.bankrupt) continue;
    for (const route of airline.routes) {
      const aircraft = airline.fleet.find((a) => a.id === route.assignedAircraftId);
      if (!aircraft) continue;
      const type = findAircraftType(aircraft.aircraftTypeId);
      const origin = findAirport(route.originCode);
      const dest = findAirport(route.destCode);
      const distance = distanceKm(origin, dest);
      const capacity = type.seats * route.weeklyFrequency * WEEKS_PER_MONTH;
      services.push({
        route,
        airline,
        origin,
        dest,
        distance,
        capacity,
        attractiveness: serviceAttractiveness(
          route.fare,
          distance,
          route.weeklyFrequency,
          airline.reputation,
        ),
      });
    }
  }
  return services;
}

/**
 * Resolves every route in the world into direct + connecting passengers,
 * splitting each city pair's demand among all competing operators.
 */
export function resolveMarket(
  world: World,
  demandMultiplier: number,
): Map<string, ServiceOutcome> {
  const services = buildServices(world);
  const outcomes = new Map<string, ServiceOutcome>();
  for (const svc of services) {
    outcomes.set(svc.route.id, {
      routeId: svc.route.id,
      airlineId: svc.airline.id,
      directPassengers: 0,
      connectingPassengers: 0,
      capacity: svc.capacity,
    });
  }

  // --- Direct origin/destination demand, split among competitors ---
  const groups = new Map<string, ServiceContext[]>();
  for (const svc of services) {
    const key = pairKey(svc.route.originCode, svc.route.destCode);
    const list = groups.get(key) ?? [];
    list.push(svc);
    groups.set(key, list);
  }

  for (const group of groups.values()) {
    const { origin, dest, distance } = group[0];
    const total = totalMarketDemand(origin, dest, distance) * demandMultiplier;

    const sumAttr = group.reduce((s, svc) => s + svc.attractiveness, 0);
    // How much of the market actually flies, given the prevailing fares.
    const weightedFareAppeal =
      group.reduce((s, svc) => s + fareFactor(svc.route.fare, distance) * svc.attractiveness, 0) /
      Math.max(sumAttr, 1e-9);
    const captured = total * Math.min(1.6, weightedFareAppeal);

    for (const svc of group) {
      const share = sumAttr > 0 ? svc.attractiveness / sumAttr : 0;
      const outcome = outcomes.get(svc.route.id)!;
      outcome.directPassengers = Math.min(svc.capacity, captured * share);
    }
  }

  // --- Connecting traffic feeding through an airline's own hubs ---
  addConnectingDemand(services, outcomes, demandMultiplier);

  return outcomes;
}

function addConnectingDemand(
  services: ServiceContext[],
  outcomes: Map<string, ServiceOutcome>,
  demandMultiplier: number,
): void {
  const byAirline = new Map<string, ServiceContext[]>();
  for (const svc of services) {
    const list = byAirline.get(svc.airline.id) ?? [];
    list.push(svc);
    byAirline.set(svc.airline.id, list);
  }

  for (const svcs of byAirline.values()) {
    for (const leg1 of svcs) {
      if (!leg1.dest.hub) continue;
      for (const leg2 of svcs) {
        if (leg2.origin.code !== leg1.dest.code) continue;
        if (leg2.dest.code === leg1.origin.code) continue;

        const throughDistance = leg1.distance + leg2.distance;
        const potential =
          totalMarketDemand(leg1.origin, leg2.dest, throughDistance) *
          demandMultiplier *
          CONNECTION_DEMAND_SHARE;

        const o1 = outcomes.get(leg1.route.id)!;
        const o2 = outcomes.get(leg2.route.id)!;
        const spare1 = Math.max(0, o1.capacity - o1.directPassengers - o1.connectingPassengers);
        const spare2 = Math.max(0, o2.capacity - o2.directPassengers - o2.connectingPassengers);
        const carried = Math.min(potential, spare1, spare2);
        if (carried <= 0) continue;

        o1.connectingPassengers += carried;
        o2.connectingPassengers += carried;
      }
    }
  }
}
