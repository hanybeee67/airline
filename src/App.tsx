import { useEffect, useRef, useState } from "react";
import "./App.css";
import { GameProvider, useGame } from "./state/GameContext";
import { StartScreen } from "./components/StartScreen";
import { Hud } from "./components/Hud";
import { WorldMap } from "./components/WorldMap";
import { MapLegend } from "./components/MapLegend";
import { ManagePanel } from "./components/ManagePanel";
import { ErrorToast } from "./components/ErrorToast";

function GameScreen() {
  const { world } = useGame();
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedCode, setSelectedCode] = useState<string | undefined>(undefined);
  const [advancing, setAdvancing] = useState(false);
  const prevMonth = useRef<number | null>(null);

  const month = world?.month ?? null;
  useEffect(() => {
    if (month === null) return;
    if (prevMonth.current === null) {
      prevMonth.current = month;
      return;
    }
    if (month !== prevMonth.current) {
      prevMonth.current = month;
      setAdvancing(true);
      const t = setTimeout(() => setAdvancing(false), 1000);
      return () => clearTimeout(t);
    }
  }, [month]);

  if (!world) return <StartScreen />;

  return (
    <div className="game">
      <div className="map-layer">
        <WorldMap world={world} selectedCode={selectedCode} advancing={advancing} />
      </div>
      <MapLegend />
      <Hud onOpenPanel={() => setPanelOpen((v) => !v)} />
      <ManagePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSelectAirport={setSelectedCode}
      />
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
