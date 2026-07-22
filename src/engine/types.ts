export interface Airport {
  code: string;
  city: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  /**
   * Approximate recent annual passenger throughput in millions — used as the
   * raw "market size" that drives origin/destination demand.
   */
  marketSize: number;
  /** True for airports that function as major connecting hubs. */
  hub: boolean;
}

export interface AircraftType {
  id: string;
  /** Real-world model name, e.g. "Airbus A321neo". */
  name: string;
  manufacturer: "Airbus" | "Boeing" | "Embraer";
  category: "regional" | "narrowbody" | "widebody";
  seats: number;
  rangeKm: number;
  cruiseSpeedKmh: number;
  /** Fuel burned per kilometre flown, in liters (both engines, cruise). */
  fuelBurnPerKm: number;
  /** Cabin + flight crew needed to operate one aircraft of this type. */
  crewRequired: number;
  /** Approximate current market/list price in dollars. */
  purchasePrice: number;
  monthlyLeasePrice: number;
  monthlyMaintenanceCost: number;
}

export type AcquisitionMode = "owned" | "leased";

export interface OwnedAircraft {
  id: string;
  aircraftTypeId: string;
  acquisitionMode: AcquisitionMode;
  purchaseMonth: number;
  /** 0-100, degrades slowly with use; low condition raises maintenance cost. */
  condition: number;
}

export interface Route {
  id: string;
  originCode: string;
  destCode: string;
  assignedAircraftId: string;
  weeklyFrequency: number;
  /** One-way fare in dollars. */
  fare: number;
  openedMonth: number;
}

export interface Loan {
  id: string;
  principal: number;
  /** Remaining balance owed. */
  balance: number;
  /** Monthly interest rate (e.g. 0.008 = 0.8%/month). */
  monthlyRate: number;
  /** Fixed monthly payment (principal + interest). */
  monthlyPayment: number;
  termMonths: number;
  takenMonth: number;
}

export interface CrewState {
  /** Total crew members employed. */
  employed: number;
  /** Crew currently in training, arriving `readyMonth`. */
  inTraining: { count: number; readyMonth: number }[];
}

export interface Airline {
  id: string;
  name: string;
  isPlayer: boolean;
  /** Colour used to render this airline's routes on the map. */
  color: string;
  cash: number;
  reputation: number;
  fleet: OwnedAircraft[];
  routes: Route[];
  loans: Loan[];
  crew: CrewState;
  /** Consecutive months the airline has ended with negative cash. */
  negativeCashMonths: number;
  /** True once the airline has gone bankrupt and stopped operating. */
  bankrupt: boolean;
}

export type GameEventKind =
  | "fuel_spike"
  | "fuel_drop"
  | "recession"
  | "boom"
  | "strike"
  | "incident";

export interface GameEvent {
  id: string;
  kind: GameEventKind;
  title: string;
  description: string;
  startMonth: number;
  /** How many months (inclusive) the effect lasts. */
  durationMonths: number;
  /** Multiplier applied to global demand while active (1 = neutral). */
  demandMultiplier: number;
  /** Multiplier applied to fuel price while active (1 = neutral). */
  fuelMultiplier: number;
  /** If set, only this airline is affected (e.g. a strike or incident). */
  targetAirlineId?: string;
}

export interface RouteReport {
  routeId: string;
  originCode: string;
  destCode: string;
  passengers: number;
  connectingPassengers: number;
  capacity: number;
  loadFactor: number;
  revenue: number;
  operatingCost: number;
  profit: number;
}

export interface MonthlyReport {
  month: number;
  revenue: number;
  operatingCosts: number;
  leaseCosts: number;
  maintenanceCosts: number;
  crewCosts: number;
  loanPayments: number;
  interestPaid: number;
  netIncome: number;
  cashEnd: number;
  reputationEnd: number;
  routeReports: RouteReport[];
}

export interface World {
  month: number;
  airlines: Airline[];
  events: GameEvent[];
  /** History of the player's monthly reports (airlines[0]). */
  history: MonthlyReport[];
  /** Log of notable events, newest last. */
  eventLog: { month: number; text: string }[];
  gameOver: boolean;
}
