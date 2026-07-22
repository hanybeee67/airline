import { describe, expect, it } from "vitest";
import {
  buyAircraft,
  closeRoute,
  crewRequiredForRoutes,
  openRoute,
  sellAircraft,
  setFare,
  setFrequency,
} from "./airline";
import { findAircraftType } from "./data";
import { makeAirline } from "./testSupport";

describe("buyAircraft", () => {
  it("deducts cash when buying outright", () => {
    const airline = makeAirline();
    const type = findAircraftType("a321neo");
    const after = buyAircraft(airline, "a321neo", "owned");
    expect(after.cash).toBe(airline.cash - type.purchasePrice);
    expect(after.fleet).toHaveLength(1);
  });

  it("does not touch cash when leasing", () => {
    const airline = makeAirline();
    const after = buyAircraft(airline, "a321neo", "leased");
    expect(after.cash).toBe(airline.cash);
    expect(after.fleet[0].acquisitionMode).toBe("leased");
  });

  it("throws when cash is insufficient for a purchase", () => {
    const poor = makeAirline({ cash: 1000 });
    expect(() => buyAircraft(poor, "b777_9", "owned")).toThrow();
  });
});

function withRoute() {
  let airline = makeAirline();
  airline = buyAircraft(airline, "a321neo", "owned");
  const aircraftId = airline.fleet[0].id;
  airline = openRoute(airline, {
    originCode: "ICN",
    destCode: "HND",
    assignedAircraftId: aircraftId,
    weeklyFrequency: 5,
    fare: 200,
  });
  return { airline, aircraftId, routeId: airline.routes[0].id };
}

describe("openRoute", () => {
  it("opens a valid in-range route", () => {
    const { airline } = withRoute();
    expect(airline.routes).toHaveLength(1);
    expect(airline.routes[0].originCode).toBe("ICN");
  });

  it("rejects routes beyond the aircraft's range", () => {
    let airline = makeAirline();
    airline = buyAircraft(airline, "e195e2", "owned");
    const aircraftId = airline.fleet[0].id;
    expect(() =>
      openRoute(airline, {
        originCode: "ICN",
        destCode: "JFK",
        assignedAircraftId: aircraftId,
        weeklyFrequency: 1,
        fare: 900,
      }),
    ).toThrow();
  });

  it("rejects assigning the same aircraft twice", () => {
    const { airline, aircraftId } = withRoute();
    expect(() =>
      openRoute(airline, {
        originCode: "HND",
        destCode: "ICN",
        assignedAircraftId: aircraftId,
        weeklyFrequency: 3,
        fare: 200,
      }),
    ).toThrow();
  });
});

describe("fares, frequency, closing, crew", () => {
  it("updates fare and frequency within limits", () => {
    const { airline, routeId } = withRoute();
    expect(setFare(airline, routeId, 250).routes[0].fare).toBe(250);
    expect(setFrequency(airline, routeId, 7).routes[0].weeklyFrequency).toBe(7);
  });

  it("rejects a non-positive fare", () => {
    const { airline, routeId } = withRoute();
    expect(() => setFare(airline, routeId, 0)).toThrow();
  });

  it("closes a route, freeing its aircraft", () => {
    const { airline, aircraftId, routeId } = withRoute();
    const closed = closeRoute(airline, routeId);
    expect(closed.routes).toHaveLength(0);
    const reopened = openRoute(closed, {
      originCode: "HND",
      destCode: "ICN",
      assignedAircraftId: aircraftId,
      weeklyFrequency: 2,
      fare: 200,
    });
    expect(reopened.routes).toHaveLength(1);
  });

  it("reports crew required for assigned routes", () => {
    const { airline } = withRoute();
    expect(crewRequiredForRoutes(airline)).toBe(findAircraftType("a321neo").crewRequired);
  });

  it("refuses to sell an aircraft still on a route", () => {
    const { airline, aircraftId } = withRoute();
    expect(() => sellAircraft(airline, aircraftId)).toThrow();
  });
});
