import { useGame } from "../state/GameContext";
import { AIRCRAFT_TYPES, findAircraftType } from "../engine/data";
import { formatMoney } from "../format";

export function FleetPanel() {
  const { company, buyAircraft, sellAircraft } = useGame();
  if (!company) return null;

  return (
    <div className="panel fleet">
      <section>
        <h2>Aircraft market</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Seats</th>
              <th>Range</th>
              <th>Purchase price</th>
              <th>Monthly lease</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {AIRCRAFT_TYPES.map((type) => (
              <tr key={type.id}>
                <td>{type.name}</td>
                <td>{type.seats}</td>
                <td>{type.rangeKm.toLocaleString()} km</td>
                <td>{formatMoney(type.purchasePrice)}</td>
                <td>{formatMoney(type.monthlyLeasePrice)}/mo</td>
                <td className="actions">
                  <button
                    disabled={company.cash < type.purchasePrice}
                    onClick={() => buyAircraft(type.id, "owned")}
                  >
                    Buy
                  </button>
                  <button onClick={() => buyAircraft(type.id, "leased")}>Lease</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Your fleet</h2>
        {company.fleet.length === 0 ? (
          <p className="hint">No aircraft yet — buy or lease one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Mode</th>
                <th>Condition</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {company.fleet.map((aircraft) => {
                const type = findAircraftType(aircraft.aircraftTypeId);
                const route = company.routes.find((r) => r.assignedAircraftId === aircraft.id);
                return (
                  <tr key={aircraft.id}>
                    <td>{type.name}</td>
                    <td>{aircraft.acquisitionMode}</td>
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
        )}
      </section>
    </div>
  );
}
