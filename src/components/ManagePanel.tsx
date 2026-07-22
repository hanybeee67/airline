import { useState } from "react";
import { OverviewPanel } from "./panels/OverviewPanel";
import { FleetPanel } from "./panels/FleetPanel";
import { RoutesPanel } from "./panels/RoutesPanel";
import { CrewPanel } from "./panels/CrewPanel";
import { FinancePanel } from "./panels/FinancePanel";
import { CompetitorsPanel } from "./panels/CompetitorsPanel";
import { EventsPanel } from "./panels/EventsPanel";

const TABS = [
  "overview",
  "fleet",
  "routes",
  "crew",
  "finance",
  "rivals",
  "events",
] as const;
type Tab = (typeof TABS)[number];

export function ManagePanel({
  open,
  onClose,
  onSelectAirport,
}: {
  open: boolean;
  onClose: () => void;
  onSelectAirport?: (code: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <aside className={open ? "manage-panel open" : "manage-panel"}>
      <div className="manage-head">
        <div className="manage-tabs">
          {TABS.map((t) => (
            <button key={t} className={t === tab ? "mtab active" : "mtab"} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <button className="manage-close" onClick={onClose} title="Close panel">×</button>
      </div>
      <div className="manage-body">
        {tab === "overview" && <OverviewPanel />}
        {tab === "fleet" && <FleetPanel />}
        {tab === "routes" && <RoutesPanel onSelectAirport={onSelectAirport} />}
        {tab === "crew" && <CrewPanel />}
        {tab === "finance" && <FinancePanel />}
        {tab === "rivals" && <CompetitorsPanel />}
        {tab === "events" && <EventsPanel />}
      </div>
    </aside>
  );
}
