import { useMemo, useState } from "react";
import { useGame } from "../state/GameContext";
import { AIRPORTS, findAircraftType, findAirport } from "../engine/data";
import { distanceKm } from "../engine/geo";
import { isRouteDistanceValid, maxWeeklyFrequency } from "../engine/rules";

export function RoutesPanel() {
  const { company, openRoute, closeRoute, setFare, setFrequency } = useGame();
  const idleAircraft = useMemo(
    () =>
      company
        ? company.fleet.filter((a) => !company.routes.some((r) => r.assignedAircraftId === a.id))
        : [],
    [company],
  );

  const [originCode, setOriginCode] = useState(AIRPORTS[0].code);
  const [destCode, setDestCode] = useState(AIRPORTS[1].code);
  const [aircraftId, setAircraftId] = useState("");
  const [weeklyFrequency, setWeeklyFrequency] = useState(3);
  const [fare, setFareInput] = useState(200);

  if (!company) return null;

  const selectedAircraft = idleAircraft.find((a) => a.id === aircraftId) ?? idleAircraft[0];
  const distance =
    originCode && destCode && originCode !== destCode
      ? distanceKm(findAirport(originCode), findAirport(destCode))
      : 0;
  const type = selectedAircraft ? findAircraftType(selectedAircraft.aircraftTypeId) : null;
  const maxFreq = type && distance ? maxWeeklyFrequency(type, distance) : 0;
  const inRange = type && distance ? isRouteDistanceValid(type, distance) : false;

  return (
    <div className="panel routes">
      <section>
        <h2>Open a new route</h2>
        {idleAircraft.length === 0 ? (
          <p className="hint">Every aircraft is already assigned. Buy or lease another one first.</p>
        ) : (
          <form
            className="new-route-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedAircraft) return;
              openRoute({
                originCode,
                destCode,
                assignedAircraftId: selectedAircraft.id,
                weeklyFrequency,
                fare,
              });
            }}
          >
            <label>
              Origin
              <select value={originCode} onChange={(e) => setOriginCode(e.target.value)}>
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} — {a.city}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Destination
              <select value={destCode} onChange={(e) => setDestCode(e.target.value)}>
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} — {a.city}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Aircraft
              <select value={selectedAircraft?.id ?? ""} onChange={(e) => setAircraftId(e.target.value)}>
                {idleAircraft.map((a) => (
                  <option key={a.id} value={a.id}>
                    {findAircraftType(a.aircraftTypeId).name} ({a.acquisitionMode})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Weekly frequency (max {maxFreq})
              <input
                type="number"
                min={1}
                max={Math.max(maxFreq, 1)}
                value={weeklyFrequency}
                onChange={(e) => setWeeklyFrequency(Number(e.target.value))}
              />
            </label>
            <label>
              Fare ($ one-way)
              <input
                type="number"
                min={1}
                value={fare}
                onChange={(e) => setFareInput(Number(e.target.value))}
              />
            </label>
            <p className="hint">Distance: {Math.round(distance).toLocaleString()} km</p>
            <button type="submit" disabled={!inRange || originCode === destCode || maxFreq === 0}>
              Open route
            </button>
            {!inRange && originCode !== destCode && (
              <p className="warning">Out of range for this aircraft.</p>
            )}
          </form>
        )}
      </section>

      <section>
        <h2>Active routes</h2>
        {company.routes.length === 0 ? (
          <p className="hint">No routes yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Route</th>
                <th>Aircraft</th>
                <th>Frequency/wk</th>
                <th>Fare</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {company.routes.map((route) => {
                const aircraft = company.fleet.find((a) => a.id === route.assignedAircraftId);
                const routeType = aircraft ? findAircraftType(aircraft.aircraftTypeId) : null;
                const routeDistance = distanceKm(findAirport(route.originCode), findAirport(route.destCode));
                const routeMaxFreq = routeType ? maxWeeklyFrequency(routeType, routeDistance) : route.weeklyFrequency;
                return (
                  <tr key={route.id}>
                    <td>{route.originCode} ↔ {route.destCode}</td>
                    <td>{routeType?.name ?? "—"}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={routeMaxFreq}
                        value={route.weeklyFrequency}
                        onChange={(e) => setFrequency(route.id, Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={route.fare}
                        onChange={(e) => setFare(route.id, Number(e.target.value))}
                      />
                    </td>
                    <td className="actions">
                      <button onClick={() => closeRoute(route.id)}>Close</button>
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
