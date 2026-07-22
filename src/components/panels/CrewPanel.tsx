import { useState } from "react";
import { useGame } from "../../state/GameContext";
import { crewRequiredForRoutes } from "../../engine/airline";
import { crewInTraining } from "../../engine/crew";
import { CREW_TRAINING_COST, CREW_TRAINING_MONTHS } from "../../engine/constants";
import { formatMoney } from "../../format";

export function CrewPanel() {
  const { player, hireCrew } = useGame();
  const [count, setCount] = useState(8);
  if (!player) return null;

  const required = crewRequiredForRoutes(player);
  const training = crewInTraining(player);
  const shortfall = Math.max(0, required - player.crew.employed - crewInTraining(player));

  return (
    <div className="stack">
      <section>
        <h2>Crew</h2>
        <div className="stat-row">
          <div className="mini-stat"><span>Employed</span><strong>{player.crew.employed}</strong></div>
          <div className="mini-stat"><span>In training</span><strong>{training}</strong></div>
          <div className="mini-stat"><span>Required by network</span><strong>{required}</strong></div>
          <div className="mini-stat"><span>Shortfall</span><strong className={shortfall > 0 ? "negative" : ""}>{shortfall}</strong></div>
        </div>
        {shortfall > 0 && (
          <p className="warning">
            You are short {shortfall} crew — that many aircraft will sit grounded (still costing lease
            and maintenance) until you hire and train more.
          </p>
        )}
      </section>

      <section>
        <h2>Hire &amp; train</h2>
        <p className="hint">
          Training costs {formatMoney(CREW_TRAINING_COST)} per crew member and takes {CREW_TRAINING_MONTHS} month
          before they can fly.
        </p>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (count > 0) hireCrew(count);
          }}
        >
          <input type="number" min={1} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          <span className="hint">= {formatMoney(count * CREW_TRAINING_COST)}</span>
          <button type="submit">Hire {count}</button>
          {shortfall > 0 && (
            <button type="button" onClick={() => hireCrew(shortfall + 4)}>
              Cover shortfall ({shortfall + 4})
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
