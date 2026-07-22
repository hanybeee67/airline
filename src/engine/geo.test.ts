import { describe, expect, it } from "vitest";
import { distanceKm } from "./geo";
import { findAirport } from "./data";

describe("distanceKm", () => {
  it("returns 0 for the same airport", () => {
    const icn = findAirport("ICN");
    expect(distanceKm(icn, icn)).toBeCloseTo(0, 3);
  });

  it("matches the known ICN-NRT great-circle distance approximately", () => {
    const icn = findAirport("ICN");
    const nrt = findAirport("NRT");
    expect(distanceKm(icn, nrt)).toBeGreaterThan(1100);
    expect(distanceKm(icn, nrt)).toBeLessThan(1300);
  });

  it("is symmetric", () => {
    const jfk = findAirport("JFK");
    const lhr = findAirport("LHR");
    expect(distanceKm(jfk, lhr)).toBeCloseTo(distanceKm(lhr, jfk), 6);
  });
});
