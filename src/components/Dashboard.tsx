import { useGame } from "../state/GameContext";
import { formatMoney, formatNumber, formatPercent } from "../format";

export function Dashboard() {
  const { company } = useGame();
  if (!company) return null;

  const last = company.history[company.history.length - 1];

  return (
    <div className="panel dashboard">
      <div className="card-grid">
        <div className="card">
          <span className="label">Fleet size</span>
          <span className="value">{company.fleet.length}</span>
        </div>
        <div className="card">
          <span className="label">Active routes</span>
          <span className="value">{company.routes.length}</span>
        </div>
        <div className="card">
          <span className="label">Last month net income</span>
          <span className={`value ${last && last.netIncome < 0 ? "negative" : ""}`}>
            {last ? formatMoney(last.netIncome) : "—"}
          </span>
        </div>
        <div className="card">
          <span className="label">Reputation</span>
          <span className="value">{Math.round(company.reputation)}/100</span>
        </div>
      </div>

      {last ? (
        <section>
          <h2>Last month by route</h2>
          <table>
            <thead>
              <tr>
                <th>Route</th>
                <th>Passengers</th>
                <th>Load factor</th>
                <th>Revenue</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {last.routeReports.map((r) => (
                <tr key={r.routeId}>
                  <td>{r.originCode} ↔ {r.destCode}</td>
                  <td>{formatNumber(r.passengers)}</td>
                  <td>{formatPercent(r.loadFactor)}</td>
                  <td>{formatMoney(r.revenue)}</td>
                  <td className={r.profit < 0 ? "negative" : ""}>{formatMoney(r.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <p className="hint">
          No months flown yet. Buy an aircraft, open a route, then advance the month to see results.
        </p>
      )}
    </div>
  );
}
