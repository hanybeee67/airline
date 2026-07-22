import { describe, expect, it } from "vitest";
import { advanceMonth, createWorld } from "./world";
import { buyAircraft, openRoute } from "./airline";

describe("createWorld", () => {
  it("creates the player plus competitor airlines", () => {
    const world = createWorld("Falcon Air");
    expect(world.airlines[0].isPlayer).toBe(true);
    expect(world.airlines[0].name).toBe("Falcon Air");
    expect(world.airlines.length).toBeGreaterThanOrEqual(3);
  });

  it("gives competitors a starting network", () => {
    const world = createWorld("Falcon Air");
    const ai = world.airlines.filter((a) => !a.isPlayer);
    expect(ai.some((a) => a.routes.length > 0)).toBe(true);
  });
});

describe("advanceMonth", () => {
  it("advances the month and records a player report", () => {
    const world = createWorld("Falcon Air");
    const { world: next, report } = advanceMonth(world);
    expect(next.month).toBe(1);
    expect(report).not.toBeNull();
    expect(next.history).toHaveLength(1);
  });

  it("lets the player earn revenue on a crewed route", () => {
    let world = createWorld("Falcon Air");
    let player = world.airlines[0];
    player = buyAircraft(player, "b787_9", "leased");
    const aircraftId = player.fleet[0].id;
    player = openRoute(player, {
      originCode: "ICN",
      destCode: "LAX",
      assignedAircraftId: aircraftId,
      weeklyFrequency: 3,
      fare: 850,
    });
    player = { ...player, crew: { employed: 20, inTraining: [] } };
    world = { ...world, airlines: [player, ...world.airlines.slice(1)] };

    const { report } = advanceMonth(world);
    expect(report!.revenue).toBeGreaterThan(0);
    expect(report!.routeReports[0].passengers).toBeGreaterThan(0);
  });

  it("grounds routes the airline has no crew for (no revenue, still costs)", () => {
    let world = createWorld("Falcon Air");
    let player = world.airlines[0];
    player = buyAircraft(player, "a321neo", "owned");
    const aircraftId = player.fleet[0].id;
    player = openRoute(player, {
      originCode: "ICN",
      destCode: "HND",
      assignedAircraftId: aircraftId,
      weeklyFrequency: 5,
      fare: 200,
    });
    // No crew employed → grounded.
    world = { ...world, airlines: [player, ...world.airlines.slice(1)] };

    const { report } = advanceMonth(world);
    expect(report!.routeReports[0].passengers).toBe(0);
    expect(report!.maintenanceCosts).toBeGreaterThan(0);
  });
});
