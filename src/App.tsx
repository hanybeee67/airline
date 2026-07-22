import { useState } from "react";
import "./App.css";
import { GameProvider, useGame } from "./state/GameContext";
import { StartScreen } from "./components/StartScreen";
import { Hud } from "./components/Hud";
import { WorldMap } from "./components/WorldMap";
import { ManagePanel } from "./components/ManagePanel";
import { ErrorToast } from "./components/ErrorToast";

function GameScreen() {
  const { world } = useGame();
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedCode, setSelectedCode] = useState<string | undefined>(undefined);

  if (!world) return <StartScreen />;

  return (
    <div className="game">
      <div className="map-layer">
        <WorldMap world={world} selectedCode={selectedCode} />
      </div>
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
