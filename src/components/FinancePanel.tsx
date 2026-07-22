import { useGame } from "../state/GameContext";
import { formatMoney, monthLabel } from "../format";

export function FinancePanel() {
  const { company } = useGame();
  if (!company) return null;

  const history = [...company.history].reverse();

  return (
    <div className="panel finance">
      <h2>Financial history</h2>
      {history.length === 0 ? (
        <p className="hint">Advance a month to generate your first report.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue</th>
              <th>Operating</th>
              <th>Lease</th>
              <th>Maintenance</th>
              <th>Net income</th>
              <th>Cash</th>
              <th>Reputation</th>
            </tr>
          </thead>
          <tbody>
            {history.map((report) => (
              <tr key={report.month}>
                <td>{monthLabel(report.month - 1)}</td>
                <td>{formatMoney(report.revenue)}</td>
                <td>{formatMoney(report.operatingCosts)}</td>
                <td>{formatMoney(report.leaseCosts)}</td>
                <td>{formatMoney(report.maintenanceCosts)}</td>
                <td className={report.netIncome < 0 ? "negative" : ""}>
                  {formatMoney(report.netIncome)}
                </td>
                <td>{formatMoney(report.cashEnd)}</td>
                <td>{Math.round(report.reputationEnd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
