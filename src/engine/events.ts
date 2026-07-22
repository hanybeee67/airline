import type { Airline, GameEvent, GameEventKind, World } from "./types";

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

interface EventTemplate {
  kind: GameEventKind;
  title: string;
  description: string;
  demandMultiplier: number;
  fuelMultiplier: number;
  minDuration: number;
  maxDuration: number;
  /** True if the event hits one airline rather than the whole market. */
  targeted: boolean;
}

const TEMPLATES: EventTemplate[] = [
  {
    kind: "fuel_spike",
    title: "Oil price spike",
    description: "Geopolitical tension sends jet fuel prices soaring.",
    demandMultiplier: 1,
    fuelMultiplier: 1.4,
    minDuration: 2,
    maxDuration: 4,
    targeted: false,
  },
  {
    kind: "fuel_drop",
    title: "Fuel prices ease",
    description: "A supply glut pushes jet fuel prices down.",
    demandMultiplier: 1,
    fuelMultiplier: 0.75,
    minDuration: 2,
    maxDuration: 4,
    targeted: false,
  },
  {
    kind: "recession",
    title: "Economic downturn",
    description: "A global slowdown cools travel demand.",
    demandMultiplier: 0.75,
    fuelMultiplier: 1,
    minDuration: 3,
    maxDuration: 6,
    targeted: false,
  },
  {
    kind: "boom",
    title: "Travel boom",
    description: "Strong economic growth and pent-up demand fill cabins.",
    demandMultiplier: 1.3,
    fuelMultiplier: 1,
    minDuration: 3,
    maxDuration: 6,
    targeted: false,
  },
  {
    kind: "strike",
    title: "Crew strike",
    description: "A labour dispute grounds part of the network and dents demand.",
    demandMultiplier: 0.7,
    fuelMultiplier: 1,
    minDuration: 1,
    maxDuration: 2,
    targeted: true,
  },
  {
    kind: "incident",
    title: "Safety incident",
    description: "A well-publicised incident hurts the airline's reputation.",
    demandMultiplier: 0.8,
    fuelMultiplier: 1,
    minDuration: 2,
    maxDuration: 3,
    targeted: true,
  },
];

interface Rng {
  (): number;
}

function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/**
 * With a small monthly probability, generates a new event. Targeted events are
 * assigned to a random operating airline (biased toward the player for drama).
 */
export function maybeGenerateEvent(world: World, rng: Rng): GameEvent | null {
  if (rng() > 0.28) return null;

  const template = TEMPLATES[randInt(rng, 0, TEMPLATES.length - 1)];
  const event: GameEvent = {
    id: newId("event"),
    kind: template.kind,
    title: template.title,
    description: template.description,
    startMonth: world.month + 1,
    durationMonths: randInt(rng, template.minDuration, template.maxDuration),
    demandMultiplier: template.demandMultiplier,
    fuelMultiplier: template.fuelMultiplier,
  };

  if (template.targeted) {
    const operating = world.airlines.filter((a) => !a.bankrupt);
    if (operating.length === 0) return null;
    const target = pickTargetAirline(operating, rng);
    event.targetAirlineId = target.id;
    event.title = `${event.title} — ${target.name}`;
  }

  return event;
}

function pickTargetAirline(operating: Airline[], rng: Rng): Airline {
  const player = operating.find((a) => a.isPlayer);
  if (player && rng() < 0.4) return player;
  return operating[randInt(rng, 0, operating.length - 1)];
}

export function activeEvents(world: World, month: number): GameEvent[] {
  return world.events.filter(
    (e) => month >= e.startMonth && month < e.startMonth + e.durationMonths,
  );
}

/** Combined global demand and fuel multipliers from all non-targeted active events. */
export function globalModifiers(events: GameEvent[]): {
  demandMultiplier: number;
  fuelMultiplier: number;
} {
  let demandMultiplier = 1;
  let fuelMultiplier = 1;
  for (const e of events) {
    if (e.targetAirlineId) continue;
    demandMultiplier *= e.demandMultiplier;
    fuelMultiplier *= e.fuelMultiplier;
  }
  return { demandMultiplier, fuelMultiplier };
}

/** Demand multiplier that applies only to a specific airline (targeted events). */
export function airlineDemandModifier(events: GameEvent[], airlineId: string): number {
  return events
    .filter((e) => e.targetAirlineId === airlineId)
    .reduce((m, e) => m * e.demandMultiplier, 1);
}
