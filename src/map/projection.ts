import type { LatLon } from "../engine/geo";
import { WORLD_VIEWBOX } from "./worldPaths";

const { width: W, height: H } = WORLD_VIEWBOX;

export const MAP_WIDTH = W;
export const MAP_HEIGHT = H;

export function projectPoint(p: LatLon): { x: number; y: number } {
  return {
    x: ((p.lon + 180) / 360) * W,
    y: ((90 - p.lat) / 180) * H,
  };
}

/**
 * Projects a great-circle point list into one or more SVG polyline strings,
 * splitting the line wherever it wraps across the antimeridian so it doesn't
 * streak all the way across the map.
 */
export function projectPathSegments(points: LatLon[]): string[] {
  const segments: string[] = [];
  let current: string[] = [];
  let prevX: number | null = null;

  for (const p of points) {
    const { x, y } = projectPoint(p);
    if (prevX !== null && Math.abs(x - prevX) > W / 2) {
      if (current.length > 1) segments.push(current.join(" "));
      current = [];
    }
    current.push(`${current.length === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
    prevX = x;
  }
  if (current.length > 1) segments.push(current.join(" "));
  return segments;
}
