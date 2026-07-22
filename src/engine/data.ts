import type { AircraftType, Airport } from "./types";

export const AIRPORTS: Airport[] = [
  { code: "ICN", city: "Seoul", country: "South Korea", lat: 37.46, lon: 126.44, marketSize: 95 },
  { code: "NRT", city: "Tokyo", country: "Japan", lat: 35.76, lon: 140.39, marketSize: 100 },
  { code: "PVG", city: "Shanghai", country: "China", lat: 31.14, lon: 121.8, marketSize: 98 },
  { code: "HKG", city: "Hong Kong", country: "China", lat: 22.31, lon: 113.91, marketSize: 85 },
  { code: "SIN", city: "Singapore", country: "Singapore", lat: 1.35, lon: 103.99, marketSize: 80 },
  { code: "BKK", city: "Bangkok", country: "Thailand", lat: 13.69, lon: 100.75, marketSize: 70 },
  { code: "LAX", city: "Los Angeles", country: "United States", lat: 33.94, lon: -118.41, marketSize: 90 },
  { code: "JFK", city: "New York", country: "United States", lat: 40.64, lon: -73.78, marketSize: 100 },
  { code: "LHR", city: "London", country: "United Kingdom", lat: 51.47, lon: -0.45, marketSize: 95 },
  { code: "SYD", city: "Sydney", country: "Australia", lat: -33.95, lon: 151.18, marketSize: 60 },
];

export const AIRCRAFT_TYPES: AircraftType[] = [
  {
    id: "rj70",
    name: "RJ-70 Regional",
    seats: 70,
    rangeKm: 1500,
    cruiseSpeedKmh: 500,
    fuelBurnPerKm: 3.5,
    crewRequired: 4,
    purchasePrice: 18_000_000,
    monthlyLeasePrice: 180_000,
    monthlyMaintenanceCost: 40_000,
  },
  {
    id: "nb180",
    name: "NB-180 Narrowbody",
    seats: 180,
    rangeKm: 5500,
    cruiseSpeedKmh: 850,
    fuelBurnPerKm: 6.5,
    crewRequired: 6,
    purchasePrice: 55_000_000,
    monthlyLeasePrice: 480_000,
    monthlyMaintenanceCost: 90_000,
  },
  {
    id: "wb320",
    name: "WB-320 Widebody",
    seats: 320,
    rangeKm: 12_000,
    cruiseSpeedKmh: 900,
    fuelBurnPerKm: 11,
    crewRequired: 12,
    purchasePrice: 140_000_000,
    monthlyLeasePrice: 1_100_000,
    monthlyMaintenanceCost: 220_000,
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
