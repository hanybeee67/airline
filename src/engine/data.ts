import type { AircraftType, Airport } from "./types";

/**
 * Airports with real coordinates and `marketSize` set to approximate recent
 * (2023-2024) annual passenger throughput in millions. Hubs are the world's
 * major connecting airports.
 */
export const AIRPORTS: Airport[] = [
  { code: "ATL", city: "Atlanta", country: "United States", region: "North America", lat: 33.64, lon: -84.43, marketSize: 104, hub: true },
  { code: "DXB", city: "Dubai", country: "United Arab Emirates", region: "Middle East", lat: 25.25, lon: 55.36, marketSize: 87, hub: true },
  { code: "DFW", city: "Dallas", country: "United States", region: "North America", lat: 32.9, lon: -97.04, marketSize: 82, hub: true },
  { code: "HND", city: "Tokyo", country: "Japan", region: "Asia", lat: 35.55, lon: 139.78, marketSize: 79, hub: true },
  { code: "LHR", city: "London", country: "United Kingdom", region: "Europe", lat: 51.47, lon: -0.45, marketSize: 79, hub: true },
  { code: "IST", city: "Istanbul", country: "Turkey", region: "Europe", lat: 41.26, lon: 28.74, marketSize: 76, hub: true },
  { code: "DEN", city: "Denver", country: "United States", region: "North America", lat: 39.86, lon: -104.67, marketSize: 78, hub: true },
  { code: "LAX", city: "Los Angeles", country: "United States", region: "North America", lat: 33.94, lon: -118.41, marketSize: 75, hub: true },
  { code: "ORD", city: "Chicago", country: "United States", region: "North America", lat: 41.98, lon: -87.9, marketSize: 74, hub: true },
  { code: "DEL", city: "Delhi", country: "India", region: "Asia", lat: 28.56, lon: 77.1, marketSize: 73, hub: true },
  { code: "JFK", city: "New York", country: "United States", region: "North America", lat: 40.64, lon: -73.78, marketSize: 62, hub: true },
  { code: "CDG", city: "Paris", country: "France", region: "Europe", lat: 49.01, lon: 2.55, marketSize: 67, hub: true },
  { code: "SIN", city: "Singapore", country: "Singapore", region: "Asia", lat: 1.35, lon: 103.99, marketSize: 60, hub: true },
  { code: "PVG", city: "Shanghai", country: "China", region: "Asia", lat: 31.14, lon: 121.8, marketSize: 55, hub: true },
  { code: "FRA", city: "Frankfurt", country: "Germany", region: "Europe", lat: 50.04, lon: 8.56, marketSize: 59, hub: true },
  { code: "ICN", city: "Seoul", country: "South Korea", region: "Asia", lat: 37.46, lon: 126.44, marketSize: 56, hub: true },
  { code: "AMS", city: "Amsterdam", country: "Netherlands", region: "Europe", lat: 52.31, lon: 4.76, marketSize: 62, hub: true },
  { code: "HKG", city: "Hong Kong", country: "China", region: "Asia", lat: 22.31, lon: 113.91, marketSize: 40, hub: true },
  { code: "BKK", city: "Bangkok", country: "Thailand", region: "Asia", lat: 13.69, lon: 100.75, marketSize: 52, hub: false },
  { code: "SYD", city: "Sydney", country: "Australia", region: "Oceania", lat: -33.95, lon: 151.18, marketSize: 39, hub: false },
  { code: "GRU", city: "São Paulo", country: "Brazil", region: "South America", lat: -23.43, lon: -46.47, marketSize: 38, hub: true },
  { code: "JNB", city: "Johannesburg", country: "South Africa", region: "Africa", lat: -26.13, lon: 28.24, marketSize: 21, hub: true },
];

/**
 * Current-generation aircraft with realistic published specs. Fuel burn is an
 * approximate cruise figure in liters/km (both engines combined).
 */
export const AIRCRAFT_TYPES: AircraftType[] = [
  {
    id: "e195e2",
    name: "Embraer E195-E2",
    manufacturer: "Embraer",
    category: "regional",
    seats: 146,
    rangeKm: 4815,
    cruiseSpeedKmh: 833,
    fuelBurnPerKm: 3.0,
    crewRequired: 5,
    purchasePrice: 60_400_000,
    monthlyLeasePrice: 320_000,
    monthlyMaintenanceCost: 95_000,
  },
  {
    id: "a220_300",
    name: "Airbus A220-300",
    manufacturer: "Airbus",
    category: "regional",
    seats: 150,
    rangeKm: 6300,
    cruiseSpeedKmh: 828,
    fuelBurnPerKm: 3.1,
    crewRequired: 5,
    purchasePrice: 81_000_000,
    monthlyLeasePrice: 360_000,
    monthlyMaintenanceCost: 110_000,
  },
  {
    id: "b737max8",
    name: "Boeing 737 MAX 8",
    manufacturer: "Boeing",
    category: "narrowbody",
    seats: 178,
    rangeKm: 6570,
    cruiseSpeedKmh: 839,
    fuelBurnPerKm: 3.5,
    crewRequired: 6,
    purchasePrice: 121_600_000,
    monthlyLeasePrice: 430_000,
    monthlyMaintenanceCost: 140_000,
  },
  {
    id: "a321neo",
    name: "Airbus A321neo",
    manufacturer: "Airbus",
    category: "narrowbody",
    seats: 206,
    rangeKm: 7400,
    cruiseSpeedKmh: 833,
    fuelBurnPerKm: 3.8,
    crewRequired: 7,
    purchasePrice: 129_500_000,
    monthlyLeasePrice: 470_000,
    monthlyMaintenanceCost: 155_000,
  },
  {
    id: "b787_9",
    name: "Boeing 787-9 Dreamliner",
    manufacturer: "Boeing",
    category: "widebody",
    seats: 296,
    rangeKm: 14_140,
    cruiseSpeedKmh: 903,
    fuelBurnPerKm: 6.4,
    crewRequired: 12,
    purchasePrice: 292_500_000,
    monthlyLeasePrice: 1_050_000,
    monthlyMaintenanceCost: 320_000,
  },
  {
    id: "a350_900",
    name: "Airbus A350-900",
    manufacturer: "Airbus",
    category: "widebody",
    seats: 315,
    rangeKm: 15_000,
    cruiseSpeedKmh: 903,
    fuelBurnPerKm: 6.8,
    crewRequired: 13,
    purchasePrice: 317_400_000,
    monthlyLeasePrice: 1_150_000,
    monthlyMaintenanceCost: 340_000,
  },
  {
    id: "b777_9",
    name: "Boeing 777-9",
    manufacturer: "Boeing",
    category: "widebody",
    seats: 426,
    rangeKm: 13_510,
    cruiseSpeedKmh: 905,
    fuelBurnPerKm: 8.6,
    crewRequired: 15,
    purchasePrice: 442_200_000,
    monthlyLeasePrice: 1_600_000,
    monthlyMaintenanceCost: 470_000,
  },
];

export function findAirport(code: string): Airport {
  const airport = AIRPORTS.find((a) => a.code === code);
  if (!airport) throw new Error(`Unknown airport code: ${code}`);
  return airport;
}

export function findAircraftType(id: string): AircraftType {
  const type = AIRCRAFT_TYPES.find((t) => t.id === id);
  if (!type) throw new Error(`Unknown aircraft type: ${id}`);
  return type;
}
