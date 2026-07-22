import { useGame } from "../../state/GameContext";
import { AIRCRAFT_TYPES, findAircraftType } from "../../engine/data";
import { formatMoney } from "../../format";

export function FleetPanel() {
  const { player, buyAircraft, sellAircraft } = useGame();
  if (!player) return null;

  return (
    <div className="stack">
      <section>
        <h2>Aircraft market</h2>
        <p className="hint">Current-generation jets. Buy outright for cash, or lease for a monthly fee.</p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Class</th>
                <th>Seats</th>
                <th>Range</th>
                <th>Price</th>
                <th>Lease</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {AIRCRAFT_TYPES.map((type) => (
                <tr key={type.id}>
                  <td>{type.name}</td>
                  <td className="muted">{type.category}</td>
                  <td>{type.seats}</td>
                  <td>{type.rangeKm.toLocaleString()} km</td>
                  <td>{formatMoney(type.purchasePrice)}</td>
                  <td>{formatMoney(type.monthlyLeasePrice)}/mo</td>
                  <td className="actions">
                    <button disabled={player.cash < type.purchasePrice} onClick={() => buyAircraft(type.id, "owned")}>
                      Buy
                    </button>
                    <button onClick={() => buyAircraft(type.id, "leased")}>Lease</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Your fleet ({player.fleet.length})</h2>
        {player.fleet.length === 0 ? (
          <p className="hint">No aircraft yet — buy or lease one above.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Mode</th>
                  <th>Condition</th>
                  <th>Assignment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {player.fleet.map((aircraft) => {
                  const type = findAircraftType(aircraft.aircraftTypeId);
                  const route = player.routes.find((r) => r.assignedAircraftId === aircraft.id);
                  return (
                    <tr key={aircraft.id}>
                      <td>{type.name}</td>
                      <td className="muted">{aircraft.acquisitionMode}</td>
                      <td>{Math.round(aircraft.condition)}%</td>
                      <td>{route ? `${route.originCode} ↔ ${route.destCode}` : "Idle"}</td>
                      <td className="actions">
                        <button disabled={!!route} onClick={() => sellAircraft(aircraft.id)}>
                          {aircraft.acquisitionMode === "owned" ? "Sell" : "Return"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
