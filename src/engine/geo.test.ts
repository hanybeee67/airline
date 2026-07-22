import { describe, expect, it } from "vitest";
import { distanceKm, greatCirclePath } from "./geo";
import { findAirport } from "./data";

describe("distanceKm", () => {
  it("returns 0 for the same airport", () => {
    const icn = findAirport("ICN");
    expect(distanceKm(icn, icn)).toBeCloseTo(0, 3);
  });

  it("matches the known ICN-HND great-circle distance approximately", () => {
    const icn = findAirport("ICN");
    const hnd = findAirport("HND");
    expect(distanceKm(icn, hnd)).toBeGreaterThan(1000);
    expect(distanceKm(icn, hnd)).toBeLessThan(1300);
  });

  it("is symmetric", () => {
    const jfk = findAirport("JFK");
    const lhr = findAirport("LHR");
    expect(distanceKm(jfk, lhr)).toBeCloseTo(distanceKm(lhr, jfk), 6);
  });
});

describe("greatCirclePath", () => {
  it("returns segments + 1 points with matching endpoints", () => {
    const a = findAirport("LAX");
    const b = findAirport("SYD");
    const path = greatCirclePath(a, b, 32);
    expect(path).toHaveLength(33);
    expect(path[0].lat).toBeCloseTo(a.lat, 4);
    expect(path[0].lon).toBeCloseTo(a.lon, 4);
    expect(path[path.length - 1].lat).toBeCloseTo(b.lat, 4);
    expect(path[path.length - 1].lon).toBeCloseTo(b.lon, 4);
  });
});
