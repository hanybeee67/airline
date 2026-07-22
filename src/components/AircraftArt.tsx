import { useId } from "react";
import type { LiveryScheme } from "../engine/types";
import { findAircraftType } from "../engine/data";

interface Proportions {
  bodyH: number;
  bodyLen: number;
  engineW: number;
  engineH: number;
  windows: number;
}

function proportions(category: string, seats: number): Proportions {
  const len = 150 + seats * 0.18;
  if (category === "widebody") {
    return { bodyH: 24, bodyLen: Math.min(len, 210), engineW: 34, engineH: 17, windows: Math.round(seats / 14) };
  }
  if (category === "narrowbody") {
    return { bodyH: 18, bodyLen: Math.min(len, 195), engineW: 26, engineH: 13, windows: Math.round(seats / 12) };
  }
  return { bodyH: 16, bodyLen: Math.min(len, 180), engineW: 22, engineH: 11, windows: Math.round(seats / 11) };
}

/**
 * A parametric side-view illustration of an aircraft, sized by its category and
 * painted in the airline's colour and livery scheme.
 */
export function AircraftArt({
  typeId,
  livery = "#4f9bff",
  scheme = "stripe",
  height = 54,
  className,
}: {
  typeId: string;
  livery?: string;
  scheme?: LiveryScheme;
  height?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const type = findAircraftType(typeId);
  const p = proportions(type.category, type.seats);

  const cy = 60;
  const tailX = 20;
  const noseX = tailX + p.bodyLen;
  const cx = (tailX + noseX) / 2;
  const top = cy - p.bodyH / 2;
  const bottom = cy + p.bodyH / 2;

  const winStart = cx - 18;
  const winEnd = noseX - 34;
  const winCount = Math.max(6, Math.min(28, p.windows));
  const winGap = (winEnd - winStart) / winCount;
  const windows = Array.from({ length: winCount }, (_, i) => winStart + i * winGap);

  const bodyGrad = `body-${uid}`;
  const clipId = `clip-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 260 110"
      width={(height * 260) / 110}
      height={height}
      role="img"
      aria-label={type.name}
    >
      <defs>
        <linearGradient id={bodyGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f1f5fc" />
          <stop offset="1" stopColor="#d5deef" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x={tailX} y={top} width={p.bodyLen} height={p.bodyH} rx={p.bodyH / 2} />
        </clipPath>
      </defs>

      {/* Far wing */}
      <polygon
        points={`${cx + 26},${cy} ${cx - 22},${cy} ${cx - 74},${cy + 34} ${cx - 40},${cy + 34}`}
        fill="rgba(120,140,180,0.5)"
      />
      {/* Horizontal stabiliser */}
      <polygon
        points={`${tailX + 26},${cy - 1} ${tailX - 4},${cy - 12} ${tailX + 8},${cy - 1}`}
        fill="rgba(150,168,205,0.9)"
      />
      {/* Vertical tail fin */}
      <polygon
        points={`${tailX + 34},${top} ${tailX + 2},${top - 30} ${tailX + 18},${top}`}
        fill={livery}
      />
      {/* Tail logo dot */}
      <circle cx={tailX + 15} cy={top - 12} r="3" fill="rgba(255,255,255,0.85)" />

      {/* Fuselage */}
      <rect
        x={tailX}
        y={top}
        width={p.bodyLen}
        height={p.bodyH}
        rx={p.bodyH / 2}
        fill={`url(#${bodyGrad})`}
        stroke="rgba(30,45,75,0.3)"
        strokeWidth="1"
      />

      {/* Livery scheme overlay (clipped to fuselage) */}
      <g clipPath={`url(#${clipId})`}>
        {scheme === "belly" && (
          <rect x={tailX} y={cy + 1} width={p.bodyLen} height={p.bodyH / 2} fill={livery} opacity="0.9" />
        )}
        {scheme === "tail" && (
          <rect x={tailX} y={top} width={40} height={p.bodyH} fill={livery} opacity="0.85" />
        )}
        {scheme === "swoosh" && (
          <path
            d={`M${tailX} ${bottom} Q ${cx - 20} ${bottom} ${noseX} ${top + 3} L ${noseX} ${bottom} L ${tailX} ${bottom} Z`}
            fill={livery}
            opacity="0.85"
          />
        )}
        {scheme === "stripe" && (
          <rect x={tailX} y={cy - 1.5} width={p.bodyLen} height="4" fill={livery} opacity="0.9" />
        )}
      </g>

      {/* Cockpit window */}
      <path d={`M${noseX - 6} ${cy - 5} q -12 -1 -18 5 l 14 0 z`} fill="#2b3d63" />
      {/* Passenger windows */}
      {windows.map((x, i) => (
        <circle key={i} cx={x} cy={cy - 3} r="1.4" fill="#8ea6cf" />
      ))}

      {/* Near wing */}
      <polygon
        points={`${cx + 34},${bottom - 3} ${cx - 16},${bottom - 3} ${cx - 66},${cy + 30} ${cx - 46},${cy + 30}`}
        fill="#dbe4f4"
        stroke="rgba(30,45,75,0.25)"
        strokeWidth="0.8"
      />
      {/* Winglet */}
      <polygon points={`${cx - 66},${cy + 30} ${cx - 70},${cy + 20} ${cx - 62},${cy + 30}`} fill={livery} />
      {/* Engine nacelle */}
      <rect x={cx - 26} y={cy + 10} width={p.engineW} height={p.engineH} rx={p.engineH / 2} fill="#33405a" />
      <circle cx={cx - 26 + 3} cy={cy + 10 + p.engineH / 2} r={p.engineH / 2 - 2} fill="#5a6b93" />
    </svg>
  );
}
