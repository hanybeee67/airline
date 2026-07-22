import { describe, expect, it } from "vitest";
import { createCompany, buyAircraft, openRoute, closeRoute, sellAircraft, setFare, setFrequency } from "./company";
import { findAircraftType } from "./data";

describe("buyAircraft", () => {
  it("deducts cash when buying outright", () => {
    const company = createCompany("Test Air");
    const type = findAircraftType("rj70");
    const after = buyAircraft(company, "rj70", "owned");
    expect(after.cash).toBe(company.cash - type.purchasePrice);
    expect(after.fleet).toHaveLength(1);
  });

  it("does not touch cash when leasing", () => {
    const company = createCompany("Test Air");
    const after = buyAircraft(company, "rj70", "leased");
    expect(after.cash).toBe(company.cash);
    expect(after.fleet[0].acquisitionMode).toBe("leased");
  });

  it("throws when cash is insufficient for a purchase", () => {
    const poor = { ...createCompany("Test Air"), cash: 1000 };
    expect(() => buyAircraft(poor, "wb320", "owned")).toThrow();
  });
});

describe("openRoute", () => {
  it("opens a valid route within range and frequency limits", () => {
    let company = createCompany("Test Air");
    company = buyAircraft(company, "rj70", "owned");
    const aircraftId = company.fleet[0].id;

    company = openRoute(company, {
      originCode: "ICN",
      destCode: "NRT",
      assignedAircraftId: aircraftId,
      weeklyFrequency: 5,
      fare: 150,
    });

    expect(company.routes).toHaveLength(1);
    expect(company.routes[0].originCode).toBe("ICN");
  });

  it("rejects routes beyond the aircraft's range", () => {
    let company = createCompany("Test Air");
    company = buyAircraft(company, "rj70", "owned");
    const aircraftId = company.fleet[0].id;

    expect(() =>
      openRoute(company, {
        originCode: "ICN",
        destCode: "JFK",
        assignedAircraftId: aircraftId,
        weeklyFrequency: 1,
        fare: 900,
      }),
    ).toThrow();
  });

  it("rejects frequency above what the aircraft can sustain", () => {
    let company = createCompany("Test Air");
    company = buyAircraft(company, "rj70", "owned");
    const aircraftId = company.fleet[0].id;

    expect(() =>
      openRoute(company, {
        originCode: "ICN",
        destCode: "NRT",
        assignedAircraftId: aircraftId,
        weeklyFrequency: 999,
        fare: 150,
      }),
    ).toThrow();
  });

  it("rejects assigning the same aircraft to a second route", () => {
    let company = createCompany("Test Air");
    company = buyAircraft(company, "rj70", "owned");
    const aircraftId = company.fleet[0].id;
    company = openRoute(company, {
      originCode: "ICN",
      destCode: "NRT",
      assignedAircraftId: aircraftId,
      weeklyFrequency: 3,
      fare: 150,
    });

    expect(() =>
      openRoute(company, {
        originCode: "NRT",
        destCode: "ICN",
        assignedAircraftId: aircraftId,
        weeklyFrequency: 3,
        fare: 150,
      }),
    ).toThrow();
  });
});

describe("closeRoute / setFare / setFrequency", () => {
  function setup() {
    let company = createCompany("Test Air");
    company = buyAircraft(company, "rj70", "owned");
    const aircraftId = company.fleet[0].id;
    company = openRoute(company, {
      originCode: "ICN",
      destCode: "NRT",
      assignedAircraftId: aircraftId,
      weeklyFrequency: 3,
      fare: 150,
    });
    return { company, aircraftId, routeId: company.routes[0].id };
  }

  it("updates fare", () => {
    const { company, routeId } = setup();
    const updated = setFare(company, routeId, 200);
    expect(updated.routes[0].fare).toBe(200);
  });

  it("rejects a non-positive fare", () => {
    const { company, routeId } = setup();
    expect(() => setFare(company, routeId, 0)).toThrow();
  });

  it("updates frequency within limits", () => {
    const { company, routeId } = setup();
    const updated = setFrequency(company, routeId, 5);
    expect(updated.routes[0].weeklyFrequency).toBe(5);
  });

  it("closes a route, freeing its aircraft", () => {
    const { company, routeId, aircraftId } = setup();
    const updated = closeRoute(company, routeId);
    expect(updated.routes).toHaveLength(0);

    const reopened = openRoute(updated, {
      originCode: "NRT",
      destCode: "ICN",
      assignedAircraftId: aircraftId,
      weeklyFrequency: 2,
      fare: 150,
    });
    expect(reopened.routes).toHaveLength(1);
  });
});

describe("sellAircraft", () => {
  it("refunds part of the purchase price for an owned aircraft", () => {
    let company = createCompany("Test Air");
    company = buyAircraft(company, "rj70", "owned");
    const aircraftId = company.fleet[0].id;
    const cashAfterBuy = company.cash;

    const sold = sellAircraft(company, aircraftId);
    expect(sold.cash).toBeGreaterThan(cashAfterBuy);
    expect(sold.fleet).toHaveLength(0);
  });

  it("refuses to sell an aircraft still assigned to a route", () => {
    let company = createCompany("Test Air");
    company = buyAircraft(company, "rj70", "owned");
    const aircraftId = company.fleet[0].id;
    company = openRoute(company, {
      originCode: "ICN",
      destCode: "NRT",
      assignedAircraftId: aircraftId,
      weeklyFrequency: 3,
      fare: 150,
    });

    expect(() => sellAircraft(company, aircraftId)).toThrow();
  });
});
