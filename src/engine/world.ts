import type {
  Airline,
  MonthlyReport,
  RouteReport,
  World,
} from "./types";
import { findAircraftType, findAirport } from "./data";
import { distanceKm } from "./geo";
import { resolveMarket } from "./market";
import {
  activeEvents,
  airlineDemandModifier,
  globalModifiers,
  maybeGenerateEvent,
} from "./events";
import { runAiTurn } from "./ai";
import { buyAircraft } from "./airline";
import { graduateCrew } from "./crew";
import {
  BANKRUPTCY_GRACE_MONTHS,
  BASE_FUEL_PRICE_PER_LITER,
  CONDITION_DECAY_PER_MONTH,
  CONDITION_MAINTENANCE_THRESHOLD,
  CREW_COST_PER_MONTH,
  STARTING_CASH,
  WEEKS_PER_MONTH,
} from "./constants";

/** Deterministic PRNG so a given seed replays identically. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function emptyAirline(
  id: string,
  name: string,
  color: string,
  isPlayer: boolean,
): Airline {
  return {
    id,
    name,
    isPlayer,
    color,
    cash: STARTING_CASH,
    reputation: 50,
    fleet: [],
    routes: [],
    loans: [],
    crew: { employed: 0, inTraining: [] },
    negativeCashMonths: 0,
    bankrupt: false,
  };
}

const AI_SEEDS: { name: string; color: string }[] = [
  { name: "Aurora Atlantic", color: "#e0533d" },
  { name: "Pacific Meridian", color: "#2f9e6d" },
  { name: "Continental Star", color: "#c9922b" },
];

export function createWorld(playerName: string, seed = 20240722): World {
  const rng = mulberry32(seed);
  const player = emptyAirline("player", playerName, "#2f6feb", true);

  const airlines: Airline[] = [player];
  AI_SEEDS.forEach((s, i) => {
    let ai = emptyAirline(`ai-${i}`, s.name, s.color, false);
    ai = seedAiAirline(ai, rng);
    airlines.push(ai);
  });

  return {
    month: 0,
    airlines,
    events: [],
    history: [],
    eventLog: [],
    gameOver: false,
  };
}

/** Gives an AI airline a plausible starting network so competition exists from month 1. */
function seedAiAirline(airline: Airline, rng: () => number): Airline {
  let next = airline;
  const starterTypes = ["a321neo", "b737max8", "b787_9", "a220_300"];
  const count = 2;
  for (let i = 0; i < count; i++) {
    const typeId = starterTypes[Math.floor(rng() * starterTypes.length)];
    next = buyAircraft(next, typeId, "leased");
  }
  // Crew for the starter fleet plus a buffer.
  const crewNeeded = next.fleet.reduce(
    (s, a) => s + findAircraftType(a.aircraftTypeId).crewRequired,
    0,
  );
  next = { ...next, crew: { employed: crewNeeded + 6, inTraining: [] } };

  // Deploy the fleet.
  next = runAiTurn(next, 0, rng);
  return next;
}

/** Routes this airline has enough employed crew to operate this month. */
function crewableRouteIds(airline: Airline): Set<string> {
  const ids = new Set<string>();
  let used = 0;
  for (const route of airline.routes) {
    const aircraft = airline.fleet.find((a) => a.id === route.assignedAircraftId);
    if (!aircraft) continue;
    const req = findAircraftType(aircraft.aircraftTypeId).crewRequired;
    if (used + req <= airline.crew.employed) {
      used += req;
      ids.add(route.id);
    }
  }
  return ids;
}

export function advanceMonth(world: World): { world: World; report: MonthlyReport | null } {
  if (world.gameOver) return { world, report: null };

  const month = world.month + 1;
  const rng = mulberry32((world.month + 1) * 2654435761);

  // 1. Crew finishing training joins the workforce.
  let airlines = world.airlines.map((a) => graduateCrew(a, month));

  // 2. Competitors act.
  airlines = airlines.map((a) => (a.isPlayer || a.bankrupt ? a : runAiTurn(a, month, rng)));

  // 3. Possibly spawn a new event.
  const events = [...world.events];
  const eventLog = [...world.eventLog];
  const newEvent = maybeGenerateEvent({ ...world, airlines }, rng);
  if (newEvent) {
    events.push(newEvent);
    eventLog.push({ month, text: newEvent.title });
    if (newEvent.kind === "incident" && newEvent.targetAirlineId) {
      airlines = airlines.map((a) =>
        a.id === newEvent.targetAirlineId
          ? { ...a, reputation: Math.max(0, a.reputation - 8) }
          : a,
      );
    }
  }

  // 4. Environment for this month.
  const active = activeEvents({ ...world, events }, month);
  const { demandMultiplier, fuelMultiplier } = globalModifiers(active);
  const fuelPrice = BASE_FUEL_PRICE_PER_LITER * fuelMultiplier;

  // 5. Resolve the competitive market over crewable routes only.
  const crewable = new Map<string, Set<string>>();
  for (const a of airlines) crewable.set(a.id, crewableRouteIds(a));
  const marketWorld: World = {
    ...world,
    airlines: airlines.map((a) => ({
      ...a,
      routes: a.bankrupt ? [] : a.routes.filter((r) => crewable.get(a.id)!.has(r.id)),
    })),
  };
  const outcomes = resolveMarket(marketWorld, demandMultiplier);

  // 6. Book finances for each airline.
  let playerReport: MonthlyReport | null = null;
  airlines = airlines.map((airline) => {
    const { airline: updated, report } = settleAirline(
      airline,
      month,
      fuelPrice,
      outcomes,
      crewable.get(airline.id)!,
      airlineDemandModifier(active, airline.id),
    );
    if (airline.isPlayer) playerReport = report;
    return updated;
  });

  const player = airlines.find((a) => a.isPlayer)!;
  const gameOver = player.bankrupt;

  const nextWorld: World = {
    month,
    airlines,
    events,
    history: playerReport ? [...world.history, playerReport] : world.history,
    eventLog,
    gameOver,
  };

  return { world: nextWorld, report: playerReport };
}

