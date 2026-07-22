import { useGame } from "../state/GameContext";
import { formatMoney, monthLabel } from "../format";

const TABS = ["dashboard", "fleet", "routes", "finance"] as const;
export type Tab = (typeof TABS)[number];

export function Header({ tab, onTabChange }: { tab: Tab; onTabChange: (tab: Tab) => void }) {
  const { company, advanceMonth } = useGame();
  if (!company) return null;

  return (
    <header className="app-header">
      <div className="brand">
        <strong>{company.name}</strong>
        <span className="date">{monthLabel(company.month)}</span>
      </div>
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={t === tab ? "tab active" : "tab"}
            onClick={() => onTabChange(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      <div className="kpis">
        <span title="Cash on hand">{formatMoney(company.cash)}</span>
        <span title="Reputation">Rep {Math.round(company.reputation)}</span>
        <button className="advance" onClick={advanceMonth}>
          Advance month →
        </button>
      </div>
    </header>
  );
}
