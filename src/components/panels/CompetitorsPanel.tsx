import { useState } from "react";
import { useGame } from "../../state/GameContext";
import { findAircraftType } from "../../engine/data";
import { AircraftArt } from "../AircraftArt";

export function CompetitorsPanel() {
  const { world } = useGame();
  const [expanded, setExpanded] = useState<string | null>("player");
  if (!world) return null;

  return (
    <div className="stack">
      <section>
        <h2>Airlines</h2>
        <p className="hint">
          You compete with three rival carriers for passengers on every route. Cheaper fares, more
          frequency and a stronger reputation win a bigger share of each market. Tap an airline to
          see its fleet.
        </p>

        <div className="airline-list">
          {world.airlines.map((a) => {
            const open = expanded === a.id;
            // Group this airline's fleet by type.
            const groups = new Map<string, number>();
            for (const ac of a.fleet) groups.set(ac.aircraftTypeId, (groups.get(ac.aircraftTypeId) ?? 0) + 1);

            return (
              <div key={a.id} className={`airline-card${open ? " open" : ""}`}>
                <button className="airline-head" onClick={() => setExpanded(open ? null : a.id)}>
                  <span className="legend-swatch" style={{ background: a.color }} />
                  <span className="airline-name">
                    {a.name}
                    {a.isPlayer && <span className="legend-you">YOU</span>}
                  </span>
                  <span className="airline-meta">
                    {a.bankrupt ? (
                      <span className="negative">Bankrupt</span>
                    ) : (
                      <>✈ {a.fleet.length} · {a.routes.length} routes · Rep {Math.round(a.reputation)}</>
                    )}
                  </span>
                  <span className="chev">{open ? "▾" : "▸"}</span>
                </button>

                {open && (
                  <div className="airline-fleet">
                    {groups.size === 0 ? (
                      <p className="hint">No aircraft.</p>
                    ) : (
                      [...groups.entries()].map(([typeId, count]) => (
                        <div key={typeId} className="fleet-chip">
                          <AircraftArt typeId={typeId} livery={a.color} height={38} />
                          <div>
                            <strong>{findAircraftType(typeId).name}</strong>
                            <span className="muted">×{count}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
