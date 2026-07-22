import type { Airline } from "./types";

/** Minimal blank airline for unit tests. */
export function makeAirline(overrides: Partial<Airline> = {}): Airline {
  return {
    id: "test",
    name: "Test Air",
    isPlayer: true,
    color: "#2f6feb",
    cash: 300_000_000,
    reputation: 50,
    fleet: [],
    routes: [],
    loans: [],
    crew: { employed: 0, inTraining: [] },
    negativeCashMonths: 0,
    bankrupt: false,
    ...overrides,
  };
}
