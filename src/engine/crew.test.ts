import { describe, expect, it } from "vitest";
import { crewInTraining, graduateCrew, hireCrew } from "./crew";
import { makeAirline } from "./testSupport";

describe("crew", () => {
  it("puts newly hired crew into training, not immediate service", () => {
    const airline = makeAirline();
    const after = hireCrew(airline, 10, 0);
    expect(after.crew.employed).toBe(0);
    expect(crewInTraining(after)).toBe(10);
    expect(after.cash).toBeLessThan(airline.cash);
  });

  it("graduates crew once training time has elapsed", () => {
    let airline = hireCrew(makeAirline(), 10, 0);
    airline = graduateCrew(airline, 1);
    expect(airline.crew.employed).toBe(10);
    expect(crewInTraining(airline)).toBe(0);
  });

  it("does not graduate crew before training completes", () => {
    const airline = graduateCrew(hireCrew(makeAirline(), 10, 5), 5);
    expect(airline.crew.employed).toBe(0);
  });

  it("throws when hiring more crew than cash allows", () => {
    const poor = makeAirline({ cash: 1000 });
    expect(() => hireCrew(poor, 100, 0)).toThrow();
  });
});
