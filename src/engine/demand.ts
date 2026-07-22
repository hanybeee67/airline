import type { Airport } from "./types";
import {
  DEMAND_CONSTANT,
  FARE_ELASTICITY,
  REFERENCE_FARE_PER_KM,
  WEEKS_PER_MONTH,
} from "./constants";

/**
 * Total monthly origin/destination demand for a city pair (both directions,
 * before fares are considered): a gravity model where bigger markets and
 * shorter distances mean more potential travelers.
 */
export function totalMarketDemand(
  a: Airport,
  b: Airport,
  distanceKm: number,
): number {
  const marketPull = a.marketSize * b.marketSize;
  return (DEMAND_CONSTANT * marketPull * WEEKS_PER_MONTH) / Math.sqrt(Math.max(distanceKm, 1));
}

/** Passengers are more price-sensitive the further fares stray above the reference price. */
export function fareFactor(fare: number, distanceKm: number): number {
  const referenceFare = Math.max(distanceKm * REFERENCE_FARE_PER_KM, 1);
  const ratio = referenceFare / Math.max(fare, 1);
  return clamp(ratio ** FARE_ELASTICITY, 0.15, 3);
}

/** More frequent service captures more of the addressable demand, with diminishing returns. */
export function frequencyFactor(weeklyFrequency: number): number {
  return clamp(Math.sqrt(weeklyFrequency / 7), 0.15, 1.7);
}

/** Airline reputation shifts a modest share of demand toward or away from the company. */
export function reputationFactor(reputation: number): number {
  return 0.6 + clamp(reputation, 0, 100) / 125;
}

/**
 * Relative attractiveness of one service on a route — combines price appeal,
 * frequency and reputation. Used to split shared demand across competitors.
 */
export function serviceAttractiveness(
  fare: number,
  distanceKm: number,
  weeklyFrequency: number,
  reputation: number,
): number {
  return (
    fareFactor(fare, distanceKm) *
    frequencyFactor(weeklyFrequency) *
    reputationFactor(reputation)
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
