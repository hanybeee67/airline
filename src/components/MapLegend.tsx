import { useGame } from "../state/GameContext";

export function MapLegend() {
  const { world } = useGame();
  if (!world) return null;

  return (
    <div className="map-legend">
      <span className="legend-title">Airlines</span>
      {world.airlines.map((a) => (
        <div key={a.id} className={a.bankrupt ? "legend-row gone" : "legend-row"}>
          <span className="legend-swatch" style={{ background: a.color }} />
          <span className="legend-name">
            {a.name}
            {a.isPlayer && <span className="legend-you">YOU</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
