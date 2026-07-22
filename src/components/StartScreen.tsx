import { useState } from "react";
import { useGame } from "../state/GameContext";

export function StartScreen() {
  const { startGame } = useGame();
  const [name, setName] = useState("Skyline Airways");

  return (
    <div className="start-screen">
      <h1>Sky Airline Tycoon</h1>
      <p className="tagline">Build an airline empire, one route at a time.</p>
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
        />
        <button type="submit">Found the airline</button>
      </form>
    </div>
  );
}
