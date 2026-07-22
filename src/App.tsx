import { useState } from "react";
import "./App.css";
import { GameProvider, useGame } from "./state/GameContext";
import { StartScreen } from "./components/StartScreen";
import { Header, type Tab } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { FleetPanel } from "./components/FleetPanel";
import { RoutesPanel } from "./components/RoutesPanel";
import { FinancePanel } from "./components/FinancePanel";
import { ErrorToast } from "./components/ErrorToast";

function GameScreen() {
  const { company } = useGame();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (!company) return <StartScreen />;

  return (
    <div className="app-shell">
      <Header tab={tab} onTabChange={setTab} />
      <main>
        {tab === "dashboard" && <Dashboard />}
        {tab === "fleet" && <FleetPanel />}
        {tab === "routes" && <RoutesPanel />}
        {tab === "finance" && <FinancePanel />}
      </main>
      <ErrorToast />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
}
