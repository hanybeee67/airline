import { useGame } from "../../state/GameContext";
import { activeEvents } from "../../engine/events";
import { monthLabel } from "../../format";

export function EventsPanel() {
  const { world } = useGame();
  if (!world) return null;

  const active = activeEvents(world, world.month);
  const log = [...world.eventLog].reverse();

  return (
    <div className="stack">
      <section>
        <h2>Active events</h2>
        {active.length === 0 ? (
          <p className="hint">Calm skies — no events are affecting the market right now.</p>
        ) : (
          <ul className="event-list">
            {active.map((e) => (
              <li key={e.id}>
                <strong>{e.title}</strong>
                <p className="muted">{e.description}</p>
                <p className="event-effect">
                  {e.demandMultiplier !== 1 && <span>Demand {e.demandMultiplier.toFixed(2)}× </span>}
                  {e.fuelMultiplier !== 1 && <span>Fuel {e.fuelMultiplier.toFixed(2)}× </span>}
                  <span className="muted">· until {monthLabel(e.startMonth + e.durationMonths - 1)}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Event history</h2>
        {log.length === 0 ? (
          <p className="hint">Nothing has happened yet.</p>
        ) : (
          <ul className="log-list">
            {log.map((entry, i) => (
              <li key={i}>
                <span className="muted">{monthLabel(entry.month - 1)}</span> {entry.text}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