function settleAirline(
  airline: Airline,
  month: number,
  fuelPrice: number,
  outcomes: Map<string, import("./market").ServiceOutcome>,
  crewableIds: Set<string>,
  targetedDemandModifier: number,
): { airline: Airline; report: MonthlyReport } {
  const fleet = airline.fleet.map((a) => ({ ...a }));

  let revenue = 0;
  let operatingCosts = 0;
  const routeReports: RouteReport[] = [];

  if (!airline.bankrupt) {
    for (const route of airline.routes) {
      const aircraft = fleet.find((a) => a.id === route.assignedAircraftId);
      if (!aircraft) continue;
      const type = findAircraftType(aircraft.aircraftTypeId);
      const distance = distanceKm(findAirport(route.originCode), findAirport(route.destCode));
      const capacity = type.seats * route.weeklyFrequency * WEEKS_PER_MONTH;
      const grounded = !crewableIds.has(route.id);
      const outcome = outcomes.get(route.id);

      const direct = grounded || !outcome ? 0 : outcome.directPassengers * targetedDemandModifier;
      const connecting =
        grounded || !outcome ? 0 : outcome.connectingPassengers * targetedDemandModifier;
      const passengers = Math.min(capacity, direct + connecting);
      const routeRevenue = passengers * route.fare;

      let routeOperatingCost = 0;
      if (!grounded) {
        const monthlyRoundTrips = route.weeklyFrequency * WEEKS_PER_MONTH;
        routeOperatingCost = type.fuelBurnPerKm * distance * 2 * fuelPrice * monthlyRoundTrips;
        aircraft.condition = Math.max(0, aircraft.condition - CONDITION_DECAY_PER_MONTH);
      }

      revenue += routeRevenue;
      operatingCosts += routeOperatingCost;
      routeReports.push({
        routeId: route.id,
        originCode: route.originCode,
        destCode: route.destCode,
        passengers: Math.round(passengers),
        connectingPassengers: Math.round(connecting),
        capacity: Math.round(capacity),
        loadFactor: capacity > 0 ? passengers / capacity : 0,
        revenue: routeRevenue,
        operatingCost: routeOperatingCost,
        profit: routeRevenue - routeOperatingCost,
      });
    }
  }

  // Fleet-level fixed costs.
  let leaseCosts = 0;
  let maintenanceCosts = 0;
  for (const aircraft of fleet) {
    const type = findAircraftType(aircraft.aircraftTypeId);
    if (aircraft.acquisitionMode === "leased") leaseCosts += type.monthlyLeasePrice;
    const penalty =
      aircraft.condition < CONDITION_MAINTENANCE_THRESHOLD
        ? 1 + (CONDITION_MAINTENANCE_THRESHOLD - aircraft.condition) / 100
        : 1;
    maintenanceCosts += type.monthlyMaintenanceCost * penalty;
  }

  const crewCosts = airline.crew.employed * CREW_COST_PER_MONTH;

  // Loan amortization.
  let loanPayments = 0;
  let interestPaid = 0;
  const loans = airline.loans
    .map((loan) => {
      const interest = loan.balance * loan.monthlyRate;
      const payment = Math.min(loan.monthlyPayment, loan.balance + interest);
      const principalPaid = payment - interest;
      loanPayments += payment;
      interestPaid += interest;
      return { ...loan, balance: Math.max(0, loan.balance - principalPaid) };
    })
    .filter((loan) => loan.balance > 1);

  const netIncome = revenue - operatingCosts - leaseCosts - maintenanceCosts - crewCosts - loanPayments;
  const cashEnd = airline.cash + netIncome;

  const flown = routeReports.filter((r) => r.capacity > 0 && crewableIds.has(r.routeId));
  const avgLoad =
    flown.length > 0 ? flown.reduce((s, r) => s + r.loadFactor, 0) / flown.length : 0.55;
  const repDelta = (avgLoad - 0.6) * 3 + (netIncome > 0 ? 0.3 : -0.5);
  const reputationEnd = Math.min(100, Math.max(0, airline.reputation + repDelta));

  const negativeCashMonths = cashEnd < 0 ? airline.negativeCashMonths + 1 : 0;
  const bankrupt = airline.bankrupt || negativeCashMonths >= BANKRUPTCY_GRACE_MONTHS;

  const report: MonthlyReport = {
    month,
    revenue,
    operatingCosts,
    leaseCosts,
    maintenanceCosts,
    crewCosts,
    loanPayments,
    interestPaid,
    netIncome,
    cashEnd,
    reputationEnd,
    routeReports,
  };

  const updated: Airline = {
    ...airline,
    cash: cashEnd,
    reputation: reputationEnd,
    fleet,
    loans,
    negativeCashMonths,
    bankrupt,
  };

  return { airline: updated, report };
}
