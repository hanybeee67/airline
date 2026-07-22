import { useState } from "react";
import { useGame } from "../state/GameContext";

export function StartScreen() {
  const { startGame } = useGame();
  const [name, setName] = useState("Skyline Airways");

  return (
    <div className="start-screen">
      <div className="start-card">
        <h1>Sky Airline Tycoon</h1>
        <p className="tagline">
          Found an airline, fly a modern fleet across the real world map, and
          outmanoeuvre three rival carriers.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) startGame(name.trim());
          }}
        >
          <label htmlFor="company-name">Airline name</label>
          <input
            id="company-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoFocus
          />
          <button type="submit">Found the airline →</button>
        </form>
      </div>
    </div>
  );
}
