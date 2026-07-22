import { describe, expect, it } from "vitest";
import { isRouteDistanceValid, maxWeeklyFrequency, roundTripBlockHours } from "./rules";
import { findAircraftType } from "./data";

describe("roundTripBlockHours", () => {
  it("grows with distance", () => {
    const type = findAircraftType("nb180");
    expect(roundTripBlockHours(type, 2000)).toBeGreaterThan(roundTripBlockHours(type, 500));
  });
});

describe("maxWeeklyFrequency", () => {
  it("allows more frequency on short routes than long ones", () => {
    const type = findAircraftType("nb180");
    expect(maxWeeklyFrequency(type, 500)).toBeGreaterThan(maxWeeklyFrequency(type, 5000));
  });

  it("is zero once the block time exceeds weekly utilization hours", () => {
    const type = findAircraftType("rj70");
    expect(maxWeeklyFrequency(type, 1_000_000)).toBe(0);
  });
});

describe("isRouteDistanceValid", () => {
  it("rejects distances beyond range", () => {
    const type = findAircraftType("rj70");
    expect(isRouteDistanceValid(type, type.rangeKm + 1)).toBe(false);
    expect(isRouteDistanceValid(type, type.rangeKm - 1)).toBe(true);
  });
});
