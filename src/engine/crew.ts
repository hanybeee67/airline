import type { Airline } from "./types";
import { CREW_TRAINING_COST, CREW_TRAINING_MONTHS } from "./constants";

/** Crew already employed and available to fly this month. */
export function availableCrew(airline: Airline): number {
  return airline.crew.employed;
}

/** Crew that have been hired but are still completing training. */
export function crewInTraining(airline: Airline): number {
  return airline.crew.inTraining.reduce((sum, batch) => sum + batch.count, 0);
}

/**
 * Hire and begin training `count` crew members. They cost money up front and
 * become available after the training lead time.
 */
export function hireCrew(airline: Airline, count: number, currentMonth: number): Airline {
  if (count <= 0) throw new Error("Crew count must be positive.");
  const cost = count * CREW_TRAINING_COST;
  if (airline.cash < cost) throw new Error("Not enough cash to train this many crew.");

  return {
    ...airline,
    cash: airline.cash - cost,
    crew: {
      ...airline.crew,
      inTraining: [
        ...airline.crew.inTraining,
        { count, readyMonth: currentMonth + CREW_TRAINING_MONTHS },
      ],
    },
  };
}

/** Moves any crew whose training has finished into the employed pool. */
export function graduateCrew(airline: Airline, currentMonth: number): Airline {
  const ready = airline.crew.inTraining
    .filter((b) => b.readyMonth <= currentMonth)
    .reduce((sum, b) => sum + b.count, 0);
  if (ready === 0) return airline;

  return {
    ...airline,
    crew: {
      employed: airline.crew.employed + ready,
      inTraining: airline.crew.inTraining.filter((b) => b.readyMonth > currentMonth),
    },
  };
}
