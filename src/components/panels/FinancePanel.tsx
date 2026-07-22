import { useState } from "react";
import { useGame } from "../../state/GameContext";
import { maxBorrowable, netWorth, totalDebt } from "../../engine/loans";
import { LOAN_ANNUAL_RATE, LOAN_TERM_MONTHS } from "../../engine/constants";
import { formatMoney, formatPercent, monthLabel } from "../../format";

export function FinancePanel() {
  const { world, player, takeLoan, repayLoan } = useGame();
  const [amount, setAmount] = useState(50_000_000);
  if (!world || !player) return null;

  const borrowable = maxBorrowable(player);
  const history = [...world.history].reverse();

  return (
    <div className="stack">
      <section>
        <h2>Financing</h2>
        <div className="stat-row">
          <div className="mini-stat"><span>Net worth</span><strong>{formatMoney(netWorth(player))}</strong></div>
          <div className="mini-stat"><span>Total debt</span><strong>{formatMoney(totalDebt(player))}</strong></div>
          <div className="mini-stat"><span>Borrowing power</span><strong>{formatMoney(borrowable)}</strong></div>
        </div>
        <p className="hint">
          Loans run {LOAN_TERM_MONTHS} months at {formatPercent(LOAN_ANNUAL_RATE)} APR.
        </p>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (amount > 0) takeLoan(amount);
          }}
        >
          <input
            type="number"
            min={1_000_000}
            step={5_000_000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <button type="submit" disabled={amount > borrowable}>Take loan</button>
        </form>

        {player.loans.length > 0 && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Balance</th><th>Monthly payment</th><th></th></tr>
              </thead>
              <tbody>
                {player.loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{formatMoney(loan.balance)}</td>
                    <td>{formatMoney(loan.monthlyPayment)}/mo</td>
                    <td className="actions">
                      <button disabled={player.cash < loan.balance} onClick={() => repayLoan(loan.id)}>
                        Repay in full
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2>Monthly results</h2>
        {history.length === 0 ? (
          <p className="hint">Advance a month to generate your first report.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Fuel/ops</th>
                  <th>Lease</th>
                  <th>Maint.</th>
                  <th>Crew</th>
                  <th>Debt</th>
                  <th>Net</th>
                  <th>Cash</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.month}>
                    <td>{monthLabel(r.month - 1)}</td>
                    <td>{formatMoney(r.revenue)}</td>
                    <td>{formatMoney(r.operatingCosts)}</td>
                    <td>{formatMoney(r.leaseCosts)}</td>
                    <td>{formatMoney(r.maintenanceCosts)}</td>
                    <td>{formatMoney(r.crewCosts)}</td>
                    <td>{formatMoney(r.loanPayments)}</td>
                    <td className={r.netIncome < 0 ? "negative" : ""}>{formatMoney(r.netIncome)}</td>
                    <td className={r.cashEnd < 0 ? "negative" : ""}>{formatMoney(r.cashEnd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
