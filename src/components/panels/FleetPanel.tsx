import { useGame } from "../../state/GameContext";
import { AIRCRAFT_TYPES, findAircraftType } from "../../engine/data";
import { formatMoney } from "../../format";
import { AircraftArt } from "../AircraftArt";

export function FleetPanel() {
  const { player, buyAircraft, sellAircraft } = useGame();
  if (!player) return null;

  // Group the owned fleet by aircraft type.
  const groups = new Map<string, typeof player.fleet>();
  for (const a of player.fleet) {
    const list = groups.get(a.aircraftTypeId) ?? [];
    list.push(a);
    groups.set(a.aircraftTypeId, list);
  }

  return (
    <div className="stack">
      <section>
        <h2>Aircraft market</h2>
        <p className="hint">Current-generation jets. Buy outright for cash, or lease for a monthly fee.</p>
        <div className="market-grid">
          {AIRCRAFT_TYPES.map((type) => (
            <div key={type.id} className="market-card">
              <div className="market-art">
                <AircraftArt typeId={type.id} livery={player.color} height={58} />
              </div>
              <div className="market-info">
                <strong>{type.name}</strong>
                <span className="muted">{type.category} · {type.seats} seats · {type.rangeKm.toLocaleString()} km</span>
                <div className="market-prices">
                  <span>{formatMoney(type.purchasePrice)}</span>
                  <span className="muted">· {formatMoney(type.monthlyLeasePrice)}/mo lease</span>
                </div>
              </div>
              <div className="market-actions">
                <button disabled={player.cash < type.purchasePrice} onClick={() => buyAircraft(type.id, "owned")}>Buy</button>
                <button onClick={() => buyAircraft(type.id, "leased")}>Lease</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Your fleet ({player.fleet.length})</h2>
        {player.fleet.length === 0 ? (
          <p className="hint">No aircraft yet — buy or lease one above.</p>
        ) : (
          <div className="fleet-groups">
            {[...groups.entries()].map(([typeId, aircraft]) => {
              const type = findAircraftType(typeId);
              return (
                <div key={typeId} className="fleet-group">
                  <div className="fleet-group-head">
                    <AircraftArt typeId={typeId} livery={player.color} height={46} />
                    <div>
                      <strong>{type.name}</strong>
                      <span className="muted">×{aircraft.length}</span>
                    </div>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr><th>Mode</th><th>Condition</th><th>Assignment</th><th></th></tr>
                      </thead>
                      <tbody>
                        {aircraft.map((ac) => {
                          const route = player.routes.find((r) => r.assignedAircraftId === ac.id);
                          return (
                            <tr key={ac.id}>
                              <td className="muted">{ac.acquisitionMode}</td>
                              <td>{Math.round(ac.condition)}%</td>
                              <td>{route ? `${route.originCode} ↔ ${route.destCode}` : "Idle"}</td>
                              <td className="actions">
                                <button disabled={!!route} onClick={() => sellAircraft(ac.id)}>
                                  {ac.acquisitionMode === "owned" ? "Sell" : "Return"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
