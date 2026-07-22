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
 * A parametric side-view illustration of an aircraft, sized and detailed by its
 * category, with the airline's livery colour on the tail and cheatline.
 */
export function AircraftArt({
  typeId,
  livery = "#4f9bff",
  height = 54,
  className,
}: {
  typeId: string;
  livery?: string;
  height?: number;
  className?: string;
}) {
  const type = findAircraftType(typeId);
  const p = proportions(type.category, type.seats);

  const cy = 60;
  const tailX = 20;
  const noseX = tailX + p.bodyLen;
  const cx = (tailX + noseX) / 2;
  const top = cy - p.bodyH / 2;
  const bottom = cy + p.bodyH / 2;

  // Passenger windows along the fuselage.
  const winStart = cx - 18;
  const winEnd = noseX - 34;
  const winCount = Math.max(6, Math.min(28, p.windows));
  const winGap = (winEnd - winStart) / winCount;
  const windows = Array.from({ length: winCount }, (_, i) => winStart + i * winGap);

  return (
    <svg
      className={className}
      viewBox="0 0 260 110"
      width={(height * 260) / 110}
      height={height}
      role="img"
      aria-label={type.name}
    >
      {/* Far wing (behind fuselage) */}
      <polygon
        points={`${cx + 26},${cy} ${cx - 22},${cy} ${cx - 74},${cy + 34} ${cx - 40},${cy + 34}`}
        fill="rgba(120,140,180,0.55)"
      />
      {/* Horizontal stabiliser */}
      <polygon
        points={`${tailX + 26},${cy - 1} ${tailX - 4},${cy - 12} ${tailX + 8},${cy - 1}`}
        fill="rgba(150,168,205,0.9)"
      />
      {/* Vertical tail fin (livery) */}
      <polygon
        points={`${tailX + 34},${top} ${tailX + 2},${top - 30} ${tailX + 18},${top}`}
        fill={livery}
      />

      {/* Fuselage */}
      <rect
        x={tailX}
        y={top}
        width={p.bodyLen}
        height={p.bodyH}
        rx={p.bodyH / 2}
        fill="#f3f6fc"
        stroke="rgba(30,45,75,0.35)"
        strokeWidth="1"
      />
      {/* Cheatline (livery) */}
      <rect x={tailX + 6} y={cy - 1} width={p.bodyLen - 30} height="3.5" rx="1.5" fill={livery} opacity="0.85" />

      {/* Cockpit window */}
      <path
        d={`M${noseX - 6} ${cy - 5} q -12 -1 -18 5 l 14 0 z`}
        fill="#2b3d63"
      />
      {/* Passenger windows */}
      {windows.map((x, i) => (
        <circle key={i} cx={x} cy={cy - 3} r="1.4" fill="#9fb3d6" />
      ))}

      {/* Near wing */}
      <polygon
        points={`${cx + 34},${bottom - 3} ${cx - 16},${bottom - 3} ${cx - 66},${cy + 30} ${cx - 46},${cy + 30}`}
        fill="#dbe4f4"
        stroke="rgba(30,45,75,0.25)"
        strokeWidth="0.8"
      />
      {/* Winglet */}
      <polygon
        points={`${cx - 66},${cy + 30} ${cx - 70},${cy + 20} ${cx - 62},${cy + 30}`}
        fill="#cdd8ee"
      />
      {/* Engine nacelle */}
      <rect
        x={cx - 26}
        y={cy + 10}
        width={p.engineW}
        height={p.engineH}
        rx={p.engineH / 2}
        fill="#33405a"
      />
      <circle cx={cx - 26 + 3} cy={cy + 10 + p.engineH / 2} r={p.engineH / 2 - 2} fill="#54648a" />
    </svg>
  );
}
