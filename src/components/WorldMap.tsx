import { useMemo } from "react";
import type { World } from "../engine/types";
import { AIRPORTS, findAirport } from "../engine/data";
import { greatCirclePath } from "../engine/geo";
import { WORLD_LAND_PATHS } from "../map/worldPaths";
import { MAP_HEIGHT, MAP_WIDTH, projectPathSegments, projectPoint } from "../map/projection";

interface RenderRoute {
  key: string;
  color: string;
  isPlayer: boolean;
  segments: string[];
}

export function WorldMap({ world, selectedCode }: { world: World; selectedCode?: string }) {
  const routes = useMemo<RenderRoute[]>(() => {
    const rendered: RenderRoute[] = [];
    for (const airline of world.airlines) {
      if (airline.bankrupt) continue;
      for (const route of airline.routes) {
        const origin = findAirport(route.originCode);
        const dest = findAirport(route.destCode);
        const segments = projectPathSegments(greatCirclePath(origin, dest, 48));
        rendered.push({
          key: route.id,
          color: airline.color,
          isPlayer: airline.isPlayer,
          segments,
        });
      }
    }
    // Draw competitor routes first so player routes sit on top.
    return rendered.sort((a, b) => Number(a.isPlayer) - Number(b.isPlayer));
  }, [world]);

  const graticule = useMemo(() => buildGraticule(), []);

  return (
    <svg
      className="world-map"
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="World route map"
    >
      <defs>
        <radialGradient id="ocean" cx="50%" cy="42%" r="75%">
          <stop offset="0%" stopColor="var(--ocean-1)" />
          <stop offset="100%" stopColor="var(--ocean-2)" />
        </radialGradient>
        <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#ocean)" />

      <g className="graticule">
        {graticule.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      <g className="land">
        {WORLD_LAND_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      <g className="routes">
        {routes.map((r) =>
          r.segments.map((seg, i) => (
            <path
              key={`${r.key}-${i}`}
              d={seg}
              stroke={r.color}
              className={r.isPlayer ? "route player" : "route competitor"}
              filter={r.isPlayer ? "url(#routeGlow)" : undefined}
            />
          )),
        )}
      </g>

      <g className="airports">
        {AIRPORTS.map((airport) => {
          const { x, y } = projectPoint(airport);
          const r = 1.6 + Math.sqrt(airport.marketSize) / 2.4;
          const selected = airport.code === selectedCode;
          return (
            <g key={airport.code} className={selected ? "airport selected" : "airport"}>
              <circle cx={x} cy={y} r={r} className="airport-dot" />
              {(airport.hub || selected) && (
                <text x={x + r + 1.5} y={y + 2.2} className="airport-label">
                  {airport.code}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function buildGraticule(): string[] {
  const paths: string[] = [];
  for (let lon = -150; lon <= 150; lon += 30) {
    const x = ((lon + 180) / 360) * MAP_WIDTH;
    paths.push(`M${x} 0 L${x} ${MAP_HEIGHT}`);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * MAP_HEIGHT;
    paths.push(`M0 ${y} L${MAP_WIDTH} ${y}`);
  }
  return paths;
}
