import { useGame } from "../../state/GameContext";

export function CompetitorsPanel() {
  const { world } = useGame();
  if (!world) return null;

  return (
    <div className="stack">
      <section>
        <h2>Airlines</h2>
        <p className="hint">
          You compete with three rival carriers for passengers on every route. Cheaper fares, more
          frequency and a stronger reputation win a bigger share of each market.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Airline</th>
                <th>Fleet</th>
                <th>Routes</th>
                <th>Reputation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {world.airlines.map((a) => (
                <tr key={a.id} className={a.isPlayer ? "you-row" : ""}>
                  <td>
                    <span className="swatch" style={{ background: a.color }} />
                    {a.name}
                    {a.isPlayer && <span className="you-tag">YOU</span>}
                  </td>
                  <td>{a.fleet.length}</td>
                  <td>{a.routes.length}</td>
                  <td>{Math.round(a.reputation)}</td>
                  <td className={a.bankrupt ? "negative" : ""}>{a.bankrupt ? "Bankrupt" : "Operating"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
