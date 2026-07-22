import type { AircraftType } from "./types";
import { TURNAROUND_HOURS, WEEKLY_UTILIZATION_HOURS } from "./constants";

export function roundTripBlockHours(
  aircraftType: AircraftType,
  distanceKm: number,
): number {
  const flightHours = (2 * distanceKm) / aircraftType.cruiseSpeedKmh;
  return flightHours + 2 * TURNAROUND_HOURS;
}

/** Highest weekly round-trip frequency a single aircraft can sustain on this route. */
export function maxWeeklyFrequency(
  aircraftType: AircraftType,
  distanceKm: number,
): number {
  const blockHours = roundTripBlockHours(aircraftType, distanceKm);
  return Math.max(0, Math.floor(WEEKLY_UTILIZATION_HOURS / blockHours));
}

export function isRouteDistanceValid(
  aircraftType: AircraftType,
  distanceKm: number,
): boolean {
  return distanceKm > 0 && distanceKm <= aircraftType.rangeKm;
}
