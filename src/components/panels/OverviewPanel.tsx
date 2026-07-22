import { useGame } from "../../state/GameContext";
import { formatMoney, formatNumber, formatPercent } from "../../format";

export function OverviewPanel() {
  const { world, player } = useGame();
  if (!world || !player) return null;

  const last = world.history[world.history.length - 1];

  return (
    <div className="stack">
      {world.gameOver && (
        <section className="gameover">
          <h2>Game over — {player.name} is bankrupt</h2>
          <p className="hint">Your cash stayed negative too long. Start a new game to try again.</p>
        </section>
      )}

      <section>
        <h2>Last month</h2>
        {!last ? (
          <p className="hint">
            Buy an aircraft (Fleet), hire crew (Crew), open a route (Routes), then advance the month.
          </p>
        ) : (
          <>
            <div className="stat-row">
              <div className="mini-stat"><span>Revenue</span><strong>{formatMoney(last.revenue)}</strong></div>
              <div className="mini-stat"><span>Net income</span><strong className={last.netIncome < 0 ? "negative" : ""}>{formatMoney(last.netIncome)}</strong></div>
              <div className="mini-stat"><span>Interest paid</span><strong>{formatMoney(last.interestPaid)}</strong></div>
              <div className="mini-stat"><span>Reputation</span><strong>{Math.round(last.reputationEnd)}</strong></div>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Pax</th>
                    <th>Connect</th>
                    <th>Load</th>
                    <th>Revenue</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {last.routeReports.map((r) => (
                    <tr key={r.routeId}>
                      <td>{r.originCode} ↔ {r.destCode}</td>
                      <td>{formatNumber(r.passengers)}</td>
                      <td className="muted">{formatNumber(r.connectingPassengers)}</td>
                      <td>{formatPercent(r.loadFactor)}</td>
                      <td>{formatMoney(r.revenue)}</td>
                      <td className={r.profit < 0 ? "negative" : ""}>{formatMoney(r.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
