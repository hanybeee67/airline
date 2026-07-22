import { useEffect, useMemo, useRef, useState } from "react";
import type { World } from "../engine/types";
import { AIRPORTS, findAirport } from "../engine/data";
import { distanceKm, greatCirclePath } from "../engine/geo";
import { WORLD_LAND_PATHS } from "../map/worldPaths";
import { MAP_HEIGHT, MAP_WIDTH, projectPathSegments, projectPoint } from "../map/projection";
import { playSound } from "../sound";

interface RenderRoute {
  key: string;
  color: string;
  isPlayer: boolean;
  segments: string[];
  motionPath: string;
  durSec: number;
}

export function WorldMap({
  world,
  selectedCode,
  advancing,
}: {
  world: World;
  selectedCode?: string;
  advancing?: boolean;
}) {
  const player = world.airlines[0];

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

  // Detect newly opened player routes and play a draw-in + departure effect.
  const prevRouteIds = useRef<Set<string> | null>(null);
  const [effects, setEffects] = useState<{ id: string; origin: string }[]>([]);
  useEffect(() => {
    const ids = new Set(player.routes.map((r) => r.id));
    if (prevRouteIds.current === null) {
      prevRouteIds.current = ids;
      return;
    }
    const fresh = player.routes.filter((r) => !prevRouteIds.current!.has(r.id));
    prevRouteIds.current = ids;
    if (fresh.length > 0) {
      playSound("whoosh");
      const add = fresh.map((r) => ({ id: r.id, origin: r.originCode }));
      setEffects((e) => [...e, ...add]);
      const addIds = new Set(add.map((a) => a.id));
      setTimeout(() => setEffects((e) => e.filter((x) => !addIds.has(x.id))), 1100);
    }
  }, [world, player.routes]);

  const graticule = useMemo(() => buildGraticule(), []);

  return (
    <svg
      className={`world-map${advancing ? " advancing" : ""}`}
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
        <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#8fc0ff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
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

      {/* New-route draw-in + departure pulse */}
      <g className="route-effects">
        {effects.map((fx) => {
          const route = routes.find((r) => r.key === fx.id);
          const o = projectPoint(findAirport(fx.origin));
          return (
            <g key={`fx-${fx.id}`}>
              {route && (
                <path
                  className="route-draw"
                  d={route.motionPath}
                  stroke={player.color}
                  pathLength={100}
                />
              )}
              <circle className="depart-pulse" cx={o.x} cy={o.y} r="2" stroke={player.color} />
            </g>
          );
        })}
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

      {/* Month-advance sweep */}
      {advancing && (
        <rect key={world.month} className="month-sweep" x="0" y="0" width="160" height={MAP_HEIGHT} fill="url(#sweep)" />
      )}
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
