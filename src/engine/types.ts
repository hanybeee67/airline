export interface Airport {
  code: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  /** Relative size of the local travel market (population x wealth, abstracted to 1-100). */
  marketSize: number;
}

export interface AircraftType {
  id: string;
  name: string;
  seats: number;
  rangeKm: number;
  cruiseSpeedKmh: number;
  /** Fuel burned per kilometre flown, in liters. */
  fuelBurnPerKm: number;
  crewRequired: number;
  purchasePrice: number;
  monthlyLeasePrice: number;
  /** Base monthly maintenance cost regardless of usage. */
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

export interface RouteReport {
  routeId: string;
  originCode: string;
  destCode: string;
  passengers: number;
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
  netIncome: number;
  cashEnd: number;
  reputationEnd: number;
  routeReports: RouteReport[];
}

export interface Company {
  name: string;
  cash: number;
  reputation: number;
  month: number;
  fleet: OwnedAircraft[];
  routes: Route[];
  history: MonthlyReport[];
}
