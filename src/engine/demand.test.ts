import { describe, expect, it } from "vitest";
import {
  fareFactor,
  frequencyFactor,
  reputationFactor,
  serviceAttractiveness,
  totalMarketDemand,
} from "./demand";
import { findAirport } from "./data";
import { distanceKm } from "./geo";

describe("fareFactor", () => {
  it("decreases as fare rises above the reference fare", () => {
    expect(fareFactor(400, 1000)).toBeLessThan(fareFactor(100, 1000));
  });
});

describe("frequencyFactor", () => {
  it("increases with more weekly flights but saturates", () => {
    expect(frequencyFactor(14)).toBeGreaterThan(frequencyFactor(3));
    expect(frequencyFactor(60)).toBeLessThanOrEqual(1.7);
  });
});

describe("reputationFactor", () => {
  it("rewards higher reputation", () => {
    expect(reputationFactor(90)).toBeGreaterThan(reputationFactor(10));
  });
});

describe("totalMarketDemand", () => {
  it("is positive and falls with distance for a fixed market", () => {
    const icn = findAirport("ICN");
    const hnd = findAirport("HND");
    const lax = findAirport("LAX");
    const near = totalMarketDemand(icn, hnd, distanceKm(icn, hnd));
    const far = totalMarketDemand(icn, lax, distanceKm(icn, lax));
    expect(near).toBeGreaterThan(0);
    expect(near).toBeGreaterThan(far);
  });
});

describe("serviceAttractiveness", () => {
  it("rises with a cheaper fare and more frequency", () => {
    const cheapFrequent = serviceAttractiveness(120, 1200, 14, 60);
    const dearRare = serviceAttractiveness(400, 1200, 3, 60);
    expect(cheapFrequent).toBeGreaterThan(dearRare);
  });
});
