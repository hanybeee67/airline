import { useMemo, useState } from "react";
import { useGame } from "../../state/GameContext";
import { AIRPORTS, findAircraftType, findAirport } from "../../engine/data";
import { distanceKm } from "../../engine/geo";
import { isRouteDistanceValid, maxWeeklyFrequency } from "../../engine/rules";
import { formatNumber } from "../../format";

export function RoutesPanel({ onSelectAirport }: { onSelectAirport?: (code: string) => void }) {
  const { player, openRoute, closeRoute, setFare, setFrequency } = useGame();
  const idleAircraft = useMemo(
    () =>
      player
        ? player.fleet.filter((a) => !player.routes.some((r) => r.assignedAircraftId === a.id))
        : [],
    [player],
  );

  const [originCode, setOriginCode] = useState("ICN");
  const [destCode, setDestCode] = useState("HND");
  const [aircraftId, setAircraftId] = useState("");
  const [weeklyFrequency, setWeeklyFrequency] = useState(5);
  const [fare, setFareInput] = useState(300);

  if (!player) return null;

  const selectedAircraft = idleAircraft.find((a) => a.id === aircraftId) ?? idleAircraft[0];
  const distance =
    originCode !== destCode ? distanceKm(findAirport(originCode), findAirport(destCode)) : 0;
  const type = selectedAircraft ? findAircraftType(selectedAircraft.aircraftTypeId) : null;
  const maxFreq = type && distance ? maxWeeklyFrequency(type, distance) : 0;
  const inRange = type && distance ? isRouteDistanceValid(type, distance) : false;

  return (
    <div className="stack">
      <section>
        <h2>Open a new route</h2>
        {idleAircraft.length === 0 ? (
          <p className="hint">No idle aircraft. Buy or lease one in the Fleet tab first.</p>
        ) : (
          <form
            className="route-form"
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
                  <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
                ))}
              </select>
            </label>
            <label>
              Destination
              <select value={destCode} onChange={(e) => setDestCode(e.target.value)}>
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
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
              Weekly freq. (max {maxFreq})
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
              <input type="number" min={1} value={fare} onChange={(e) => setFareInput(Number(e.target.value))} />
            </label>
            <div className="route-form-foot">
              <span className="hint">Distance: {formatNumber(distance)} km</span>
              <button type="submit" disabled={!inRange || originCode === destCode || maxFreq === 0}>
                Open route
              </button>
            </div>
            {!inRange && originCode !== destCode && (
              <p className="warning">Out of range for this aircraft — pick a longer-range jet.</p>
            )}
          </form>
        )}
      </section>

      <section>
        <h2>Active routes ({player.routes.length})</h2>
        {player.routes.length === 0 ? (
          <p className="hint">No routes yet.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Aircraft</th>
                  <th>Freq/wk</th>
                  <th>Fare</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {player.routes.map((route) => {
                  const aircraft = player.fleet.find((a) => a.id === route.assignedAircraftId);
                  const routeType = aircraft ? findAircraftType(aircraft.aircraftTypeId) : null;
                  const routeDistance = distanceKm(findAirport(route.originCode), findAirport(route.destCode));
                  const routeMaxFreq = routeType ? maxWeeklyFrequency(routeType, routeDistance) : route.weeklyFrequency;
                  return (
                    <tr key={route.id}>
                      <td>
                        <button className="linkish" onClick={() => onSelectAirport?.(route.originCode)}>
                          {route.originCode} ↔ {route.destCode}
                        </button>
                      </td>
                      <td className="muted">{routeType?.name ?? "—"}</td>
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
          </div>
        )}
      </section>
    </div>
  );
}
