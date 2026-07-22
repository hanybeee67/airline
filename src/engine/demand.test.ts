import { describe, expect, it } from "vitest";
import { estimateMonthlyDemand, fareFactor, frequencyFactor, reputationFactor } from "./demand";
import { findAirport } from "./data";
import { distanceKm } from "./geo";

describe("fareFactor", () => {
  it("decreases as fare rises above the reference fare", () => {
    const low = fareFactor(100, 1000);
    const high = fareFactor(400, 1000);
    expect(high).toBeLessThan(low);
  });
});

describe("frequencyFactor", () => {
  it("increases with more weekly flights but saturates", () => {
    const few = frequencyFactor(3);
    const many = frequencyFactor(14);
    const evenMore = frequencyFactor(28);
    expect(many).toBeGreaterThan(few);
    expect(evenMore).toBeLessThanOrEqual(1.6);
  });
});

describe("reputationFactor", () => {
  it("rewards higher reputation", () => {
    expect(reputationFactor(90)).toBeGreaterThan(reputationFactor(10));
  });
});

describe("estimateMonthlyDemand", () => {
  it("is positive for a plausible route and reacts to fare changes", () => {
    const icn = findAirport("ICN");
    const nrt = findAirport("NRT");
    const distance = distanceKm(icn, nrt);

    const cheap = estimateMonthlyDemand(icn, nrt, distance, 80, 7, 50);
    const expensive = estimateMonthlyDemand(icn, nrt, distance, 500, 7, 50);

    expect(cheap).toBeGreaterThan(0);
    expect(cheap).toBeGreaterThan(expensive);
  });
});
