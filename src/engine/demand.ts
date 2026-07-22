import type { Airport } from "./types";
import {
  DEMAND_CONSTANT,
  FARE_ELASTICITY,
  REFERENCE_FARE_PER_KM,
  WEEKS_PER_MONTH,
} from "./constants";

/**
 * Gravity-model base demand: bigger markets and shorter distances mean more
 * potential travelers, before fare, frequency or reputation are considered.
 */
export function baseMonthlyDemand(
  origin: Airport,
  dest: Airport,
  distanceKm: number,
): number {
  const marketPull = origin.marketSize * dest.marketSize;
  return (DEMAND_CONSTANT * marketPull * WEEKS_PER_MONTH) / Math.sqrt(Math.max(distanceKm, 1));
}

/** Passengers are more price-sensitive the further fares stray above the reference price. */
export function fareFactor(fare: number, distanceKm: number): number {
  const referenceFare = Math.max(distanceKm * REFERENCE_FARE_PER_KM, 1);
  const ratio = referenceFare / Math.max(fare, 1);
  return clamp(ratio ** FARE_ELASTICITY, 0.2, 3);
}

/** More frequent service captures more of the addressable demand, with diminishing returns. */
export function frequencyFactor(weeklyFrequency: number): number {
  return clamp(Math.sqrt(weeklyFrequency / 7), 0.15, 1.6);
}

/** Airline reputation shifts a modest share of demand toward or away from the company. */
export function reputationFactor(reputation: number): number {
  return 0.6 + clamp(reputation, 0, 100) / 125;
}

export function estimateMonthlyDemand(
  origin: Airport,
  dest: Airport,
  distanceKm: number,
  fare: number,
  weeklyFrequency: number,
  reputation: number,
): number {
  return (
    baseMonthlyDemand(origin, dest, distanceKm) *
    fareFactor(fare, distanceKm) *
    frequencyFactor(weeklyFrequency) *
    reputationFactor(reputation)
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
