import type { Company, MonthlyReport, RouteReport } from "./types";
import { findAircraftType, findAirport } from "./data";
import { distanceKm } from "./geo";
import { estimateMonthlyDemand } from "./demand";
import {
  CONDITION_DECAY_PER_MONTH,
  CONDITION_MAINTENANCE_THRESHOLD,
  CREW_COST_PER_MONTH,
  FUEL_PRICE_PER_LITER,
  WEEKS_PER_MONTH,
} from "./constants";

/** Advances the company by one month: flies every route, books revenue/costs, ages the fleet. */
export function simulateMonth(company: Company): { company: Company; report: MonthlyReport } {
  const fleet = company.fleet.map((a) => ({ ...a }));

  let revenue = 0;
  let operatingCosts = 0;
  const routeReports: RouteReport[] = [];

  for (const route of company.routes) {
    const aircraft = fleet.find((a) => a.id === route.assignedAircraftId);
    if (!aircraft) continue;

    const type = findAircraftType(aircraft.aircraftTypeId);
    const origin = findAirport(route.originCode);
    const dest = findAirport(route.destCode);
    const distance = distanceKm(origin, dest);

    const capacity = type.seats * route.weeklyFrequency * WEEKS_PER_MONTH;
    const demand = estimateMonthlyDemand(
      origin,
      dest,
      distance,
      route.fare,
      route.weeklyFrequency,
      company.reputation,
    );
    const passengers = Math.min(capacity, demand);
    const loadFactor = capacity > 0 ? passengers / capacity : 0;
    const routeRevenue = passengers * route.fare;

    const monthlyRoundTrips = route.weeklyFrequency * WEEKS_PER_MONTH;
    const fuelCost = type.fuelBurnPerKm * distance * 2 * FUEL_PRICE_PER_LITER * monthlyRoundTrips;
    const crewCost = type.crewRequired * CREW_COST_PER_MONTH;
    const routeOperatingCost = fuelCost + crewCost;

    revenue += routeRevenue;
    operatingCosts += routeOperatingCost;
    routeReports.push({
      routeId: route.id,
      originCode: route.originCode,
      destCode: route.destCode,
      passengers: Math.round(passengers),
      capacity: Math.round(capacity),
      loadFactor,
      revenue: routeRevenue,
      operatingCost: routeOperatingCost,
      profit: routeRevenue - routeOperatingCost,
    });

    aircraft.condition = Math.max(0, aircraft.condition - CONDITION_DECAY_PER_MONTH);
  }

  let leaseCosts = 0;
  let maintenanceCosts = 0;
  for (const aircraft of fleet) {
    const type = findAircraftType(aircraft.aircraftTypeId);
    if (aircraft.acquisitionMode === "leased") {
      leaseCosts += type.monthlyLeasePrice;
    }
    const maintenancePenalty =
      aircraft.condition < CONDITION_MAINTENANCE_THRESHOLD
        ? 1 + (CONDITION_MAINTENANCE_THRESHOLD - aircraft.condition) / 100
        : 1;
    maintenanceCosts += type.monthlyMaintenanceCost * maintenancePenalty;
  }

  const netIncome = revenue - operatingCosts - leaseCosts - maintenanceCosts;
  const avgLoadFactor =
    routeReports.length > 0
      ? routeReports.reduce((sum, r) => sum + r.loadFactor, 0) / routeReports.length
      : 0.5;
  const reputationDelta = (avgLoadFactor - 0.6) * 4 + (netIncome > 0 ? 0.3 : -0.5);
  const reputationEnd = clamp(company.reputation + reputationDelta, 0, 100);
  const cashEnd = company.cash + netIncome;

  const report: MonthlyReport = {
    month: company.month + 1,
    revenue,
    operatingCosts,
    leaseCosts,
    maintenanceCosts,
    netIncome,
    cashEnd,
    reputationEnd,
    routeReports,
  };

  const nextCompany: Company = {
    ...company,
    cash: cashEnd,
    reputation: reputationEnd,
    month: company.month + 1,
    fleet,
    history: [...company.history, report],
  };

  return { company: nextCompany, report };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
