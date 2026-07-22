import { useMemo } from "react";
import type { World } from "../engine/types";
import { AIRPORTS, findAirport } from "../engine/data";
import { distanceKm, greatCirclePath } from "../engine/geo";
import { WORLD_LAND_PATHS } from "../map/worldPaths";
import { MAP_HEIGHT, MAP_WIDTH, projectPathSegments, projectPoint } from "../map/projection";

interface RenderRoute {
  key: string;
  color: string;
  isPlayer: boolean;
  segments: string[];
  motionPath: string;
  durSec: number;
}

export function WorldMap({ world, selectedCode }: { world: World; selectedCode?: string }) {
  const routes = useMemo<RenderRoute[]>(() => {
    const rendered: RenderRoute[] = [];
    for (const airline of world.airlines) {
      if (airline.bankrupt) continue;
      for (const route of airline.routes) {
        const origin = findAirport(route.originCode);
        const dest = findAirport(route.destCode);
        const segments = projectPathSegments(greatCirclePath(origin, dest, 64));
        if (segments.length === 0) continue;
        const dist = distanceKm(origin, dest);
        rendered.push({
          key: route.id,
          color: airline.color,
          isPlayer: airline.isPlayer,
          segments,
          motionPath: segments[0],
          durSec: Math.min(26, Math.max(6, dist / 320)),
        });
      }
    }
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
          <feGaussianBlur stdDeviation="1.2" result="b" />
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

      {/* Route arcs */}
      <g className="routes">
        {routes.map((r) =>
          r.segments.map((seg, i) => (
            <path
              key={`${r.key}-${i}`}
              id={i === 0 ? `mp-${r.key}` : undefined}
              d={seg}
              stroke={r.color}
              className={r.isPlayer ? "route player" : "route competitor"}
              filter={r.isPlayer ? "url(#routeGlow)" : undefined}
            />
          )),
        )}
      </g>

      {/* Animated aircraft travelling along each route */}
      <g className="fleet-in-flight">
        {routes.map((r) => (
          <g key={`plane-${r.key}`} className="flying-plane">
            <path d="M7 0 L-5 -4 L-2 0 L-5 4 Z" fill={r.color} stroke="#fff" strokeWidth="0.5" />
            <animateMotion dur={`${r.durSec}s`} repeatCount="indefinite" rotate="auto">
              <mpath href={`#mp-${r.key}`} />
            </animateMotion>
          </g>
        ))}
      </g>

      {/* Airports */}
      <g className="airports">
        {AIRPORTS.map((airport) => {
          const { x, y } = projectPoint(airport);
          const r = 1.8 + Math.sqrt(airport.marketSize) / 2.6;
          const selected = airport.code === selectedCode;
          const leftSide = x > MAP_WIDTH - 150;
          return (
            <g key={airport.code} className={selected ? "airport selected" : "airport"}>
              {airport.hub && (
                <circle cx={x} cy={y} r={r} className="hub-pulse">
                  <animate attributeName="r" values={`${r};${r + 6};${r}`} dur="3.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="3.2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r={r} className="airport-dot" />
              <text
                x={leftSide ? x - r - 2 : x + r + 2}
                y={y + 2.6}
                textAnchor={leftSide ? "end" : "start"}
                className="airport-label"
              >
                <tspan className="airport-code">{airport.code}</tspan>
                <tspan className="airport-city"> {airport.city}</tspan>
              </text>
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
