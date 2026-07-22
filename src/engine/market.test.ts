import { describe, expect, it } from "vitest";
import type { World } from "./types";
import { buyAircraft, openRoute } from "./airline";
import { resolveMarket } from "./market";
import { makeAirline } from "./testSupport";

function operator(id: string, fare: number) {
  let airline = makeAirline({ id, name: id, isPlayer: id === "a" });
  airline = buyAircraft(airline, "b787_9", "owned");
  const aircraftId = airline.fleet[0].id;
  airline = openRoute(airline, {
    originCode: "ICN",
    destCode: "HND",
    assignedAircraftId: aircraftId,
    weeklyFrequency: 7,
    fare,
  });
  airline = { ...airline, crew: { employed: 40, inTraining: [] } };
  return airline;
}

function world(...airlines: ReturnType<typeof operator>[]): World {
  return { month: 0, airlines, events: [], history: [], eventLog: [], gameOver: false };
}

describe("resolveMarket", () => {
  it("gives a monopoly positive direct passengers", () => {
    const monopoly = operator("a", 200);
    const outcomes = resolveMarket(world(monopoly), 1);
    const outcome = outcomes.get(monopoly.routes[0].id)!;
    expect(outcome.directPassengers).toBeGreaterThan(0);
  });

  it("splits demand so a competitor carries fewer than a monopoly would", () => {
    const solo = operator("a", 200);
    const monopolyPax = resolveMarket(world(solo), 1).get(solo.routes[0].id)!.directPassengers;

    const a = operator("a", 200);
    const b = operator("b", 200);
    const dueled = resolveMarket(world(a, b), 1).get(a.routes[0].id)!.directPassengers;

    expect(dueled).toBeLessThan(monopolyPax);
  });

  it("lets the cheaper competitor win the larger share", () => {
    const cheap = operator("a", 140);
    const dear = operator("b", 320);
    const outcomes = resolveMarket(world(cheap, dear), 1);
    expect(outcomes.get(cheap.routes[0].id)!.directPassengers).toBeGreaterThan(
      outcomes.get(dear.routes[0].id)!.directPassengers,
    );
  });

  it("scales demand with the global multiplier", () => {
    const solo = operator("a", 200);
    const normal = resolveMarket(world(solo), 1).get(solo.routes[0].id)!.directPassengers;
    const recession = resolveMarket(world(solo), 0.7).get(solo.routes[0].id)!.directPassengers;
    expect(recession).toBeLessThan(normal);
  });
});
